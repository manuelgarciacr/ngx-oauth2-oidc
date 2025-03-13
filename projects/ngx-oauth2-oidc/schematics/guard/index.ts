import {
    // Change,
    // InsertChange,
    // ObjectLiteralExpression,
    // Rule,
    SchematicContext,
    SchematicsException,
    Tree,
    // addModuleImportToModule,
    // buildComponent,
    // chain,
    // createSourceFile,
    findAppConfig,
    findBootstrapApplicationCall,
    // findModuleFromOptions,
    findProvidersLiteral,
    getProjectMainFile,
    getSourceFile,
    getSources,
    // getWorkspace,
    isStandaloneApp,
    // isStandaloneSchematic,
    readWorkspace,
    ts,
} from "../utils";

import { Schema } from "./schema";
import {
    // GlobalData,
    // NamedNode,
    findImportLocalName,
    // getData,
    getRouterModuleDeclarations,
    // log,
    // nodeFlags,
    resolveValueFromIdentifier,
} from "../utils/utils";
// import { findNodes } from "../utils/find";
// import { insertInject } from "../utils/injections";
// import { cancellation } from "../utils/rules";
// import { getTemplate, insertTemplate } from "../utils/templates";
// import { insertImport } from "../utils/imports";
// import { insertImplementation } from "../utils/implementations";
// import { insertMethod } from "../utils/methods";
// import login from "../login";

type NodeRecord<T extends ts.Node = ts.Node> = {label: string, fileName: string, start: number, final: number, node: T, parent: NodeRecord | null, children: number, route?: ts.ObjectLiteralExpression, idx?: number}
// const log2 = (p: any) =>
//     log(p, 5, {
//         show: [
//             "label",
//             "fileName",
//             "start",
//             "final",
//             "node",
//             "children",
//             "kind",
//             "getText",
//             "initializer"
//         ],
//     });

export default function (options: Schema) {
    return async (tree: Tree, _context: SchematicContext) => {
        const project = options.project ?? "";
        const routeName = options.route;
        const workspace = await readWorkspace(tree);
        const projectWorkspace = workspace.projects.get(project);

        let sources: ts.SourceFile[];
        let arrayLiteralArray: NodeRecord[] = [];

        // Checking that project exists
        if (!projectWorkspace) {
            throw new SchematicsException(
                `❌  Unable to find project '${project}' in the workspace`
            );
        }

        // Checking component name is not empty
        if (!routeName) {
            throw new SchematicsException(
                `❌  Path name option is empty`
            );
        }

        sources = getSources(tree, projectWorkspace) as ts.SourceFile[];

        // No typescript source files in the project
        if (!sources.length) {
            throw new SchematicsException(
                `❌  No typescript source files in the project`
            );
        }
console.log("AAA")
        const mainPath = getProjectMainFile(projectWorkspace);
console.log("AAA")
        // Legacy projects might not have a `build` target, but they're likely
        // not on an Angular version that supports standalone either.
        const isStandalone = !projectWorkspace?.targets?.has("build")
            ? false
            : isStandaloneApp(tree, mainPath);

        if (!isStandalone) {
            const declarations = getDeclarations(sources);
            arrayLiteralArray = getArrayLiteralArray(tree, declarations)

        } else {
            const {filePath: configPath, node: config} = getConfig(tree, mainPath);
            /* const {node, args} = */ getProvider(tree, configPath, config, "provideRouter", '@angular/router' );
        }

        if (!arrayLiteralArray.length) {
            throw new SchematicsException(
                `❌  The route "${routeName}" is not found in the project`
            );
        }

        // let sourceFile;

        // for (const route of arrayLiteralArray) {
        //     const source = route.getSourceFile();
        //     const file = source.fileName;
        //     const className = node.name?.escapedText.toString() ?? "";
        //     if (file != sourceFile) {
        //         sourceFile = file;
        //     }
        // }


        // if (!isStandalone) {
        //     const appPath = getAppModulePath(tree, mainPath);
        //     const modulePath = appPath;
        //     const moduleFileContent = tree.read(modulePath);

        //     if (!moduleFileContent) {
        //         throw new SchematicsException(
        //             `❌  Could not read Angular module file: ${modulePath}`
        //         );
        //     }

        //     const parsedFile = ts.createSourceFile(
        //         modulePath,
        //         moduleFileContent.toString(),
        //         ts.ScriptTarget.Latest,
        //         true,
        //     );

        //     const sourceFiles = findSources(tree, projectWorkspace, {fileName: "*.ts", caseSensitive: false}) as ts.SourceFile[];
        //     console.log(appPath);
        // }
    }
}

