import {
    DirEntry,
    Tree,
} from "@angular-devkit/schematics";
import { JsonValue, normalize, workspaces } from "@angular-devkit/core";
import { ts, nodeType, /*getModifiers*/ } from './util';

export const showData = (
    _tree: Tree,
    options?: Object,
    sources?: (string | ts.Node)[],
    indented: number = 0,
    _modifiers: boolean = false,
    dirEntry?: DirEntry,
    projectWorkspace?: workspaces.ProjectDefinition,
    buildOptions?: Record<string, JsonValue | undefined>
) => {
    !!options && console.log("OPTIONS", options);

    sources?.forEach(src => {
        if (typeof src === "string") {
            const extension = src.split(".").pop() ?? "";

            console.log("FILE", `******* ${extension} *******`, normalize(src));

            return;
        }

        let nodeDepth = 0;
        let parent = src.parent;

        while (parent) {
            nodeDepth++;
            parent = parent.parent;
        }

        // const nodeMods = (src as {modifiers?: ts.NodeArray<ts.ModifierLike>}).modifiers
        // const mods = modifiers ? getModifiers(nodeMods) : undefined;
        // const mods2 = mods && Object.keys(mods).length > 0 ? mods : undefined;
// if (src.kind === 263) {
//     console.dir(src)
// }
        console.log(
            indented ? ' '.repeat(indented * nodeDepth) : nodeDepth.toString().padStart(2),
            "NODE",
            src.kind.toString().padStart(3),
            nodeType(src, 1, {pos: src.pos, end: src.end})
        );
        // src.forEachChild(node => {
        //     const nodeMods = (
        //         node as { modifiers?: ts.NodeArray<ts.ModifierLike> }
        //     ).modifiers;
        //     const mods = modifiers ? getModifiers(nodeMods) : undefined;
        //     const mods2 =
        //         mods && Object.keys(mods).length > 0 ? mods : undefined;

        //     console.log("   NODE", node.kind.toString().padStart(3), nodeType(node, 1, mods2)) //;showLines(node.getText()))
        // });
    });

    dirEntry?.subdirs.forEach(subdir => console.log("SUBDIR", subdir));

    dirEntry?.subfiles.forEach(subfile => console.log("SUBFILE", subfile));

    if (projectWorkspace) {
        process.stdout.write("PROJECT_WORKSPACE ");
        console.dir(projectWorkspace, { depth: null });
    }

    if (buildOptions) {
        process.stdout.write("BUILD_OPTIONS ");
        console.dir(buildOptions, { depth: null });
    }
};

export const showLines = (text: string, lines = 5) => {
    const linesArray = text.split('\n');

    if (linesArray.length > lines) {
        linesArray.splice(lines);
        linesArray.push("...")
    }

    return linesArray.join('\n')
}
