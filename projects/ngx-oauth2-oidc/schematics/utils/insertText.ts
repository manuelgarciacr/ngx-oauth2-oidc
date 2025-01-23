//import ts from "typescript";
import { Rule, SchematicContext, Tree } from "@angular-devkit/schematics/";
import { ts } from "./util";
import { findNodes } from "./find";
import { showData } from "./showData";
//import { insertImport } from "@schematics/angular/utility/ast-utils";
//import { InsertChange } from "@schematics/angular/utility/change";

/**
 * If the provider already exists, a message is logged; otherwise a new provider insertion Rule
 * is added to 'rules' array
 * @param {Tree} tree File tree of the project
 * @param {SchematicContext} context Schematic context
 * @param {string} project Name of the project to which to add the import
 * @param {string} name Provider name
 * @param {string} lib Provider library name
 * @param {string} options Provider options as a string
 * @param {Rule[]} [rules=[]] Initial Rules array where to add the text insertion Rule
 * @returns {Rule[]} Array with the Rules to be executed
 */
export const insertText = (
    // tree: Tree,
    //context: SchematicContext,
    source: ts.SourceFile,
    //name: string,
    //lib: string,
    rules: Rule[] = []
): Rule[] => {
    /*if (isImported(source, name, lib))
        rules.push(() => context.logger.warn(`👁️  Import already exists: '${name}'`));
    else*/ rules.push(insertTextRuleFactory(source));

    return rules;
};

export function insertTextRuleFactory(node: ts.Node): Rule {
    return (tree: Tree, _context: SchematicContext) => {
        const source = node.getSourceFile();
        //const source = findParentSource(node);
        //const filePath = source.fileName;
        //const updateRecorder = tree.beginUpdate(filePath);
        const nodes = findNodes(source, 1);

        showData(tree, undefined, nodes, 1, true);
        //         const filePath = "some-file.ts";
        //         const fileContent = `import { Foo } from 'foo';
        // const bar = 'bar;
        // `;
        //         tree.create(filePath, fileContent);
        //         const source = ts.createSourceFile(
        //             filePath,
        //             fileContent,
        //             ts.ScriptTarget.Latest,
        //             true
        //         );
        //         const updateRecorder = tree.beginUpdate(filePath);
        //         const change = insertImport(source, filePath, "Bar", "./bar", true);
        //         if (change instanceof InsertChange) {
        //             updateRecorder.insertRight(change.pos, change.toAdd);
        //         }
        //         tree.commitUpdate(updateRecorder);
        //         console.log(tree.get(filePath)?.content.toString());
        return tree;
    };
}
