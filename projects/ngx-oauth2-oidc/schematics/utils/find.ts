import { DirEntry, Tree } from "@angular-devkit/schematics";
import { workspaces } from "@angular-devkit/core";
import { NodeArray, getSourceFile, isNodeArray, ts } from "./utils"

export type findOptions = {
    test?: (node: ts.Node) => boolean;
    kindOrGuard?: ts.SyntaxKind | ((node: ts.Node) => node is any);
    decorator?: string | null;
    names?: string[];
    caseSensitive?: boolean;
};
export const findNodes = <T extends ts.Node>(
    rootNode: ts.Node | NodeArray<ts.Node>,
    depth: number = Infinity,
    options?: findOptions
): T[] => {
    if (!rootNode) return [];
    if (isNodeArray(rootNode) && rootNode.length === 0) return [];

    const { test, kindOrGuard, decorator, names, caseSensitive = true } = options ?? {};
    const nodes: T[] = [];
    const guard =
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

        if (add && test) {
            add &&= test(node)
        }

        if (add && guard) {
            add &&= guard(node)
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

        _if: if (add && names) {
            if (!("name" in node)) {
                add &&= false;
                break _if;
            }
            const nodeName = (node.name as ts.Identifier)?.escapedText ?? "";
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

