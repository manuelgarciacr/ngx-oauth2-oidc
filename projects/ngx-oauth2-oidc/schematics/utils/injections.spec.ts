import { logging } from "@angular-devkit/core";
import {
    HostTree,
    Rule,
    chain,
    SchematicContext,
    callRule,
} from "@angular-devkit/schematics";
import { SchematicTestRunner } from "@angular-devkit/schematics/testing";
import { getFileContent } from "./util";
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
    let logs: logging.LogEntry[];
    let modulePath: string;
    let moduleContent: string;
    let tree: HostTree;
    // let tasks: TaskConfigurationGenerator[];
    let data: Record<string, Record<string, any>>;
    let rules: Rule[];

    beforeEach(async () => {
        tree = new HostTree();
        logs  = [];
        modulePath = "/src/app/app.module.ts";
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
        tree.create(modulePath, moduleContent);
        data = {};
        rules = [];
    });

    it("insertInject function", async () => {
        insertInject(
            modulePath,
            "AppModule",
            "NgModule",
            "FooService02",
            "./FooService",
            "serv03",
            "public",
            data,
            rules
        );

        await firstValueFrom(callRule(chain(rules), tree, context));

        const output01 = getFileContent(tree, modulePath);

        expect(output01).toMatch(
            /export class AppModule {\n\s*public serv03 = inject\(fooNamespace.FooService02\);\n/
        );

        rules = [];

        insertInject(
            modulePath,
            "AppModule",
            undefined,
            "FooService04",
            "./FooService04",
            "serv04",
            "public",
            data,
            rules
        );

        insertInject(
            modulePath,
            "AppModule",
            "NgModule",
            "FooService05",
            "./FooService04",
            "serv05",
            "public readoply",
            data,
            rules
        );

        await firstValueFrom(callRule(chain(rules), tree, context));

        const output02 = getFileContent(tree, modulePath);

        expect(output02).toMatch(
            /import { AppComponent } from '.\/app.component';\nimport { FooService04, FooService05 } from '.\/FooService04';\n\n/
        );
        expect(output02).toMatch(
            /import { AppComponent } from '.\/app.component';\nimport { FooService04, FooService05 } from '.\/FooService04';\n\n/
        );
    });

    it("injectedDataRuleFactory function should return injected data of a property and a symbol", async () => {
        rules.push(
            injectedDataRuleFactory(
                modulePath,
                "AppModule",
                "NgModule",
                "FooService",
                "./FooService",
                data
            )
        );

        await firstValueFrom(callRule(chain(rules), tree, context));

        expect(data["injectedData"]?.["value"]).toEqual(["serv02", "fooNamespace.FooService"]);
        expect(data["injectedData"]?.["allValues"].length).toBe(3);
        expect(logs.length).toBe(1);
        expect(logs?.[0]?.message).toBe(
            "Import clause with errors: '* from'  👁️"
        );
    });

    it("insertInjectRuleFactory function returned rule should throw errors or show a warnings", async () => {
        rules.push(
            insertInjectRuleFactory(
                modulePath,
                "AppModule",
                "NgModule",
                "FooComponent",
                "foo",
                "private readonly",
                data
            )
        );

        await expectAsync(
            firstValueFrom(callRule(chain(rules), tree, context))
        ).toBeRejectedWithError(
            "❌  Unable to verify import declaration : 'FooComponent'"
        );

        data["importedData"] = {};

        await expectAsync(
            firstValueFrom(callRule(chain(rules), tree, context))
        ).toBeRejectedWithError(
            "❌  Unable to verify inject declaration: 'FooComponent'"
        );

        data["importedData"] = { value: undefined };
        data["injectedData"] = {};

        await expectAsync(
            firstValueFrom(callRule(chain(rules), tree, context))
        ).toBeRejectedWithError("❌  Import not added: 'FooComponent'");

        data["importedData"]["value"] = "FooComponent";
        data["injectedData"]["value"] = ["fooService", "FooService"];

        await firstValueFrom(
            callRule(chain(rules), tree, context)
        );

        const text = `property: fooService, symbol: FooService`;
        expect(logs.pop()?.message).toBe(
            `Inject statement already added: '${text}'  👁️`
        );
        expect(logs.length).toBe(0);
    });
});
