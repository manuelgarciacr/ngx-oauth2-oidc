import { IOAuth2Configuration, IOAuth2Metadata, IOAuth2Parameters } from "../index";

/** URL type */
export type urlType = string;

/** Internal configuration object type */
// export type oauth2ConfigType = Modify<IOAuth2Config, {
//     configuration: oauth2ConfigurationType,
// }>;

/** External configuration object type */
export interface IOAuth2Config {
    /** Configuration section. Configuration values */
    configuration: IOAuth2Configuration;

    /** Metadata section. Fields loaded from the discovery document */
    metadata: IOAuth2Metadata;

    /** Parameters section. Oauth parameters */
    parameters: IOAuth2Parameters;
}

export const configSections = ["configuration", "metadata", "parameters"];

