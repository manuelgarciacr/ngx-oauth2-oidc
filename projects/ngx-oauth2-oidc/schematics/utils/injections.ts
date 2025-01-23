import { Rule, SchematicContext, Tree, SchematicsException } from "@angular-devkit/schematics";
import { getIndentation, getSourceFile, ts } from "./util";
import { getAllImportedIdentifiers, insertImport } from "./imports";
import { findNodes } from "./find";
import { insertImport as _insertImport } from "@schematics/angular/utility/ast-utils";
import { InsertChange, Change } from "@schematics/angular/utility/change";
import { getEOL } from "@schematics/angular/utility/eol";

/**
 * Function that returns the rules necessary to inject a specific symbol from the
 * indicated module. The symbol is imported. If the function can not verify
 * this import, an error message is logged. If the item has already been injected,
 * a warning message is logged; otherwise, the new rules will be added to the set
 * of rules to be dealt with.
 * @param {string} fileName File we want to add inject to. It is assumed to be an existing
 *      editable file.
 * @param {string} className Name of the class we want to add inject to.
 * @param {string | undefined} decorator Optional name of one of the decorators in the class.
 * @param {string} symbolName Symbol to import
 * @param {string} module Module from which to import
 * @param {string} propertyName Property where to inject the symbol
 * @param {string} modifiers Modifiers for the property
 * @param {Record<string, Record<string, any>>} data Global object that allows sharing
 *      data between rules.
 * @param {Rule[]} rules Set of rules to be dealt with.
 * @returns {Rule[]} Set of rules to be dealt with.
 */
export const insertInject = (
    fileName: string,
    className: string,
    decorator: string | undefined,
    symbolName: string,
    module: string,
    propertyName: string,
    modifiers: string,
    data: Record<string, Record<string, any>>,
    rules: Rule[] = []
): Rule[] => {

    insertImport(fileName, symbolName, module, data, rules);
    rules.push(injectedDataRuleFactory(fileName, className, decorator, symbolName, module, data));
    rules.push(insertInjectRuleFactory(fileName, className, decorator, symbolName, propertyName, modifiers, data));

    return rules;
};

/**
 * Determine if an inject statement already exists. Even inside a constructor
 */
export function injectedDataRuleFactory(
    fileName: string,
    className: string,
    decorator: string | undefined,
    symbolName: string,
    module: string,
    data: Record<string, Record<string, any>>
): Rule {
    return (tree, context) => {
        const source = getSourceFile(tree, fileName);
        const tokens = getAllImportedIdentifiers(source, symbolName, module, context);
        const classDeclaration = <ts.ClassDeclaration>(
            findNodes(source, 1, { kindOrGuard: ts.isClassDeclaration, name: className, decorator })[0]
        );
        const getData01 = (st: ts.PropertyDeclaration) => {
            const modifiers = st.modifiers; // [private, readonly]
            const prop = st as ts.PropertyDeclaration;
            const name = prop.name?.getText();
            const call = prop.initializer as ts.CallExpression;
            const inject = call?.expression;
            const arg = call?.arguments?.[0] as
                | ts.Identifier
                | ts.PropertyAccessExpression;
            const id = arg?.getText();
            // Filter condition
            const condition =
                name &&
                call &&
                ts.isCallExpression(call) &&
                inject &&
                ts.isIdentifier(inject) &&
                inject?.escapedText === "inject" &&
                arg &&
                (ts.isIdentifier(arg) || ts.isPropertyAccessExpression(arg));
            // Map output
            const mapOutput: [string, string] = [name, id];

            return {
                modifiers,
                prop,
                name,
                call,
                inject,
                arg,
                id,
                condition,
                mapOutput,
            };
        };
        const getData02 = (st: ts.BinaryExpression) => {
            const prefix = st.getFirstToken()?.getText(); // this
            const prop = st.left as ts.PropertyAccessExpression;
            const name = prop?.name.escapedText.toString();
            const call = st.right as ts.CallExpression;
            const inject = call?.expression;
            const arg = call?.arguments?.[0] as
                | ts.Identifier
                | ts.PropertyAccessExpression;
            const id = arg?.getText();
            // Filter condition
            const condition =
                name &&
                call &&
                ts.isCallExpression(call) &&
                inject &&
                ts.isIdentifier(inject) &&
                inject?.escapedText === "inject" &&
                arg &&
                (ts.isIdentifier(arg) || ts.isPropertyAccessExpression(arg));
            // Map output
            const mapOutput: [string, string] = [name, id];

            return {
                prefix,
                prop,
                name,
                call,
                inject,
                arg,
                id,
                condition,
                mapOutput,
            };
        };
        const getData03 = (st: ts.ParameterDeclaration) => {
            const name = st.name?.getText();
            const type = st.type as ts.TypeReferenceNode;
            const id = st.type?.getText();
            // Filter condition
            const condition = name && type && ts.isTypeReferenceNode(type);
            // Map output
            const mapOutput: [string, string | undefined] = [name, id];

            return { name, type, id, condition, mapOutput };
        };
        const findStatements01 = (): ts.PropertyDeclaration[] =>
            findNodes(classDeclaration, Infinity, {
                kindOrGuard: ts.isPropertyDeclaration,
            });
        const findStatements02 = (): ts.BinaryExpression[] =>
            findNodes(classDeclaration, Infinity, {
                kindOrGuard: ts.isBinaryExpression,
            });
        const findStatements03 = (): ts.ParameterDeclaration[] =>
            findNodes(classDeclaration, Infinity, {
                kindOrGuard: ts.isConstructorDeclaration,
            }).flatMap(st =>
                findNodes(st, Infinity, { kindOrGuard: ts.isParameter })
            );
        const injections01 = findStatements01()
            .filter(st => getData01(st).condition)
            .map(st => getData01(st).mapOutput);
        const injections02 = findStatements02()
            .filter(st => getData02(st).condition)
            .map(st => getData02(st).mapOutput);
        const injections03 = findStatements03()
            .filter(st => getData03(st).condition)
            .map(st => getData03(st).mapOutput);
        const injections = [...injections01, ...injections02, ...injections03];
        const injection = injections.find(
            curr => curr[1] && tokens.includes(curr[1])
        );

        data["injectedData"] = { value: injection, allValues: injections };

        return tree;
    };
}

