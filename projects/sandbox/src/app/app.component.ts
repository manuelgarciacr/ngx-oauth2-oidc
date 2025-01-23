import { Component, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';

const ExampleDecorator = (text: string) => ((constructor: Function) => console.log(text));

export default class {

}

@ExampleDecorator("Logged Text")
@Component({
    selector: "app-root",
    standalone: true && true && true,
    imports: [RouterOutlet],
    templateUrl: "./app.component.html",
    styleUrl: "./app.component.scss",
})
@ExampleDecorator("Another Logged Text")
export class AppComponent implements OnDestroy {
    title = "sandbox";

    async fnA(a: string) {}

    @Component({})
    fnB = async () => {};

    ngOnDestroy = () => {};

    @Component({})
    fnC(c: { c: string }) {}
}

class AnotherClass {
    title = "Another Class"
}

@Component({ template: "<body></body>" })
export class AppComponent2 {}