const getDeclarations = (sourceFiles: ts.SourceFile[]) => {
    const declarations = sourceFiles
        .flatMap(sf => getRouterModuleDeclarations(sf).map(decl => ({fileName: sf.fileName, decl})))
        .map(
            val =>
                ({
                    label: "CALL",
                    fileName: val.fileName,
                    start: 0,
                    final: 0,
                    node: val.decl,
                    parent: null,
                    children: 0,
                } as NodeRecord)
        )
        .filter(dec => dec.node && ts.isCallExpression(dec.node))
        .map(dec => ({
            ...dec,
            start: dec.node!.getStart(),
            final: dec.node!.getEnd(),
        }));

    if (!declarations.length) {
        throw new SchematicsException(
            `❌  Unable to find route declarations in the project`
        );
    }

    return declarations as NodeRecord<ts.CallExpression>[]
}

const getArrayLiteralArray = (tree: Tree, declarations: NodeRecord<ts.CallExpression>[]) => {
    const arrayLiteralArray = <NodeRecord[]>[];

    declarations.forEach(decl => {
        const sourceFile = decl.node.getSourceFile();
        const fileName = sourceFile.fileName;
        const arrayLiteral = getArrayLiteral(tree, sourceFile, fileName, decl);

        arrayLiteralArray.push(arrayLiteral)
        const routes = getRoutes(tree, sourceFile, arrayLiteral, 0);
        const children = getChildren(tree, routes);
        arrayLiteralArray.push(...routes, ...children);
    })

    arrayLiteralArray.sort((a, b) => {
        const posOrder = a.start - b.start;
        const endOrder = b.final - a.final;
        return a.fileName < b.fileName ? -1 : a.fileName > b.fileName ? 1 :
        posOrder < 0 ? -1 : posOrder > 0 ? 1 :
        endOrder < 0 ? -1 : endOrder > 0 ? 1 :
        0
    })

// arrayLiteralArray.forEach(node => console.log(node.fileName.split("/").pop(), node.start, node.final, node.label, node.children))
// console.log(arrayLiteralArray.length);
    return arrayLiteralArray
};

const getArrayLiteral = (
    tree: Tree,
    sourceFile: ts.SourceFile,
    fileName: string,
    declaration: NodeRecord<ts.CallExpression>,
): NodeRecord<ts.ArrayLiteralExpression> => {
    const scopeConfigMethodArgs = declaration.node.arguments;

    if (!scopeConfigMethodArgs.length) {
        const { line } = sourceFile.getLineAndCharacterOfPosition(
            declaration.node.getStart()
        );
        throw new SchematicsException(
            `❌  The router module method doesn't have arguments ` +
                `at line ${line} in ${fileName}`
        );
    }

    const routesArg = scopeConfigMethodArgs[0];
    const array = getValue(tree, fileName, routesArg, ts.isArrayLiteralExpression, declaration, "ROUTEARRAY");

    if (!array || !ts.isArrayLiteralExpression(array.node)) {
        const { line } = sourceFile.getLineAndCharacterOfPosition(
            routesArg.getStart()
        );
        throw new SchematicsException(
            `❌  No route declaration array was found that corresponds ` +
                `to router module at line ${line} in ${fileName}`
        );
    }

    declaration.children++;

    return array as NodeRecord<ts.ArrayLiteralExpression>;
};

const getValue = (
    tree: Tree,
    fileName: string,
    argument: ts.Expression,
    kindOrGuard: ts.SyntaxKind | ((node: ts.Node) => node is any) | null | undefined,
    parent: NodeRecord,
    label: string
) => {
    const guard =
        typeof kindOrGuard === "function"
            ? kindOrGuard
            : typeof kindOrGuard === "number"
            ? (node: ts.Node): node is any => node.kind === kindOrGuard
            : (node: ts.Node): node is any =>
                  (ts.isArrayLiteralExpression(node) ||
                  ts.isObjectLiteralExpression(node) ||
                  ts.isLiteralExpression(node));

    // Check if the route declarations array is
    // an inlined argument of RouterModule or an imported variable
    if (guard(argument)) {
        return {
            label,
            fileName,
            start: argument.getStart(),
            final: argument.getEnd(),
            node: argument,
            parent,
            children: 0,
        } as NodeRecord<typeof argument>;
    }

    if (ts.isIdentifier(argument)) {
        const value = resolveValueFromIdentifier(tree, fileName, argument);

        if (value && guard(value.node)) {
            return {
                label,
                fileName: value.filePath,
                start: value.node.getStart(),
                final: value.node.getEnd(),
                node: value.node,
                parent,
                children: 0
            } as NodeRecord<typeof value.node>;
        }
    }

    return null;
};

