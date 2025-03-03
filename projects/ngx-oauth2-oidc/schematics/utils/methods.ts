import {
    Rule,
    SchematicContext,
    Tree,
    SchematicsException,
} from "@angular-devkit/schematics";
import {
    GlobalData,
    NamedNode,
    getData,
    getInBlockIndentation,
    getSourceFile,
    setData,
    ts,
} from "./utils";
import { findNodes } from "./find";
import { InsertChange } from "@schematics/angular/utility/change";
import { getEOL } from "@schematics/angular/utility/eol";
import { implementationsCode } from "./implementations";

const messageText = (
    file: string,
    className: string,
    templateId: string,
    decorator?: string
) =>
    `${file.split("/").pop()} => ${className}${
        decorator ? "@" + decorator : ""
    } => ${templateId}`;

/**
 * Function that returns the rules necessary to add a method from a template. If an
 * identical method has already been added, a warning message is logged; otherwise, the
 * new rules will be added to the set of rules to be dealt with.
 * @param {string} file File we want to add method to. It is assumed to be an existing
 *      editable file.
 * @param {string} className Name of the class we want to add method to.
 * @param {string} templateId Template to include
 * @param {string | undefined} decorator Optional name of one of the decorators in the class.
 * @param {boolean} alreadyAddedWarning If it is true, a warning message can be displayed.
 * @param {GlobalData} data Global object that allows sharing
 *      data between rules.
 * @param {Rule[]} rules Set of rules to be dealt with.
 * @returns {Rule[]} Set of rules to be dealt with.
 */
export const insertMethod = (
    file: string,
    className: string,
    templateId: string,
    decorator: string | undefined,
    alreadyAddedWarning: boolean,
    data: GlobalData,
    rules: Rule[] = []
): Rule[] => {
    rules.push(
        methodDataRuleFactory(
            file,
            className,
            templateId,
            decorator,
            data
        )
    );
    rules.push(
        insertMethodRuleFactory(
            file,
            className,
            templateId,
            decorator,
            alreadyAddedWarning,
            data
        )
    );

    return rules;
};

/**
 * Determine if an identical method has already been included.
 * @param {string} file File we want to add method to. It is assumed to be an existing
 *      editable file.
 * @param {string} className Name of the class we want to include method to.
 * @param {string} templateId Template to include
 * @param {string | undefined} decorator Optional name of one of the decorators in the class.
 * @param {GlobalData} data Global object that allows sharing
 *      data between rules.
 * @returns {Rule} The rule that adds the method data, if any, into the global
 *      'data' object.
 */
export function methodDataRuleFactory(
    file: string,
    className: string,
    templateId: string,
    decorator: string | undefined,
    data: GlobalData
): Rule {
    return (tree: Tree, _context: SchematicContext) => {
        const source = getSourceFile(tree, file);
        const classDeclaration = <ts.ClassDeclaration>findNodes(source, 1, {
            kindOrGuard: ts.isClassDeclaration,
            names: [className],
            decorator,
        })[0];
        const code = getData(data, "template", templateId, "value");

        if (!code) {
            throw new SchematicsException(
                `❌  Id of the method template to be added unknown: '${templateId}'`
            );
        }

        const methods = findNodes(classDeclaration, 1, {
            kindOrGuard: ts.isMethodDeclaration,
        });

        methods.push(
            ...findNodes(classDeclaration, 1, {
                test: (n: ts.Node) =>
                    ts.isPropertyDeclaration(n) &&
                    !!n.initializer &&
                    ts.isArrowFunction(n.initializer),
            })
        );
        methods.sort((a, b) => a.pos - b.pos);

        const method = methods.find(
            n =>
                n.getText().replaceAll(/\s/g, "") ===
                code.replaceAll(/\s/g, "")
        );

        setData(
            data,
            !!method,
            ...["methodData", file, className, templateId, decorator ?? ""]
        );

        return tree;
    };
}

/**
 * Adds a method from a template if it has not yet been added
 * @param {string} file File we want to add method to. It is assumed to be an existing
 *      editable file.
 * @param {string} className Name of the class we want to include method to.
 * @param {string} templateId Template to include
 * @param {string | undefined} decorator Optional name of one of the decorators in the class.
 * @param {boolean} alreadyAddedWarning If it is true, a warning message can be displayed.
 * @param {GlobalData} data Global object that allows sharing
 *      data between rules.
 * @returns {Rule} The rule that adds the method data, if any, into the global
 *      'data' object.
 */
