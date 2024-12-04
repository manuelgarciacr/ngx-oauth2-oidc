import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatCard, MatCardActions, MatCardTitle } from '@angular/material/card';
import { MatButton } from '@angular/material/button';
import { IOAuth2Config, Oauth2Service } from 'ngx-oauth2-oidc';
import { MatDialog } from '@angular/material/dialog';
import { openErrorDialog } from '../dialog/dialog.component';
import googleJson from "../../assets/google.json";
import gitlabJson from "../../assets/gitlab.json";
import dropboxJson from "../../assets/dropbox.json";
import {HttpClient} from '@angular/common/http'
import { firstValueFrom, tap } from 'rxjs';

@Component({
    standalone: true,
    imports: [
        NgOptimizedImage,
        MatCard,
        MatCardTitle,
        MatCardActions,
        MatButton,
    ],
    templateUrl: `login.component.html`,
    styleUrl: "./login.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
    private http = inject(HttpClient);
    private readonly router = inject(Router);
    private readonly oauth2 = inject(Oauth2Service);
    private readonly _working = signal(false);
    protected readonly working = this._working.asReadonly();
    readonly dialog = inject(MatDialog);

    async ngOnInit() {
        const no_worker = this.oauth2.config.configuration?.no_worker;

        if (!no_worker) {
            const head = "data:text/javascript;charset=UTF-8,";
            await firstValueFrom(
                this.http
                    .get("assets/_worker.js", { responseType: "text" })
                    .pipe(tap(res => this.oauth2.setWorker(head + res)))
            );
        }

        try {
            await this.oauth2.interceptor();
            this.oauth2.isCodeIntercepted && (await this.oauth2.token());
            await this.oauth2.verify_token();
            this.oauth2.idToken?.["sub"] && this.router.navigate(["/home"]);
        } catch (err) {
            (err as Error).name != "JWTExpired" &&
                openErrorDialog.bind(this)(err);
        }
    }

    loginGoogle = () => {
        this.login(JSON.parse(JSON.stringify(googleJson)));
    };

    loginGitlab = () => {
        this.login(JSON.parse(JSON.stringify(gitlabJson)));
    };

    loginDropbox = () => {
        this.login(JSON.parse(JSON.stringify(dropboxJson)));
    };

    login = async (cfg: IOAuth2Config) => {
        if (this.working()) return;
        else this._working.set(true);

        try {
            this.oauth2.setConfig(cfg);
            await this.oauth2.fetchDiscoveryDoc();
            await this.oauth2.authorization({}, "Perico De Los Palotes");
        } catch (err) {
            openErrorDialog.bind(this)(err);
        } finally {
            this._working.set(false);
        }
    };
}
