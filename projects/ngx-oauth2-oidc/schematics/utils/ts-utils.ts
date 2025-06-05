import ts, {
    // Node,
    // NodeArray as _NodeArray,
    // ObjectLiteralExpression,
    // SyntaxKind,
    // createSourceFile,
} from "@schematics/angular/third_party/github.com/Microsoft/TypeScript/lib/typescript";
import { SchematicsException } from "./ng-utils";

export { ts }
export type NodeArray<T extends ts.Node> = ts.NodeArray<T> & {
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

// Node

export const isNode = (
    obj: any
): obj is ts.Node => {
    return hasProperty(obj, "pos") && hasProperty(obj, "end") && hasProperty(obj, "kind");
}

var hasOwnProperty = Object.prototype.hasOwnProperty;

function hasProperty(map2: any, key: PropertyKey) {
    return hasOwnProperty.call(map2, key);
}

// NodeArray

export const isNodeArray = <T extends ts.Node>(obj: any): obj is NodeArray<T> =>
    Array.isArray(obj) && hasProperty(obj, "pos") && hasProperty(obj, "end");

export const positionalError = (
    argument: ts.Node,
    errorMsg: string,
    sourceFile?: ts.SourceFile,
    fileName?: string
) => {
    sourceFile ??= argument.getSourceFile();
    fileName ??= sourceFile.fileName;

    const { line, character } = sourceFile.getLineAndCharacterOfPosition(
        argument.getStart()
    );

    throw new SchematicsException(
        `${errorMsg} at line ${line + 1} character ${
            character + 1
        } in ${fileName}`
    );
};

