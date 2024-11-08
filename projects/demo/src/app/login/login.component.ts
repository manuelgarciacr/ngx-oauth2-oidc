import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatCard, MatCardActions, MatCardTitle } from '@angular/material/card';
import { MatButton } from '@angular/material/button';
import { IOAuth2Config, Oauth2Service } from 'ngx-oauth2-oidc';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '..';

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
            // authorization response interception
            await this.oauth2.interceptor();
            // received id_token verification
            await this.oauth2.verify_token();
        } catch (err) {
            console.log(this.oauth2.errorArray(err), err);
            // expired id_token verification errors are ignored
            if ((err as Error).cause != "oauth2 verify_token" || this.oauth2.isIdTokenIntercepted) {
                this.openErrorDialog(err)
            }
        }

        const sub = this.oauth2.idToken?.["sub"] ?? "";

        if (sub) {
            this.router.navigate(["/home"]);
        }
    }

    loginGoogle = () => {
        this.login({
            configuration: {
                authorization_grant: "implicit",
            },
            metadata: {
                issuer: "https://accounts.google.com",
            },
            parameters: {
                // response_type: ["token", "id_token"],
                client_id:
                    "115940404174-2re8nu673gkn13jclq25spmgo9sdh1t2.apps.googleusercontent.com",
                scope: [
                    "email",
                    "profile",
                    // "https://www.googleapis.com/auth/userinfo.profile",
                    // "openid",
                    // "https://www.googleapis.com/auth/userinfo.email",
                    "https://www.googleapis.com/auth/drive.readonly"
                ],
            },
        });
    };

    loginFacebook = () => {
        sessionStorage.setItem("user", "Pepe");
        this.router.navigate(["/home"]);
    };

    loginDropbox = () => {
        sessionStorage.setItem("user", "Pepe");
        this.router.navigate(["/home"]);
    };

    login = async (cfg: IOAuth2Config) => {
        if (this.working()) return;
        else this._working.set(true);

        try {
            this.oauth2.setConfig(cfg);
            await this.oauth2.fetchDiscoveryDoc();
            await this.oauth2.authorization();
        } catch (err) {
            const array = this.oauth2.errorArray(err);
            console.error(array.length == 1 ? array[0] : array);
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
        this.openDialog(
            "ERROR",
            error.cause as string,
            error.message
        );
    }
}
