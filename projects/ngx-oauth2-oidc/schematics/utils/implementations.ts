import {
    InsertChange,
    ReplaceChange,
    Rule,
    SchematicContext,
    SchematicsException,
    Tree,
    getEOL,
    getSourceFile,
    ts,
} from ".";
import {
    GlobalData,
    getData,
    getInBlockIndentation,
    setData,
} from "./utils";
import { findNodes } from "./find";

export const implementationsCode = {
    constructor: `    __mod__constructor() {
    }`,
    ngOnChanges: `    __mod__ngOnChanges(changes: SimpleChanges) {
    }`,
    ngOnInit: `    __mod__ngOnInit():__void__ {
    }`,
    ngDoCheck: `    __mod__ngDoCheck():__void__ {
    }`,
    ngAfterContentInit: `    __mod__ngAfterContentInit():__void__ {
    }`,
    ngAfterContentChecked: `    __mod__ngAfterContentChecked():__void__ {
    }`,
    ngAfterViewInit: `    __mod__ngAfterViewInit():__void__ {
    }`,
    ngAfterViewChecked: `    __mod__ngAfterViewChecked():__void__ {
    }`,
    ngOnDestroy: `    __mod__ngOnDestroy():__void__ {
    }`,
    // TODO: add modifiers
    getCode(
        name: string,
        indentation: string,
        requiredModifiers: string[]
    ): string {
        const key = name as Exclude<
            keyof typeof implementationsCode,
            "getCode" | "getOrder"
        >;
        const __mod = requiredModifiers.length
            ? requiredModifiers.join(" ") + " "
            : "";
        const __void = requiredModifiers.includes("async")
            ? " Promise<void>"
            : " void";

        return this[key]
            .replaceAll("    ", indentation)
            .replaceAll("__mod__", __mod)
            .replaceAll("__void__", __void);
    },
    getOrder(name: string): number {
        const key = name as Exclude<
            keyof typeof implementationsCode,
            "getCode" | "getOrder"
        >;
        return Object.keys(implementationsCode).indexOf(key);
    },
};
const messageText = (
    file: string,
    className: string,
    decorator: string | null | undefined,
    implementation: string,
    modifiers: string[]
) =>
    `${file.split("/").pop()} => ${className}${
        decorator ? "@" + decorator : ""
    } => ${modifiers.concat([implementation]).join(" ")}`;

/**
 * Function that returns the rules necessary to add a specific implementation. If the
 * implementation has already been added, a warning message is logged; otherwise, the
 * new rules will be added to the set of rules to be dealt with.
 * @param {string} file File we want to add implementation to. It is assumed to be an existing
 *      editable file.
 * @param {string} className Name of the class we want to add implementation to.
 * @param {string | null | undefined} decorator Optional name of one of the decorators in the class.
 * @param {string} implementation Implementation to include
 * @param {string[]} modifiers Implementation modifiers
 * @param {boolean} alreadyAddedWarning If it is true, a warning message can be displayed.
 * @param {GlobalData} data Global object that allows sharing
 *      data between rules.
 * @param {Rule[]} rules Set of rules to be dealt with.
 * @returns {Rule[]} Set of rules to be dealt with.
 */
export const insertImplementation = async (
    file: string,
    className: string,
    decorator: string | undefined,
    implementation: string,
    modifiers: string[],
    alreadyAddedWarning: boolean,
    data: GlobalData,
    rules: Rule[] = []
): Promise<Rule[]> => {
    rules.push(
        implementedDataRuleFactory(
            file,
            className,
            decorator,
            implementation,
            modifiers,
            data
        )
    );
    rules.push(
        insertImplementationRuleFactory(
            file,
            className,
            decorator,
            implementation,
            modifiers,
            alreadyAddedWarning,
            data
        )
    );

    return rules;
};

/**
 * Determine if the implementation has already been included.
 * @param {string} file File we want to add implementation to. It is assumed to be an existing
 *      editable file.
 * @param {string} className Name of the class we want to include implementation to.
 * @param {string | null | undefined} decorator Optional name of one of the decorators in the class.
 * @param {string} implementation Implementation to include
 * @param {string[]} modifiers Implementation modifiers
 * @param {GlobalData} data Global object that allows sharing
 *      data between rules.
 * @returns {Rule} The rule that adds the implemented data, if any, into the global
 *      'data' object.
 */
