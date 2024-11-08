import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Oauth2Service } from "ngx-oauth2-oidc";
import { catchError, lastValueFrom, tap } from 'rxjs';

@Component({
    selector: "app-home",
    standalone: true,
    imports: [CommonModule],
    templateUrl: "./home.component.html",
    styleUrl: "./home.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit {
    private router = inject(Router);
    private http = inject(HttpClient);
    private readonly oauth2 = inject(Oauth2Service);
    private readonly exp = signal("");
    private readonly expires_in = signal(0);
    protected readonly userName = signal("");
    protected readonly userEmail = signal("");
    protected readonly idToken = signal("");
    protected readonly idExpiration = computed(() => {
        return new Date(parseInt(this.exp()) * 1000);
    });
    protected readonly accessToken = signal("");
    protected readonly accessExpiration = computed(() => {
        return this.expires_in() ? new Date(this.expires_in()) : new Date("");
    });
    protected readonly driveFiles = signal("");

    async ngOnInit(): Promise<void> {
        // Prevent storage tampering
        window.addEventListener("storage", () => this.logout());

        try {
            // authorization response interception
            await this.oauth2.interceptor();
            // received id_token verification
            await this.oauth2.verify_token();
        } catch (err) {
            this.logout();
        }

        this.userName.set(this.oauth2.idToken?.["name"] ?? "");
        this.userEmail.set(this.oauth2.idToken?.["email"] ?? "");
        this.displayTokens()

        try {
            this.getDriveFiles();
        } catch (err) {
            console.log(err);
        }
    }

    logout = () => {
        this.oauth2.setConfig({});
        this.router.navigate(["/login"]);
    };

    getDriveFiles = () => {
        const headers = new HttpHeaders({
            Authorization: `Bearer ${this.accessToken()}`,
        });
        lastValueFrom(
            this.http
                .get("https://www.googleapis.com/drive/v3/files", { headers })
                .pipe(
                    tap(res =>
                        this.driveFiles.set(JSON.stringify(res, null, 4))
                    ),
                    catchError(err => {
                        console.error(this.oauth2.errorArray(err));
                        this.driveFiles.set(
                            `${(err as Error).name}\n${(err as Error).message}`
                        );
                        throw err;
                    })
                )
        );
    };

    refreshToken = async () => {
        try {

            const sub = this.oauth2.idToken?.["sub"] ?? "";

            this.oauth2.removeIdToken()
            this.displayTokens();

            await this.oauth2.authorization({
                prompt: "none",
                login_hint: sub,
                redirect_uri: window.location.href.split("#")[0].split("?")[0],
            });
        } catch (err) {
            const array = this.oauth2.errorArray(err);
            console.error(array.length == 1 ? array[0] : array);
            this.logout()
        }

    };

    displayTokens = () => {
        this.exp.set(this.oauth2.idToken?.["exp"] ?? "");
        this.expires_in.set(this.oauth2.config?.parameters?.["expires_in"] ?? 0)
        this.idToken.set(this.oauth2.config?.parameters?.["id_token"] ?? "");
        this.accessToken.set(
            this.oauth2.config?.parameters?.["access_token"] ?? ""
        );
    }
}

