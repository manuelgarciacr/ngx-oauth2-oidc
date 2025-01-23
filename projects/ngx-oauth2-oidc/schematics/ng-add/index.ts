import {
    Tree, SchematicContext,
    SchematicsException
} from "@angular-devkit/schematics";
import { RunSchematicTask } from "@angular-devkit/schematics/tasks";
import { readWorkspace } from "@schematics/angular/utility";
import { Schema } from "./schema";
import { currentProject } from "../utils/projects";

export function ngAdd(options: Schema) {
    return async (tree: Tree, context: SchematicContext) => {
        const project = options.project ?? (await currentProject(tree)) ?? "";

        // Checking that project exists
        const projectWorkspace = (await readWorkspace(tree)).projects.get(
            project
        );

        if (!projectWorkspace) {
            throw new SchematicsException(
                `Unable to find project '${project}' in the workspace`
            );
        }

        //tree.create(options.name || "hello", "world");

        context.addTask(
            new RunSchematicTask("providers", options)
        );

        return tree;
    }
}