export function implementedDataRuleFactory(
    file: string,
    className: string,
    decorator: string | null | undefined,
    implementation: string,
    modifiers: string[],
    data: GlobalData
): Rule {
    return (tree: Tree, context: SchematicContext) => {
        const source = getSourceFile(tree, file);
        const classDeclaration = <ts.ClassDeclaration>findNodes(source, 1, {
            kindOrGuard: ts.isClassDeclaration,
            names: [className],
            decorator,
        })[0];
        const _messageText = messageText(
            file,
            className,
            decorator,
            implementation,
            modifiers
        );

        if (!Object.keys(implementationsCode).includes(implementation)) {
            throw new SchematicsException(
                `❌  Name of the function to be implemented unknown: '${_messageText}'`
            );
        }

        const members = classDeclaration.members;
        const implementations =
            implementation === "constructor"
                ? members.filter(n => ts.isConstructorDeclaration(n))
                : members.filter(
                      n =>
                          ts.isMethodDeclaration(n) &&
                          n.name.getText() === implementation
                  );

        if (!implementations.length) {
            implementations.push(
                ...members.filter(
                    n =>
                        ts.isPropertyDeclaration(n) &&
                        !!n.initializer &&
                        ts.isArrowFunction(n.initializer) &&
                        n.name.getText() === implementation
                )
            );
        }

        const impl = implementations[0];
        const implementedModifiers = <string[]>[];
        let type = "";
        let arrowFn;

        if (impl && ts.isConstructorDeclaration(impl)) {
            impl.modifiers?.forEach(n =>
                implementedModifiers.push(n.getText())
            );
            type = "CONSTRUCTOR";
        }

        if (impl && ts.isMethodDeclaration(impl)) {
            impl.modifiers?.forEach(n =>
                implementedModifiers.push(n.getText())
            );
            type = "METHOD";
        }

        if (impl && ts.isPropertyDeclaration(impl)) {
            arrowFn = impl.initializer as ts.ArrowFunction;

            impl.modifiers?.forEach(n =>
                implementedModifiers.push(n.getText())
            );
            arrowFn.modifiers?.forEach(n =>
                implementedModifiers.push(n.getText())
            );
            type = "PROPERTY";
        }

        const returnType = arrowFn
            ? arrowFn.type?.getText()
            : impl
            ? (impl as ts.SignatureDeclaration).type?.getText()
            : undefined;
        // throws errors
        const requiredModifiers = getModifiers(
            modifiers,
            implementedModifiers,
            _messageText
        );
        const canReturnAPromise =
            !returnType ||
            returnType.replaceAll(/\s/g, "").startsWith("Promise<");
        const isAsync = requiredModifiers.includes("async");
        const promiseRequired =
            isAsync && !canReturnAPromise
                ? `Promise<${returnType}>`
                : undefined;

        if (isEqual(implementedModifiers, requiredModifiers, true))
            requiredModifiers.splice(0);

        if (!!requiredModifiers.length && implementations.length > 1) {
            context.logger.warn(
                `👁️  Multiple implementations, only one will be updated: ${_messageText}`
            );
        }

        const interfaceOrClass = implementation.startsWith("ng")
            ? implementation.substring(2)
            : undefined;
        const heritageClauses = classDeclaration.heritageClauses;
        const implementClause = heritageClauses?.filter(
            n => n.token === ts.SyntaxKind.ImplementsKeyword
        )?.[0];
        const implementClauseItems = implementClause?.types.map(n =>
            (n.expression as ts.Identifier)?.escapedText?.toString()
        );
        const inHeritageClause =
            implementClauseItems?.includes(interfaceOrClass ?? "") ?? false;

        setData(
            data,
            {
                interfaceOrClass,
                inHeritageClause,
                requiredModifiers,
                promiseRequired,
                type,
            },
            ...[
                "implementedData",
                file,
                className,
                implementation,
                decorator ?? "",
            ]
        );

        return tree;
    };
}

/**
 * Implements a method if it has not yet been implemented
 * @param {string} file File we want to add implementation to. It is assumed to be an existing
 *      editable file.
 * @param {string} className Name of the class we want to include implementation to.
 * @param {string | null | undefined} decorator Optional name of one of the decorators in the class.
 * @param {string} implementation Implementation to include
 * @param {string[]} modifiers Implementation modifiers
 * @param {boolean} alreadyAddedWarning If it is true, a warning message can be displayed.
 * @param {GlobalData} data Global object that allows sharing
 *      data between rules.
 * @returns {Rule} The rule that adds the implemented data, if any, into the global
 *      'data' object.
 */
