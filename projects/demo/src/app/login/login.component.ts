import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatCard, MatCardActions, MatCardTitle } from '@angular/material/card';
import { MatButton } from '@angular/material/button';
import { IOAuth2Config, Oauth2Service } from 'ngx-oauth2-oidc';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '..';
import googleJson from "../../assets/google.json";
import gitlabJson from "../../assets/gitlab.json";
import dropboxJson from "../../assets/dropbox.json";
import { HttpErrorResponse } from '@angular/common/http';

@Component({
    standalone: true,
    imports: [CommonModule, MatCard, MatCardTitle, MatCardActions, MatButton],
    templateUrl: `login.component.html`,
    styleUrl: "./login.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
    private readonly router = inject(Router);
    private readonly oauth2 = inject(Oauth2Service);
    private readonly dialog = inject(MatDialog);
    private readonly _working = signal(false);
    protected readonly working = this._working.asReadonly();

    async ngOnInit() {
        try {
            await this.oauth2.interceptor();
            this.oauth2.isCodeIntercepted && await this.oauth2.token();
            await this.oauth2.verify_token();
            this.oauth2.idToken?.["sub"] && this.router.navigate(["/home"]);

        } catch (err) {
            (err as Error).name != "JWTExpired" && this.openErrorDialog(err)
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
            await this.oauth2.authorization();
        } catch (err) {
            console.error(err);
            this.openErrorDialog(err);
        } finally {
            this._working.set(false);
        }
    };

    openDialog(title: string, line01: string, line02: string): void {
        const dialogRef = this.dialog.open(DialogComponent, {
            data: { title, line01, line02 },
        })
    }

    openErrorDialog(err: unknown) {
        const error = err as Error;
        if (err instanceof HttpErrorResponse) {
            if (err.error instanceof Error) {
                const error = err.error;
                error.cause = err.error.cause;
                error.name = err.error.name;
                error.message = err.error.message
            } else {
                error.cause = err.status;
                error.message = JSON.stringify(err.error, null, 4);
            }
        }
        this.openDialog(
            "ERROR",
            [error.cause, error.name].join(' '),
            error.message
        );
    }
}
