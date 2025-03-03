import {
    SchematicsException,
    Tree} from "@angular-devkit/schematics";
import { getEOL } from "@schematics/angular/utility/eol";
import _ts, {
    SyntaxKind,
    NodeArray as _NodeArray
} from "@schematics/angular/third_party/github.com/Microsoft/TypeScript/lib/typescript";

export type GlobalData = Record<string, any>;
export const setData = (target: GlobalData, value: any, ...keys: string[]) => {
    const len = keys.length;
    let i = 0;
    let last = target,
        next = target;

    while (i < len && next[keys[i]] !== undefined) {
        last = next;
        next = next[keys[i++]];
    }
    while (i < len) {
        last = next;
        next = next[keys[i++]] = {};
    }
    if (value === null || value === undefined) {
        if (len) delete last[keys[len - 1]];
        else Object.keys(last).forEach(key => delete last[key]);
    } else if (isPlainObject(value)) Object.assign(next, { ...next, ...value });
    else last[keys[len - 1]] = value;
};
export const getData = (target: GlobalData, ...keys: string[]) => {
    let i = 0;
    let t = target;
    while (i < keys.length && t !== undefined) t = t[keys[i++]];

    return t === undefined ? t : JSON.parse(JSON.stringify(t));
};
export const __$$undefined = Symbol.for("__$$undefined");
export const __$$anonymous = Symbol.for("__$$anonymous");
export interface Node extends ts.Node {}
export interface NamedNode extends ts.Node {name: ts.Identifier}
export type NodeArray<T extends ts.Node> = _NodeArray<T> & {
    pos: number;
    end: number;
};
export import ts = _ts;
import { findNodes } from "./find";
export enum NodeTypeExtension {
    single,
    extended,
    onlyExtension,
}
export const getEnumIdentifier = (enumeration: any, value: number) => {
    // const key = value.toString() as keyof typeof enumeration;
    // return enumeration[key];

    return Object.entries(enumeration)
        .filter(v => isNaN(Number(v[0])))
        .find(v => v[1] === value)?.[0];
};
export const getNodeType = (node: ts.Node | number) => {
    const kind = typeof node === "number" ? node : node.kind
    return getEnumIdentifier(ts.SyntaxKind, kind) as string;
}
export const isPlainObject = (v: any) =>
    !!v &&
    typeof v === "object" &&
    (v.__proto__ === null || v.__proto__ === Object.prototype);
const _nodeIdentifier = (node: ts.Node) =>
    (node as { name?: { escapedText?: string } }).name?.escapedText ??
    (node as { escapedText?: string }).escapedText;

export const nodeFlags = (node: ts.Node | undefined) => {
    if (node === undefined) return [];

    const values = (
        Object.values(ts.NodeFlags).filter(
            v => typeof v === "number"
        ) as number[]
    ).sort((a, b) => b - a);
    const flagsArray = [];
    let flags = node.flags;

    do {
        const val = values.find(v => v <= flags)!;
        const key = val.toString() as keyof typeof ts.NodeFlags;

        flagsArray.unshift(ts.NodeFlags[key]); // as unknown as string);
        flags -= val;
    } while (flags > 0);

    return flagsArray as unknown as string[];
};

/**
 *
 * @param {ts.Node} parent Parent node with statements, properties or members
 * @param {string} source Source file content
 * @param {string} eol EOL string
 * @param {"first" | "last"} order
 * @param {ts.NodeArray<ts.Node>} nodes
 * @returns {[string, string, string, string, boolean, boolean, boolean]}
 */
