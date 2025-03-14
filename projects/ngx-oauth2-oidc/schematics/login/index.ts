import {
    Rule,
    SchematicContext,
    SchematicsException,
    Tree,
    chain,
    getSources,
    readWorkspace,
    ts,
} from "../utils";
import { Schema } from "./schema";
import { GlobalData, NamedNode, getData, nodeFlags } from "../utils/utils";
import { findNodes } from "../utils/find";
import { insertInject } from "../utils/injections";
import { cancellation } from "../utils/rules";
import { getTemplate, insertTemplate } from "../utils/templates";
import { insertImport } from "../utils/imports";
import { insertImplementation } from "../utils/implementations";
import { insertMethod } from "../utils/methods";

const loginTemplateOptions = (
    data: GlobalData,
    file: string,
    className: string,
    node: ts.Node & { members: ts.NodeArray<ts.Node> }
) => ({
    templatePath: "./files",
    templateName: "login",
    vars: {
        id: {
            str: "login",
            ids: findNodes<NamedNode>(node.members, 1)
                .filter(n => "name" in n)
                .map(n => n.name.getText()),
        },
        ioauth2config: () =>
            getData(
                data,
                "importedData",
                file,
                "ngx-oauth2-oidc",
                "IOAuth2Config",
                "value"
            ),
        oauth2: () =>
            getData(
                data,
                "injectedData",
                file,
                className,
                "Component",
                "ngx-oauth2-oidc",
                "Oauth2Service",
                "value",
                "propertyId"
            ),
    },
});

const loginInterceptorTemplateOptions = (
    data: GlobalData,
    file: string,
    className: string
) => ({
    templatePath: "./files",
    templateName: "loginInterceptor",
    vars: {
        oauth2: (): string =>
            getData(
                data,
                "injectedData",
                file,
                className,
                "Component",
                "ngx-oauth2-oidc",
                "Oauth2Service",
                "value",
                "propertyId"
            ),
        router: (): string =>
            getData(
                data,
                "injectedData",
                file,
                className,
                "Component",
                "@angular/router",
                "Router",
                "value",
                "propertyId"
            ),
        route: "routeName",
    },
});

export default function (options: Schema) {
    return async (tree: Tree, context: SchematicContext) => {
        const project = options.project ?? "";
        const component = options.component;
        const workspace = await readWorkspace(tree);
        const projectWorkspace = workspace.projects.get(project);
        const data: GlobalData = {};
        const rules: Rule[] = [];
        let sources: ts.SourceFile[];
        let nodes: ts.ClassDeclaration[];

        // Checking that project exists
        if (!projectWorkspace) {
            throw new SchematicsException(
                `❌  Unable to find project '${project}' in the workspace`
            );
        }

        // Checking component name is not empty
        if (!component) {
            throw new SchematicsException(
                `❌  Login component class name is empty`
            );
        }

        sources = getSources(tree, projectWorkspace) as ts.SourceFile[];

        // No typescript source files in the project
        if (!sources.length) {
            throw new SchematicsException(
                `❌  No typescript source files in the project`
            );
        }

        nodes = getNodes(sources, component);

        // Login component class not found
        if (!nodes.length) {
            throw new SchematicsException(
                `❌  Login component class not found in the project`
            );
        }

        let sourceFile;

        for (const node of nodes) {
            const source = node.getSourceFile();
            const file = source.fileName;
            const className = node.name?.escapedText.toString() ?? "";
            if (file != sourceFile) {
                sourceFile = file;

                insertImport(file, "ngx-oauth2-oidc", "Oauth2Service", null, true, data, rules);
                insertImport(file, "ngx-oauth2-oidc", "IOAuth2Config", null, true, data, rules);
                insertImport(file, "@angular/router", "Router", null, false, data, rules);
                insertImport(file, "@angular/core", "OnInit", null, false, data, rules);
                insertImport(file, "@angular/core", "inject", null, false, data, rules);
            }

            if (nodeFlags(node).includes("ThisNodeHasError")) {
                cancellation(
                    "Component with errors",
                    true,
                    "continue01",
                    data,
                    rules
                );
            }

            insertInject(
                file,
                className,
                "Component",
                "ngx-oauth2-oidc",
                "Oauth2Service",
                "oauth2",
                "private readonly",
                true,
                data,
                rules
            );

            insertInject(
                file,
                className,
                "Component",
                "@angular/router",
                "Router",
                "router",
                "private readonly",
                false,
                data,
                rules
            );

            await getTemplate(
                "login",
                // templateOptions
                loginTemplateOptions(data, file, className, node),
                data,
                rules
            );

            insertMethod(
                file,
                className,
                "login",
                "Component",
                true,
                data,
                rules
            );

            await insertImplementation(
                file,
                className,
                "Component",
                "ngOnInit",
                ["async"],
                false,
                data,
                rules
            );

            // TODO: create insertStatement function
            await insertTemplate(
                file,
                // templateOptions
                loginInterceptorTemplateOptions(data, file, className),
                // rootFindOptions
                {
                    kindOrGuard: ts.isClassDeclaration,
                    names: [className],
                },
                // parentFindOptions
                {
                    test: (n: ts.Node) =>
                        ts.isMethodDeclaration(n.parent) &&
                        n.parent.name.getText() === "ngOnInit" &&
                        ts.isBlock(n),
                },
                rules,
                undefined,
                undefined,
                "last"
            );

        };

        return chain([
            chain(rules),
            //() => {throw new SchematicsException(`❌  STOP`)},

            () =>
                context.logger.info(
                    "\x1b[92m🆗🆗 Login template generated successfully\x1b[0m"
                ),
        ]);
    };
}

const getNodes = (sources: ts.SourceFile[], name: string) => {
    let searchOptions = {
        kindOrGuard: ts.isClassDeclaration,
        names: [name],
        decorator: "Component",
        caseSensitive: true,
    };
    let nodes = sources.reduce(
        (prev, cur) => [
            ...prev,
            ...findNodes<ts.ClassDeclaration>(
                cur as ts.SourceFile,
                1,
                searchOptions
            ),
        ],
        <ts.ClassDeclaration[]>[]
    );

    if (!nodes.length) {
        searchOptions.caseSensitive = false;
        nodes = sources.reduce(
            (prev, cur) => [
                ...prev,
                ...findNodes<ts.ClassDeclaration>(
                    cur as ts.SourceFile,
                    1,
                    searchOptions
                ),
            ],
            <ts.ClassDeclaration[]>[]
        );
    }

    return nodes
}

/**
 * Resolves options for the build target of the given project
 */
// export const getProjectTargetOptions = (project: workspaces.ProjectDefinition, buildTarget: string) => {
// 	const buildTargetObject = project.targets.get(buildTarget);

// 	if (buildTargetObject && buildTargetObject.options) {
// 		return buildTargetObject.options;
// 	}

// 	throw new SchematicsException(`Cannot determine project target configuration for: ${buildTarget}.`);
// }