export const insertImplementationRuleFactory = (
    file: string,
    className: string,
    decorator: string | null | undefined,
    implementation: string,
    modifiers: string[],
    alreadyAddedWarning: boolean,
    data: GlobalData
): Rule => {
    return (tree: Tree, context: SchematicContext) => {
        const dataKeys = [
            "implementedData",
            file,
            className,
            implementation,
            decorator ?? "",
        ];
        const implementedData: Record<string, any> & {
            requiredModifiers: string[];
        } = getData(
            data,
            ...dataKeys
        );
        const _messageText = messageText(
            file,
            className,
            decorator,
            implementation,
            modifiers
        );

        const isAllOk = validateImplementedData(
            implementedData,
            _messageText,
            context
        );

        if (isAllOk) {
            alreadyAddedWarning &&
                context.logger.warn(
                    `👁️  Method already added: ${_messageText}`
                );
            !alreadyAddedWarning &&
                context.logger.info(
                    `\x1b[92m✅  Method already added: ${_messageText}\x1b[0m`
                );
            return;
        }

        const sourceFile = getSourceFile(tree, file);
        const source = sourceFile.getFullText();
        const classDeclaration = <ts.ClassDeclaration>findNodes(sourceFile, 1, {
            kindOrGuard: ts.isClassDeclaration,
            names: [className],
            decorator,
        })[0];
        const heritageClauses = classDeclaration.heritageClauses;
        const implementClause = heritageClauses?.filter(
            n => n.token === ts.SyntaxKind.ImplementsKeyword
        )?.[0];
        const eol = getEOL(source);
        const members = classDeclaration.members;
        const { interfaceOrClass, requiredModifiers, promiseRequired } =
            implementedData;
        const updateRecorder = tree.beginUpdate(file);

        let { inHeritageClause, type } = implementedData;
        let impl: ts.ClassElement | undefined;
        let arrowFn: ts.ArrowFunction | undefined;

        if (type === "CONSTRUCTOR") {
            impl = members.filter(n => ts.isConstructorDeclaration(n))[0];
        }
        if (type === "METHOD") {
            impl = members.filter(
                n =>
                    ts.isMethodDeclaration(n) &&
                    n.name.getText() === implementation
            )[0];
        }
        if (type === "PROPERTY") {
            impl = members.filter(
                n =>
                    ts.isPropertyDeclaration(n) &&
                    n.name.getText() === implementation
            )[0];
            arrowFn = (impl as ts.PropertyDeclaration)
                .initializer as ts.ArrowFunction;
        }
        const returnType = arrowFn
            ? arrowFn.type
            : impl
            ? (impl as ts.SignatureDeclaration).type
            : undefined;

        if (interfaceOrClass && !inHeritageClause && !implementClause) {
            const pos = classDeclaration.name!.end;
            const change = new InsertChange(
                file,
                pos,
                ` implements ${interfaceOrClass} `
            );

            if (change instanceof InsertChange) {
                updateRecorder.insertRight(change.pos, change.toAdd);
                inHeritageClause = true;
            }
        } else if (interfaceOrClass && !inHeritageClause) {
            const pos = implementClause!.end;
            const change = new InsertChange(file, pos, `, ${interfaceOrClass}`);

            if (change instanceof InsertChange) {
                updateRecorder.insertRight(change.pos, change.toAdd);
                inHeritageClause = true;
            }
        }

        if (returnType && promiseRequired) {
            const replacePos = returnType.getStart();
            const oldText = returnType.getText();
            // const replaceLength = endPos - replacePos;
            const change = new ReplaceChange(
                file,
                replacePos,
                oldText,
                promiseRequired
            );

            if (change instanceof ReplaceChange) {
                updateRecorder.remove(change.order, oldText.length);
                updateRecorder.insertRight(change.order, change.newText);
            }
        }

        const newModifiers =
            type === "PROPERTY"
                ? requiredModifiers.filter(val => val !== "async")
                : type === ""
                ? []
                : requiredModifiers;

        if (newModifiers.length) {
            const replacePos = impl!.getStart();
            const endPos = impl!.name!.getStart();
            const replaceLength = endPos - replacePos;
            const change = new ReplaceChange(
                file,
                replacePos,
                "",
                newModifiers.join(" ") + " "
            );

            if (change instanceof ReplaceChange) {
                updateRecorder.remove(change.order, replaceLength);
                updateRecorder.insertRight(change.order, change.newText);
            }
        }

        if (type === "PROPERTY" && requiredModifiers.includes("async")) {
            const replacePos = arrowFn!.pos;
            const endPos = arrowFn!.getStart();
            const replaceLength = endPos - replacePos;
            const change = new ReplaceChange(file, replacePos, "", " async ");

            if (change instanceof ReplaceChange) {
                updateRecorder.remove(change.order, replaceLength);
                updateRecorder.insertRight(change.order, change.newText);
            }
        }

        if (type === "") {
            // Implementation not added
            // TODO: Insert the method based on declarations order (properties, implementations, methods)
            const [_parentIndentation, _indentation, previousNodeIndentation] =
                getInBlockIndentation(classDeclaration, source, eol, "last");
            const change = new InsertChange(
                file,
                classDeclaration.members.end,
                `${eol}${implementationsCode.getCode(
                    implementation,
                    previousNodeIndentation,
                    requiredModifiers
                )}`
            );

            if (change instanceof InsertChange) {
                updateRecorder.insertRight(change.pos, change.toAdd);
                type = "METHOD";
            }
        }

        tree.commitUpdate(updateRecorder);

        setData(
            data,
            {
                interfaceOrClass,
                inHeritageClause,
                requiredModifiers,
                type,
            },
            ...dataKeys
        );

        context.logger.info(
            `\x1b[92m✅  Implementation inserted successfully: ${_messageText}\x1b[0m`
        );
    };
};


