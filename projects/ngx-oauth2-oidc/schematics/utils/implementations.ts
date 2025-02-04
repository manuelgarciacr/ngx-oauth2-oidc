import {
    Rule,
    SchematicContext,
    Tree,
    SchematicsException,
} from "@angular-devkit/schematics";
import {
    GlobalData,
    NodeArray,
    getData,
    getIndentation,
    getSourceFile,
    log,
    setData,
    ts,
} from "./utils";
import { insertImport } from "./imports";
import { findNodes } from "./find";
//import { insertImport as _insertImport } from "@schematics/angular/utility/ast-utils";
import { InsertChange, Change } from "@schematics/angular/utility/change";
import { getEOL } from "@schematics/angular/utility/eol";
import { getPos, insertTemplate } from "./templates";

const implementations = {
    "constructor": `    constructor() {
    }`,
    "ngOnChanges": `    ngOnChanges(changes: SimpleChanges) {
    }`,
    "ngOnInit": `    ngOnInit(): void {
    }`,
    "ngDoCheck": `    ngDoCheck(): void {
    }`,
    "ngAfterContentInit": `    ngAfterContentInit(): void {
    }`,
    "ngAfterContentChecked": `    ngAfterContentChecked(): void {
    }`,
    "ngAfterViewInit": `    ngAfterViewInit(): void {
    }`,
    "ngAfterViewChecked": `    ngAfterViewChecked(): void {
    }`,
    "ngOnDestroy": `    ngOnDestroy(): void {
    }`,
    getCode(name: string, indentation: string): string {
        const key = name as Exclude<
            keyof typeof implementations,
            "getCode"
        >;
        return this[ key ].replaceAll("    ", indentation)
    }
};

/**
 * Function that returns the rules necessary to add a specific implementation. If the
 * implementation has already been added, a warning message is logged; otherwise, the
 * new rules will be added to the set of rules to be dealt with.
 * @param {string} file File we want to add implementation to. It is assumed to be an existing
 *      editable file.
 * @param {string} className Name of the class we want to add implementation to.
 * @param {string} implementation Implementation to include
 * @param {string | undefined} decorator Optional name of one of the decorators in the class.
 * @param {boolean} warnings If it is true, warning messages will be displayed.
 * @param {GlobalData} data Global object that allows sharing
 *      data between rules.
 * @param {Rule[]} rules Set of rules to be dealt with.
 * @returns {Rule[]} Set of rules to be dealt with.
 */
