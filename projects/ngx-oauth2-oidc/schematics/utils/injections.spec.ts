import { logging } from "@angular-devkit/core";
import {
    HostTree,
    Rule,
    chain,
    SchematicContext,
    callRule,
} from "@angular-devkit/schematics";
import { SchematicTestRunner } from "@angular-devkit/schematics/testing";
import { GlobalData, getData, getFileContent, setData } from "./utils";
import * as path from "path";
import { firstValueFrom } from "rxjs";
import { injectedDataRuleFactory, insertInject, insertInjectRuleFactory } from "./injections";

const collectionPath = path.join(__dirname, "../collection.json");

describe("injections utils", () => {
    const runner = new SchematicTestRunner("schematics", collectionPath);
    // Only one subscription
    runner.logger.subscribe((e: logging.LogEntry) => logs.push(e));
    const context = {
        logger: runner.logger,
    } as unknown as SchematicContext;
    const className = "AppModule";
    const decorator = "NgModule";
    let logs: logging.LogEntry[];
    let file: string;
    let moduleContent: string;
    let tree: HostTree;
    // let tasks: TaskConfigurationGenerator[];
    let data: GlobalData;
    let rules: Rule[];

    beforeEach(async () => {
        tree = new HostTree();
        logs  = [];
        file = "/src/app/app.module.ts";
        moduleContent = `
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { Foo } from './foo';
import { Foo as fooAlias} from './foo';
import def01, {Foo, default as def02} from './foo';
import def03 from './foo';
import * as def04 from './foo';
import Foo from './foo';
import {default def05} from './foo.component'; // Compiler Error
import * as fooNamespace from './FooService';
import {default as service} from './FooService';
import * from './FooService'; // Compiler Error
import { AppComponent } from './app.component';

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {
    a = inject(FooService);
    b = def33.Oauth2Service;
    c = Oauth2Service;
    d = pepe;
    constructor(private serv: fooNamespace, public serv02: fooNamespace.FooService) {
    }
}
`;
        tree.create(file, moduleContent);
        data = {};
        rules = [];
    });

    it("insertInject function", async () => {
        insertInject(
            file,
            className,
            "./FooService",
            "FooService02",
            "serv03",
            "public",
            decorator,
            data,
            rules
        );

        await firstValueFrom(callRule(chain(rules), tree, context));

        const output01 = getFileContent(tree, file);

        expect(output01).toMatch(
            /export class AppModule {\n\s*public serv03 = inject\(fooNamespace.FooService02\);\n/
        );

        rules = [];

        insertInject(
            file,
            className,
            "./FooService04",
            "FooService04",
            "serv04",
            "public",
            undefined,
            data,
            rules
        );

        insertInject(
            file,
            className,
            "./FooService04",
            "FooService05",
            "serv05",
            "public readoply",
            decorator,
            data,
            rules
        );

        await firstValueFrom(callRule(chain(rules), tree, context));

        const output02 = getFileContent(tree, file);

        expect(output02).toMatch(
            /import { AppComponent } from '.\/app.component';\nimport { FooService04, FooService05 } from '.\/FooService04';\n\n/
        );
        expect(output02).toMatch(
            /import { AppComponent } from '.\/app.component';\nimport { FooService04, FooService05 } from '.\/FooService04';\n\n/
        );
    });

    it("injectedDataRuleFactory function should return injected data of a property and a symbol", async () => {
        const module = "./FooService";
        const symbol = "FooService";

        setData(
            data,
            {
                value: "fooNamespace.FooService",
                allValues: ["fooNamespace.FooService", "service.FooService"],
            },
            "importedData",
            file,
            module,
            symbol
        );

        rules.push(
            injectedDataRuleFactory(
                file,
                className,
                module,
                symbol,
                decorator,
                data
            )
        );

        await firstValueFrom(callRule(chain(rules), tree, context));

        expect(
            getData(data, "injectedData", file, className, module, symbol, "value")
        ).toEqual(["serv02", "fooNamespace.FooService"]);
        expect(
            getData(data, "injectedData", file, className, module, symbol, "allValues").length
        ).toBe(1);
        expect(logs.length).toBe(0);
    });

    it("insertInjectRuleFactory function returned rule should throw errors or show a warnings", async () => {
        const module = "foo";
        const symbol = "FooComponent";
        const property = "fooService";

        rules.push(
            insertInjectRuleFactory(
                file,
                className,
                module,
                symbol,
                property,
                "private readonly",
                decorator,
                data
            )
        );

        await expectAsync(
            firstValueFrom(callRule(chain(rules), tree, context))
        ).toBeRejectedWithError(
            "❌  Unable to verify import declaration : 'FooComponent'"
        );

        setData(data, {value: "FooComponent"}, ...["importedData", file, module, symbol]);

        await expectAsync(
            firstValueFrom(callRule(chain(rules), tree, context))
        ).toBeRejectedWithError(
            "❌  Unable to verify inject declaration: 'FooComponent'"
        );

        setData(
            data,
            { value: undefined },
            ...["importedData", file, module, symbol]
        );
        setData(
            data,
            {},
            ...["injectedData", file, className, module, symbol]
        );

        await expectAsync(
            firstValueFrom(callRule(chain(rules), tree, context))
        ).toBeRejectedWithError("❌  Import not added: 'FooComponent'");

        setData(
            data,
            { value: "FooComponent" },
            ...["importedData", file, module, symbol]
        );
        setData(
            data,
            { value: ["fooService", "FooService"] },
            ...["injectedData", file, className, module, symbol]
        );

        await firstValueFrom(
            callRule(chain(rules), tree, context)
        );

        const text = `property: fooService, symbol: FooService`;

        expect(logs.pop()?.message).toBe(
            `👁️  Inject statement already added: '${text}'`
        );
        expect(logs.length).toBe(0);
    });
});
