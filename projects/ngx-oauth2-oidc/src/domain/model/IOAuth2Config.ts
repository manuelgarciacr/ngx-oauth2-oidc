import { IOAuth2Configuration, IOAuth2Metadata, IOAuth2Parameters } from "../index";

/** Configuration object */
const config = {
    /** Configuration section. Configuration options and method parameters */
    configuration: {} as IOAuth2Configuration,

    /** Metadata section. Fields loaded from discovery document override configured values */
    metadata: {} as IOAuth2Metadata,

    /** Parameters section. OAuth parameters. Values ​​returned by endpoints override configured values */
    parameters: {} as IOAuth2Parameters,
};

/** Configuration object type */
export interface IOAuth2Config extends Partial<typeof config> {}

/** Configuration object sections */
export const configSections = Object.keys(config) as (keyof typeof config)[];