export const getInBlockIndentation = (
    parent: ts.Node & {
        statements?: ts.NodeArray<ts.Node>;
        properties?: ts.NodeArray<ts.Node>;
        members?: ts.NodeArray<ts.Node>;
    },
    source?: string,
    eol?: string,
    order: "first" | "last" = "last",
    nodes?: ts.NodeArray<ts.Node> | ts.Node[]
): [string, string, string, string, boolean, boolean, boolean] => {
    nodes ??= "statements" in parent
        ? parent.statements
        : "properties" in parent
        ? parent.properties
        : parent.members;
    source ??= parent.getSourceFile().getFullText();
    eol ??= getEOL(source);

    if (nodes === undefined) {
        throw new SchematicsException(
            `❌  Undefined block nodes: ${nodeType(parent)}`
        );
    }

    let pos =
        order === "last"
            ? nodes.length
            : 0;

    const indentation = getIndentation(parent.getSourceFile(), source, eol);
    const [parentIndentation, parentStart, parentEnd] = getNodeIndentation(parent, source, eol);
    const inlineStart =
        !!nodes.length &&
        source.lastIndexOf("{", nodes[0].getStart()) >
        source.lastIndexOf(eol, nodes[0].getStart());
    const inlineEnd =
        !!nodes.length &&
        source.indexOf("}", nodes[nodes.length - 1].end) <
            source.indexOf(eol, nodes[nodes.length - 1].end);

    let previousNodeIndentation = parentIndentation + indentation;
    let nextNodeIndentation = parentIndentation + indentation;

    if (pos - 1 >= 0) {
        const [indentation, nodeStart] = getNodeIndentation(
            nodes[pos - 1],
            source,
            eol
        );

        if (nodeStart !==  parentStart) previousNodeIndentation = indentation
    }

    if (pos === 0 && pos < nodes.length) {
        const [indentation, nodeStart] = getNodeIndentation(
            nodes[pos],
            source,
            eol
        );

        if (nodeStart !== parentStart) nextNodeIndentation = indentation;
    }

    return [
        parentIndentation,
        indentation,
        previousNodeIndentation,
        nextNodeIndentation,
        parentStart === parentEnd,
        inlineStart,
        inlineEnd
    ];
};

export const getIndentation = (
    sourceFile: ts.SourceFile,
    source?: string,
    eol?: string
) => {
    source ??= sourceFile.getFullText();
    eol ??= getEOL(source);

    const nodes = <ts.Node[]>[];
    const parents = findNodes<
        ts.Node & {
            statements?: ts.NodeArray<ts.Node>;
            properties?: ts.NodeArray<ts.Node>;
            members?: ts.NodeArray<ts.Node>;
        }
    >(sourceFile, 12, {
        test: n =>
            Object.hasOwn(n, "statements") ||
            Object.hasOwn(n, "properties") ||
            Object.hasOwn(n, "members"),
    });

    parents.forEach(
        n =>
            n.statements &&
            nodes.push(...(n.statements as unknown as ts.Node[]))
    );
    parents.forEach(
        n =>
            n.properties &&
            nodes.push(...(n.properties as unknown as ts.Node[]))
    );
    parents.forEach(
        n => n.members && nodes.push(...(n.members as unknown as ts.Node[]))
    );

    const indentations = nodes
        .map(
            n =>
                getNodeIndentation(n, source, eol)[0].length -
                getNodeIndentation(n.parent, source, eol)[0].length
        )
        .reduce(
            (prev, curr) =>{
                if (curr === 0) return prev;

                return prev[curr] ? { ...prev, [curr]: prev[curr] + 1 } : { ...prev, [curr]: 1 }
            },
            <Record<number, number>>{}
        );
    const entries = Object.entries(indentations).sort((a, b) =>
        b[1] - a[1] === 0 ? parseInt(b[0]) - parseInt(a[0]) : b[1] - a[1]
    );

    const len = entries.length ? parseInt(entries[0][0]) : 0;

    return " ".repeat(len);
};

