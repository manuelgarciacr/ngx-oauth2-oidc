import { IOAuth2Configuration, IOAuth2Metadata, IOAuth2Parameters, oauth2Configuration } from "../index";
import { Modify } from "../../utils";

/** Internal configuration object type */
export type oauth2Config = Modify<IOAuth2Config, {
    configuration: oauth2Configuration,
}>;

/** External configuration object type */
export interface IOAuth2Config {
    /** Configuration section. Configuration values */
    configuration: Partial<IOAuth2Configuration>;

    /** Metadata section. Fields loaded from the discovery document */
    metadata: IOAuth2Metadata;

    /** Parameters section. Oauth parameters */
    parameters: IOAuth2Parameters;
}
