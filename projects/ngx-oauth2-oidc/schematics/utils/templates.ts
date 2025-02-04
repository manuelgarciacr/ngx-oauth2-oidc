import { strings } from "@angular-devkit/core";
import * as _path from "path";

import {
    Rule,
    SchematicContext,
    SchematicsException,
    Tree,
    apply,
    chain,
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
import { findNodes } from "./find";
import { Observable, firstValueFrom } from "rxjs";

type namedNode = ts.Node & { name: { getText(): string } };

export type insertTemplateOptions = {
    parentName?: string;
    parentkindOrGuard?: ts.SyntaxKind | ((node: ts.Node) => node is any);
    itemNames?: string[];
    itemkindOrGuard?: ts.SyntaxKind | ((node: ts.Node) => node is any);
    order?: number | "last";
};

export const insertTemplate = async (
    file: string,
    templatePath: string,
    templateName: string,
    templateOptions: Record<string, any>,
    options: insertTemplateOptions,
    data: GlobalData,
    rules: Rule[]
): Promise<Rule[]> => {
    rules.push(
        await insertTemplateRuleFactory(
            file,
            templatePath,
            templateName,
            templateOptions,
            options,
            data
        )
    );

    return rules;
};

const insertTemplateRuleFactory = async (
    file: string,
    templatePath: string,
    templateName: string,
    templateOptions: Record<string, any>,
    options: insertTemplateOptions,
    data: GlobalData
): Promise<Rule> => {

    return async (tree: Tree, context: SchematicContext) => {
        const {
            parentName: name,
            parentkindOrGuard: kindOrGuard = ts.isSourceFile,
            itemNames = [],
            itemkindOrGuard,
            order = 0,
        } = options;
        const source = getSourceFile(tree, file);
        const names = name ? [name] : undefined;
        const parent = findNodes(source, 1, { kindOrGuard, names })?.[0];

        if (!("members" in parent)) {
            throw new SchematicsException(
                `❌  Parent node without members: '${nodeType(parent, 1)}'`
            );
        }

        const itemsRoot = parent.members as NodeArray<ts.Node>;
        const eol = getEOL(source.getFullText());
        const [pos, indentation] = getPos(itemsRoot, order, eol, itemNames, itemkindOrGuard);

        if ("id" in templateOptions) {
            const ids = findNodes<namedNode>(itemsRoot, 1)
                .filter(n => "name" in n)
                .map(n => n.name.getText());

            templateOptions = { ...templateOptions, id: {str: templateOptions["id"], ids} }
        }

        const nodeText = (
            await _getTemplate(
                templatePath,
                `/${templateName}`,
                context,
                templateOptions
            )
        )?.replaceAll("    ", indentation);
        const updateRecorder = tree.beginUpdate(file);
        const change = new InsertChange(file, pos, `${eol}${nodeText}`);

        if (change instanceof InsertChange) {
            updateRecorder.insertRight(change.pos, change.toAdd);
        }

        tree.commitUpdate(updateRecorder);

        setData(data, true, "insertedTemplate", templatePath, templateName, "value");
    };
};

export const getPos = (
    itemsRoot: NodeArray<ts.Node>,
    order: "last" | number,
    eol: string,
    itemNames: string[] = [],
    itemkindOrGuard?: ts.SyntaxKind | ((node: ts.Node) => node is any),
): [number, string] => {
    //ts.factory.createNodeArray()
    const _items = findNodes<namedNode>(itemsRoot, 1, {
        kindOrGuard: itemkindOrGuard,
    })
    const items = _items.filter(
        n =>
            (itemNames.length > 0 &&
                "name" in n &&
                itemNames.includes(n.name.getText())) ||
            itemNames.length === 0
    );
    const indentation = getIndentation(items, order, eol);
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
    path: string,
    fileName: string,
    options: Record<string, any>,
    data: GlobalData,
    rules: Rule[]
): Promise<Rule[]> => {
    rules.push(async (tree: Tree, context: SchematicContext) => {
        const code = await _getTemplate(path, fileName, context, options);

        setData(data, code, "templates", id, "value");
    })
    return rules
}

export const _getTemplate = async (
    path: string,
    fileName: string,
    context: SchematicContext,
    options: Record<string, any>
) => {

    const templateSource = apply(url(path), [
        applyTemplates(fileName, {
            ...strings,
            identify(val: {str: string, ids: string[]}) {
                const {str, ids} = val;
                let cnt = 0;
                let id = str;
                while (ids.includes(id))
                    id = str + (++cnt).toString().padStart(2, "0");
                return id;
            },
            ...options,
        }),
        //move(normalize(options.path as string)),
    ]);
    const tree = await firstValueFrom(
        templateSource(context) as Observable<Tree>
    );
    return tree.read(fileName)?.toString();
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
