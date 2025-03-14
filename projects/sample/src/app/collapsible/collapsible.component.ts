import { CommonModule, NgIf, SlicePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, Input, input, output, Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: "sort",
    standalone: true,
})
export class SortPipe implements PipeTransform {
    transform(val: [string, any][]) {
        const ordered = (unordered?: [string, any][] | null) =>
            unordered?.sort((a, b) => a == b ? 0 : a > b ? 1 : -1) ?? [];
        return ordered(val);
    }
}

@Component({
    selector: "app-collapsible",
    standalone: true,
    imports: [NgIf, SlicePipe, SortPipe, CommonModule],
    templateUrl: `collapsible.component.html`,
    styleUrl: "./collapsible.component.css",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollapsibleComponent {
    @Input({required: true}) name!: string;
    call = input.required<string>();
    request = input.required<[string, any][]>();
    response = input.required<[string, any][]>();
    error = input.required<boolean>();
    open = input.required<boolean>();
    toggle_open = output<boolean>()
    reqType = computed(
        () => this.request()[0]?.[0] == "@URL" ? "URL" : "PAYLOAD"
    )

    toggleOpen() {
        this.toggle_open.emit(!this.open());
    }
}
