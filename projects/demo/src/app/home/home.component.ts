import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Oauth2Service } from "ngx-oauth2-oidc";
import { catchError, lastValueFrom, tap } from 'rxjs';
import { DialogComponent, openErrorDialog } from '../dialog/dialog.component';

@Component({
    selector: "app-home",
    standalone: true,
    imports: [CommonModule, DialogComponent],
    templateUrl: "./home.component.html",
    styleUrl: "./home.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit {
    private router = inject(Router);
    private http = inject(HttpClient);
    private readonly oauth2 = inject(Oauth2Service);
    readonly dialog = inject(MatDialog);
    private readonly exp = signal("");
    private readonly expires_in = signal(0);
    protected readonly issuer = signal("");
    protected readonly userName = signal("");
    protected readonly userEmail = signal("");
    protected readonly idToken = signal("");
    protected readonly idExpiration = computed(() => {
        return new Date(parseInt(this.exp()) * 1000).toLocaleTimeString();
    });
    protected readonly accessToken = signal("");
    protected readonly accessExpiration = computed(() => {
        return this.expires_in()
            ? new Date(this.expires_in()).toLocaleTimeString()
            : new Date("");
    });
    protected readonly refreshToken = signal("");
    protected readonly apiData = signal("");

    async ngOnInit(): Promise<void> {
        // Prevent storage tampering
        window.addEventListener("storage", () => this.logout());

        this.getTokensData();

        try {
            await this.oauth2.interceptor();
            await this.oauth2.verify_token();
            this.getTokensData();
            await this.getApiData();
        } catch (err) {
            openErrorDialog.bind(this)(err).subscribe(_ => {
                (err as Error).cause === "oauth2 verify_token" &&
                    this.logout();
            });
        }

    }

    logout = () => {
        this.oauth2.setConfig({});
        this.router.navigate(["/login"]);
    };

    getApiData = async () => {
        const iss = this.oauth2.idToken?.["iss"] ?? "";
        const req =
            iss == "https://accounts.google.com"
                ? ["get", "https://www.googleapis.com/drive/v3/files"]
                : iss == "https://gitlab.com"
                ? ["get", "https://gitlab.com/api/v4/projects?owned=true"]
                : iss == "https://www.dropbox.com"
                ? [
                      "post",
                      "https://api.dropboxapi.com/2/files/list_folder",
                      '{"path": ""}',
                  ]
                : "";

        if (!req) {
            this.apiData.set("");
            return;
        }

        const headers = new HttpHeaders({
            Authorization: `Bearer ${this.accessToken()}`,
            "Content-Type": "application/json",
        });

        const request =
            req[0] == "get"
                ? this.http.get(req[1], { headers })
                : this.http.post(req[1], req[2], { headers });

        return lastValueFrom(
            request.pipe(
                tap(res =>
                    this.apiData.set(JSON.stringify(res, null, 4))
                ),
                catchError(err => {
                    throw err;
                })
            )
        );
    };

    refresh = async () => {
        const issuer = this.oauth2.config?.metadata?.["issuer"] ?? "";
        const implicit = issuer == "https://accounts.google.com";

        if (implicit) this.implicitRefresh();
        else this.tokenRefresh();
    };

    implicitRefresh = async () => {
        try {
            const sub = this.oauth2.idToken?.["sub"] ?? "";

            await this.oauth2.authorization({
                prompt: "none",
                login_hint: sub,
                redirect_uri: window.location.href.split("#")[0].split("?")[0],
                // I only want a new access_token.
                response_type: "token"
            });
        } catch (err) {
            console.error(err);
            this.logout();
        }
    };

    tokenRefresh = async () => {
        try {
            await this.oauth2.refresh();
            this.getTokensData();
        } catch (err) {
            openErrorDialog.bind(this)(err)
        }
    };

    revocation = async () => {
        try {
            await this.oauth2.revocation();
        } catch (err) {
            openErrorDialog.bind(this)(err)
        }
    };

    getTokensData = () => {
        const it = this.oauth2.idToken;
        const parms = this.oauth2.config?.parameters;
        const name =
            it?.["name"] ?? [it?.["given_name"], it?.["family_name"]].join(" ");

        this.issuer.set(it?.["iss"] ?? "");
        this.userName.set(name);
        this.userEmail.set(it?.["email"] ?? "");
        this.exp.set(it?.["exp"] ?? "");
        this.expires_in.set(parms?.["expires_in"] ?? 0);
        this.idToken.set(parms?.["id_token"] ?? "");
        this.accessToken.set(parms?.["access_token"] ?? "");
        this.refreshToken.set(parms?.["refresh_token"] ?? "");
    };
}

