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
    positionalError,
    // isStandaloneSchematic,
    readWorkspace,
    resolveValueFromIdentifier,
    ts,
} from ".";
import { log } from "./utils";

export type NodeRecord<T extends ts.Node = ts.Node> = {
    label: string;
    fileName: string;
    start: number;
    final: number;
    name?: string;
    node: T;
    parent: NodeRecord | null;
    children: number;
};

export const getElements = (
    tree: Tree,
    arrayLiteral: NodeRecord<ts.ArrayLiteralExpression>,
    kindOrGuard?: ts.SyntaxKind | ((node: ts.Node) => node is any),
    label: string = "ELEMENT",
    elementDescription: string = "element",
    spreadData = false,
    errorMsg?: string,
    spreadDepth: number = 0
) => {
    const guard =
        typeof kindOrGuard === "function"
            ? kindOrGuard
            : typeof kindOrGuard === "number"
            ? (node: ts.Node): node is any => node.kind === kindOrGuard
            : ts.isExpression;
    const expressionsArray = <NodeRecord[]>[];
    const elements = arrayLiteral.node.elements.map(
        elem => elem as ts.Expression
    );

    elements.forEach(elem => {
        if (ts.isIdentifier(elem)) {
            const value = getValue(
                tree,
                arrayLiteral,
                elem,
                guard,
                label,
                elementDescription,
                errorMsg
             ) as NodeRecord<ts.ObjectLiteralExpression>;

            expressionsArray.push(value);
            //return;
        }

        if (ts.isObjectLiteralExpression(elem)) {
            const value = getValue(
                tree,
                arrayLiteral,
                elem,
                guard,
                label,
                elementDescription,
                errorMsg
            ) as NodeRecord<ts.ObjectLiteralExpression>;

            expressionsArray.push(value);
            //return;
        }

        if (ts.isSpreadElement(elem)) {
            const spread = getValue(
                tree,
                arrayLiteral,
                elem,
                ts.isSpreadElement,
                `${label}_SPREAD`
            )!;
            const value = getValue(
                tree,
                spread,
                elem.expression,
                ts.isArrayLiteralExpression,
                `${label}_ARRAY`,
                "array",
                `❌  No array was found that corresponds to the spreed`
            ) as NodeRecord<ts.ArrayLiteralExpression>;

            spreadData && expressionsArray.push(spread);
            spreadData && expressionsArray.push(value);
            spreadDepth++;

            // TODO: Circular reference control
            if (spreadDepth > 10) {
                nodeError(elem, "❌  More than ten nested spreads");
            }

            const elements = getElements(
                tree,
                value,
                kindOrGuard,
                label,
                elementDescription,
                spreadData,
                errorMsg,
                spreadDepth
            );
            expressionsArray.push(...elements);
            //return;
        }

        //nodeError(elem, `❌  No ${elementDescription} was found`);
    });

    return expressionsArray;
};

export const getProperties = (
    tree: Tree,
    objectLiteral: NodeRecord<ts.ObjectLiteralExpression>,
    name?: string,
    kindOrGuard?: ts.SyntaxKind | ((node: ts.Node) => node is any),
    label: string = "PROPERTY",
    propertyDescription: string = "property",
    spreadData = false,
    errorMsg?: string,
    spreadDepth: number = 0
) => {
    const guard =
        typeof kindOrGuard === "function"
            ? kindOrGuard
            : typeof kindOrGuard === "number"
            ? (node: ts.Node): node is any => node.kind === kindOrGuard
            : ts.isExpression;
    const expressionsArray = <NodeRecord[]>[];
    const properties = objectLiteral.node.properties.map(
        prop => prop as ts.ObjectLiteralElementLike
    );

    properties.forEach(prop => {
        if (
            ts.isPropertyAssignment(prop) &&
            (!name || prop.name.getText() === name)
        ) {
            const value = getValue(
                tree,
                objectLiteral,
                prop.initializer,
                guard,
                label,
                propertyDescription,
                errorMsg
                // `❌  No ${propertyDescription} was found that corresponds to the initializer`
            ) as NodeRecord<ts.ObjectLiteralExpression>;

            value &&
                expressionsArray.push({ ...value, name: prop.name.getText() });
        }

        if (
            ts.isShorthandPropertyAssignment(prop) &&
            ts.isIdentifier(prop.name) &&
            (!name || prop.name.getText() === name)
        ) {
            const value = getValue(
                tree,
                objectLiteral,
                prop.name,
                guard,
                label,
                propertyDescription,
                errorMsg
            ) as NodeRecord<ts.ObjectLiteralExpression>;

            value &&
                expressionsArray.push({ ...value, name: prop.name.getText() });
        }

        if (ts.isSpreadAssignment(prop)) {
            const spread = getValue(
                tree,
                objectLiteral,
                prop,
                ts.isSpreadAssignment,
                `${label}_SPREAD`
            )!;
            const value = getValue(
                tree,
                spread,
                prop.expression,
                ts.isObjectLiteralExpression,
                `${label}_OBJECT`,
                "object",
                `❌  No object was found that corresponds to the spreed`
            ) as NodeRecord<ts.ObjectLiteralExpression>;

            spreadData && expressionsArray.push(spread);
            spreadData && expressionsArray.push(value);
            spreadDepth++;

            // TODO: Circular reference control
            if (spreadDepth > 10) {
                nodeError(prop, "❌  More than ten nested spreads");
            }

            const properties = getProperties(
                tree,
                value,
                name,
                kindOrGuard,
                label,
                propertyDescription,
                spreadData,
                errorMsg,
                spreadDepth
            );
            expressionsArray.push(...properties);
            //return;
        }

        //nodeError(prop, `❌  No ${propertyDescription} was found`);
    });

    return expressionsArray;
};

