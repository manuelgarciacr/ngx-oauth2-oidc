import { Component, OnDestroy, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DialogComponent } from '../../../demo/src/app';

// import { Foo } from './foo';
// import { Foo as fooAlias} from './foo';
// import def03 from './foo';
// import * as def04 from './foo';
// import Foo from './foo';
// import {default def05} from './foo.component'; // Compiler Error
// import * as fooNamespace from './FooService';
// import {default as service} from './FooService';
// import * from './FooService'; // Compiler Error

//import def01, {Foo, default as def02} from 'ngx-oauth2-oidc';

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

@Component({})
class logincomponent{constructor(){}}

@Component({ template: "<body></body>" })
export class LoginCOMPONENT implements OnDestroy extends Component, DialogComponent{

    a = inject(def01);

    constructor(private b: def01){
        this.pepe()
    }

    ngOnDestroy(): void {
        throw new Error('Method not implemented.');
    }
    ExampleDecorator = 7;
    a = 3;
    login = 4;
   pepe = () => {}
    private luis () {}

LoginCOMPONENT = 4
    [object Promise
[object  Promise

]
]
}