export const getNodeIndentation = (
    node?: ts.Node,
    source?: string,
    eol?: string
): [string, number, number] => {
    if (!node) return ["", -1, -1];

    source ??= node.getSourceFile().getFullText();
    eol ??= getEOL(source);

    const getIndentation = (pos: number) => {
        let cnt = pos;
        while (cnt < source.length && source.charAt(cnt).match(/[ \t]/)) cnt++;

        return cnt - pos;
    };
    const start = source.lastIndexOf(eol, node.getStart()); //source.lastIndexOf(eol, node.pos);
    const end = source.lastIndexOf(eol, node.end - 1);
    const startInd = getIndentation(start + (start < 0 ? 1 : eol.length));
    const endInd = getIndentation(end + (end < 0 ? 1 : eol.length));

    return [" ".repeat(startInd < endInd ? startInd : endInd), start, end];
};

export const log = (obj: Record<string, any>, depth: number | null, options?: {omit?: string[], show?: string[], print?: boolean }) => {
    const { omit = ["parent"], show: filter = [], print = true } = options ?? {omit: ["parent"], filter: []};
    const arrayRoot = "__arrayRoot__";
    const clone = (obj: Object, cnt: number) => {
        const newObj = {}
        if (cnt < 0) return newObj;
        for (var property in obj) {
            if (obj.hasOwnProperty(property) && ((property  === arrayRoot && cnt === depth) || filter.includes(property) || filter.length === 0 || !isNaN(property as unknown as number))) {
                if (omit.includes(property)) {
                    Object.assign(newObj, {
                        [property]: "__omited__"
                    });
                } else if (Array.isArray(obj[property as keyof typeof obj])) {
                    Object.assign(newObj, {[property]: []});
                    Object.entries(obj[property as keyof typeof obj])
                        .filter(
                            p =>
                                filter.includes(p[0]) ||
                                filter.length === 0 ||
                                !isNaN(p[0] as unknown as number)
                        )
                        .forEach(

                            p => {
                                if (typeof p[1] === "object") {
                                    // @ts-ignore
                                    newObj[property as keyof typeof newObj][
                                        p[0]
                                    ] = clone(p[1], cnt - 1);
                                    Object.setPrototypeOf(
                                        newObj[property as keyof typeof newObj][
                                            p[0]
                                        ],
                                        p[1]
                                    );
                                } else {
                                    // @ts-ignore
                                    newObj[property as keyof typeof newObj][
                                        p[0]
                                    ] = omit.includes(p[0])
                                        ? "__omited__"
                                        : p[0] === "kind"
                                        ? `${p[1]} (${getNodeType(p[1])})`
                                        : p[1];
                                }

                            }
                        );
                } else if (typeof obj[property as keyof typeof obj] == "object") {
                    Object.assign(newObj, {
                        [property]: clone(
                            obj[property as keyof typeof obj],
                            cnt - 1
                        ) ,
                    });
                    Object.setPrototypeOf(
                        newObj[property as keyof typeof obj],
                        obj[property as keyof typeof obj]
                    );
                } else {
                    Object.assign(newObj, {
                        [property]:
                            omit.includes(property)
                                ? "__omited__"
                                : property === "kind"
                                ? `${
                                      obj[property as keyof typeof obj]
                                  } (${getNodeType(
                                      obj[
                                          property as keyof typeof obj
                                      ] as unknown as number
                                  )})`
                                : obj[property as keyof typeof obj],
                    });
                }
            }
        }
        if (
            obj?.constructor?.name === "NodeObject" &&
            (filter.includes("getText()") ||
                filter.includes("getText") ||
                filter.length === 0)
        ) {
            Object.assign(newObj, {
                "getText()": omit.includes("getText()")
                    ? "__omited__"
                    : (obj as ts.Node).getText(),
            });
        }
        if (
            obj?.constructor?.name === "NodeObject" &&
            (filter.includes("getFullText()") ||
                filter.includes("getFullText") ||
                filter.length === 0)
        ) {
            Object.assign(newObj, {
                "getFullText()": omit.includes("getFullText()")
                    ? "__omited__"
                    : (obj as ts.Node).getFullText(),
            });
        }
        return newObj
    }
    // const iterate = (out: Record<string, any>, cnt: number, key: string) => {
    //     if (cnt < 0) return out;
    //     for (let key in out) {
    //         if (omit.includes(key)) out[key] = "__omited__";
    //         else if (filter.length > 0 && !filter.includes(key)) delete out[key];
    //         else if (Array.isArray(out[key])) out[key] = out[key].map((n: Record<string, any>) => iterate(n, cnt - 1, key));
    //         else if (typeof out[key] === "object") out[key] = iterate(out[key], cnt - 1, key)
    //     }
    //     return out
    // }
    depth ??= 5;
    depth = depth < 0 ? 0 : depth > 10 ? 10 : depth;
    if (Array.isArray(obj)) {
        depth++;
        const newObj = {[arrayRoot]: obj};
        const out = clone(newObj, depth)
        if (print)
            console.dir(out[arrayRoot as keyof typeof out], { depth });
        return out[arrayRoot as keyof typeof out] as Record<string, any>;
    }
    const out = clone(obj, depth);
    if (print)
        console.dir(out, {depth});
    return out as Record<string, any>
}