// const getRoute = (
//     sourceFile: ts.SourceFile,
//     fileName: string,
//     array: NodeRecord<ts.ArrayLiteralExpression>,
//     routeName: string
// ): NodeRecord => {
//     const arr = array.node.elements
//         .map((route, idx) => ({ route, idx }))
//         .filter(
//             val =>
//                 ts.isObjectLiteralExpression(val.route) &&
//                 val.route.properties.some(
//                     prop =>
//                         ts.isPropertyAssignment(prop) &&
//                         ts.isIdentifier(prop.name) &&
//                         prop.name.text === "path" &&
//                         ts.isStringLiteral(prop.initializer) &&
//                         prop.initializer.text === routeName
//                 )
//         );

//     if (arr.length > 1) {
//         const { line } = sourceFile.getLineAndCharacterOfPosition(
//             arr[1].route.getStart()
//         );

//         throw new SchematicsException(
//             `❌  Duplicated route declaration was found at line ` +
//             `${line + 1} in ${fileName}`
//         );
//     }

//     return {...array, ...arr[0] as {route: ts.ObjectLiteralExpression, idx: number}}
// }

const getRoutes = (
    tree: Tree,
    sourceFile: ts.SourceFile,
    arrayLiteral: NodeRecord<ts.ArrayLiteralExpression>,
    loopCnt: number
) => {
    const arrayLiteralArray = <NodeRecord[]>[];
    const elements = arrayLiteral.node.elements.map(
        elem => elem as ts.Expression
    );

    elements.forEach(elem => {
        if (ts.isIdentifier(elem)) {
            const value = getValue(
                tree,
                arrayLiteral.fileName,
                elem,
                ts.isObjectLiteralExpression,
                arrayLiteral,
                "ROUTE"
            );

            if (!value || !ts.isObjectLiteralExpression(value.node)) {
                const { line } = sourceFile.getLineAndCharacterOfPosition(
                    elem.getStart()
                );
                throw new SchematicsException(
                    `❌  No route declaration was found that corresponds ` +
                        `to the identifier at line ${line + 1} in ${arrayLiteral.fileName}`
                );
            }

            arrayLiteral.children++;
            arrayLiteralArray.push(
                value as NodeRecord<ts.ObjectLiteralExpression>
            );
            return
        }

        if (ts.isObjectLiteralExpression(elem)) {
            const value =  {
                label: "ROUTE",
                fileName: arrayLiteral.fileName,
                start: elem.getStart(),
                final: elem.getEnd(),
                node: elem,
                parent: arrayLiteral,
                children: 0,
            } as NodeRecord<ts.ObjectLiteralExpression>;

            arrayLiteral.children++;
            arrayLiteralArray.push(
                value as NodeRecord<ts.ObjectLiteralExpression>
            );
            return
        }

        if (ts.isSpreadElement(elem)) {
            const value = getValue(
                tree,
                arrayLiteral.fileName,
                elem.expression,
                ts.isArrayLiteralExpression,
                arrayLiteral,
                "ROUTEARRAY"
            ) as NodeRecord<ts.ArrayLiteralExpression>;

            if (!value) {
                const { line } = sourceFile.getLineAndCharacterOfPosition(
                    elem.getStart()
                );
                throw new SchematicsException(
                    `❌  No route declaration was found that corresponds ` +
                        `to the spreed at line ${line + 1} in ${arrayLiteral.fileName}`
                );
            }

            arrayLiteral.children++;
            arrayLiteralArray.push(
                value
            );
            loopCnt++;

            const valueSourceFile = getSourceFile(tree, value.fileName);

            if (loopCnt > 10) {
                const { line } = sourceFile.getLineAndCharacterOfPosition(
                    elem.getStart()
                );
                throw new SchematicsException(
                    `❌  More than ten nested spreads at line ${line + 1} in ${
                            arrayLiteral.fileName
                        }`
                );
            }

            const routes = getRoutes(tree, valueSourceFile, value, loopCnt);
            arrayLiteralArray.push(...routes)
            return
        }

        const { line } = sourceFile.getLineAndCharacterOfPosition(
            elem.getStart()
        );

        throw new SchematicsException(
            `❌  No route declaration was found at line ${line + 1} in ${
                arrayLiteral.fileName
            }`
        );
    })

    return arrayLiteralArray;
};

