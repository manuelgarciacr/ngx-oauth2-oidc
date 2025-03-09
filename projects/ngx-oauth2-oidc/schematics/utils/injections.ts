import { Rule, SchematicContext, Tree, SchematicsException } from "@angular-devkit/schematics";
import { GlobalData, getData, getInBlockIndentation, getSourceFile, setData, ts } from "./utils";
import { findNodes } from "./find";
import { InsertChange, Change } from "@schematics/angular/utility/change";
import { getEOL } from "@schematics/angular/utility/eol";
import { messageText as importMessageText} from "./imports";

const injectionMessageText = (
    file: string,
    className: string,
    decorator: string | null | undefined,
    module: string,
    symbol: string,
    symbolId: string | null | undefined,
    property: string,
    propertyId: string | null | undefined
) =>
    `${file.split("/").pop()} => ${className}${
        decorator ? "@" + decorator : ""
    } => ${module} => ${symbol}${
        symbolId && symbolId !== symbol ? " (alias " + symbolId + ")" : ""
    } => ${property}${
        propertyId && propertyId !== property
            ? " (alias " + propertyId + ")"
            : ""
    }`;

/**
 * Function that returns the rules necessary to inject a specific symbol from the
 * indicated module. If the function can not verify if the symbol is already imported,
 * an error message is logged. If the symbol has not been imported an error message is
 * logged. If the item has already been injected, a warning message is logged; otherwise,
 * the new rules will be added to the set of rules to be dealt with.
 * @param {string} file File we want to add inject to. It is assumed to be an existing
 *      editable file.
 * @param {string} className Name of the class we want to add inject to.
 * @param {string | null | undefined} decorator Optional name of one of the decorators in the class.
 * @param {string} module Module from which to import
 * @param {string} symbol Symbol to import
 * @param {string} property Property where to inject the symbol
 * @param {string} modifiers Modifiers for the property
 * @param {boolean} alreadyAddedWarning If it is true, a warning message can be displayed.
 * @param {GlobalData} data Global object that allows sharing
 *      data between rules.
 * @param {Rule[]} rules Set of rules to be dealt with.
 * @returns {Rule[]} Set of rules to be dealt with.
 */