const _defaultExtendedText = (node: ts.Node) => {
    const id = !!_nodeIdentifier(node)
        ? _nodeIdentifier(node)
        : node.kind === 263 // ClassDeclaration
        ? "Symbol(__$$anonymous)"
        : "";
    const dec = (ts.getDecorators(node as ts.HasDecorators) ?? [])
        .map(d => nodeType(d, 2))
        .join("");
    const flags = !!node.flags ? "flags: " + nodeFlags(node).join(", ") : "";
    return id + dec + (id + dec ? " " : "") + (flags ? flags : "");
};

const _nodeType = (
    extension: NodeTypeExtension,
    singleText: string,
    extendedText: string,
    data?: Object
) =>
    `${extension < 2 ? singleText : ""}${
        extension === 1 && extendedText !== "" ? ", " : ""
    }${extension > 0 ? extendedText : ""}${
        data
            ? " " +
              JSON.stringify(data ?? "", (_key, value) => {
                  if (value === __$$undefined) return "Symbol(__$$undefined)";
                  return value;
              })
            : ""
    }`;

export const nodeType = (
    node: Node,
    extension: NodeTypeExtension = 1,
    data?: Object
): string => {
    if  (!node?.kind && !isNodeArray(node)) {
        throw new SchematicsException(
            `❌  nodeType: it is not a node`
        );
    }

    return isNodeArray(node)
        ? _nodeType(extension, "NodeArray", `length: ${node.length}`, data)
        : ts.isStringLiteral(node) // 11
        ? _nodeType(extension, "StringLiteral", '"' + node.text + '"', data)
        : ts.isIdentifier(node) // 80
        ? _nodeType(extension, "Identifier", node?.escapedText as string, data)
        : ts.isDecorator(node) // 170
        ? _nodeType(
              extension,
              "Decorator",
              "@" + node.expression.getFirstToken()?.getText(),
              data
          )
        : // : ts.isPropertyDeclaration(node) // 172
        // ? _nodeType(
        //       extension,
        //       "PropertyDeclaration",
        //       node.name.getText() +
        //           (ts.getDecorators(node) ?? [])
        //               .map(d => nodeType(d, 2))
        //               .join(""),
        //       data
        //   )
        // : ts.isMethodDeclaration(node) // 174
        // ? _nodeType(
        //       extension,
        //       "MethodDeclaration",
        //       node.name.getText() +
        //           (ts.getDecorators(node) ?? [])
        //               .map(d => nodeType(d, 2))
        //               .join(""),
        //       data
        //   )
        // : ts.isBlock(node) // 241
        // ? _nodeType(extension, "Block", "flags: " + flags.join(", "), data)
        // : ts.isVariableStatement(node) // 243
        // ? _nodeType(
        //       extension,
        //       "VariableStatement",
        //       _defaultExtendedText(node),
        //       data
        //   )
        // : ts.isExpressionStatement(node) // 244
        // ? _nodeType(
        //       extension,
        //       "ExpressionStatement",
        //       node.flags ? "flags: " + _nodeFlags(node).join(", ") : "",
        //       data
        //   )
        // : ts.isClassDeclaration(node) // 263
        // ? _nodeType(
        //       extension,
        //       "ClassDeclaration",
        //       (node.name?.escapedText ?? "anonymous") +
        //           (ts.getDecorators(node) ?? [])
        //               .map(d => nodeType(d, 2))
        //               .join(""),
        //       data
        //   )
        ts.isImportDeclaration(node) // 272
        ? _nodeType(extension, "ImportDeclaration", node.getText(), data)
        : ts.isImportClause(node) // 273
        ? _nodeType(
              extension,
              "ImportClause",
              node.name?.escapedText ?? node.getText(),
              data
          )
        : ts.isNamedImports(node) // 275
        ? _nodeType(extension, "NamedImports", node.getText(), data)
        : ts.isSourceFile(node) // 307
        ? _nodeType(extension, "SourceFile", node.fileName, data)
        : _nodeType(
              extension,
              getEnumIdentifier(ts.SyntaxKind, node?.kind) as string,
              _defaultExtendedText(node),
              data
          );
};

