import { logging } from "@angular-devkit/core";
import {
    HostTree,
    Rule,
    chain,
    callRule,
    SchematicContext /*, TaskConfigurationGenerator */,
} from "@angular-devkit/schematics";
import { SchematicTestRunner } from "@angular-devkit/schematics/testing";
import { ts, getFileContent, GlobalData, setData, getData } from "./utils";
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
    let file: string;
    let moduleContent: string;
    let tree: HostTree;
    // let tasks: TaskConfigurationGenerator[];
    // let logs: LogEntry[];
    // let context: SchematicContext;
    let source: ts.SourceFile;
    let data: GlobalData;
    let rules: Rule[];
    let tokens: string[];

    beforeEach(async () => {
        // angular-cli/packages/schematics/angular/class/index_spec.ts
        // appTree = await runner.runSchematic("workspace");
        // appTree = await runner.runSchematic("application");
        tree = new HostTree();
        logs = [];
        file = "/src/app/app.module.ts";
        moduleContent = `
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { Foo } from './foo'; // Foo is a named import
import { Foo as fooAlias} from './foo';
import def01, {Foo, default as def02} from './foo'; // Foo is a named import
import def03 from './foo';
import aaa def3 from './foo'; // Compiler Error
import * as def04 from './foo';
import * from './foo'; // Compiler Error
import Foo from './foo'; // Foo is a namespace of './foo'
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
        tree.create(file, moduleContent);
        // tasks = [];
        // context = {
        //     addTask(task: TaskConfigurationGenerator) {
        //         tasks.push(task);
        //     },
        // } as SchematicContext;
        source = getTsSource(file, moduleContent);
        data = {};
        rules = [];
        // Possible values ​​of the 'Foo' symbol imported from the module './foo'
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
        const module = "./foo.component";
        let symbol = "FooComponent";

        // Import added
        insertImport(file, module, symbol, "", true, data, rules);

        await firstValueFrom(callRule(chain(rules), tree, context));

        const output01 = getFileContent(tree, file);

        expect(output01).toMatch(
            /import { AppComponent } from '.\/app.component';\nimport { FooComponent } from '.\/foo.component';\n\n/
        );
        expect(getData(data, "importedData", file, module, symbol, "value")).toBe(
            "FooComponent"
        );
        expect(logs.length).toBe(1);

        logs = [];
        rules = [];

        // Import already added
        insertImport(file, module, "FooComponent", "", true, data, rules);
        // Import added
        insertImport(file, module, "FooComponent02", "", true, data, rules);
        // Import added
        insertImport(file, "./foo.component03", "FooComponent03", "", true, data, rules);
        // Import clause with errors & Import already added
        insertImport(file, "./foo", "newService", "", true, data, rules);

        await firstValueFrom(
            callRule(chain(rules), tree, context)
        );

        const output02 = getFileContent(tree, file);

        expect(output02).toMatch(
            /import { AppComponent } from '.\/app.component';\nimport { FooComponent, FooComponent02 } from '.\/foo.component';\nimport { FooComponent03 } from '.\/foo.component03';\n\n/
        );
        expect(
            getData(data, "importedData", file, "./foo.component", "FooComponent", "value")
        ).toBe("FooComponent");
        expect(
            getData(data, "importedData", file, "./foo.component", "FooComponent02", "value")
        ).toBe("FooComponent02");
        expect(
            getData(data, "importedData", file, "./foo.component03", "FooComponent03", "value")
        ).toBe("FooComponent03");
        // Here the symbol is not equal than the imported symbol
        expect(
            getData(data, "importedData", file, "./foo", "newService", "value")
        ).toBe("Foo.newService");
        expect(logs.length).toBe(5);
    });

    it("importedDataRuleFactory function should return imported identifier of a symbol", async () => {
        const module = "./foo";
        const symbol = "Foo";

        rules.push(importedDataRuleFactory(file, module, symbol, "", data));

        await firstValueFrom(
            callRule(chain(rules), tree, context)
        );

        expect(
            getData(data, "importedData", file, module, symbol, "value")
        ).toBe("Foo");
        expect(
            getData(data, "importedData", file, module, symbol, "allValues")
        ).toEqual(tokens);
        expect(logs.length).toBe(1);
        expect(logs?.[0]?.message).toBe(
            "👁️  Import clause with errors: '* from'"
        );
    });

    it("insertImportRuleFactory function returned rule should throw errors or show a warnings", async () => {
        const module = "./foo.component";
        const symbol = "FooComponent";

        rules.push(
            insertImportRuleFactory(
                file,
                module,
                symbol,
                "",
                true,
                data
            )
        );

        await expectAsync(
            firstValueFrom(runner.callRule(chain(rules), tree))
        ).toBeRejectedWithError(
            "❌  Unable to verify import declaration: 'FooComponent'"
        );

        setData(
            data,
            { value: "FooComponent" },
            ...["importedData", file, module, symbol]
        );

        await firstValueFrom(
            callRule(chain(rules), tree, context)
        );

        expect(logs.pop()?.message).toBe(
            "👁️  Import already added: 'FooComponent'"
        );
    });

    it("getImportedIdentifier function should return imported identifier of a symbol", () => {
        const token = getImportedIdentifier(source, "./foo", "Foo", context);

        expect(token).toEqual(["Foo", tokens]);
        expect(logs.length).toBe(1);
        expect(logs?.[0]?.message).toBe(
            "👁️  Import clause with errors: '* from'"
        );
    });

    it("getAllImportedIdentifiers functions should return all imported identifiers of a symbol", () => {
        const readTokens = getAllImportedIdentifiers(
            source,
            "./foo",
            "Foo",
            context
        );

        expect(readTokens).toEqual(tokens);
        expect(logs.length).toBe(1);
        expect(logs?.[0]?.message).toBe(
            "👁️  Import clause with errors: '* from'"
        );
    });
});
