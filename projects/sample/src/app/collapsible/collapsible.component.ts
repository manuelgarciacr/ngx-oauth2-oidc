import { NgIf, SlicePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, input, output } from '@angular/core';

@Component({
    selector: "app-collapsible",
    standalone: true,
    imports: [NgIf, SlicePipe],
    templateUrl: `collapsible.component.html`,
    styleUrl: "./collapsible.component.css",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollapsibleComponent {
    @Input({required: true}) name!: string;
    request = input.required<[string, any][]>();
    response = input.required<[string, any][]>();
    error = input.required<boolean>();
    open = input.required<boolean>();
    toggle_open = output<boolean>()

    toggleOpen() {
        this.toggle_open.emit(!this.open());
    }
}
