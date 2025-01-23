import { Tree, Rule, SchematicContext, chain } from "@angular-devkit/schematics";
import { addSingleProvider } from "../utils/providers";
import { Schema } from "../ng-add/schema";

export default function(options: Schema): Rule {
    return async (tree: Tree, context: SchematicContext) => {
        const rules: Rule[] = [];
console.log(options)
        await addSingleProvider(tree, context, "sandbox", "provideOAuth2", "ngx-oauth2-oidc", "", rules)
        await addSingleProvider(tree, context, "sandbox", "provideHttpClient", "@angular/common/http", "", rules)

        rules.push(() => context.logger.info("Providers already added ✅"));

        return chain(rules);
    };
}
