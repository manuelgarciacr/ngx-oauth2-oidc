import { SchematicContext, SchematicsException, Tree, Rule, chain } from "@angular-devkit/schematics";
import { Schema } from "./schema";
import { readWorkspace } from "@schematics/angular/utility";
import { ts } from "../utils/util";
//import { showData } from "../utils/showData";
import { findNodes, findSources } from "../utils/find";
import { insertImport, insertImportRuleFactory } from "../utils/imports";
import { /* insertInject */ } from "../utils/injections";
//import { addSingleImport } from "../utils/imports";
//import { insertText } from "../utils/insertText";

export default function (options: Schema) {

    return async (tree: Tree, context: SchematicContext) => {
        const project = options.project ?? "";
        const workspace = await readWorkspace(tree);
        const projectWorkspace = workspace.projects.get(project);
        const data: Record<string, Record<string, any>> = {};
        const rules: Rule[] = [];
        const cleanDataRuleFactory = (
            data: Record<string, Record<string, any>>
        ) => {
            return (tree: Tree) => {
                delete data["importedData"];
                return tree;
            };
        };
        const findOptions = {
            path: "",
            fileName: "*.ts",
        };

        let sources: (string | ts.SourceFile)[]

        // Checking that project exists
        if (!projectWorkspace) {
            throw new SchematicsException(
                `Unable to find project '${project}' in the workspace`
            );
        }

        //const buildOptions = getProjectTargetOptions(projectWorkspace, "build");

        sources = findSources(tree, projectWorkspace, findOptions);

        if (!sources.length) {
            sources = findSources(tree, projectWorkspace, {
                ...findOptions,
                caseSensitive: false
            });
        }

        const components = sources.reduce((prev, cur) => [...prev, ...findNodes(cur as ts.SourceFile, 1, {kindOrGuard: 263, name: "AppComponent2", decorator: "Component"})], <ts.Node[]>[])

        components.forEach(component =>{
            //const subNodes = findNodes(component, 1);
            const fileName = component.getSourceFile().fileName;

            //showData(tree, undefined, subNodes, 4);

insertImport(fileName, "FooComponent01", "./foo.component", data, rules);
insertImport(fileName, "FooComponent02", "./foo.component", data, rules);
insertImport(fileName, "FooComponent03", "./foo.component", data, rules);
rules.push(cleanDataRuleFactory({})); // Forces an error on the next import
rules.push(
    insertImportRuleFactory(fileName, "FooComponent04", "./foo.component", data)
);
            // insertImport(
            //     sourceFile,
            //     "Oauth2Service",
            //     "ngx-oauth2-oidc",
            //     data,
            //     rules
            // );

            // insertInject(
            //     component as ts.ClassDeclaration,
            //     "Oauth2Service",
            //     "ngx-oauth2-oidc",
            //     "oauth2",
            //     undefined,
            //     data,
            //     rules
            // );
        })


        // if (sources[0] && typeof sources[0] !== "string") {
        //     const nodes = findNodes(sources[0], 3, {name: "*"});

        //     console.log("\n\n");
        //     showData(tree, undefined, nodes, 4);

        //     addSingleImport(context, sources[0], "Oauth2Service", "ngx-oauth2-oidc", rules);
        //     //insertText(context)
        // }

        // sourceFile.forEachChild(node => {

        //     if (isClassDeclaration(node)) {
        //         console.info("CLASS_DECLARATION");

        //         console.dir(getClassDeclaration(node), { depth: null });

        //     } else {
        //         console.log("NODE", node.kind, node.getText())
        //     }
        // });

        rules.push(() =>
            context.logger.info(
                "\x1b[92m🆗  Login generated successfully\x1b[0m"
            )
        );

        return chain(rules);
    };
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

