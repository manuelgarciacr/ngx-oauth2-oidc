import { ChangeDetectionStrategy, Component, OnDestroy, Pipe, PipeTransform, computed, effect, inject, signal, type OnInit } from "@angular/core";
import { Oauth2Service, IOAuth2Config } from "ngx-oauth2-oidc";
import webAppConfig  from "../../../public/google-web-app.config.json";
import desktopConfig from "../../../public/google-desktop.config.json";
import { FormsModule } from "@angular/forms"
import { JsonPipe } from "@angular/common";

@Pipe({
    name: "json4",
    standalone: true
})
export class Json4Pipe implements PipeTransform {
    transform(val: any) {
        return JSON.stringify(val, null, 4);
    }
}

@Component({
    standalone: true,
    templateUrl: "login.component.html",
    imports: [FormsModule, Json4Pipe],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "container-fluid row mt-3" },
    styles: [
        "fieldset {background-color: lightsalmon}",
        "legend {background-color: peru}",
    ],
})
export class LoginComponent implements OnInit {
    private readonly oauth2Svc = inject(Oauth2Service);
    private _working = signal(false);
    private count = 0;
    protected readonly working = this._working.asReadonly();
    protected readonly api = signal("web");
    protected readonly grant = signal("code");
    protected readonly code = signal("code");
    protected readonly token = signal(false);
    protected readonly id_token = signal(false);
    protected readonly client_id = signal("");
    protected readonly client_secret = signal("");
    protected readonly config = signal(<IOAuth2Config>{});
    protected readonly response_type = computed(() => {
        const val = [];
        this.code() && val.push("code");
        this.token() && val.push("token");
        this.id_token() && val.push("id_token");
        return val.length ? val.join(" ") : "none";
    });
    private effect = effect(
        () => {
            this.count++;
            if (this.count > 100) {
                console.log("EFFECT CANCEL");
                this.effect.destroy();
            }

            const config = JSON.parse(
                sessionStorage.getItem("sample_config") ?? "{}"
            ) as IOAuth2Config;
            const tag = config?.configuration?.tag;
            const client_id = config?.parameters?.client_id;
            const client_secret = config?.parameters?.client_secret;

            const cfg = (this.api() == "web" ? webAppConfig : desktopConfig) as IOAuth2Config;
            const resTyp = this.response_type();
            const id_token = this.id_token();

            const newCfg = tag == cfg["configuration"].tag ? config! : (cfg as IOAuth2Config);
            // if (tag != cfg.tag) {
            //     this.client_id.set(cfg.parameters.client_id);
            //     this.client_secret.set("")
            // }
            //const cte = this.client_id();

            newCfg.parameters.response_type = resTyp;
            if (id_token) {
                newCfg.configuration.authorization_params!.push("nonce");
            }
            //if (resTyp == "none") cfg.configuration.authorization_params["include_granted_scopes"];
            //console.log("CFG", cfg);
            sessionStorage.setItem("sample_config", JSON.stringify(newCfg));
            this.config.set(newCfg)
            //console.log("RESTYP", rt);
        },
        { allowSignalWrites: true }
    );

    async ngOnInit(): Promise<void> {
        this.getParameters();

        const params = await this.oauth2Svc.interceptor();
        const code = params["code"];
        const id_token = params["id_token"];

        console.log("PARAMS", params);
        if (code) {
            try {
                // const tag = this.oauth2Service.config?.tag ?? "";
                // const id = this.oauth2Service.config?.parameters.client_id
                // const reqId = id?.substring(13, 17);
                // const res = await lastValueFrom(
                //     this.repo.clientSecret(tag, reqId ?? "xxxx")
                // );
                // const b64 = res.data ? res.data[0] : "";
                // const client_secret = Buffer.from(b64, "base64").toString(
                //     "utf-8"
                // );
                const client_secret = undefined;
                const resp1 = await this.oauth2Svc.token(code, client_secret);

                //const refresh_token = this.oauth2Service.config?.parameters.refresh_token
                const resp2 = resp1?.refresh_token
                    ? await this.oauth2Svc.refresh(client_secret)
                    : undefined;

                const resp3 = resp1?.id_token
                    ? await this.oauth2Svc.id_token_verify()
                    : undefined;

                console.log("TOKEN", client_secret, resp1, resp2, resp3);
            } catch (err) {
                console.error(err);
            }
        }

        if (id_token) {
            const resp3 = await this.oauth2Svc.id_token_verify();

            console.log("ID_TOKEN", resp3);
        }
        window.history.replaceState({}, "", window.location.pathname);
    }

    protected setConfig = (s: string) => {
        const obj = JSON.parse(s);
        sessionStorage.setItem("sample_config", JSON.stringify(obj));
        this.config.set(obj);
    };

    private saveParameters = (): void => {
        const api = this.api();
        const grant = this.grant();
        const code = this.code();
        const token = this.token();
        const id_token = this.id_token();
        const client_id = this.client_id();
        const client_secret = this.client_secret();

        sessionStorage.setItem(
            "sample_parameters",
            JSON.stringify({
                api,
                grant,
                code,
                token,
                id_token,
                client_id,
                client_secret,
            })
        );
    };

    private getParameters = () => {
        const sample = sessionStorage.getItem("sample_parameters");

        if (sample) {
            const object = JSON.parse(sample);
            this.api.set(object.api);
            this.grant.set(object.grant);
            this.code.set(object.code);
            this.token.set(object.token);
            this.id_token.set(object.id_token);
            this.client_id.set(object.client_id);
            this.client_secret.set(object.client_secret);
        }
    };

    protected google = async () => {
        if (this.working()) return;
        this._working.set(true);

        this.saveParameters();

        try {
            //this.oauth2Svc.setConfig(oauth2GoogleConfig);
            this.oauth2Svc.setConfig(this.config());
            await this.oauth2Svc.fetchDiscoveryDoc();
            await this.oauth2Svc.authorization();
        } catch (err) {
            console.error(err);
        } finally {
            this._working.set(false);
        }
    };
}

