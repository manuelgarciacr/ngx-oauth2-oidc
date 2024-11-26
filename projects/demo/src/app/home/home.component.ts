import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { jsonObjectType, methodType, Oauth2Service, payloadType } from "ngx-oauth2-oidc";
import { openErrorDialog } from '../dialog/dialog.component';
import { Pause } from '../utils/pause';

@Component({
    selector: "app-home",
    standalone: true,
    imports: [],
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

    async ngOnInit() {
        const head = "data:text/javascript;charset=UTF-8,";

        this.http
            .get("assets/_worker.js", { responseType: "text" })
            .subscribe(data => {
                this.oauth2.setWorker(head + encodeURIComponent(data));
            });

        const pause = Pause(100);
        await pause.start();

        // Prevent storage tampering
        window.addEventListener("storage", () => this.logout());

        try {
            await this.oauth2.interceptor();
            this.getTokensData();
            this.getApiData();
        } catch (err) {
            openErrorDialog.bind(this)(err)
        }
    }

    logout = () => {
        this.oauth2.setConfig({});
        this.router.navigate(["/login"]);
    };

    getApiData = () => {
        const noWorker = !!this.oauth2.config.configuration?.no_worker;
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
                      {"path": ""} // '{"path": ""}',
                  ]
                : "";

        if (!request) {
            this.apiData.set("");
            return;
        }

        const method = request[0] as methodType;
        const url = request[1] as string;
        const headers = {
                    Authorization: `Bearer ${this.accessToken()}`,
                    accept: "application/json",
                    "Content-Type": "application/json",
                };
        const body = request[2] as payloadType;

        this.oauth2.apiRequest({}, url, method, headers, body)
            .then(res => {
                const isWorker = Object.keys(res ?? {}).sort().join("") == "dataerror";
                if (isWorker) {
                    const response = res as {data: payloadType, error: jsonObjectType};
                    if (response.error) throw response.error;
                    this.apiData.set(JSON.stringify(response.data, null, 4))
                } else {
                    const response = res as payloadType
                    this.apiData.set(JSON.stringify(response, null, 4))
                }
            })
            .catch(err => {
                openErrorDialog.bind(this)(err);
                throw err;
            });
    };

    refresh = async () => {
        const issuer = this.oauth2.config?.metadata?.["issuer"] ?? "";
        const implicit = issuer == "https://accounts.google.com";

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

