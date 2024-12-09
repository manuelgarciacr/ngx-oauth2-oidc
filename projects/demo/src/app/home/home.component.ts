import { ChangeDetectionStrategy, Component, computed, HostListener, inject, OnInit, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { methodType, Oauth2Service, payloadType } from "ngx-oauth2-oidc";
import { openErrorDialog } from '../dialog/dialog.component';
import { NgIf } from '@angular/common';
import { Router } from '@angular/router';

@Component({
    selector: "app-home",
    standalone: true,
    imports: [NgIf],
    templateUrl: "./home.component.html",
    styleUrl: "./home.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit {
    @HostListener("window:beforeunload")
    async onBeforeUnload() {
        //  Save encrypted configuration within session storage, with a secure cookie
        //      carrying the decryption data.
        //  The 'idTokenGuard' and 'interceptor' restore the configuration and delete
        //      the previously encrypted data.
        //  The "authorization" request and the "apiRequest" with the "HREF" method setted
        //      automatically save the configuration,
        await this.oauth2.saveState();
    }
    private router = inject(Router);
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
    protected readonly refreshExpiration = signal("unknown");
    protected readonly apiData = signal("");

    async ngOnInit() {

        // Prevent storage tampering
        window.addEventListener("storage", () => this.logout());

        this.getTokensData();

        try {
            await this.oauth2.interceptor();
            this.getApiData();
            this.getTokensData();
        } catch (err) {
            openErrorDialog.bind(this)(err);
        }
    }

    logout = () => {
        this.oauth2.setConfig({});
        this.router.navigate(["/login"]);
    };

    getApiData = () => {
        const iss = this.oauth2.idToken?.["iss"] ?? "";
        const request =
            iss == "https://accounts.google.com"
                ? ["GET", "https://www.googleapis.com/drive/v3/files"]
                : iss == "https://gitlab.com"
                ? ["GET", "https://gitlab.com/api/v4/projects?owned=true"]
                : iss == "https://www.dropbox.com"
                ? [
                      "POST",
                      "https://api.dropboxapi.com/2/files/list_folder",
                      { path: "" }, // '{"path": ""}',
                  ]
                : "";

        if (!request) {
            this.apiData.set("");
            return;
        }

        const method = request[0] as methodType;
        const url = request[1] as string;
        const headers = {
            Authorization: `Bearer ${
                this.oauth2.config.parameters?.access_token ?? ""
            }`,
            accept: "application/json",
            "Content-Type": "application/json",
        };
        const body = request[2] as payloadType;

        this.oauth2
            .apiRequest({}, url, method, headers, body)
            .then(res => {
                const response = res as payloadType;
                this.apiData.set(JSON.stringify(response, null, 4));
            })
            .catch(err => {
                openErrorDialog.bind(this)(err);
            });
    };

    refresh = async () => {
        const issuer = this.oauth2.config?.metadata?.["issuer"] ?? "";
        const implicit = issuer == "https://accounts.google.com";
        this.oauth2.setParameters({ access_token: undefined });
        if (implicit) this.implicitRefresh();
        else this.tokenRefresh();
    };

    implicitRefresh = async () => {
        try {
            const sub = (this.oauth2.idToken?.["sub"] as string) ?? "";

            await this.oauth2.authorization({
                prompt: "none",
                login_hint: sub,
                redirect_uri: window.location.href.split("#")[0].split("?")[0],
                // I only want a new access_token.
                response_type: "token",
            });
        } catch (err) {
            openErrorDialog.bind(this)(err);
        }
    };

    tokenRefresh = async () => {
        try {
            await this.oauth2.refresh();
        } catch (err) {
            openErrorDialog.bind(this)(err);
        }
        this.getTokensData();
    };

    revocation = async () => {
        try {
            await this.oauth2.revocation();
        } catch (err) {
            openErrorDialog.bind(this)(err);
        }
    };

    getTokensData = () => {
        const it = this.oauth2.idToken;
        const parms = this.oauth2.config?.parameters;
        const name =
            it?.["name"] ?? [it?.["given_name"], it?.["family_name"]].join(" ");

        this.issuer.set((it?.["iss"] as string) ?? "");
        this.userName.set(name as string);
        this.userEmail.set((it?.["email"] as string) ?? "");
        this.exp.set((it?.["exp"] as string) ?? "");
        this.expires_in.set(parms?.["expires_in"] ?? 0);
        this.idToken.set(parms?.["id_token"] ?? "");
        this.accessToken.set(parms?.["access_token"] ?? "");
        this.refreshToken.set(parms?.["refresh_token"] ?? "");
    };
}

