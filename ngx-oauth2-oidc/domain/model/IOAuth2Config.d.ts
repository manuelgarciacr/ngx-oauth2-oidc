import { IOAuth2Configuration, IOAuth2Metadata, IOAuth2Parameters } from "../index";
/** Configuration object */
declare const config: {
    discovery: import("./types").customParametersType;
    /** Metadata section. Fields loaded from discovery document override configured values */
    authorization: import("./types").customParametersType;
    token: import("./types").customParametersType;
    refresh: import("./types").customParametersType;
    verify_token: import("./IOAuth2Parameters").IOAuth2VerifyTokenParameters & import("./IOAuth2Parameters").IOAuth2VerifyTokenJoseOptions;
    revocation: import("./types").customParametersType;
    /** Configuration section. Configuration options and method parameters */
    configuration: IOAuth2Configuration;
    /** Metadata section. Fields loaded from discovery document override configured values */
    metadata: IOAuth2Metadata;
    /** Parameters section. OAuth parameters. Values ​​returned by endpoints override configured values */
    parameters: IOAuth2Parameters;
};
/** Configuration object type */
export interface IOAuth2Config extends Partial<typeof config> {
}
/** Configuration object sections */
export declare const configSections: ("discovery" | "authorization" | "token" | "refresh" | "verify_token" | "revocation" | "configuration" | "metadata" | "parameters")[];
export {};
//# sourceMappingURL=IOAuth2Config.d.ts.map