const getChildren = (
    tree: Tree,
    routes: NodeRecord[]
) => {
    const arrayLiteralArray = <NodeRecord[]>[];
    const children: any[] = [];

    routes
        .filter(node => node.label === "ROUTE")
        .forEach(node => {
            const { fileName, node: route } = node;
            const sourceFile = getSourceFile(tree, fileName);
            const elements = (
                route as ts.ObjectLiteralExpression
            ).properties.filter(
                prop =>
                    (ts.isPropertyAssignment(prop) ||
                        ts.isShorthandPropertyAssignment(prop)) &&
                    ts.isIdentifier(prop.name) &&
                    prop.name.text === "children"
            );
            if (elements.length > 1) {
                const { line } = sourceFile.getLineAndCharacterOfPosition(
                    elements[1].getStart()
                );

                throw new SchematicsException(
                    `❌  More than one children property ` +
                        `at line ${line + 1} in ${fileName}`
                );
            }

            if (!elements.length) return;

            children.push({
                fileName,
                sourceFile,
                property: elements[0],
                parent: node,
            });
        });

    children.forEach(child => {
        const { fileName, sourceFile, property, parent } = child;
        const value = ts.isPropertyAssignment(property)
            ? (getValue(
                  tree,
                  fileName,
                  (property as ts.PropertyAssignment).initializer,
                  ts.isArrayLiteralExpression,
                  parent,
                  "ROUTEARRAY"
              ) as NodeRecord<ts.ArrayLiteralExpression>)
            : (getValue(
                  tree,
                  fileName,
                  property.name as ts.Identifier,
                  ts.isArrayLiteralExpression,
                  parent,
                  "ROUTEARRAY"
              ) as NodeRecord<ts.ArrayLiteralExpression>);

        if (!value) {
            const expr = ts.isPropertyAssignment(property)
                ? (property as ts.PropertyAssignment).initializer
                : (property.name as ts.Identifier);
            const { line } = sourceFile.getLineAndCharacterOfPosition(
                expr.getStart()
            );
            throw new SchematicsException(
                `❌  No child route declaration array was found that corresponds ` +
                    `to the expression at line ${line + 1} in ${fileName}`
            );
        }

        parent.children++;
        arrayLiteralArray.push(value)

        const valueSourceFile = getSourceFile(tree, value.fileName);
        const childRoutes = getRoutes(tree, valueSourceFile, value, 0);

        arrayLiteralArray.push(...childRoutes)
    });

    return arrayLiteralArray
};

const getConfig = (tree: Tree, mainFilePath: string) => {
    const bootstrapCall = findBootstrapApplicationCall(tree, mainFilePath);

    if (!bootstrapCall) {
        throw new SchematicsException(`❌  Bootstrap call not found`);
    }

    if (bootstrapCall.arguments.length === 0) {
        throw new SchematicsException(
            `❌  Invalid bootstrapApplication call in ${mainFilePath}`
        );
    }

    const appConfig = findAppConfig(bootstrapCall, tree, mainFilePath);

    if (!appConfig) {
        throw new SchematicsException(
            `❌  Can not resolve the node that defines the app config ` +
            `from the bootstrap call in ${mainFilePath}`
        );
    }

    return appConfig
}

const getProvider = (
    tree:Tree,
    fileName: string,
    config: ts.ObjectLiteralExpression,
    name: string,
    module: string
) => {
    const sourceFile = getSourceFile(tree, fileName);
    const localName = findImportLocalName(sourceFile, module, name);
    const providers = findProvidersLiteral(config);

    if (!providers) {
        const { line } = sourceFile.getLineAndCharacterOfPosition(
            config.getStart()
        );

        // TODO: Add providers ​​if there are no
        throw new SchematicsException(
            `❌  Can not find providers in the config object at line ` +
                `${line + 1} in ${fileName}`
        );
    }

    for (const elem of providers.elements) {
        if (
            ts.isCallExpression(elem) &&
            ts.isIdentifier(elem.expression) &&
            elem.expression.escapedText === localName
        ) {
            return { node: elem, args: elem.arguments };
        }
    }

    const { line } = sourceFile.getLineAndCharacterOfPosition(
        providers.getStart()
    );

    // TODO: Add a provider if it does not exist
    throw new SchematicsException(
        `❌  Can not find the provider named "${localName}" in the config object at line ` +
            `${line + 1} in ${fileName}`
    );
};

    // console.log(route)
    // log(arr, 3);
    // if (occurrencesCount > 0) {
    //     const lastRouteLiteral = [...routesArr.elements].pop() as ts.Expression;
    //     const lastRouteIsWildcard =
    //         ts.isObjectLiteralExpression(lastRouteLiteral) &&
    //         lastRouteLiteral.properties.some(
    //             n =>
    //                 ts.isPropertyAssignment(n) &&
    //                 ts.isIdentifier(n.name) &&
    //                 n.name.text === "path" &&
    //                 ts.isStringLiteral(n.initializer) &&
    //                 n.initializer.text === "**"
    //         );

    //     const indentation = text.match(/\r?\n(\r?)\s*/) || [];
    //     const routeText = `${indentation[0] || " "}${routeLiteral}`;

    //     // Add the new route before the wildcard route
    //     // otherwise we'll always redirect to the wildcard route
    //     if (lastRouteIsWildcard) {
    //         insertPos = lastRouteLiteral.pos;
    //         route = `${routeText},`;
    //     } else {
    //         insertPos = lastRouteLiteral.end;
    //         route = `,${routeText}`;
    //     }
    // }

    //return new InsertChange(fileToAdd, insertPos, route);
