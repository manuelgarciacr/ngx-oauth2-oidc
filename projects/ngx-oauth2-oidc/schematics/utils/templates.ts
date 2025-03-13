
import {
    FileEntry,
    PathTemplateData,
    ReplaceChange,
    Rule,
    SchematicContext,
    SchematicsException,
    TEMPLATE_FILENAME_RE,
    Tree,
    apply,
    applyContentTemplate,
    applyPathTemplate,
    composeFileOperators,
    forEach,
    getEOL,
    getSourceFile,
    strings,
    ts,
    url,
    when,
} from ".";
import * as _path from "path";

import { GlobalData, getInBlockIndentation, nodeType, setData } from "./utils";
import { findNodes, findOptions } from "./find";
import { Observable, firstValueFrom } from "rxjs";

type namedNode = ts.Node & { name: { getText(): string } };

export type templateOptions = {
    templatePath: string;
    templateName: string;
    vars: Record<string, any>;
};

export type insertOptions = {
    itemNames?: string[];
    itemkindOrGuard?: ts.SyntaxKind | ((node: ts.Node) => node is any);
    order?: number | "last";
};

export const insertTemplate = async (
    file: string,
    templateOptions: templateOptions,
    rootFindOptions: findOptions = {},
    parentFindOptions: findOptions = {},
    rules: Rule[],
    source?: string,
    eol?: string,
    order: "first" | "last" = "last",
    nodes?: ts.NodeArray<ts.Node>,
): Promise<Rule[]> => {
    rules.push(
        await insertTemplateRuleFactory(
            file,
            templateOptions,
            rootFindOptions,
            parentFindOptions,
            // itemsFindOptions,
            source,
            eol,
            order,
            nodes
        )
    );

    return rules;
};

const insertTemplateRuleFactory = async (
    file: string,
    templateOptions: templateOptions,
    rootFindOptions: findOptions = {},
    parentFindOptions: findOptions = {},
    source?: string,
    eol?: string,
    order: "first" | "last" = "last",
    nodes?: ts.NodeArray<ts.Node>
): Promise<Rule> => {
    return async (tree: Tree, context: SchematicContext) => {
        const { vars } = templateOptions;
        const sourceFile = getSourceFile(tree, file);
        const root = rootFindOptions && sourceFile
            ? findNodes(sourceFile, 4, rootFindOptions)?.[0]
            : sourceFile;
        const parent: ts.Node & {
            statements?: ts.NodeArray<ts.Node>;
            properties?: ts.NodeArray<ts.Node>;
            members?: ts.NodeArray<ts.Node>;
        } =
            parentFindOptions && root
                ? findNodes(root, 4, parentFindOptions)?.[0]
                : sourceFile;
        nodes ??= "statements" in parent //Object.hasOwn(parent, "statements")
            ? parent.statements
            : "properties" in parent //Object.hasOwn(parent, "properties")
            ? parent.properties
            : parent.members;
        source ??= parent.getSourceFile().getFullText();
        eol ??= getEOL(source);

        for (let key in vars) {
            if (typeof vars[key] === "function") {
                vars[key] = vars[key]();
            }
        }

        let itemsRoot;

        if (parent && "statements" in parent) {
            itemsRoot = parent.statements;
        } else if (parent && "properties" in parent) {
            itemsRoot = parent.properties;
        } else {
            itemsRoot = parent?.members;
        }

        if (!itemsRoot) {
            throw new SchematicsException(
                `❌  Parent node without members nor body: '${
                    parent ? nodeType(parent, 1) : parent
                }'`
            );
        }

        if ("id" in vars) {
            const ids = findNodes<namedNode>(itemsRoot, 1)
                .filter(n => "name" in n)
                .map(n => n.name.getText());

            Object.assign(vars, { id: { str: vars["id"], ids } });
        }

        const template = await _getTemplate(
            { ...templateOptions, vars },
            context
        ) ?? "";
        const [
            parentIndentation,
            indentation,
            previousNodeIndentation,
            nextNodeIndentation,
        ] = getInBlockIndentation(parent, source, eol, order);
        const nodeText = template
                ?.trim()
                ?.replaceAll("    ", indentation)
                ?.replaceAll("\n", `\n${previousNodeIndentation}`);
        const blockContent = parent.getText().slice(1, -1);
        const blockLength = blockContent.length;
        const getInlineContent = (template: string, block: string) => {
            const first = (order === "first" ? template : block).trim();
            const last = (order === "first" ? block : template).trim();
            const sufix =
                first &&
                last &&
                !first.endsWith(";") &&
                !first.endsWith("}")
                    ? ";"
                    : "";
            const indentation = order === "first" ? nextNodeIndentation : previousNodeIndentation;
            const separator = first && last ? eol + indentation : "";
            return first + sufix + separator + last
        }

        let newContent = eol + parentIndentation + indentation;

        newContent += getInlineContent(nodeText, blockContent);
        newContent += eol + parentIndentation

        const updateRecorder = tree.beginUpdate(file);
        const change = new ReplaceChange(file, itemsRoot.pos, blockContent, newContent);

        if (change instanceof ReplaceChange) {
            updateRecorder.remove(change.order, blockLength);
            updateRecorder.insertRight(change.order, change.newText);
        }

        tree.commitUpdate(updateRecorder);
    };
};

export const getTemplate = async (
    id: string,
    options: templateOptions,
    data: GlobalData,
    rules: Rule[]
): Promise<Rule[]> => {
    rules.push(async (_tree: Tree, context: SchematicContext) => {
        const code = await _getTemplate(options, context);

        setData(data, code, "template", id, "value");
    })
    return rules
}

const _getTemplate = async (
    options: templateOptions,
    context: SchematicContext,
) => {

    const templateSource = apply(url(options.templatePath), [
        applyTemplates(options.templateName, {
            ...strings,
            identify(val: {str: string, ids: string[]}) {
                const {str, ids} = val;
                if (!str || !ids) {
                    throw new SchematicsException(
                        `❌  Invalid argument type: 'var.id'`
                    );
                }
                let cnt = 0;
                let id = str;
                while (ids.includes(id))
                    id = str + (++cnt).toString().padStart(2, "0");
                return id;
            },
            isFunction(val: () => string) {
                let str;
                try {
                    str = val()
                } catch(err) {
                    throw new SchematicsException(
                        `❌  inFunction(${val.name}) execution error: '${err}'`
                    );
                }
                return str
            },
            ...options.vars,
        }),
        //move(normalize(options.path as string)),
    ]);
    const tree = await firstValueFrom(
        templateSource(context) as Observable<Tree>
    );
    const str  = tree.read(options.templateName)?.toString();

    return str;
};

export function applyTemplates<T>(name: string, options: T): Rule {
    return forEach(
        when(
            path => path.endsWith(name + ".template"),
            composeFileOperators([
                applyContentTemplate(options),
                // See above for this weird cast.
                applyPathTemplate(options as {} as PathTemplateData),
                entry => {
                    return {
                        content: entry.content,
                        path: entry.path.replace(TEMPLATE_FILENAME_RE, ""),
                    } as FileEntry;
                },
            ])
        )
    );
}
