import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef } from '@angular/material/dialog';
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
    readonly data = inject<{title: string, line01: string, line02: string}>(MAT_DIALOG_DATA);
}