export const insertMethodRuleFactory = (
    file: string,
    className: string,
    templateId: string,
    decorator: string | undefined,
    alreadyAddedWarning: boolean,
    data: GlobalData
): Rule => {
    return (tree: Tree, context: SchematicContext) => {
        const methodData = getData(
            data,
            "methodData",
            file,
            className,
            templateId,
            decorator ?? ""
        );
        const _messageText = messageText(file, className, templateId, decorator);

        validateMethodData(methodData, _messageText);

        if (methodData) {
            alreadyAddedWarning &&
                context.logger.warn(
                    `👁️  Method already added: ${_messageText}`
                );
            !alreadyAddedWarning &&
                context.logger.info(
                    `\x1b[92m✅  Method already added: ${_messageText}\x1b[0m`
                );
            return;
        }

        const sourceFile = getSourceFile(tree, file);
        const source = sourceFile.getFullText();
        const classDeclaration = <ts.ClassDeclaration>findNodes(sourceFile, 1, {
            kindOrGuard: ts.isClassDeclaration,
            names: [className],
            decorator,
        })[0];
        const eol = getEOL(source);
        const template = getData(data, "template", templateId, "value");
        const updateRecorder = tree.beginUpdate(file);

        const [pos, indentation, previousNodeIndentation] = _getPos(classDeclaration, source, eol);
        const nodeText = template
            ?.trim()
            ?.replaceAll("    ", indentation)
            ?.replaceAll("\n", `\n${previousNodeIndentation}`);
        const change = new InsertChange(
            file,
            pos,
            `${eol}${previousNodeIndentation}${nodeText}`
        );

        if (change instanceof InsertChange) {
            updateRecorder.insertRight(change.pos, change.toAdd);
        }

        tree.commitUpdate(updateRecorder);

        setData(
            data,
            true,
            "methodData",
            file,
            className,
            templateId,
            decorator ?? ""
        );

        context.logger.info(
            `\x1b[92m✅  Method inserted successfully: ${_messageText}\x1b[0m`
        );
    };
};


const validateMethodData = (methodData: GlobalData, messageText: string) => {

    if (methodData === undefined) {
        throw new SchematicsException(
            `❌  Unable to verify method declaration: ${messageText}`
        );
    }
};

const _getPos = (
    classDeclaration: ts.ClassDeclaration,
    source: string,
    eol: string
): [number, string, string] => {
    const functions = findNodes(classDeclaration, 1, {
        kindOrGuard: ts.isConstructorDeclaration,
    });

    functions.push(
        ...findNodes(classDeclaration, 1, {
            kindOrGuard: ts.isMethodDeclaration,
        })
    );
    functions.push(
        ...findNodes(classDeclaration, 1, {
            test: (n: ts.Node) =>
                ts.isPropertyDeclaration(n) &&
                !!n.initializer &&
                ts.isArrowFunction(n.initializer),
        })
    );

    const methods = functions
        .filter(n => {
            const keys = Object.keys(implementationsCode);
            const name = (n as NamedNode).name?.escapedText?.toString() ?? "constructor";

            return !keys.includes(name);
        })
        .sort((a, b) => a.pos - b.pos);

    const implementations = functions
        .filter(n => {
            const keys = Object.keys(implementationsCode);
            const name =
                (n as NamedNode).name?.escapedText?.toString() ?? "constructor";

            return keys.includes(name);
        })
        .sort((a, b) => a.pos - b.pos);

    // The class has normal methods
    if (methods.length) {
        const pos = methods.at(-1)!.end;
        const [_parentIndentation, indentation, previousNodeIndentation] =
            getInBlockIndentation(
                classDeclaration,
                source,
                eol,
                "last",
                methods
            );

        return [pos, indentation, previousNodeIndentation];
    }

    // The class has implementations
    if (implementations.length) {
        const pos = implementations.at(-1)!.end;
        const [_parentIndentation, indentation, previousNodeIndentation] =
            getInBlockIndentation(
                classDeclaration,
                source,
                eol,
                "last",
                implementations
            );

        return [pos, indentation, previousNodeIndentation];
    }

    // The class has members
    const [_parentIndentation, indentation, previousNodeIndentation] =
        getInBlockIndentation(
            classDeclaration,
            source,
            eol,
            "last",
            classDeclaration.members
        );
    return [classDeclaration.members.end, indentation, previousNodeIndentation];
};
