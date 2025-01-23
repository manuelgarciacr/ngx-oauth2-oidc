import { Rule, SchematicContext, Tree, SchematicsException } from "@angular-devkit/schematics";
import { ts, getSourceFile, nodeFlags } from "./util";
import { findNodes } from "./find";
import { insertImport as _insertImport } from "@schematics/angular/utility/ast-utils";
import { InsertChange } from "@schematics/angular/utility/change";

/**
 * Function that returns the rules necessary to import a specific symbol from the indicated
 * module. If the item has already been imported, a warning message is logged; otherwise,
 * the new rules will be added to the set of rules to be dealt with.
 * @param {string} fileName File we want to add import to. It is assumed to be an existing
 *      editable file.
 * @param {string} symbolName Symbol to import
 * @param {string} module Module from which to import
 * @param {Record<string, Record<string, any>>} data Global object that allows sharing
 *      data between rules.
 * @param {Rule[]} rules Set of rules to be dealt with.
 * @returns {Rule[]} Set of rules to be dealt with.
 */
export const insertImport = (
    fileName: string,
    symbolName: string,
    module: string,
    data: Record<string, Record<string, any>>,
    rules: Rule[]
): Rule[] => {
    rules.push(importedDataRuleFactory(fileName, symbolName, module, data));
    rules.push(insertImportRuleFactory(fileName, symbolName, module, data));

    return rules;
};

/**
 * Determine if the item has already been imported. Even within another import or namespace
 * @param {string} fileName File we want to add import to. It is assumed to be an existing
 *      editable file.
 * @param {string} symbolName Symbol to import
 * @param {string} module Module from which to import
 * @param {Record<string, Record<string, any>>} data Global object that allows sharing
 *      data between rules.
 * @returns {Rule} The rule that adds the imported identifier, if any, into the global
 *      'data' object.
 */
export function importedDataRuleFactory(
    fileName: string,
    symbolName: string,
    module: string,
    data: Record<string, Record<string, any>>
): Rule {
    return (tree: Tree, context: SchematicContext) => {
        const source = getSourceFile(tree, fileName);
        const [token, tokens] = getImportedIdentifier(source, symbolName, module, context);

        data["importedData"] = {value: token, allValues: tokens};

        return tree;
    };
}

export const insertImportRuleFactory = (
    fileName: string,
    symbolName: string,
    module: string,
    data: Record<string, Record<string, any>>
): Rule => {
    return (tree: Tree, context: SchematicContext): Tree => {
        const source = getSourceFile(tree, fileName);
        const updateRecorder = tree.beginUpdate(fileName);
        const change = _insertImport(source, fileName, symbolName, module);
        const importedData = data["importedData"]

        if (importedData === undefined) {
            throw new SchematicsException(
                `❌  Unable to verify import declaration: '${symbolName}'`
            );
        }

        if (importedData["value"] !== undefined){
            context.logger.warn(
                `Import already added: '${importedData["value"]}'  👁️`
            );
            return tree
        }

        if (change instanceof InsertChange) {
            updateRecorder.insertRight(change.pos, change.toAdd);
        }

        tree.commitUpdate(updateRecorder);

        //data["importedData"] = { ...data["importedData"], value: symbolName };
        importedData["value"] = symbolName;
        importedData["allValues"] = [symbolName];

        context.logger.info(
            `\x1b[92mImport added successfully: "${symbolName}"\x1b[0m  ✅`
        );

        return tree;
    };
};

/**
 * Gets an identifier or property access expression from those imported
 * into the given source file, for a given symbol and module.
 * @param {ts.SourceFile} source Given source file.
 * @param {string} symbolName Given symbol name.
 * @param {string} module Given module path name.
 * @param {SchematicContext} context Schematic context (needed for the logger)
 * @return The identifier or property access expressions
 */
export const getImportedIdentifier = (
    source: ts.SourceFile,
    symbolName: string,
    module: string,
    context: SchematicContext
) => {
    const tokens = getAllImportedIdentifiers(source, symbolName, module, context);

    if (tokens.length === 0) {
        return [undefined, []]
    }

    if (tokens.includes(symbolName)) {
        return [symbolName, tokens]
    }

    const token = tokens.find(t => !t.endsWith("." + symbolName)) || tokens[0];

    return [token, tokens]
}

/**
 * Gets all identifiers and property access expressions that have been
 * imported into a given source file, for a given symbol and module.
 * @param {ts.SourceFile} source Given source file.
 * @param {string} symbolName Given symbol name.
 * @param {string} module Given module path name.
 * @param {SchematicContext} context Schematic context (needed for the logger)
 * @return The identifiers and property access expressions
 */
export const getAllImportedIdentifiers = (
    source: ts.SourceFile,
    symbolName: string,
    module: string,
    context: SchematicContext
) => {
    const rootNode = source;
    const allImports = findNodes(rootNode, 2, {
        kindOrGuard: ts.isImportDeclaration,
    }) as ts.ImportDeclaration[];
    // get nodes that map to import statements from the file fileName
    const relevantImports = allImports.filter(
        node =>
            ts.isStringLiteralLike(node.moduleSpecifier) &&
            node.moduleSpecifier.text === module
    );
    const relevantSpecifiers = relevantImports.reduce((prev, curr) => {
        const namedImportBindings = curr.importClause?.namedBindings;

        if (nodeFlags(curr).includes("ThisNodeHasError")) {
            context.logger.warn(
                `Import statement with errors: '${curr.getText()}'  👁️`
            );
            return prev;
        }

        // ImportClause.text: { default as def02, Foo, Foo as fooAlias } [, stringLiteral]
        // (namedImportBindings.elements as ImportSpecifier[])[n]{ propertyName: 'default', name: 'def02' }
        // (namedImportBindings.elements as ImportSpecifier[])[n]{ propertyName: undefined, name: 'Foo' }
        // (namedImportBindings.elements as ImportSpecifier[])[n]{ propertyName: 'Foo', name: 'fooAlias }
        if (namedImportBindings && ts.isNamedImports(namedImportBindings)) {
            prev = [...prev, ...namedImportBindings.elements];
        }

        // ImportClause.text: * as def04
        // (namedImportBindings as NamespaceImport).name: 'def04'
        if (namedImportBindings && ts.isNamespaceImport(namedImportBindings)) {
            prev = [...prev, namedImportBindings];
        }

        // ImportClause.text: def03 [, {... }]
        // ImportClause.name: 'def03'
        if (curr.importClause?.name) {
            prev = [...prev, curr.importClause];
        }
        return prev;
    }, <(ts.ImportSpecifier | ts.NamespaceImport | ts.ImportClause)[]>[]);
    const relevantTokens = relevantSpecifiers.reduce((prev, curr) => {
        const name = curr.name?.escapedText.toString();
        const propertyName = (curr as ts.ImportSpecifier).propertyName?.escapedText.toString();

        if (curr.name && nodeFlags(curr.name).includes("ThisNodeHasError")) {
            context.logger.warn(`Import clause with errors: '${curr.getText()}'  👁️`);
            return prev;
        }

        ts.isImportSpecifier(curr) &&
            propertyName === "default" &&
            prev.push(name + "." + symbolName);
        ts.isImportSpecifier(curr) &&
            propertyName === undefined &&
            name === symbolName && prev.push(name );
        ts.isImportSpecifier(curr) &&
            propertyName === symbolName &&
            name && prev.push(name);
        ts.isNamespaceImport(curr) && prev.push(name + "." + symbolName);
        ts.isImportClause(curr) && prev.push(name + "." + symbolName);

        return prev;
    }, <string[]>[]);

    return [...new Set(relevantTokens)].sort();
};

