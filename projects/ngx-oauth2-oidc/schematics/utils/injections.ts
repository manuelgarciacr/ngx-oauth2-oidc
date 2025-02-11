import { Rule, SchematicContext, Tree, SchematicsException } from "@angular-devkit/schematics";
import { GlobalData, getData, getIndentation, getSourceFile, setData, ts } from "./utils";
import { findNodes } from "./find";
import { InsertChange, Change } from "@schematics/angular/utility/change";
import { getEOL } from "@schematics/angular/utility/eol";

/**
 * Function that returns the rules necessary to inject a specific symbol from the
 * indicated module. If the function can not verify if the symbol is already imported,
 * an error message is logged. If the symbol has not been imported an error message is
 * logged. If the item has already been injected, a warning message is logged; otherwise,
 * the new rules will be added to the set of rules to be dealt with.
 * @param {string} file File we want to add inject to. It is assumed to be an existing
 *      editable file.
 * @param {string} className Name of the class we want to add inject to.
 * @param {string} module Module from which to import
 * @param {string} symbol Symbol to import
 * @param {string} property Property where to inject the symbol
 * @param {string} modifiers Modifiers for the property
 * @param {string | undefined} decorator Optional name of one of the decorators in the class.
 * @param {GlobalData} data Global object that allows sharing
 *      data between rules.
 * @param {Rule[]} rules Set of rules to be dealt with.
 * @returns {Rule[]} Set of rules to be dealt with.
 */
export const insertInject = (
    file: string,
    className: string,
    module: string,
    symbol: string,
    property: string,
    modifiers: string,
    decorator: string | undefined,
    data: GlobalData,
    rules: Rule[] = []
): Rule[] => {
    //insertImport(file, module, symbol, data, rules);
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
    rules.push(
        insertInjectRuleFactory(
            file,
            className,
            module,
            symbol,
            property,
            modifiers,
            decorator,
            data
        )
    );

    return rules;
};

/**
 * Determine if an inject statement already exists. Even inside a constructor
 */
export function injectedDataRuleFactory(
    file: string,
    className: string,
    module: string,
    symbol: string,
    decorator: string | undefined,
    data: GlobalData
): Rule {
    // TODO: Optimize and clean the code
    return (tree, _context) => {
        const importedData = getData(data, "importedData", file, module, symbol);
        validateImportedData(importedData, symbol);
        const imported = importedData.allValues;
        const source = getSourceFile(tree, file);
        const classDeclaration = findNodes<ts.ClassDeclaration>(source, 1, {
            kindOrGuard: ts.isClassDeclaration,
            names: [className],
            decorator,
        })[0];
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
            const name = prop?.name?.escapedText.toString();
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
        const allValues = injections.filter(
            inj => inj[1] && imported.includes(inj[1])
        );
        const value = allValues[0];

        setData(
            data,
            { value, allValues },
            ...["injectedData", file, className, module, symbol]
        );

        return tree;
    };
}

export const insertInjectRuleFactory = (
    file: string,
    className: string,
    module: string,
    symbol: string,
    property: string,
    modifiers: string,
    decorator: string | undefined,
    data: GlobalData
): Rule => {

    return (tree: Tree, context: SchematicContext) => {

        const importedData = getData(data, "importedData", file, module, symbol);
        const injectedData = getData(data, "injectedData", file, className, module, symbol);
        validateImportedData(importedData, symbol);
        validateInjectedData(injectedData, symbol);
        const imported = importedData.value;
        const injected = injectedData.value;

        if (injected !== undefined) {
            const text = `property: ${injected[0]}, symbol: ${injected[1]}`;

            context.logger.warn(
                `👁️  Inject statement already added: '${text}'`
            );
            return tree;
        }

        const source = getSourceFile(tree, file);
        const classDeclaration = <ts.ClassDeclaration>findNodes(source, 1, {
            kindOrGuard: ts.isClassDeclaration,
            names: [className],
            decorator,
        })[0];
        const updateRecorder = tree.beginUpdate(file);

        const change = _insertInject(
            source,
            classDeclaration,
            imported,
            property,
            modifiers
        );

        if (change instanceof InsertChange) {
            updateRecorder.insertRight(change.pos, change.toAdd);
        }

        tree.commitUpdate(updateRecorder);

        const value = [property, imported];

        setData(
            data,
            { value, allValues: [value] },
            ...["injectedData", file, className, module, symbol]
        );

        context.logger.info(
            `\x1b[92m✅  Property injected successfully: ${file
                .split("/")
                .pop()} => ${className} => ${module} => ${symbol}"\x1b[0m`
        );

        return tree;
    };
};

/**
 * Add inject `modifiers propertyName = inject(symbolNameToken);` if the inject doesn't exit
 * already
 * @param source Source file we want to add inject to.
 * @param classNode Class node we want to add inject to.
 * @param imported Imported identifier name.
 * @param property Property name.
 * @param modifiers Property modifiers.
 * @return Change
 */
function _insertInject(
    source: ts.SourceFile,
    classNode: ts.ClassDeclaration,
    imported: string,
    property: string,
    modifiers: string
): Change {
    const fileToEdit = source.fileName;
    const eol = getEOL(source.getText());
    const pos = classNode.members.pos;
    const indentation = getIndentation(classNode, classNode.members, 0);

    modifiers = modifiers ? modifiers + " " : ""

    return new InsertChange(
        fileToEdit,
        pos,
        `${eol}${indentation}${modifiers}${property} = inject(${imported});`
    );
}

const validateImportedData = (importedData: GlobalData, symbol: string) => {
    if (importedData === undefined) {
        throw new SchematicsException(
            `❌  Unable to verify import declaration : '${symbol}'`
        );
    }

    if (importedData["value"] === undefined) {
        throw new SchematicsException(`❌  Import not added: '${symbol}'`);
    }
}

const validateInjectedData = (injectedData: GlobalData, symbol: string) => {
    if (injectedData === undefined) {
        throw new SchematicsException(
            `❌  Unable to verify inject declaration: '${symbol}'`
        );
    }
}
