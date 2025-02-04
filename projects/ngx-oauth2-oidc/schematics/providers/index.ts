import { Tree, Rule, SchematicContext, SchematicsException, chain } from "@angular-devkit/schematics";
import { insertProvider as _addProvider } from "../utils/providers";
import { readWorkspace } from "@schematics/angular/utility";
import { Schema } from "../ng-add/schema";

export default function(options: Schema): Rule {
    return async (tree: Tree, context: SchematicContext) => {
        const projectName = options.project ?? "";
        const workspace = await readWorkspace(tree);
        const projectWorkspace = workspace.projects.get(projectName);
        const data: Record<string, Record<string, any>> = {};
        const rules: Rule[] = [];
        const addProvider = (
            providerName: string,
            module: string, providerOptions: Object | undefined | null = null
        ) =>
            _addProvider(
                projectName,
                providerName,
                module,
                providerOptions,
                data,
                rules
            );
        // Checking that project exists
        if (!projectWorkspace) {
            throw new SchematicsException(
                `❌  Unable to find project '${projectName}' in the workspace`
            );
        }

        await addProvider("provideOAuth2", "ngx-oauth2-oidc", {});
        await addProvider("provideHttpClient", "@angular/common/http");

        rules.push(() =>
            context.logger.info("\x1b[92m🆗  Providers added successfully\n\x1b[0m")
        );

        return chain(rules);
    };
}
