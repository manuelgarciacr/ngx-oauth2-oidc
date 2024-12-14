//import { Rule, SchematicContext, SchematicsException, Tree} from "@angular-devkit/schematics";
import {
    Tree, Rule, SchematicContext
} from "@angular-devkit/schematics";
// import { NodePackageInstallTask } from "@angular-devkit/schematics/tasks";
// import { readWorkspace } from "@schematics/angular/utility";
//import { addRootImport } from "@schematics/angular/utility";
import { Schema } from "./schema";
//import { addPackageToPackageJson } from "../utils/package";
export function ngAdd(options: Schema): Rule {
    return (tree: Tree, _context: SchematicContext) => {
        tree.create(options.name || "hello", "world");
        return tree;
    };
    // Add an import `MyLibModule` from `my-lib` to the root of the user's project.
    // return addRootImport(
    //     options.project,
    //     ({ code, external }) => code`${external("MyLibModule", "my-lib")}`
    // );
    //     return async (tree: Tree, context: SchematicContext) => {
    //         const {project} = options;

    //         if (project) {
    //             const workspace = await readWorkspace(tree);
    //             const projectWorkspace = workspace.projects.get(project);

    //             if (!projectWorkspace) {
    //                 throw new SchematicsException(
    //                     `Unable to find project '${project}' in the workspace`
    //                 );
    //             }
    //         }
    // debugger
    // console.log(tree)
    //         //addPackageToPackageJson(tree, "ngx-oauth2-oidc", "^0.0.0");

    //         context.addTask(new NodePackageInstallTask());
    //         // context.addTask(new RunSchematicTask("ng-add-setup-project", options), [
    //         //     context.addTask(new NodePackageInstallTask()),
    //         // ]);
    //     }
}
