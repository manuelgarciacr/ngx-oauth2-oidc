import { logging } from "@angular-devkit/core";
import {
    HostTree,
    Rule,
    chain,
    callRule,
    SchematicContext /*, TaskConfigurationGenerator */,
} from "@angular-devkit/schematics";
import { SchematicTestRunner } from "@angular-devkit/schematics/testing";
import { ts, getFileContent } from "./util";
//import { Change, InsertChange } from "@schematics/angular/utility/change";
import {
    insertImport,
    importedDataRuleFactory,
    insertImportRuleFactory,
    getAllImportedIdentifiers,
    getImportedIdentifier,
} from "./imports";
import * as path from "path";
import { firstValueFrom } from "rxjs";

const collectionPath = path.join(__dirname, "../collection.json");

function getTsSource(path: string, content: string): ts.SourceFile {
    return ts.createSourceFile(path, content, ts.ScriptTarget.Latest, true);
}

describe("imports utils", () => {
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
    // let logs: LogEntry[];
    // let context: SchematicContext;
    let source: ts.SourceFile;
    let data: Record<string, Record<string, any>>;
    let rules: Rule[];
    let tokens: string[];

    beforeEach(async () => {
        // angular-cli/packages/schematics/angular/class/index_spec.ts
        // appTree = await runner.runSchematic("workspace");
        // appTree = await runner.runSchematic("application");
        tree = new HostTree();
        logs = [];
        modulePath = "/src/app/app.module.ts";
        moduleContent = `
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { Foo } from './foo';
import { Foo as fooAlias} from './foo';
import def01, {Foo, default as def02} from './foo';
import def03 from './foo';
import aaa def3 from './foo'; // Compiler Error
import * as def04 from './foo';
import * from './foo'; // Compiler Error
import Foo from './foo';
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
    b = def33.Oauth2Service;
    c = Oauth2Service;
    d = pepe;
}
`;
        tree.create(modulePath, moduleContent);
        // tasks = [];
        // context = {
        //     addTask(task: TaskConfigurationGenerator) {
        //         tasks.push(task);
        //     },
        // } as SchematicContext;
        source = getTsSource(modulePath, moduleContent);
        data = {};
        rules = [];
        tokens = [
            "Foo",
            "Foo.Foo",
            "def01.Foo",
            "def02.Foo",
            "def03.Foo",
            "def04.Foo",
            "fooAlias",
        ];
    });

    it("insertImport function should add import to the class", async () => {
        insertImport(
            modulePath,
            "FooComponent",
            "./foo.component",
            data,
            rules
        );

        await firstValueFrom(runner.callRule(chain(rules), tree));

        const output01 = getFileContent(tree, modulePath);

        expect(output01).toMatch(
            /import { AppComponent } from '.\/app.component';\nimport { FooComponent } from '.\/foo.component';\n\n/
        );
        expect(data["importedData"]?.["value"]).toBe("FooComponent");

        insertImport(
            modulePath,
            "FooComponent",
            "./foo.component",
            data,
            rules
        );
        insertImport(
            modulePath,
            "FooComponent02",
            "./foo.component",
            data,
            rules
        );
        insertImport(
            modulePath,
            "FooComponent03",
            "./foo.component03",
            data,
            rules
        );

        await firstValueFrom(
            callRule(chain(rules), tree, context)
        );

        const output02 = getFileContent(tree, modulePath);

        expect(output02).toMatch(
            /import { AppComponent } from '.\/app.component';\nimport { FooComponent, FooComponent02 } from '.\/foo.component';\nimport { FooComponent03 } from '.\/foo.component03';\n\n/
        );
        expect(data["importedData"]?.["value"]).toBe("FooComponent");
        expect(logs.length).toBe(4);
    });

    it("importedDataRuleFactory function should return imported identifier of a symbol", async () => {
        rules.push(importedDataRuleFactory(modulePath, "Foo", "./foo", data));

        await firstValueFrom(
            callRule(chain(rules), tree, context)
        );

        expect(data["importedData"]?.["value"]).toBe("Foo");
        expect(data["importedData"]?.["allValues"]).toEqual(tokens);
        expect(logs.length).toBe(1);
        expect(logs?.[0]?.message).toBe(
            "Import clause with errors: '* from'  👁️"
        );
    });

    it("insertImportRuleFactory function returned rule should throw errors or show a warnings", async () => {
        rules.push(
            insertImportRuleFactory(
                modulePath,
                "FooComponent",
                "./foo.component",
                data
            )
        );

        await expectAsync(
            firstValueFrom(runner.callRule(chain(rules), tree))
        ).toBeRejectedWithError(
            "❌  Unable to verify import declaration: 'FooComponent'"
        );

        data["importedData"] = {value: "FooComponent"}; //["value"] = "FooComponent";

        await firstValueFrom(
            callRule(chain(rules), tree, context)
        );

        expect(logs.pop()?.message).toBe(
            "Import already added: 'FooComponent'  👁️"
        );
    });

    it("getImportedIdentifier function should return imported identifier of a symbol", () => {
        const token = getImportedIdentifier(source, "Foo", "./foo", context);

        expect(token).toEqual(["Foo", tokens]);
        expect(logs.length).toBe(1);
        expect(logs?.[0]?.message).toBe(
            "Import clause with errors: '* from'  👁️"
        );
    });

    it("getAllImportedIdentifiers functions should return all imported identifiers of a symbol", () => {
        const readTokens = getAllImportedIdentifiers(source, "Foo", "./foo", context);

        expect(readTokens).toEqual(tokens);
        expect(logs.length).toBe(1);
        expect(logs?.[0]?.message).toBe(
            "Import clause with errors: '* from'  👁️"
        );
    });
});