const validateImplementedData = (implementedData: GlobalData, messageText: string, context: SchematicContext) => {

    if (implementedData === undefined) {
        throw new SchematicsException(
            `❌  Unable to verify implementation declaration: ${messageText}`
        );
    }

    const { type, interfaceOrClass, inHeritageClause, requiredModifiers, promiseRequired } =
        implementedData;

    let isAllOk = true;

    if (!type && inHeritageClause) {
        context.logger.warn(
            `👁️  The 'implement' clause had already been added but the method was not implemented: ${messageText}`
        );
        isAllOk = false
    }

    if (type && interfaceOrClass && !inHeritageClause) {
        context.logger.warn(
            `👁️  The method was already implemented, but the clause 'implement' had not been added: ${messageText}`
        );
        isAllOk = false;
    }

    if (type && requiredModifiers.length) {
        context.logger.warn(
            `👁️  The method was already implemented, but its modifiers must be altered: ${messageText} => required: ${requiredModifiers.join(
                ", "
            )}`
        );
        isAllOk = false;
    }

    if (type && promiseRequired) {
        context.logger.warn(
            `👁️  The method was already implemented, but its return type must be altered: ${messageText} => required: ${promiseRequired}`
        );
        isAllOk = false;
    }

    if (!type) isAllOk = false;

    return isAllOk
};

const getModifiers =  (modifiers: string[], implementedModifiers: string[], messageText: string) => {
    const accessibilitants = modifiers.filter(n => ["public", "private", "protected"].includes(n));

    if (accessibilitants.length > 1) {
        throw new SchematicsException(
            `❌  More than one accessibility modifiers: ${messageText} => ${accessibilitants.join(', ')}`
        );
    }

    // merge modifiers and remove multiple accessibility modifiers
    return mergeModifiers(modifiers, implementedModifiers).filter((val, idx, array) =>
        idx > 0 ? array.lastIndexOf(val, idx - 1) < 0 : true
    );
}

const mergeModifiers = (latest: string[], actual: string[]) => {
    const order = <ReadonlyArray<string>>[
        "public",
        "private",
        "protected",
        "static",
        "override",
        "readonly",
        "*",
        "get",
        "set",
        "async",
    ];
    const lastAccessibilityModifier = 2;
    const getModifierOrder = (v: string | undefined): number =>
        v === undefined
            ? Infinity
            : order.indexOf(v) < 0
            ? getModifierOrder("*")
            : order.indexOf(v) > lastAccessibilityModifier
            ? order.indexOf(v) - lastAccessibilityModifier
            : 0;
    const output = <string[]>[];

    latest = [...latest].sort((a, b) => getModifierOrder(a) - getModifierOrder(b));
    actual = [...actual].sort(
        (a, b) => getModifierOrder(a) - getModifierOrder(b)
    );

    // If there is an accessibility modifier in the new modifiers, existing
    // accessibility modifiers are removed
    if (getModifierOrder(latest[0]) === 0) actual = actual.filter(val => getModifierOrder(val) > 0);

    while (latest.length || actual.length) {
        const latestOrder = getModifierOrder(latest[0]);
        const actualOrder = getModifierOrder(actual[0]);

        if (actualOrder < latestOrder) output.push(actual.shift()!);
        else output.push(latest.shift()!);
    }

    // remove duplicates
    return output.filter((val, idx, array) =>
        idx > 0 ? array.lastIndexOf(val, idx - 1) < 0 : true
    );
}

const isEqual = (a: Array<any>, b: Array<any>, sameOrder = false) => {
    if (a.length !== b.length) return false;

    if (!sameOrder)
        return !a.some(v => !b.includes(v));

    return !a.some((v, i) => b[i] !== v)
}