export const insertImplementation = async (
    file: string,
    className: string,
    implementation: string,
    decorator: string | undefined,
    warnings: boolean,
    data: GlobalData,
    rules: Rule[] = []
): Promise<Rule[]> => {
    //insertImport(file, module, symbol, data, rules);
    rules.push(
        implementedDataRuleFactory(
            file,
            className,
            implementation,
            decorator,
            data
        )
    );
    rules.push(
        await insertImplementationRuleFactory(
            file,
            className,
            implementation,
            decorator,
            warnings,
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
 * @param {string} implementation Implementation to include
 * @param {string | undefined} decorator Optional name of one of the decorators in the class.
 * @param {GlobalData} data Global object that allows sharing
 *      data between rules.
 * @returns {Rule} The rule that adds the implemented data, if any, into the global
 *      'data' object.
 */
export function implementedDataRuleFactory(
    file: string,
    className: string,
    implementation: string,
    decorator: string | undefined,
    data: GlobalData
): Rule {
    return (tree: Tree, context: SchematicContext) => {
        const source = getSourceFile(tree, file);
        const classDeclaration = <ts.ClassDeclaration>findNodes(source, 1, {
            kindOrGuard: ts.isClassDeclaration,
            names: [className],
            decorator,
        })[0];

        if (!Object.keys(implementations).includes(implementation)) {
            throw new SchematicsException(
                `❌  Name of the function to be implemented unknown: '${implementation}'`
            );
        }

        const interfaceOrClass = implementation.startsWith("ng") ? implementation.substring(2) : undefined;
        const heritageClauses = classDeclaration.heritageClauses;
        const implementClause = heritageClauses?.filter(
            n => n.token === ts.SyntaxKind.ImplementsKeyword
        )?.[0];
        const implementClauseItems = implementClause?.types.map(
            n => (n.expression as ts.Identifier).escapedText.toString()
        );
        const members = classDeclaration.members;
        const inHeritageClause =
            implementClauseItems?.includes(interfaceOrClass ?? "") ?? false;
        const implemented =
            implementation === "constructor"
                ? !!members.find(n => ts.isConstructorDeclaration(n))
                : !!members.find(
                      n =>
                          ts.isMethodDeclaration(n) &&
                          n.name.getText() === implementation
                  );

        setData(
            data,
            { interfaceOrClass, inHeritageClause, implemented },
            ...["implementedData", file, className, implementation]
        );

        return tree;
    };
}

/**
 * Implements a method if it has not yet been implemented
 * @param {string} file File we want to add implementation to. It is assumed to be an existing
 *      editable file.
 * @param {string} className Name of the class we want to include implementation to.
 * @param {string} implementation Implementation to include
 * @param {string | undefined} decorator Optional name of one of the decorators in the class.
 * @param {boolean} warnings If it is true, warning messages will be displayed.
 * @param {GlobalData} data Global object that allows sharing
 *      data between rules.
 * @returns {Rule} The rule that adds the implemented data, if any, into the global
 *      'data' object.
 */
export const insertImplementationRuleFactory = (
    file: string,
    className: string,
    implementation: string,
    decorator: string | undefined,
    warnings: boolean,
    data: GlobalData
): Rule => {
    return (tree: Tree, context: SchematicContext) => {
        const implementedData = getData(
            data,
            "implementedData",
            file,
            className,
            implementation
        );

        validateImplementedData(implementedData, implementation, context);

        const { interfaceOrClass, inHeritageClause, implemented } =
            implementedData;

        if (
            warnings &&
            implemented &&
            (!interfaceOrClass || inHeritageClause)
        ) {
            const text = `implementation: ${implementation}`;

            context.logger.warn(`👁️  Method already added: '${text}'`);

            //return tree;
            return;
        }

        const source = getSourceFile(tree, file);
        const classDeclaration = <ts.ClassDeclaration>findNodes(source, 1, {
            kindOrGuard: ts.isClassDeclaration,
            names: [className],
            decorator,
        })[0];
        const heritageClauses = classDeclaration.heritageClauses;
        const implementClause = heritageClauses?.filter(
            n => n.token === ts.SyntaxKind.ImplementsKeyword
        )?.[0];
        const eol = getEOL(source.getFullText());

        const updateRecorder = tree.beginUpdate(file);

        if (!implemented) {
            const [pos, indentation] = getPos(
                _getImplementations(classDeclaration),
                "last",
                eol,
                []
            );
            const change = new InsertChange(
                file,
                pos,
                `${eol}${implementations.getCode(implementation, indentation)}`
            );

            if (change instanceof InsertChange) {
                updateRecorder.insertRight(change.pos, change.toAdd);
            }
console.log("CHANGE", change.order, change.pos)
        }

        if (interfaceOrClass && !inHeritageClause && !implementClause) {
            const pos = classDeclaration.name!.end
            const change = new InsertChange(
                file,
                pos,
                ` implements ${interfaceOrClass} `
            );

            if (change instanceof InsertChange) {
                updateRecorder.insertRight(change.pos, change.toAdd);
            }
console.log("CHANGE", change.order, change.pos);
        } else if (interfaceOrClass && !inHeritageClause) {
log(
    implementClause!,
    5,
    [],
    [
        "kind",
        "flags",
        "pos",
        "end",
        "types",
        "modifiers",
        "expression",
        "escapedText",
        "heritageClauses",
        "token",
        "type",
        "implementClause",
        "name",
    ]
);
            const pos = implementClause!.end
            const change = new InsertChange(
                file,
                pos,
                `, ${interfaceOrClass}`
            );

            if (change instanceof InsertChange) {
                updateRecorder.insertRight(change.pos, change.toAdd);
            }
            console.log("CHANGE", change.order, change.pos);
        }
        // if (change instanceof InsertChange) {
        //     updateRecorder.insertRight(change.pos, change.toAdd);
        // }

        // const pos = classDeclaration.members.pos;

        // const change = _insertInject(
        //     source,
        //     classDeclaration,
        //     imported,
        //     property,
        //     modifiers
        // );

        // if (change instanceof InsertChange) {
        //     updateRecorder.insertRight(change.pos, change.toAdd);
        // }

        tree.commitUpdate(updateRecorder);

        // const value = [property, imported];

        // setData(
        //     data,
        //     { value, allValues: [value] },
        //     ...["injectedData", file, className, module, symbol]
        // );

        // context.logger.info(
        //     `\x1b[92m✅  Property injected successfully: ${file
        //         .split("/")
        //         .pop()} => ${className} => ${module} => ${symbol}"\x1b[0m`
        // );

        // if (className === "LoginCOMPONENT")
        //     throw new SchematicsException("ERROR");

        //        return tree;
    };
};


const validateImplementedData = (implementedData: GlobalData, implementation: string, context: SchematicContext) => {
    const text = `implementation: ${implementation}`;

    if (implementedData === undefined) {
        throw new SchematicsException(
            `❌  Unable to verify implementation declaration: '${implementation}'`
        );
    }

    if (implementedData["inHeritageClause"] && !implementedData["implemented"]) {
        context.logger.warn(
            `👁️  The 'implement' clause had already been added but the method was not implemented: '${text}'`
        );
    }

    if (
        implementedData["implemented"] &&
        implementedData["interfaceOrClass"] &&
        !implementedData["inHeritageClause"]
    ) {
        context.logger.warn(
            `👁️  The method was already implemented, but the clause 'implement' had not been added: '${text}'`
        );
    }
};

const _getImplementations = (classDeclaration: ts.ClassDeclaration): ts.NodeArray<ts.Node> => {
    const nodes = findNodes(classDeclaration, 1, {kindOrGuard: ts.isConstructorDeclaration});

    nodes.push(
        ...findNodes(classDeclaration, 1, {
            kindOrGuard: ts.isMethodDeclaration,
            names: Object.keys(implementations),
        })
    );

    if (nodes.length) {
        const nodeArray: NodeArray<ts.Node> = ts.factory.createNodeArray(
            nodes.sort((a, b) => a.pos - b.pos)
        );

        nodeArray.pos = nodeArray[0].pos;
        nodeArray.end = nodeArray.at(-1)!.end;

        return nodeArray
    }

    const methods = findNodes(classDeclaration.members, 1, {
        kindOrGuard: ts.isMethodDeclaration,
    }).sort((a, b) => a.pos - b.pos);

    const nodeArray: NodeArray<ts.Node> = ts.factory.createNodeArray();

    if (methods.length) {
        nodeArray.pos = methods[0].pos;
        nodeArray.end = methods[0].pos;

        return nodeArray
    }

    nodeArray.pos = classDeclaration.members.pos;
    nodeArray.end = classDeclaration.members.end;

    return nodeArray;
}
