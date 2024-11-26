import { customParametersType, getType, IOAuth2Parameters, parameterNames } from "../domain";
import { toLowerCaseProperties } from "../utils";
import { isJSON } from "../utils/isJason";

export const _setParameters = (ioauth2Parameters = <customParametersType>{}, functionName = "") => {

    if (!ioauth2Parameters || Object.entries(ioauth2Parameters).length == 0)
        return {};

    const parameters = toLowerCaseProperties(ioauth2Parameters)!; // Internal configuration parameters object

    // Parameter names are not unexpected (are warnongs)

    const parmKeys = Object.keys(parameters);
    const parmErrors = parmKeys.filter(
        key => !parameterNames.all.includes(key)
    );

    if (parmErrors.length)
        console.error(
            `WARNING: Unexpected parameters: ${parmErrors.join(", ")}.`,
            {
                message: `Custom parameters must be included inside the enpoint configuration options.`,
                cause: `oauth2 ${functionName}`,
            }
        );

    // Parameters types

    for (const parm in parameters) {
        const key = parm as keyof IOAuth2Parameters;
        const value = parameters[key];
        const type = getType(key);

        if (value === undefined || value === null) {
            delete parameters[key];
            continue
        }

        if (type == "array" && typeof value === "string")
            (parameters[key] as string[]) = [value];

        if (type == "array" && typeof value === "number")
            (parameters[key] as unknown as number[]) = [value];

        if (type == "array" && typeof value === "bigint")
            (parameters[key] as unknown as bigint[]) = [value];

        if (type == "array" && !Array.isArray(parameters[key])) {
            throw new Error(`The parameter "${key}" must be an array`, {
                cause: `oauth2 ${functionName}`,
            });
        }

        if (type == "json" && !isJSON(value)) {
            throw new Error(`The parameter "${key}" must be of type JSON`, {
                cause: `oauth2 ${functionName}`,
            });
        }

        if (
            type != "array" &&
            type != "json" &&
            type != "undefined" &&
            type != typeof value
        ) {
            throw new Error(
                `The parameter "${key}" must be of type ${type}`,
                {
                    cause: `oauth2 ${functionName}`,
                }
            );
        }
    }

    return parameters
}
