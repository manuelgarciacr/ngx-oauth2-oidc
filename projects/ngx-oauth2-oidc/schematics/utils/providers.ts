import { Rule, SchematicContext, SchematicsException, Tree, chain } from "@angular-devkit/schematics";
import { GlobalData, getData, setData, ts } from "./utils";
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
 * Function that returns the rules necessary to add a specific root provider. If the item
 * has already been added, a warning message is logged; otherwise,
 * the new rules will be added to the set of rules to be dealt with.
 * @param {string} project Project we want to add provider to. It is assumed to be an existing
 *      project.
 * @param {string} module Name of the module containing the provider
 * @param {string} provider Name of the provider we are checking
 * @param {Object | undefined | null} options Optional options objct for the provider
 * @param {GlobalData} data Global object that allows sharing
 *      data between rules.
 * @param {Rule[]} rules Set of rules to be dealt with.
 * @returns {Rule[]} Set of rules to be dealt with.
 */
export const insertProvider = async (
    project: string,
    module: string,
    provider: string,
    options: Object | undefined | null,
    data: GlobalData,
    rules: Rule[]
): Promise<Rule[]> => {
    rules.push(await providedDataRuleFactory(project, module, provider, data));
    rules.push(
        insertProviderRuleFactory(project, module, provider, options, data)
    );

    return rules;
};

/**
 * Determine if the provider has already been added
 * @param {string} project Project we want to add provider to. It is assumed to be an existing
 *      project.
 * @param {string} module Name of the module containing the provider
 * @param {string} provider Name of the provider we are checking
 * @param {GlobalData} data Global object that allows sharing
 *      data between rules.
 * @returns {Rule} The rule that actualizes the global 'data' object with the query result.
 */
export const providedDataRuleFactory = async (
    project: string,
    module: string,
    provider: string,
    data: GlobalData
): Promise<Rule> => {
    // TODO: Filter by module and provider
    // TODO: Not standalone application
    return async (tree: Tree, _context: SchematicContext) => {
        const mainFilePath = await getMainFilePath(tree, project);
        const bootstrapCall = findBootstrapApplicationCall(tree, mainFilePath);
        const { node } = findAppConfig(
            bootstrapCall,
            tree,
            mainFilePath
        ) as ResolvedAppConfig;
        const nodes =
            findProvidersLiteral(node)?.elements ??
            <ts.NodeArray<ts.Expression>>(<unknown>[]);
        const provided = nodes.some((node: ts.Expression) =>
            node
                .getFullText()
                .trim()
                .startsWith(provider + "(")
        );

        setData(data, provided, "providedData", module, provider, "value");
    }
}

/**
 * If the provider already exists, a message is logged; otherwise a new provider insertion Rule
 * is added to 'rules' array
 * @param {string} project Project we want to add provider to. It is assumed to be an existing
 *      project.
 * @param {string} module Name of the module containing the provider
 * @param {string} provider Name of the provider we are checking
 * @param {Object | undefined | null} options Optional options objct for the provider
 * @param {GlobalData} data Global object that allows sharing
 *      data between rules.
 * @returns {Rule} Rule to add the provider.
 */
export const insertProviderRuleFactory = (
    project: string,
    module: string,
    provider: string,
    options: Object | undefined | null,
    data: GlobalData
): Rule => {
    return (tree: Tree, context: SchematicContext) => {
        const providedData = getData(data, "providedData", module, provider);
        const providerOptions = options ? JSON.stringify(options) : "";

        if (providedData === undefined) {
            throw new SchematicsException(
                `❌  Unable to verify provider declaration : '${provider}'`
            );
        }

        const provided = providedData["value"];

        if (provided) {
            context.logger.warn(`👁️  Provider already added: '${provider}'`);
            return tree;
        }

        const rule01 = addRootProvider(project, ({ code, external }) => {
            return code`${external(provider, module)}(${providerOptions})`;
        });

        const rule02 = () =>
            setData(
                data,
                true,
                "providedData", module, provider, "value"
            );

        context.logger.info(
            `\x1b[92m✅  Provider added successfully: "${provider}"\x1b[0m`
        );

        return chain([rule01, rule02]);
    };
};