export const insertInject = (
    file: string,
    className: string,
    decorator: string | null | undefined,
    module: string,
    symbol: string,
    property: string,
    modifiers: string,
    alreadyAddedWarning: boolean,
    data: GlobalData,
    rules: Rule[] = []
): Rule[] => {
    //insertImport(file, module, symbol, data, rules);
    rules.push(
        injectedDataRuleFactory(
            file,
            className,
            decorator,
            module,
            symbol,
            data
        )
    );
    rules.push(
        insertInjectRuleFactory(
            file,
            className,
            decorator,
            module,
            symbol,
            property,
            modifiers,
            alreadyAddedWarning,
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
    decorator: string | null | undefined,
    module: string,
    symbol: string,
    data: GlobalData
): Rule {
    // TODO: Optimize and clean the code
    return (tree, _context) => {
        const injectImportedData = getData(
            data,
            "importedData",
            file,
            "@angular/core",
            "inject"
        );
        const _injectImportMessageText = importMessageText(
            file,
            "@angular/core",
            "inject",
            injectImportedData?.["value"]
        );
        validateImportedData(injectImportedData, _injectImportMessageText);
        const symbolImportedData = getData(
            data,
            "importedData",
            file,
            module,
            symbol
        );
        const _symbolImportMessageText = importMessageText(
            file,
            module,
            symbol,
            symbolImportedData?.["value"]
        );
        validateImportedData(symbolImportedData, _symbolImportMessageText);
        const allInjectId = injectImportedData.allValues;
        const allSymbolId = symbolImportedData.allValues;
        const source = getSourceFile(tree, file);
        const classDeclaration = findNodes<ts.ClassDeclaration>(source, 1, {
            kindOrGuard: ts.isClassDeclaration,
            names: [className],
            decorator,
        })[0];
        const getData01 = (st: ts.PropertyDeclaration) => {
            // const modifiers = st.modifiers; // [private, readonly] Future use
            const prop = st as ts.PropertyDeclaration;
            const propertyId = prop.name?.getText() ?? "";
            const call = prop.initializer as ts.CallExpression;
            const injectCall = call?.expression as ts.Identifier;
            const arg = call?.arguments?.[0] as
                | ts.Identifier
                | ts.PropertyAccessExpression;
            const symbolId = arg?.getText() ?? "";
            const injectId = injectCall?.escapedText?.toString() ?? "";
            // Filter condition
            const condition =
                propertyId &&
                call &&
                ts.isCallExpression(call) &&
                injectCall &&
                ts.isIdentifier(injectCall) &&
                arg &&
                (ts.isIdentifier(arg) || ts.isPropertyAccessExpression(arg)) &&
                symbolId;
            // Map output
            const mapOutput = {
                propertyId,
                symbolId,
                injectId,
            };

            return {
                // modifiers,
                condition,
                mapOutput,
            };
        };
        const getData02 = (st: ts.BinaryExpression) => {
            // const prefix = st.getFirstToken()?.getText(); // this. Future use
            const prop = st.left as ts.PropertyAccessExpression;
            const propertyId = prop?.name?.escapedText?.toString() ?? "";
            const call = st.right as ts.CallExpression;
            const injectCall = call?.expression as ts.Identifier;
            const arg = call?.arguments?.[0] as
                | ts.Identifier
                | ts.PropertyAccessExpression;
            const symbolId = arg?.getText() ?? "";
            const injectId = injectCall?.escapedText?.toString() ?? "";
            // Filter condition
            const condition =
                propertyId &&
                call &&
                ts.isCallExpression(call) &&
                injectCall &&
                ts.isIdentifier(injectCall) &&
                arg &&
                (ts.isIdentifier(arg) || ts.isPropertyAccessExpression(arg)) &&
                symbolId;
            // Map output
            const mapOutput = { propertyId, symbolId, injectId };

            return {
                // prefix,
                condition,
                mapOutput,
            };
        };
        const getData03 = (st: ts.ParameterDeclaration) => {
            const propertyId = st.name?.getText();
            const type = st.type as ts.TypeReferenceNode;
            const symbolId = st.type?.getText() ?? "";
            // Filter condition
            const condition = propertyId && type && ts.isTypeReferenceNode(type) && symbolId;
            // Map output
            const mapOutput = {propertyId, symbolId, injectId: undefined};

            return { condition, mapOutput };
        };
        const findStatements01 = (): ts.PropertyDeclaration[] =>
            findNodes(classDeclaration, 1, {
                kindOrGuard: ts.isPropertyDeclaration,
            });
        const findStatements02 = (): ts.BinaryExpression[] =>
            findNodes(classDeclaration, 1, {
                kindOrGuard: ts.isBinaryExpression,
            });
        const findStatements03 = (): ts.ParameterDeclaration[] =>
            findNodes(classDeclaration, 1, {
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
        const allValues = injections
            .filter(inj => inj.symbolId && allSymbolId.includes(inj.symbolId))
            .filter(inj => inj.injectId && allInjectId.includes(inj.injectId));
        const value = allValues[0];

        setData(
            data,
            { value, allValues },
            ...[
                "injectedData",
                file,
                className,
                decorator ?? "",
                module,
                symbol,
            ]
        );

        return tree;
    };
}

export const insertInjectRuleFactory = (
    file: string,
    className: string,
    decorator: string | null | undefined,
    module: string,
    symbol: string,
    property: string,
    modifiers: string,
    alreadyAddedWarning: boolean,
    data: GlobalData
): Rule => {
    return (tree: Tree, context: SchematicContext) => {
        const dataKeys = [
            "injectedData",
            file,
            className,
            decorator ?? "",
            module,
            symbol,
        ];
        const injectedData = getData(
            data,
            ...dataKeys
        );
        let { propertyId = null, symbolId = null } = injectedData?.value ?? {}
        let _injectionMessageText = injectionMessageText(
            file,
            className,
            decorator,
            module,
            symbol,
            symbolId,
            property,
            propertyId
        );

        validateInjectedData(injectedData, _injectionMessageText);

        if (propertyId) {
            alreadyAddedWarning &&
                context.logger.warn(
                    `👁️  Property already injected: ${_injectionMessageText}`
                );
            !alreadyAddedWarning &&
                context.logger.info(
                    `\x1b[92m✅  Property already injected: ${_injectionMessageText}\x1b[0m`
                );
            return tree;
        }

        const source = getSourceFile(tree, file);
        const classDeclaration = <ts.ClassDeclaration>findNodes(source, 1, {
            kindOrGuard: ts.isClassDeclaration,
            names: [className],
            decorator,
        })[0];
        const injectImportedData = getData(
            data,
            "importedData",
            file,
            "@angular/core",
            "inject"
        );
        const symbolImportedData = getData(
            data,
            "importedData",
            file,
            module,
            symbol
        );
        const injectId = injectImportedData.value;
        symbolId = symbolImportedData.value;
        _injectionMessageText = injectionMessageText(
            file,
            className,
            decorator,
            module,
            symbol,
            symbolId,
            property,
            null
        );
        const updateRecorder = tree.beginUpdate(file);

        const change = _insertInject(
            source,
            classDeclaration,
            injectId,
            symbolId,
            property,
            modifiers
        );

        if (change instanceof InsertChange) {
            updateRecorder.insertRight(change.pos, change.toAdd);
        }

        tree.commitUpdate(updateRecorder);

        const value = {propertyId: property, symbolId, injectId};

        setData(
            data,
            { value, allValues: [value] },
            ...dataKeys
        );

        context.logger.info(
            `\x1b[92m✅  Property injected successfully: ${_injectionMessageText}\x1b[0m`
        );

        return tree;
    };
};

/**
 * Add inject `modifiers propertyName = inject(symbolNameToken);` if the inject doesn't exit
 * already
 * @param sourceFile Source file we want to add inject to.
 * @param classNode Class node we want to add inject to.
 * @param imported Imported identifier name.
 * @param property Property name.
 * @param modifiers Property modifiers.
 * @return Change
 */
function _insertInject(
    sourceFile: ts.SourceFile,
    classNode: ts.ClassDeclaration,
    injectImported: string,
    symbolImported: string,
    property: string,
    modifiers: string
): Change {
    const fileToEdit = sourceFile.fileName;
    const source = sourceFile.getFullText();
    const eol = getEOL(source);
    const [_parentIndentation, indentation] = getInBlockIndentation(classNode, source, eol, "first");

    modifiers = modifiers ? modifiers + " " : "";

    return new InsertChange(
        fileToEdit,
        classNode.members.pos,
        `${eol}${indentation}${modifiers}${property} = ${injectImported}(${symbolImported});`
    );
}

const validateImportedData = (importedData: GlobalData, messageText: string) => {

    if (importedData === undefined) {
        throw new SchematicsException(
            `❌  Unable to verify import declaration: ${messageText}`
        );
    }

    if (importedData["value"] === undefined) {
        throw new SchematicsException(`❌  Import not added: ${messageText}`);
    }
}

const validateInjectedData = (injectedData: GlobalData, messageText: string) => {
    if (injectedData === undefined) {
        throw new SchematicsException(
            `❌  Unable to verify inject declaration: ${messageText}`
        );
    }
}