export type callExpressionType = {
    identifier?: string;
    arguments: EvaluatedExpression[];
};

export type modifiersType = {
    isAbstract?: boolean;
    isAccessor?: boolean;
    isAsync?: boolean;
    isConst?: boolean;
    isDeclare?: boolean;
    isDefault?: boolean;
    isExport?: boolean;
    isIn?: boolean;
    isPrivate?: boolean;
    isProtected?: boolean;
    isPublic?: boolean;
    isReadonly?: boolean;
    isOut?: boolean;
    isOverride?: boolean;
    isStatic?: boolean;
    decorators?: callExpressionType[];
};

export type classDeclarationType =
    | modifiersType
    | {
          name?: string;
      };

// SyntaxKind.StringLiteral: 11

export const isStringLiteral = ts.isStringLiteral;

export const getStringLiteral = (node?: ts.StringLiteral) => node?.text;

// SyntaxKind.Identifier: 80

export const isIdentifier = ts.isIdentifier;

export const getIdentifier = (node?: ts.Identifier) => node?.text;

// SyntaxKind.Decorator: 170

export const isDecorator = ts.isDecorator;

export function getDecorator(node: ts.Decorator) {
    const callExpression = node.expression as ts.CallExpression;
    return getCallExpression(callExpression);
}

// SyntaxKind.ObjectLiteralExpression: 210

export const isObjectLiteralExpression = ts.isObjectLiteralExpression;

export const getObjectLiteralExpression = (
    node: ts.ObjectLiteralExpression
) => {
    const properties = node.properties as ts.NodeArray<ts.PropertyAssignment>;
    const entries = properties.map(prop => getPropertyAssignment(prop) ?? []);

    return Object.fromEntries(entries);
};

// SyntaxKind.CallExpression: 213

export const isCallExpression = ts.isCallExpression;

export function getCallExpression(node: ts.CallExpression): callExpressionType {
    const identifier = node.expression as ts.Identifier; // Decorator identifier
    const decoratorArguments = // 'arguments' is a reserved word
        node.arguments as ts.NodeArray<ts.Expression>;

    return {
        identifier: getIdentifier(identifier), // undefined if anonim function
        arguments: decoratorArguments.map(arg => getEvaluatedExpression(arg)),
    };
}

// SyntaxKind.ClassDelaration: 263

export const isClassDeclaration = ts.isClassDeclaration;

