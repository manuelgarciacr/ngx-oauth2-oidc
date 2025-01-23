import { Rule, SchematicContext, Tree } from "@angular-devkit/schematics";
import { ts } from "./util";
import {
    findBootstrapApplicationCall,
    findProvidersLiteral,
    getMainFilePath,
} from "@schematics/angular/utility/standalone/util";
import {
    findAppConfig,
    ResolvedAppConfig,
} from "@schematics/angular/utility/standalone/app_config";
import { addRootProvider } from "@schematics/angular/utility";

/**
 * If the provider already exists, a message is logged; otherwise a new provider insertion Rule
 * is added to 'rules' array
 * @param {Tree} tree File tree of the project
 * @param {SchematicContext} context Schematic context
 * @param {string} project Name of the project to which to add the import
 * @param {string} name Provider name
 * @param {string} lib Provider library name
 * @param {string} options Provider options as a string
 * @param {Rule[]} [rules=[]] Initial Rules array where to add the provider insertion Rule. Optional
 * @returns {Rule[]} Promise with the Rules array
 */
export const addSingleProvider = async (
    tree: Tree,
    context: SchematicContext,
    project: string,
    name: string,
    lib: string,
    options: string,
    rules: Rule[] = []
): Promise<Rule[]> => {

    if (await existsProvider(tree, name))
        context.logger.warn(`👁️  Provider already exists: '${name}'`);
    else
        rules.push(
            addRootProvider(project, ({ code, external }) => {
                return code`${external(
                    name,
                    lib
                )}(${options})`;
            })
        );

    return rules
};

/**
 * Returns if the provider already exists
 * @param {Tree} tree File tree of the project
 * @param {string} name Provider name
 * @returns Provider exists true or false
 */
export const existsProvider = async (tree: Tree, name:string): Promise<boolean> => {
    const mainFilePath = await getMainFilePath(tree, "sandbox");
    const bootstrapCall = findBootstrapApplicationCall(tree, mainFilePath);
    const { node } = findAppConfig(
        bootstrapCall,
        tree,
        mainFilePath
    ) as ResolvedAppConfig;
    const nodes =
        findProvidersLiteral(node)?.elements ?? <ts.NodeArray<ts.Expression>><unknown>[];

    return nodes.some((node: ts.Expression) => node.getFullText().trim().startsWith(name + "("));
};
