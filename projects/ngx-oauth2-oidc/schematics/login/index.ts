import {
    Rule,
    SchematicContext,
    SchematicsException,
    Tree,
    chain,
} from "@angular-devkit/schematics";
import { Schema } from "./schema";
import { readWorkspace } from "@schematics/angular/utility";
import { ProjectDefinition } from "@angular-devkit/core/src/workspace/definitions";
import { GlobalData, getData, nodeFlags, ts } from "../utils/utils";
import { findNodes, findSources } from "../utils/find";
import { insertInject } from "../utils/injections";
import { cancellation } from "../utils/rules";
import { insertTemplate } from "../utils/templates";
import { insertImport } from "../utils/imports";
import { insertImplementation } from "../utils/implementations";

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

                insertImport(file, "ngx-oauth2-oidc", "Oauth2Service", data, rules);
                insertImport(file, "ngx-oauth2-oidc", "IOAuth2Config", data, rules);
                insertImport(file, "@angular/router", "Router", data, rules);
                insertImport(file, "@angular/core", "OnInit", data, rules);
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
                "ngx-oauth2-oidc",
                "Oauth2Service",
                "oauth2",
                "private readonly",
                "Component",
                data,
                rules
            );

            insertInject(
                file,
                className,
                "@angular/router",
                "Router",
                "router",
                "private readonly",
                "Component",
                data,
                rules
            );

            await insertTemplate(
                file,
                // templateOptions
                {
                    templatePath: "./files",
                    templateName: "login",
                    vars: { id: "login" },
                },
                // rootFindOptions
                {
                    kindOrGuard: ts.isClassDeclaration,
                    names: [className],
                },
                // parentFindOptions
                undefined,
                // itemsFindOptions
                undefined,
                "last",
                rules
            );

            await insertImplementation(
                file,
                className,
                "ngOnInit",
                "Component",
                false,
                data,
                rules
            )

            await insertTemplate(
                file,
                // templateOptions
                {
                    templatePath: "./files",
                    templateName: "loginInterceptor",
                    vars: {
                        oauth2: (): string =>
                            getData(
                                data,
                                "injectedData",
                                file,
                                className,
                                "ngx-oauth2-oidc",
                                "Oauth2Service",
                                "value"
                            )[0],
                        router: (): string =>
                            getData(
                                data,
                                "injectedData",
                                file,
                                className,
                                "@angular/router",
                                "Router",
                                "value"
                            )[0],
                        route: "route",
                    },
                },
                // rootFindOptions
                {
                    kindOrGuard: ts.isClassDeclaration,
                    names: [className],
                },
                // parentFindOptions
                {
                    kindOrGuard: ts.isMethodDeclaration,
                    names: ["ngOnInit"],
                },
                // itemsFindOptions
                undefined,
                0,
                rules
            );
        };

        return chain([
            chain(rules),
            () =>
                context.logger.info(
                    "\x1b[92m🆗  Login template generated successfully\x1b[0m"
                ),
        ]);
    };
}

const getSources = (tree: Tree, projectWorkspace: ProjectDefinition) => {
    let sources = findSources(tree, projectWorkspace, {
        fileName: "*.ts",
    });

    if (!sources.length) {
        sources = findSources(tree, projectWorkspace, {
            fileName: "*.ts",
            caseSensitive: false,
        });
    }

    return sources
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