export function getClassDeclaration(node: ts.ClassDeclaration) {
    // node.members.forEach(member => console.log("MEMBER", member.kind, member.getText()));
    const name = getIdentifier(
        node.name
    ); /** May be undefined in `export default class { ... }`. */
    const modifiers = getModifiers(node.modifiers);

    return { name, ...modifiers } as classDeclarationType;
}

// SyntaxKind.ImportDeclaration: 272

export const isImportDeclaration = ts.isImportDeclaration;

// SyntaxKind.PropertyAssignment: 303

export const isPropertyAssignment = ts.isPropertyAssignment;

export const getPropertyAssignment = (node: ts.PropertyAssignment) => {
    // if  (!node) return undefined;

    const name = getPropertyName(node.name);
    const expression = getEvaluatedExpression(node.initializer);

    return [name, expression];
};

// SyntaxKind.SourceFile: 307

export interface SourceFile extends ts.SourceFile {}

// Expression

export const isExpression = ts.isExpression;

export interface EvaluatedExpression extends ts.Node {}

export const isEvaluatedExpression = (
    node: ts.Node
): node is EvaluatedExpression =>
    // Literal
    ts.isNumericLiteral(node) ||
    ts.isBigIntLiteral(node) ||
    ts.isStringLiteral(node) ||
    ts.isRegularExpressionLiteral(node) ||
    ts.isNoSubstitutionTemplateLiteral(node) ||
    ts.isArrayLiteralExpression(node) ||
    ts.isObjectLiteralExpression(node) ||
    // Keyword
    node.kind === SyntaxKind.FalseKeyword ||
    node.kind === SyntaxKind.NullKeyword ||
    node.kind === SyntaxKind.TrueKeyword ||
    node.kind === SyntaxKind.UndefinedKeyword ||
    // Identifier
    ts.isIdentifier(node);

export const getEvaluatedExpression = (node: ts.Expression): any => {
    //if (!node) return __$$undefined

    const kind = node.kind;
    const text = (node as { text?: string }).text ?? "";
    const elements = (node as { elements?: ts.Expression[] }).elements ?? [];
    let expression;

    switch (kind) {
        // Literal
        case SyntaxKind.NumericLiteral:
            expression = Number(text);
            break;
        case SyntaxKind.BigIntLiteral:
            expression = BigInt(text);
            break;
        case SyntaxKind.StringLiteral:
            expression = text;
            break;
        case SyntaxKind.RegularExpressionLiteral:
            break;
        case SyntaxKind.NoSubstitutionTemplateLiteral:
            break;
        case SyntaxKind.ArrayLiteralExpression:
            expression = elements.map(v => getEvaluatedExpression(v));
            break;
        case SyntaxKind.ObjectLiteralExpression:
            expression = getObjectLiteralExpression(
                node as ts.ObjectLiteralExpression
            );
            break;
        // Keywords
        case SyntaxKind.FalseKeyword:
            expression = false;
            break;
        case SyntaxKind.NullKeyword:
            expression = null;
            break;
        case SyntaxKind.TrueKeyword:
            expression = true;
            break;
        case SyntaxKind.UndefinedKeyword:
            expression = undefined;
            break;
        // Identifier
        case SyntaxKind.Identifier:
            expression = text;
            break;
        default:
            console.warn(
                `getEvaluatedExpression: no evaluated expression node kind: ${kind}, text: "${node.getText()}"`
            );
            expression = __$$undefined;
    }

    return expression;
};

// PropertyName

export const isPropertyName = ts.isPropertyName;

export const getPropertyName = (node?: ts.PropertyName): any => {
    if (!node) return undefined;

    const kind = node.kind;
    const text = (node as { text?: string }).text ?? "";
    let expression;

    switch (kind) {
        case SyntaxKind.Identifier:
        case SyntaxKind.StringLiteral:
        case SyntaxKind.NoSubstitutionTemplateLiteral:
        case SyntaxKind.PrivateIdentifier:
            expression = text;
            break;
        case SyntaxKind.NumericLiteral:
            expression = Number(text);
            break;
        case SyntaxKind.ComputedPropertyName:
            expression = getEvaluatedExpression(node.expression);
            break;
        default:
            console.error(
                `getPropertyName: not a property name node kind: ${kind}, text: "${(
                    node as ts.Node
                ).getText()}"`
            );
            expression = __$$undefined;
    }

    return expression;
};

