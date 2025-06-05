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
    isNode,
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
    log,
    // nodeFlags,
    //resolveValueFromIdentifier,
} from "../utils/utils";
import { Route } from "@angular/router";
import { NodeRecord, getElements, getProperties, getValue, nodeError, nodeRecordsArray, nodeRecordsInPlaceSort } from "../utils/nodeRecords";
import { ObjectLiteralExpression, ObjectLiteralExpressionBase } from "typescript";
// import { findNodes } from "../utils/find";
// import { insertInject } from "../utils/injections";
// import { cancellation } from "../utils/rules";
// import { getTemplate, insertTemplate } from "../utils/templates";
// import { insertImport } from "../utils/imports";
// import { insertImplementation } from "../utils/implementations";
// import { insertMethod } from "../utils/methods";
// import login from "../login";

const log2 = (p: any) =>
    log(p, 5, {
        show: [
            "label",
            "fileName",
            "start",
            "final",
            "node",
            "children",
            "kind",
            "getText",
            "initializer"
        ],
    });

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

        const mainPath = getProjectMainFile(projectWorkspace);
        // Legacy projects might not have a `build` target, but they're likely
        // not on an Angular version that supports standalone either.
        const isStandalone = !projectWorkspace?.targets?.has("build")
            ? false
            : isStandaloneApp(tree, mainPath);

        if (!isStandalone) {
            const declarations = getDeclarations(sources);
            arrayLiteralArray = getRoutes(tree, declarations)

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

/**
 * Gets a NodeRecord array with the router module declarations inside a ts.SourceFile array.
 * @param sourceFiles
 * @returns
 */
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

/**
 * Gets a NodeRecord array with the routes and route arrays inside the route declarations,
 * including the children routes.
 * @param tree
 * @param declarations
 * @returns
 */
const getRoutes = (tree: Tree, declarations: NodeRecord<ts.CallExpression>[]) => {
    const routeRecords = <NodeRecord[]>[];
    const routes: NodeRecord<ts.ObjectLiteralExpression>[] = [];
    const pathRecords = <NodeRecord[]>[];
    const paths: NodeRecord<ts.StringLiteralLike>[] = [];
    const children: NodeRecord[] = [];
    declarations.forEach(decl => {
        const nodeRecord = getRoutesArray(tree, decl);
        const nodeRecordArray = getElements(
            tree,
            nodeRecord,
            ts.isObjectLiteralExpression,
            "ROUTE",
            "route declaration",
            true
        );

        routeRecords.push(nodeRecord, ...nodeRecordArray);
    })

    nodeRecordsInPlaceSort(routeRecords);
    console.table(nodeRecordsArray(routeRecords));
    let nodeRecordArray = routeRecords.filter(
        route => route.label === "ROUTE"
    );
    routes.push(
        ...(nodeRecordArray as NodeRecord<ts.ObjectLiteralExpression>[])
    );
    console.table(nodeRecordsArray(routes));

    routes.forEach(route => {
        const nodeRecordArray = getProperties(
            tree,
            route,
            "path",
            (node: ts.Node): node is any => eval(node.getText()) === "foo",
            "PATH",
            "route path",
            true
        );

        pathRecords.push(...nodeRecordArray);
    });

    nodeRecordsInPlaceSort(pathRecords);
    console.table(nodeRecordsArray(pathRecords));
    nodeRecordArray = pathRecords.filter(
        prop => prop.label === "PATH"
    );
    paths.push(...(nodeRecordArray as NodeRecord<ts.StringLiteralLike>[]));
    console.table(nodeRecordsArray(paths));

    nodeRecordArray = paths.filter(
        prop => prop.node.text === "foo"
    );

    routes.splice(0);
    declarations.forEach(decl => {
        const nodeRecord = getRoutesArray(tree, decl);
        const nodeRecordArray = getElements(
            tree,
            nodeRecord,
            ts.isObjectLiteralExpression,
            "ROUTE",
            "route declaration"
        );

        routes.push(...nodeRecordArray as NodeRecord<ts.ObjectLiteralExpression>[]);
    });

    const childRecords = <NodeRecord<ts.ArrayLiteralExpression>[]>[];
    routes.forEach(route => {
        const nodeRecordArray = getProperties(
            tree,
            route,
            "children",
            ts.isArrayLiteralExpression,
            "CHILD",
            "child route",
        );

        childRecords.push(...nodeRecordArray as  NodeRecord<ts.ArrayLiteralExpression>[]);
    });
    nodeRecordsInPlaceSort(childRecords);
    console.table(nodeRecordsArray(childRecords));

    return routeRecords
};

const removeArrayObject = <T extends Object>(arr: T[], value: T) => {
    const idx = arr.indexOf(value);

    return idx < 0 ? undefined : arr.splice(idx, 1)
}

const getRoutesArray = (
    tree: Tree,
    declaration: NodeRecord<ts.CallExpression>,
): NodeRecord<ts.ArrayLiteralExpression> => {
    const scopeConfigMethodArgs = declaration.node.arguments;

    if (!scopeConfigMethodArgs.length) {
        nodeError(declaration,
            "❌  The router module method doesn't have arguments"
        );
    }

    const routesArg = scopeConfigMethodArgs[0];
    const array = getValue(
        tree,
        declaration,
        routesArg,
        ts.isArrayLiteralExpression,
        "DECLARATIONS_ARRAY",
        "route declaration array",
        "❌  No route declaration array was found that corresponds to router module"
    );

    return array as NodeRecord<ts.ArrayLiteralExpression>;
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
//         nodeError(arr[1].route, "❌  Duplicated route declaration was found")
//     }

//     return {...array, ...arr[0] as {route: ts.ObjectLiteralExpression, idx: number}}
// }


const getChildren = (tree: Tree, routes: NodeRecord[]) =>
    getChildProperties(tree, routes, {
        filterLabels: "ROUTE",
        propertyName: "children",
        arrayLabel: "CHILDROUTE_ARRAY",
        arrayElementLabel: "CHILDROUTE",
        errorMsg:
            "❌  No child route declaration array was found that corresponds to the expression",
    });
;

const getChildProperties = (
    tree: Tree,
    nodeRecords: NodeRecord[],
    options: {
        filterLabels?: string | string[];
        propertyName?: string;
        arrayLabel?: string,
        arrayElementLabel?: string,
        errorMsg?: string
    }
) => {
    const arrayLiteralArray = <NodeRecord[]>[];
    const properties: {
        property: ts.ObjectLiteralElementLike;
        parent: NodeRecord<ts.Node>;
    }[] = [];
    const { propertyName, arrayLabel, arrayElementLabel, errorMsg } = options;
    let { filterLabels } = options;

    if (arrayElementLabel !== undefined && arrayLabel === undefined) {
        console.warn(`\t👁️  arrayLabel is undefined, so arrayElementLabel is ignored`);
    }
const e = "E";
const f = {f: "F"}
const a = {get a() {return "A"}, b(){return "B"}, c: () => {return "C"}, d: "D", e, ...f, ...{g: "G"}}
// console.dir(a)
// console.log(a.a, a.b(), a.c(), a.d, a.e, a.f)
//if (nodeRecords[0].start === 193) log(a, 4);

    typeof filterLabels === "string" && (filterLabels = [filterLabels]);

    nodeRecords
        .filter(node => !filterLabels || filterLabels.includes(node.label))
        .forEach(node => {
            const { node: obj } = node;
            const elements = (
                obj as ts.ObjectLiteralExpression
            ).properties.filter(
                prop =>
                    propertyName === undefined ||
                    (ts.isPropertyAssignment(prop) ||
                        ts.isShorthandPropertyAssignment(prop)) &&
                    ts.isIdentifier(prop.name) &&
                    prop.name.text === propertyName
            );

            if (elements.length > 1) {
                nodeError(
                    elements[1],
                    `❌  More than one "${propertyName}"" property`
                )
            }

            if (!elements.length) return;

            properties.push({
                property: elements[0],
                parent: node,
            });
        });

    properties.forEach(prop => {
        const { property, parent } = prop;
        const argument = ts.isPropertyAssignment(property)
            ? (property as ts.PropertyAssignment).initializer
            : (property.name as ts.Identifier);
        let value: NodeRecord | undefined;

        if (arrayLabel !== undefined) {
            value = getValue(
                tree,
                parent,
                argument,
                ts.isArrayLiteralExpression,
                arrayLabel
            ) as NodeRecord<ts.ArrayLiteralExpression>;
        }

        if (value && arrayElementLabel !== undefined) {
            arrayLiteralArray.push(value);
//log(value.parent?.node ?? {}, 1);
//log(value.node, 1);
            const childRoutes = getElements(
                tree,
                value as NodeRecord<ts.ArrayLiteralExpression>,
                undefined,
                "CHILDROUTE",
                "child route declaration"
            );
//log(childRoutes, 1);
            arrayLiteralArray.push(...childRoutes);
        }

        if (errorMsg && !value) {
            nodeError(argument, errorMsg)
        }

        if (!value) return;

    });

    return arrayLiteralArray;
};

const getChildren2 = (
    tree: Tree,
    routes: NodeRecord[]
) => {
    const arrayLiteralArray = <NodeRecord[]>[];
    const children: {
        property: ts.ObjectLiteralElementLike;
        parent: NodeRecord<ts.Node>;
    }[] = [];

    routes
        .filter(node => node.label === "ROUTE")
        .forEach(node => {
            const { node: route } = node;
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
                nodeError(elements[1], `❌  More than one children property`)
            }

            if (!elements.length) return;

            children.push({
                property: elements[0],
                parent: node,
            });
        });

    children.forEach(child => {
        const { property, parent } = child;
        const argument = ts.isPropertyAssignment(property)
            ? (property as ts.PropertyAssignment).initializer
            : property.name as ts.Identifier;
        const value = getValue(
            tree,
            parent,
            argument,
            ts.isArrayLiteralExpression,
            "ROUTEARRAY",
            "route declaration",
            "❌  No child route declaration array was found that corresponds to the expression"
        ) as NodeRecord<ts.ArrayLiteralExpression>

        arrayLiteralArray.push(value)

        const childRoutes = getElements(tree, value);

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
        return nodeError(
            config,
            `❌  Can not find providers in the config object`
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

    nodeError(
        providers,
        `❌  Can not find the provider named "${localName}" in the config object`
    )
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
//         nodeError(routerModuleExpr, "The router module method doesn't have arguments")
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
//             nodeError(routesArg, `No route declaration array was found that corresponds ` +
//                     `to router module`)
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
