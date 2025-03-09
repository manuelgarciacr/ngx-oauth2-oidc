import { Rule, SchematicContext, Tree, SchematicsException } from "@angular-devkit/schematics";
import { ts, getSourceFile, nodeFlags, GlobalData, setData, getData } from "./utils";
import { findNodes } from "./find";
import { insertImport as _insertImport } from "@schematics/angular/utility/ast-utils";
import { InsertChange } from "@schematics/angular/utility/change";

// TODO: To add an import alias

export const messageText = (
    file: string,
    module: string,
    symbol: string,
    symbolId?: string,
    asText: boolean = false
) =>
    asText
        ? `${file.split("/").pop()} => ${module} => ${symbol}${
              symbolId ? " '" + symbolId + "'" : ""
          }`
        : `${file.split("/").pop()} => ${module} => ${symbol}${
              symbolId && symbolId !== symbol ? " (alias " + symbolId + ")" : ""
          }`;

/**
 * Function that returns the rules necessary to import a specific symbol from the indicated
 * module. If the item has already been imported, a warning message is logged; otherwise,
 * the new rules will be added to the set of rules to be dealt with.
 * @param {string} file File we want to add import to. It is assumed to be an existing
 *      editable file.
 * @param {string} module Module from which to import
 * @param {string} symbol Symbol to import
 * @param {string | null | undefined} _alias Symbol alias (Future use)
 * @param {boolean} alreadyAddedWarning If it is true, a warning message can be displayed.
 * @param {GlobalData} data Global object that allows sharing
 *      data between rules.
 * @param {Rule[]} rules Set of rules to be dealt with.
 * @returns {Rule[]} Set of rules to be dealt with.
 */
export const insertImport = (
    file: string,
    module: string,
    symbol: string,
    _alias: string | null | undefined,
    alreadyAddedWarning: boolean,
    data: GlobalData,
    rules: Rule[]
): Rule[] => {
    rules.push(importedDataRuleFactory(file, module, symbol, _alias, data));
    rules.push(insertImportRuleFactory(file, module, symbol, _alias, alreadyAddedWarning, data));

    return rules;
};

/**
 * Determine if the item has already been imported. Even within another import or namespace
 * @param {string} file File we want to add import to. It is assumed to be an existing
 *      editable file.
 * @param {string} module Module from which to import
 * @param {string} symbol Symbol to import
 * @param {string | null | undefined} _alias Symbol alias (Future use)
 * @param {GlobalData} data Global object that allows sharing
 *      data between rules.
 * @returns {Rule} The rule that adds the imported identifier, if any, into the global
 *      'data' object.
 */
export function importedDataRuleFactory(
    file: string,
    module: string,
    symbol: string,
    _alias: string | null | undefined,
    data: GlobalData
): Rule {
    return (tree: Tree, context: SchematicContext) => {
        const source = getSourceFile(tree, file);
        const [value, allValues] = getImportedIdentifier(
            source,
            module,
            symbol,
            context
        );

        setData(
            data,
            { value, allValues },
            ...["importedData", file, module, symbol]
        );

        return tree;
    };
}

export const insertImportRuleFactory = (
    file: string,
    module: string,
    symbol: string,
    _alias: string | null | undefined,
    alreadyAddedWarning: boolean,
    data: GlobalData
): Rule => {
    return (tree: Tree, context: SchematicContext): Tree => {
        const source = getSourceFile(tree, file);
        const updateRecorder = tree.beginUpdate(file);
        const change = _insertImport(source, file, symbol, module);
        const dataKeys = ["importedData", file, module, symbol];
        const importedData = getData(
            data,
            ...dataKeys
        );
        const _messageText = messageText(file, module, symbol, importedData?.["value"]);

        if (importedData === undefined) {
            throw new SchematicsException(
                `❌  Unable to verify import declaration: ${_messageText}`
            );
        }

        if (importedData["value"] !== undefined) {
            alreadyAddedWarning &&
                context.logger.warn(
                    `👁️  Import already added: ${_messageText}`
                );
            !alreadyAddedWarning &&
                context.logger.info(
                    `\x1b[92m✅  Import already added: ${_messageText}\x1b[0m`
                );
            return tree;
        }

        if (change instanceof InsertChange) {
            updateRecorder.insertRight(change.pos, change.toAdd);
        }

        tree.commitUpdate(updateRecorder);

        setData(
            data,
            { value: symbol, allValues: [symbol] },
            ...dataKeys
        );

        context.logger.info(
            `\x1b[92m✅  Import added successfully: ${_messageText}\x1b[0m`
        );

        return tree;
    };
};

/**
 * Gets an identifier or property access expression from those imported
 * into the given source file, for a given symbol and module.
 * @param {ts.SourceFile} source Given source file.
 * @param {string} module Given module path name.
 * @param {string} symbol Given symbol name.
 * @param {SchematicContext} context Schematic context (needed for the logger)
 * @return The identifier or property access expressions
 */
export const getImportedIdentifier = (
    source: ts.SourceFile,
    module: string,
    symbol: string,
    context: SchematicContext
) => {
    const tokens = getAllImportedIdentifiers(
        source,
        module,
        symbol,
        context
    );

    if (tokens.length === 0) {
        return [undefined, []];
    }

    if (tokens.includes(symbol)) {
        return [symbol, tokens];
    }

    const token = tokens.find(t => !t.endsWith("." + symbol)) || tokens[0];

    return [token, tokens];
};

/**
 * Gets all identifiers and property access expressions that have been
 * imported into a given source file, for a given symbol and module.
 * @param {ts.SourceFile} source Given source file.
 * @param {string} module Given module path name.
 * @param {string} symbol Given symbol name.
 * @param {SchematicContext} context Schematic context (needed for the logger)
 * @return The identifiers and property access expressions
 */
export const getAllImportedIdentifiers = (
    source: ts.SourceFile,
    module: string,
    symbol: string,
    context: SchematicContext
) => {
    const file = source.fileName.split("/").pop() ?? "fileName";
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
        const _messageText = messageText(
            file,
            module,
            symbol,
            curr.getText(),
            true
        );

        if (nodeFlags(curr).includes("ThisNodeHasError")) {
            context.logger.warn(
                `👁️  Import statement with errors: ${_messageText}`
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
        const propertyName = (
            curr as ts.ImportSpecifier
        ).propertyName?.escapedText.toString();
        const _messageText = messageText(
            file,
            module,
            symbol,
            curr.getText(),
            true
        );

        if (curr.name && nodeFlags(curr.name).includes("ThisNodeHasError")) {
            context.logger.warn(
                `👁️  Import clause with errors: ${_messageText}`
            );
            return prev;
        }

        ts.isImportSpecifier(curr) &&
            propertyName === "default" &&
            prev.push(name + "." + symbol);
        ts.isImportSpecifier(curr) &&
            propertyName === undefined &&
            name === symbol &&
            prev.push(name);
        ts.isImportSpecifier(curr) &&
            propertyName === symbol &&
            name &&
            prev.push(name);
        ts.isNamespaceImport(curr) && prev.push(name + "." + symbol);
        ts.isImportClause(curr) && prev.push(name + "." + symbol);

        return prev;
    }, <string[]>[]);

    return [...new Set(relevantTokens)].sort();
};