// NodeArray

export const isNodeArray = <T extends ts.Node>(obj: any): obj is NodeArray<T> =>{
    return Array.isArray(obj) && "pos" in obj && "end" in obj && "hasTrailingComma" in obj
}

// Modifiers

export const getModifiers = (
    modifiers?: ts.NodeArray<ts.ModifierLike>
): modifiersType => {
    if (!modifiers) return {};

    return modifiers.reduce<modifiersType>(
        (prev: modifiersType, cur: ts.ModifierLike) =>
            cur.kind === SyntaxKind.AbstractKeyword
                ? { ...prev, isAbstract: true }
                : cur.kind === SyntaxKind.AccessorKeyword // ?????
                ? { ...prev, isAccessor: true }
                : cur.kind === SyntaxKind.AsyncKeyword
                ? { ...prev, isAsync: true }
                : cur.kind === SyntaxKind.ConstKeyword
                ? { ...prev, isConst: true }
                : cur.kind === SyntaxKind.DeclareKeyword
                ? { ...prev, isDeclare: true }
                : cur.kind === SyntaxKind.DefaultKeyword
                ? { ...prev, isDefault: true }
                : cur.kind === SyntaxKind.ExportKeyword
                ? { ...prev, isExport: true }
                : cur.kind === SyntaxKind.InKeyword
                ? { ...prev, isIn: true }
                : cur.kind === SyntaxKind.PrivateKeyword
                ? { ...prev, isPrivate: true }
                : cur.kind === SyntaxKind.ProtectedKeyword
                ? { ...prev, isProtected: true }
                : cur.kind === SyntaxKind.PublicKeyword // ?????
                ? { ...prev, isPublic: true }
                : cur.kind === SyntaxKind.ReadonlyKeyword
                ? { ...prev, isReadonly: true }
                : cur.kind === SyntaxKind.OutKeyword
                ? { ...prev, isOut: true }
                : cur.kind === SyntaxKind.OverrideKeyword
                ? { ...prev, isOverride: true }
                : cur.kind === SyntaxKind.StaticKeyword
                ? { ...prev, isStatic: true }
                : cur.kind === SyntaxKind.Decorator
                ? {
                      ...prev,
                      decorators: [
                          ...(prev.decorators ?? []),
                          getDecorator(cur),
                      ],
                  }
                : (() => {
                      console.error(
                          `getExpression: no literal expression node kind: ${
                              (cur as ts.Node).kind
                          }, text: "${(cur as ts.Node).getText()}"`
                      );
                      return prev;
                  })(),
        {}
    );
};

/**
 * Gets a TypeScript source file at a specific path.
 * @param tree File tree of a project.
 * @param path Path to the file.
 */
export function getSourceFile(
    tree: Tree,
    path: string
): ts.SourceFile | ts.JsonSourceFile {
    const content = tree.readText(path);
    const extension = path.split(".").pop() ?? "";

    /**
     * Convert the json syntax tree into the json value
     */
    // function convertToObject(
    //     sourceFile: JsonSourceFile,
    //     errors: Diagnostic[]
    // ): any;

    if (["json", "scss", "sass", "css"].includes(extension)) {
        const src = ts.parseJsonText(path, content);

        return src;
    }

    const source = ts.createSourceFile(
        path,
        content,
        ts.ScriptTarget.Latest,
        true
    );

    return source;
}

export function getFileContent(tree: Tree, path: string): string {
    const fileEntry = tree.get(path);

    if (!fileEntry) {
        throw new Error(`The file (${path}) does not exist.`);
    }

    return fileEntry.content.toString();
}

