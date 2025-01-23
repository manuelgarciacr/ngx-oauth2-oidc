import { Tree } from "@angular-devkit/schematics";
import { readWorkspace } from "@schematics/angular/utility";

/**
 * Returns theproject in the current path
 * @param {Tree} tree File tree of the project
 * @returns Current path project
 */
export const currentProject = async (
    tree: Tree
): Promise<string | undefined> => {
    const cwd = process.cwd();
    const workspace = await readWorkspace(tree);
    const projects = workspace.projects.entries();

    for (const [project, value] of projects) {
        if (cwd.endsWith(value.root)) return project
    }

    return undefined
};
