import {
    Tree,
    SchematicContext,
    SchematicsException
} from "@angular-devkit/schematics";
import {
    RunSchematicTask,
    NodePackageInstallTask,
} from "@angular-devkit/schematics/tasks";
import { readWorkspace } from "@schematics/angular/utility";
import { Schema as NgAddOptions } from "./schema";
import { addPackageToPackageJson } from "../utils/package";

export function ngAdd(options: NgAddOptions) {
    return async (tree: Tree, context: SchematicContext) => {
        const project = options.project;
        const loginComponent = options.loginComponent;

        // Checking that project exists
        const projectWorkspace = (await readWorkspace(tree)).projects.get(
            project
        );

        if (!projectWorkspace) {
            throw new SchematicsException(
                `❌  Unable to find project '${project}' in the workspace`
            );
        }

        const id = context.addTask(new RunSchematicTask("providers", options));

        if (loginComponent) {
            context.addTask(new RunSchematicTask("login", options), [id]);
        }
    };
}
