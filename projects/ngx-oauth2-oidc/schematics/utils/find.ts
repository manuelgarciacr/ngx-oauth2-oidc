import { NodeArray, isNodeArray, match, ts } from ".";

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

