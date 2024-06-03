import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
    standalone: true,
    template: `<p>home works!</p>`,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {}
