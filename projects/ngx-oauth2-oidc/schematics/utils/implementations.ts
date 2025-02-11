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
    getSourceFile,
    setData,
    ts,
} from "./utils";
import { findNodes } from "./find";
import { InsertChange } from "@schematics/angular/utility/change";
import { getEOL } from "@schematics/angular/utility/eol";
import { getPos } from "./templates";

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
 * @param {boolean} alreadyAddedWarning If it is true, a warning message can be displayed.
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
    alreadyAddedWarning: boolean,
    data: GlobalData,
    rules: Rule[] = []
): Promise<Rule[]> => {
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
        insertImplementationRuleFactory(
            file,
            className,
            implementation,
            decorator,
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
    return (tree: Tree, _context: SchematicContext) => {
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
            n => (n.expression as ts.Identifier)?.escapedText?.toString()
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
 * @param {boolean} alreadyAddedWarning If it is true, a warning message can be displayed.
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
    alreadyAddedWarning: boolean,
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

        const { interfaceOrClass } = implementedData;
        let { inHeritageClause, implemented } = implementedData;

        if (
            alreadyAddedWarning &&
            implemented &&
            (!interfaceOrClass || inHeritageClause)
        ) {
            const text = `implementation: ${implementation}`;

            context.logger.warn(`👁️  Method already added: '${text}'`);

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
                classDeclaration,
                _getImplementations(classDeclaration),
                undefined,
                "last",
                eol
            );
            const change = new InsertChange(
                file,
                pos,
                `${eol}${implementations.getCode(implementation, indentation)}`
            );

            if (change instanceof InsertChange) {
                updateRecorder.insertRight(change.pos, change.toAdd);
                implemented = true
            }
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
                inHeritageClause = true
            }
        } else if (interfaceOrClass && !inHeritageClause) {
            const pos = implementClause!.end
            const change = new InsertChange(
                file,
                pos,
                `, ${interfaceOrClass}`
            );

            if (change instanceof InsertChange) {
                updateRecorder.insertRight(change.pos, change.toAdd);
                inHeritageClause =  true
            }
        }

        tree.commitUpdate(updateRecorder);

        setData(
            data,
            { interfaceOrClass, inHeritageClause, implemented },
            ...["implementedData", file, className, implementation]
        );

        context.logger.info(
            `\x1b[92m✅  Implementation inserted successfully: ${file
                .split("/")
                .pop()} => ${className} => ${implementation}"\x1b[0m`
        );
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