export const insertInjectRuleFactory = (
    fileName: string,
    className: string,
    decorator: string | undefined,
    symbolName: string,
    propertyName: string,
    modifiers: string,
    data: Record<string, Record<string, any>>
): Rule => {
    return (tree: Tree, context: SchematicContext) => {
        const source = getSourceFile(tree, fileName);
        const classDeclaration = <ts.ClassDeclaration>(
            findNodes(source, 1, {
                kindOrGuard: ts.isClassDeclaration,
                name: className,
                decorator,
            })[0]
        );
        const pos = classDeclaration.members.pos;
        const updateRecorder = tree.beginUpdate(fileName);
        const importedData = data["importedData"];
        const injectedData = data["injectedData"];

        if (importedData === undefined) {
            throw new SchematicsException(
                `❌  Unable to verify import declaration : '${symbolName}'`
            );
        }

        if (injectedData === undefined) {
            throw new SchematicsException(
                `❌  Unable to verify inject declaration: '${symbolName}'`
            );
        }

        const imported = importedData["value"];
        const injected = injectedData["value"];

        if (imported === undefined) {
            throw new SchematicsException(
                `❌  Import not added: '${symbolName}'`
            );
        }

        if (injected !== undefined) {
            const text = `property: ${injected[0]}, symbol: ${injected[1]}`

            context.logger.warn(
                `Inject statement already added: '${text}'  👁️`
            );
            return tree;
        }

        const change = _insertInject(
            source,
            imported,
            propertyName,
            pos,
            modifiers
        );

        if (change instanceof InsertChange) {
            updateRecorder.insertRight(change.pos, change.toAdd);
        }

        tree.commitUpdate(updateRecorder);

        const injection = [propertyName, symbolName];

        data["injectedData"] = { value: injection, allValues: [injection]};

        context.logger.info(
            `\x1b[92mProperty injected successfully: "${propertyName}"\x1b[0m  ✅`
        )

        return tree;
    };
};

/**
 * Add inject `modifiers propertyName = inject(symbolNameToken);` if the inject doesn't exit
 * already
 * @param source Source file we want to add inject to.
 * @param imported Imported identifier name.
 * @param propertyName Property name.
 * @param pos Insertion position.
 * @param modifiers Property modifiers.
 * @return Change
 */
function _insertInject(
    source: ts.SourceFile,
    imported: string,
    propertyName: string,
    pos: number,
    modifiers: string
): Change {
    const fileToEdit = source.fileName;
    const eol = getEOL(source.getText());
    const indentation = getIndentation(source.getFullText());

    modifiers = modifiers ? modifiers + " " : ""

    return new InsertChange(
        fileToEdit,
        pos,
        `${eol}${indentation}${modifiers}${propertyName} = inject(${imported});`
    );
}