// }

// export function addRouteDeclarationToModule(
//     source: ts.SourceFile,
//     fileToAdd: string,
//     routeLiteral: string
// ): Change {
//     const routerModuleExpr = getRouterModuleDeclaration(source);

//     if (!routerModuleExpr) {
//         throw new Error(
//             `Couldn't find a route declaration in ${fileToAdd}.\n` +
//                 `Use the '--module' option to specify a different routing module.`
//         );
//     }

//     const scopeConfigMethodArgs = (routerModuleExpr as ts.CallExpression)
//         .arguments;

//     if (!scopeConfigMethodArgs.length) {
//         const { line } = source.getLineAndCharacterOfPosition(
//             routerModuleExpr.getStart()
//         );
//         throw new Error(
//             `The router module method doesn't have arguments ` +
//                 `at line ${line} in ${fileToAdd}`
//         );
//     }

//     let routesArr: ts.ArrayLiteralExpression | undefined;
//     const routesArg = scopeConfigMethodArgs[0];

//     // Check if the route declarations array is
//     // an inlined argument of RouterModule or a standalone variable
//     if (ts.isArrayLiteralExpression(routesArg)) {
//         routesArr = routesArg;
//     } else {
//         const routesVarName = routesArg.getText();
//         let routesVar;
//         if (routesArg.kind === ts.SyntaxKind.Identifier) {
//             routesVar = source.statements
//                 .filter(ts.isVariableStatement)
//                 .find(v => {
//                     return (
//                         v.declarationList.declarations[0].name.getText() ===
//                         routesVarName
//                     );
//                 });
//         }

//         if (!routesVar) {
//             const { line } = source.getLineAndCharacterOfPosition(
//                 routesArg.getStart()
//             );
//             throw new Error(
//                 `No route declaration array was found that corresponds ` +
//                     `to router module at line ${line} in ${fileToAdd}`
//             );
//         }

//         routesArr = findNodes(
//             routesVar,
//             ts.SyntaxKind.ArrayLiteralExpression,
//             1
//         )[0] as ts.ArrayLiteralExpression;
//     }

//     const occurrencesCount = routesArr.elements.length;
//     const text = routesArr.getFullText(source);

//     let route: string = routeLiteral;
//     let insertPos = routesArr.elements.pos;

//     if (occurrencesCount > 0) {
//         const lastRouteLiteral = [...routesArr.elements].pop() as ts.Expression;
//         const lastRouteIsWildcard =
//             ts.isObjectLiteralExpression(lastRouteLiteral) &&
//             lastRouteLiteral.properties.some(
//                 n =>
//                     ts.isPropertyAssignment(n) &&
//                     ts.isIdentifier(n.name) &&
//                     n.name.text === "path" &&
//                     ts.isStringLiteral(n.initializer) &&
//                     n.initializer.text === "**"
//             );

//         const indentation = text.match(/\r?\n(\r?)\s*/) || [];
//         const routeText = `${indentation[0] || " "}${routeLiteral}`;

//         // Add the new route before the wildcard route
//         // otherwise we'll always redirect to the wildcard route
//         if (lastRouteIsWildcard) {
//             insertPos = lastRouteLiteral.pos;
//             route = `${routeText},`;
//         } else {
//             insertPos = lastRouteLiteral.end;
//             route = `,${routeText}`;
//         }
//     }

//     return new InsertChange(fileToAdd, insertPos, route);
// }
