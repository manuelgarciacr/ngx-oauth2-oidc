import { DirEntry, Tree } from "@angular-devkit/schematics";
import { workspaces } from "@angular-devkit/core";
import { NodeArray, getSourceFile, isNodeArray, nodeType, ts } from "./utils"

export const findNodes = <T extends ts.Node>(
    rootNode: ts.Node | NodeArray<ts.Node>,
    depth: number = Infinity,
    options?: {
        kindOrGuard?: ts.SyntaxKind | ((node: ts.Node) => node is any);
        decorator?: string;
        names?: string[];
        caseSensitive?: boolean;
    }
): T[] => {
    if (!rootNode) return [];
    if (isNodeArray(rootNode) && rootNode.length === 0) return [];

    const { kindOrGuard, decorator, names, caseSensitive = true } = options ?? {};
    const nodes: T[] = [];
    const test =
        typeof kindOrGuard === "function"
            ? kindOrGuard
            : typeof kindOrGuard === "number"
            ? (node: ts.Node): node is any => node.kind === kindOrGuard
            : undefined;
    const getDepth = (node: ts.Node) => {
        let depth = 0;
        let parent = node.parent;

        while (parent) {
            depth++;
            parent = parent.parent;
        }

        return depth;
    };
    const rootDepth = isNodeArray(rootNode) ? getDepth(rootNode[0]) : getDepth(rootNode);

    depth = depth < 0 ? 0 : depth;

    function visit(node: ts.Node): ts.Node {
        let add = true;
//const b = a instanceof ts.
        // // 1.
        // if (ts.isClassDeclaration(node) && isComponent(node)) {
        //     withinComponent = true;

        //     // 2. Visit the child nodes of the class to find all subscriptions first
        //     const newNode = ts.visitEachChild(node, visit, context);

        //     if (containsSubscribe) {
        //         // 4. Create the subscriptions array
        //         newNode.members = ts.createNodeArray([
        //             ...newNode.members,
        //             createSubscriptionsArray(),
        //         ]);

        //         // 5. Create the ngOnDestroyMethod if not there
        //         if (!hasNgOnDestroyMethod(node)) {
        //             newNode.members = ts.createNodeArray([
        //                 ...newNode.members,
        //                 createNgOnDestroyMethod(),
        //             ]);
        //         }

        //         // 6. Create the unsubscribe loop in the body of the ngOnDestroyMethod
        //         const ngOnDestroyMethod = getNgOnDestroyMethod(newNode);
        //         ngOnDestroyMethod.body.statements = ts.createNodeArray([
        //             ...ngOnDestroyMethod.body.statements,
        //             createUnsubscribeStatement(),
        //         ]);
        //     }

        //     withinComponent = false;
        //     containsSubscribe = false;

        //     return newNode;
        // }

        // // 3.
        // if (isSubscribeExpression(node, checker) && withinComponent) {
        //     containsSubscribe = true;
        //     return wrapSubscribe(node, visit, context);
        // }
        if (add && test) {
            add &&= test(node);
        }

        if (add && decorator) {
            const idx = ts.canHaveDecorators(node)
                ? ts
                      .getDecorators(node)
                      ?.findIndex(v =>
                          match(
                              v.expression.getFirstToken()?.getText() ?? "",
                              decorator
                          )
                      ) ?? -1
                : -1;

            add &&= idx >= 0;
        }

        if (add && names && "name" in node) {
            const nodeName = (node.name as ts.Identifier)?.escapedText ?? ""
                // (node as { name?: { escapedText?: string } }).name
                //     ?.escapedText ?? "";
            const found =  !!names.find(name => match(nodeName, name, caseSensitive));
            add &&= found;
        }

        add &&= getDepth(node) - rootDepth <= depth;

        if (add) nodes.push(node as T);

        return ts.visitEachChild(node, visit, undefined);
    }

    if (isNodeArray(rootNode)) {
        rootNode.forEach(n => ts.visitNode(n, visit))
    } else ts.visitNode(rootNode, visit);

    return nodes;
};

/**
 * Resolve source nodes
 */
export const findSources = (
    tree: Tree,
    projectWorkspace: workspaces.ProjectDefinition,
    options: { path?: string; fileName?: string, caseSensitive?: boolean }
) => {
    const { path = "", fileName = "", caseSensitive = true } = { ...options };
    const sourceFiles: (string | ts.SourceFile)[] = [];
    let newPath = path;
    let dirEntry: DirEntry;

    while (newPath.includes("//")) newPath = newPath.replaceAll("//", "/");

    if (newPath.charAt(0) !== "/") newPath = "/" + newPath;

    dirEntry = tree.getDir(projectWorkspace.root + newPath);

    dirEntry.visit(visitor => {
        let sourceFile: string | ts.SourceFile;

        if (fileName) {
            const visitorName = visitor.split('/').pop()

            if (!match(visitorName!, fileName, caseSensitive)) return
        }

        try {
            const extension = visitor.split(".").pop() ?? "";

            if (extension === "html") throw "html"

            sourceFile = getSourceFile(tree, visitor);
        } catch(err) {
            sourceFile = visitor
        }

        sourceFiles.push(sourceFile);
    });


    return sourceFiles
};

const match = (text: string, mask: string, caseSensitive = true) => {

    if (!caseSensitive) {
        text = text.toLowerCase();
        mask = mask.toLowerCase();
    }

    const maskArray = mask.replaceAll(" ", "").split("*");
    const len = text.length;
    let idx = 0;

    for (let i = 0; i < maskArray.length; i++) {
        const mask = maskArray[i];
        const pos = text.indexOf(mask, idx);

        if (pos < 0) return false;
        if (pos > idx && !i) return false;

        idx = pos + mask.length;
    }

    if (idx < len && maskArray.pop()) return false

    return true;
};

