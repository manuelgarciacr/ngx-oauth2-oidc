import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import {
    MAT_DIALOG_DATA,
//    MatDialog,
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogRef,
    MatDialogTitle,
} from "@angular/material/dialog";
import { CdkDrag, CdkDragHandle } from "@angular/cdk/drag-drop";
import {MatIconModule} from '@angular/material/icon';

@Component({
    selector: "modal",
    templateUrl: "modal.component.html",
    standalone: true,
    imports: [
        MatButtonModule,
        MatDialogActions,
        MatDialogClose,
        MatDialogTitle,
        MatDialogContent,
        CdkDrag,
        CdkDragHandle,
        MatIconModule
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    styles: [
        ".cdk-drag-handle:hover {cursor: move}",
    ]
})
export class ModalComponent {
    protected readonly data = inject(MAT_DIALOG_DATA);
    private readonly dialogRef = inject(MatDialogRef<ModalComponent>);
    constructor() {
        console.log(this.data);
    }
}
