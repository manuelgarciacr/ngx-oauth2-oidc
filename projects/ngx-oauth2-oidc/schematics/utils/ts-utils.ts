import ts, {
    NodeArray as _NodeArray,
    // ObjectLiteralExpression,
    SyntaxKind,
    // createSourceFile,
} from "@schematics/angular/third_party/github.com/Microsoft/TypeScript/lib/typescript";

export { SyntaxKind, ts }
export type NodeArray<T extends ts.Node> = _NodeArray<T> & {
    pos: number;
    end: number;
};

//export import ts = _ts;

export const match = (text: string, mask: string, caseSensitive = true) => {
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

    if (idx < len && maskArray.pop()) return false;

    return true;
};

// NodeArray

export const isNodeArray = <T extends ts.Node>(
    obj: any
): obj is NodeArray<T> => {
    return (
        Array.isArray(obj) &&
        "pos" in obj &&
        "end" in obj &&
        "hasTrailingComma" in obj
    );
};