export const getValue = (
    tree: Tree,
    // TODO: parent: NodeRecord | ts.Node
    parent: NodeRecord,
    argument: ts.Node, //ts.Expression,
    kindOrGuard:
        | ts.SyntaxKind
        | ((node: ts.Node) => node is any)
        | null
        | undefined,
    label: string,
    elementDescription: string = "value",
    errorMsg?: string
) => {
    const fileName = parent.fileName;
    const guard =
        typeof kindOrGuard === "function"
            ? kindOrGuard
            : typeof kindOrGuard === "number"
            ? (node: ts.Node): node is any => node.kind === kindOrGuard
            : (node: ts.Node): node is any =>
                  ts.isArrayLiteralExpression(node) ||
                  ts.isObjectLiteralExpression(node) ||
                  ts.isLiteralExpression(node);
    let nodeRecord: NodeRecord | undefined = undefined;

    // Check if the route declarations array is
    // an inlined argument of RouterModule or an imported variable
    if (guard(argument)) {
        nodeRecord = {
            label,
            fileName,
            start: argument.getStart(),
            final: argument.getEnd(),
            node: argument,
            parent,
            children: 0,
        };
    }

    if (!nodeRecord && ts.isIdentifier(argument)) {
        const value = resolveValueFromIdentifier(tree, fileName, argument);

        if (!value) {
            return nodeError(
                argument,
                `❌  No ${elementDescription} was found that corresponds to the identifier`
            );
        }

        if (value && guard(value.node)) {
            nodeRecord = {
                label,
                fileName: value.filePath,
                start: value.node.getStart(),
                final: value.node.getEnd(),
                node: value.node,
                parent,
                children: 0,
            };
        }
    }

    if (nodeRecord) {
        parent.children++;
        return nodeRecord;
    }

    if (!errorMsg) {
        return;
    }

    return nodeError(argument, errorMsg);
};

export const nodeError = (
    nodeLike: NodeRecord | ts.Node,
    errorMsg: string,
    sourceFile?: ts.SourceFile,
    fileName?: string
) => {
    const argument = isNode(nodeLike) ? nodeLike : nodeLike.node;

    positionalError(argument, "\t" + errorMsg, sourceFile, fileName);
};

export const nodeRecordsInPlaceSort = (nodeRecords: NodeRecord[]) => nodeRecords.sort((a, b) => {
        if (a === undefined && b === undefined) return 0;
        else if (a === undefined) return 1;
        else if (b === undefined) return -1;

        const posOrder = a.start - b.start;
        const endOrder = b.final - a.final;

        return a.fileName < b.fileName ? -1 : a.fileName > b.fileName ? 1 :
        posOrder < 0 ? -1 : posOrder > 0 ? 1 :
        endOrder < 0 ? -1 : endOrder > 0 ? 1 :
        0
    })

export const nodeRecordsArray = (nodeRecords: NodeRecord[]) => nodeRecords.map(node => {
    const getModule = (parent: NodeRecord | null): string | undefined => {
        let files: string[] = [];
        while (parent) {
            files.push(
                parent.fileName.split("/").pop() +
                    " " +
                    parent.start.toString()!
            );
            parent = parent.parent;
        }
        return files.join(", ");
    };
    return [
        node.fileName?.split("/").pop(),
        node.start,
        node.final,
        node.label,
        node.children,
        getModule(node.parent),
    ];
});
