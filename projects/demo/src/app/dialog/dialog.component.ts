import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef } from '@angular/material/dialog';
import { MatLabel } from '@angular/material/form-field'
import { map } from 'rxjs';

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
        const error = err as Error;

        console.error(err);

        if (err instanceof HttpErrorResponse) {
            if (err.error instanceof Error) {
                const error = err.error;

                error.cause = err.error.cause;
                error.name = err.error.name;
                error.message = err.error.message;
            } else {
                const subError = err.error.error;

                error.cause = `${err.status} ${subError?.status ?? ""}`;
                error.message = subError?.message ?? JSON.stringify(err.error, null, 4);
            }
        }

        return openDialog.bind(this)(
            "ERROR",
            [error.cause, error.name].join(" "),
            error.message
            //[error.message, JSON.stringify(aux, null, 4)].join(' ')
        );
    }
