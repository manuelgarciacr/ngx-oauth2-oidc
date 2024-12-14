import { customParametersType } from "..";
import { IOAuth2VerifyTokenJoseOptions, IOAuth2VerifyTokenParameters } from "./IOAuth2Parameters";

/** Methods object */
export const methods = {
    /**
     * Custom parameters for the discovery endpoint
     */
    discovery: {} as customParametersType,

    /**
     * Custom parameters for the authorizaton endpoint
     */
    authorization: {} as customParametersType,

    /**
     * Custom parameters for the token endpoint
     */
    token: {} as customParametersType,

    /**
     * Custom parameters for the refresh method when calling the token endpoint
     */
    refresh: {} as customParametersType,

    /**
     * JOSE token verification options and custom parameters for the verifyToken method
     */
    verify_token: {} as IOAuth2VerifyTokenParameters &
        IOAuth2VerifyTokenJoseOptions,

    /**
     * Custom parameters for the revocation endpoint
     */
    revocation: {} as customParametersType,
};

/** Methods object type */
export interface IOAuth2Methods extends Partial<typeof methods> {}

/** Method names */
export const methodNames = Object.keys(methods);
