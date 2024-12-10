import { customParametersType } from "..";
import { IOAuth2VerifyTokenJoseOptions, IOAuth2VerifyTokenParameters } from "./IOAuth2Parameters";
/** Methods object */
export declare const methods: {
    /**
     * Custom parameters for the discovery endpoint
     */
    discovery: customParametersType;
    /**
     * Custom parameters for the authorizaton endpoint
     */
    authorization: customParametersType;
    /**
     * Custom parameters for the token endpoint
     */
    token: customParametersType;
    /**
     * Custom parameters for the refresh endpoint
     */
    refresh: customParametersType;
    /**
     * JOSE token verification options
     */
    verify_token: IOAuth2VerifyTokenParameters & IOAuth2VerifyTokenJoseOptions;
    /**
     * Custom parameters for the revocation endpoint
     */
    revocation: customParametersType;
};
/** Methods object type */
export interface IOAuth2Methods extends Partial<typeof methods> {
}
/** Method names */
export declare const methodNames: string[];
//# sourceMappingURL=IOAuth2Methods.d.ts.map