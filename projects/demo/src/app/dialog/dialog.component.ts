import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef } from '@angular/material/dialog';
import { MatLabel } from '@angular/material/form-field'

@Component({
    selector: "app-dialog",
    standalone: true,
    imports: [
        CommonModule,
        MatDialogContent,
        MatLabel,
        MatDialogActions,
        MatDialogClose,
        MatButton,
    ],
    templateUrl: "./dialog.component.html",
    styleUrl: "./dialog.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
    export class DialogComponent {
        readonly dialogRef = inject(MatDialogRef<DialogComponent>);
        readonly data = inject<{ title: string; line01?: string; line02?: string }>(
            MAT_DIALOG_DATA
        );

    }

    export function openDialog(this: {dialog: MatDialog}, title: string, line01: string, line02: string)  {
        const dialogRef = this.dialog.open(DialogComponent, {
            data: { title, line01, line02 },
        });
        return dialogRef.beforeClosed()
    }

    export function openErrorDialog(this: {dialog: MatDialog}, err: unknown) {
        let error: Error = {
            name: '',
            message: ''
        };

        console.error(err);

        if (err instanceof Error) {
            error = err
        } else if (err instanceof HttpErrorResponse) {
            if (err.error instanceof Error) {
                error = err.error;
            } else {
                const subError = err.error.error;

                error.cause = `${err.status} ${subError?.status ?? ""}`;
                error.message = subError?.message ?? JSON.stringify(err.error, null, 4);
            }
        } else if (typeof err === "string") {
            error.cause = err;
        } else if (typeof err === "object") {
            const entries = Object.entries(err ?? {});
            const arr = entries.map(val => `${val[0]}: ${JSON.stringify(val[1], null, 4)}`);
            error.cause = arr.join(`<br>`);
        }

        return openDialog.bind(this)(
            "ERROR",
            [error.cause, error.name].join(" "),
            error.message
        );
    }
