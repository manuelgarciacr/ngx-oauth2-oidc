import { strings } from "@angular-devkit/core";
import * as _path from "path";

import {
    Rule,
    SchematicContext,
    SchematicsException,
    Tree,
    apply,
    url,
    when,
    forEach,
    composeFileOperators,
    applyContentTemplate,
    applyPathTemplate,
    PathTemplateData,
    FileEntry,
    TEMPLATE_FILENAME_RE
} from "@angular-devkit/schematics";
import { InsertChange } from "@schematics/angular/utility/change";
import { getEOL } from "@schematics/angular/utility/eol";
import { GlobalData, NodeArray, getIndentation, getSourceFile, nodeType, setData, ts } from "./utils";
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
    itemsFindOptions: findOptions = {},
    order: number | "last" = 0,
    rules: Rule[]
): Promise<Rule[]> => {
    rules.push(
        await insertTemplateRuleFactory(
            file,
            templateOptions,
            rootFindOptions,
            parentFindOptions,
            itemsFindOptions,
            order
        )
    );

    return rules;
};

const insertTemplateRuleFactory = async (
    file: string,
    templateOptions: templateOptions,
    rootFindOptions: findOptions = {},
    parentFindOptions: findOptions = {},
    itemsFindOptions: findOptions = {},
    order: number | "last" = 0
): Promise<Rule> => {
    return async (tree: Tree, context: SchematicContext) => {
        const { vars } = templateOptions;
        const source = getSourceFile(tree, file);
        const root = rootFindOptions && source
            ? findNodes(source, 4, rootFindOptions)?.[0]
            : source;
        const parent = parentFindOptions && root
            ? findNodes(root, 4, parentFindOptions)?.[0]
            : source;
        let itemsRoot;

        for (let key in vars) {
            if (typeof vars[key] === "function") {
                vars[key] = vars[key]();
            }
        }

        if (parent && "members" in parent) {
            itemsRoot = parent.members as NodeArray<ts.Node>;
        }

        if (parent && (
            ts.isFunctionDeclaration(parent) ||
            ts.isMethodDeclaration(parent))
        ) {
            itemsRoot = parent.body?.statements;
        }

        if (!itemsRoot) {
            throw new SchematicsException(
                `❌  Parent node without members nor body: '${nodeType(
                    parent,
                    1
                )}'`
            );
        }

        const eol = getEOL(source.getFullText());
        const [pos, indentation] = getPos(
            parent,
            itemsRoot,
            itemsFindOptions,
            order,
            eol,
        );

        if ("id" in vars) {
            const ids = findNodes<namedNode>(itemsRoot, 1)
                .filter(n => "name" in n)
                .map(n => n.name.getText());

            Object.assign(vars, { id: { str: vars["id"], ids } });
        }

        const nodeText = (
            await _getTemplate({ ...templateOptions, vars }, context)
        )?.replaceAll("    ", indentation);
        const updateRecorder = tree.beginUpdate(file);
        const change = new InsertChange(file, pos, `${eol}${nodeText}`);

        if (change instanceof InsertChange) {
            updateRecorder.insertRight(change.pos, change.toAdd);
        }

        tree.commitUpdate(updateRecorder);
    };
};

export const getPos = (
    parent: ts.Node,
    itemsRoot: NodeArray<ts.Node>,
    options: findOptions = {},
    order: "last" | number,
    eol: string,
): [number, string] => {
    const items = findNodes(itemsRoot, 1, options);
    const indentation = getIndentation(parent, items, order);
    const position =
        order === "last"
            ? items.length
            : order > items.length
            ? items.length
            : order < 0
            ? 0
            : order;

    const pos =
        items.length === 0
            ? itemsRoot.pos
            : position === items.length
            ? items[position - 1].end
            : _getPos(items[position], eol);

    return [pos, indentation]
};

const _getPos = (item: ts.Node, eol: string) => {
    let offset = 0;
    while (item.getFullText().startsWith(eol + eol, offset))
        offset += eol.length;

    return item.pos + offset;
};

export const getTemplate = async (
    id: string,
    options: templateOptions,
    data: GlobalData,
    rules: Rule[]
): Promise<Rule[]> => {
    rules.push(async (_tree: Tree, context: SchematicContext) => {
        const code = await _getTemplate(options, context);

        setData(data, code, "templates", id, "value");
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
                let cnt = 0;
                let id = str;
                while (ids.includes(id))
                    id = str + (++cnt).toString().padStart(2, "0");
                return id;
            },
            ...options.vars,
        }),
        //move(normalize(options.path as string)),
    ]);
    const tree = await firstValueFrom(
        templateSource(context) as Observable<Tree>
    );

    return tree.read(options.templateName)?.toString();
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
