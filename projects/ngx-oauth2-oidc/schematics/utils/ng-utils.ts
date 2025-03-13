import { match, ts } from ".";

// @angular
import {
    getProjectMainFile,
    // addModuleImportToModule,
    // buildComponent,
    // findModuleFromOptions,
    // getProjectFromWorkspace,
    // isStandaloneSchematic,
} from "@angular/cdk/schematics";

// @angular-devkit
import {
    JsonValue,
    normalize,
    strings,
    workspaces,
} from "@angular-devkit/core";
import { ProjectDefinition } from "@angular-devkit/core/src/workspace/definitions";
import {
    DirEntry,
    FileEntry,
    HostTree,
    PathTemplateData,
    Rule,
    SchematicContext,
    SchematicsException,
    TEMPLATE_FILENAME_RE,
    Tree,
    apply,
    applyContentTemplate,
    applyPathTemplate,
    callRule,
    chain,
    composeFileOperators,
    forEach,
    url,
    when,
} from "@angular-devkit/schematics";
import { SchematicTestRunner } from "@angular-devkit/schematics/testing";

// @schematics
import { addRootProvider, readWorkspace } from "@schematics/angular/utility";
import {
    getDecoratorMetadata,
    getMetadataField,
    insertImport,
} from "@schematics/angular/utility/ast-utils";
import { Change, InsertChange, ReplaceChange } from "@schematics/angular/utility/change";
import { getEOL } from "@schematics/angular/utility/eol";
import {
    isStandaloneApp,
    // getAppModulePath,
} from "@schematics/angular/utility/ng-ast-utils";
// import { getWorkspace } from "@schematics/angular/utility/workspace";
import {
    findAppConfig,
    ResolvedAppConfig,
} from "@schematics/angular/utility/standalone/app_config";
import {
    findBootstrapApplicationCall,
    findProvidersLiteral,
    getMainFilePath,
} from "@schematics/angular/utility/standalone/util";

export { getProjectMainFile };
export { JsonValue, normalize, strings, workspaces };
export {
    DirEntry,
    FileEntry,
    HostTree,
    PathTemplateData,
    Rule,
    SchematicContext,
    SchematicsException,
    TEMPLATE_FILENAME_RE,
    Tree,
    apply,
    applyContentTemplate,
    applyPathTemplate,
    callRule,
    chain,
    composeFileOperators,
    forEach,
    url,
    when,
};
export { SchematicTestRunner };
export { addRootProvider, readWorkspace };
export { getDecoratorMetadata, getMetadataField, insertImport };
export { Change, InsertChange, ReplaceChange };
export { getEOL };
export { isStandaloneApp };
export { findAppConfig, ResolvedAppConfig };
export { findBootstrapApplicationCall, findProvidersLiteral, getMainFilePath };

export const getSources = (
    tree: Tree,
    projectWorkspace: ProjectDefinition
): ts.SourceFile[] => {
    let sources = <ts.SourceFile[]>findSources(tree, projectWorkspace, {
        fileName: "*.ts",
        notPath: true,
    });

    if (!sources.length) {
        sources = <ts.SourceFile[]>findSources(tree, projectWorkspace, {
            fileName: "*.ts",
            caseSensitive: false,
            notPath: true,
        });
    }

    return sources;
};

/**
 * Resolve source nodes
 */
const findSources = (
    tree: Tree,
    projectWorkspace: workspaces.ProjectDefinition,
    options: {
        path?: string;
        fileName?: string;
        caseSensitive?: boolean;
        notPath?: boolean;
    }
): ts.SourceFile[] | (string | ts.SourceFile)[] => {
    const {
        path = "",
        fileName = "",
        caseSensitive = true,
        notPath = false,
    } = { ...options };
    const sourceFiles: (string | ts.SourceFile)[] = [];
    let newPath = path;
    let dirEntry: DirEntry;

    while (newPath.includes("//")) newPath = newPath.replaceAll("//", "/");

    if (newPath.charAt(0) !== "/") newPath = "/" + newPath;

    dirEntry = tree.getDir(projectWorkspace.root + newPath);

    dirEntry.visit(visitor => {
        let sourceFile: string | ts.SourceFile;

        if (fileName) {
            const visitorName = visitor.split("/").pop();

            if (!match(visitorName!, fileName, caseSensitive)) return;
        }

        try {
            const extension = visitor.split(".").pop() ?? "";

            if (extension === "html") throw "html";

            sourceFile = getSourceFile(tree, visitor);
        } catch (err) {
            sourceFile = visitor;
        }

        sourceFiles.push(sourceFile);
    });

    const sources = notPath
        ? sourceFiles.filter(sf => typeof sf !== "string")
        : sourceFiles;

    return sources;
};

/**
 * Gets a TypeScript source file at a specific path.
 * @param tree File tree of a project.
 * @param path Path to the file.
 */
export function getSourceFile(
    tree: Tree,
    path: string
): ts.SourceFile | ts.JsonSourceFile {
    const content = tree.readText(path);
    const extension = path.split(".").pop() ?? "";

    /**
     * Convert the json syntax tree into the json value
     */
    // function convertToObject(
    //     sourceFile: JsonSourceFile,
    //     errors: Diagnostic[]
    // ): any;

    if (["json", "scss", "sass", "css"].includes(extension)) {
        const src = ts.parseJsonText(path, content);

        return src;
    }

    const source = ts.createSourceFile(
        path,
        content,
        ts.ScriptTarget.Latest,
        true
    );

    return source;
}

