import { createRemoteJWKSet, jwtVerify } from "jose";
import { setStore } from "./_store";
import { getParameters } from "./_getParameters";
import { _setParameters } from "./_setParameters";
/**
 * Verification of the id_token saved in the configuration. Makes use of the 'jose' library.
 *   Needs the "jwks_uri" and "issuer" metadata (see jose library). You also need the parameters.
 *   id_token, client_id, audience (or client_id) and nonce. This data can be overwritten by the
 *   options parameter data. Returns the payload of the id_token and saves it to storage and
 *   memory. In test mode, the request payload is also stored inside sessionStorage.
 *
 * @param config Configuration object saved in memory.
 * @param customParameters Custom parameters for the request. May include values ​​to override 'jwks_uri'
 *      and 'issuer' metadata.
 * @param issuer Authorization server's issuer identifier URL
 * @param jwks_uri URL of the authorization server's JWK Set document
 * @returns The Promise with the id_token payload or error
 */
export const _verify_token = async (config, customParameters = {}, _issuer, _jwks_uri) => {
    // Configuration options
    const test = config.configuration?.test;
    const storage = config.configuration?.storage;
    // Metadata fields
    const issuer = _issuer ?? config.metadata?.issuer ?? "";
    const jwks_uri = _jwks_uri ?? config.metadata?.jwks_uri ?? "";
    // Endpoint parameters
    const str = (name) => customParameters[name] ?? parms[name] ?? "";
    const parms = _setParameters({
        ...getParameters("verify_token", config),
        ...customParameters,
    });
    const id_token = str("id_token");
    const nonce = str("nonce");
    setStore("test", storage && test ? {} : null);
    if (!id_token)
        return;
    ///////////////////////////////////////////////////////////////////
    //
    // Errors & warnings
    //
    if (!jwks_uri)
        throw new Error(`Value ​​for 'jwks_uri' metadata is missing.`, {
            cause: "oauth2 verify_token",
        });
    if (!issuer)
        throw new Error(`Value ​​for 'issuer' metadata is missing.`, {
            cause: "oauth2 verify_token",
        });
    //
    // End of errors & warnings
    //
    ///////////////////////////////////////////////////////////////////
    //
    // Modify endpoint parameters based on the values ​​of other parameters
    //      and configuration options
    //
    // AUDIENCE
    const audience = parms["audience"] ?? parms["client_id"] ?? "";
    if (!audience)
        throw new Error(`The values ​​for the 'client_id' parameter, 'client_id' option, and 'audience' option are missing.`, { cause: "oauth2 verify_token" });
    // JVTVERIFYOPTIONS
    Object.assign(parms, { nonce, issuer, audience, jwks_uri });
    const JWKS = createRemoteJWKSet(new URL(jwks_uri));
    const jvtVerifyOptions = { ...parms };
    delete jvtVerifyOptions["id_token"];
    delete jvtVerifyOptions["jwks_uri"];
    delete jvtVerifyOptions["client_id"];
    // PAYLOAD
    let payload = {};
    try {
        const { payload: readPayload } = await jwtVerify(id_token, JWKS, jvtVerifyOptions);
        payload = readPayload;
    }
    catch (err) {
        const error = new Error(err.message, {
            cause: "oauth2 verify_token",
        });
        error.name = err.name;
        throw error;
    }
    if (payload["nonce"] && payload["nonce"] != nonce) {
        const error = Error('unexpected "nonce" claim value', {
            cause: "oauth2 verify_token",
        });
        error.name = "JWTClaimValidationFailed";
        throw error;
    }
    //
    // End of modifying endpoint parameters
    //
    ///////////////////////////////////////////////////////////////////
    if (test) {
        setStore("test", storage ? parms : null);
    }
    return Promise.resolve(payload);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiX3ZlcmlmeV90b2tlbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Byb2plY3RzL25neC1vYXV0aDItb2lkYy9zcmMvbGliL192ZXJpZnlfdG9rZW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGtCQUFrQixFQUFjLFNBQVMsRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUVqRSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBQ3BDLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUNqRCxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFFbEQ7Ozs7Ozs7Ozs7Ozs7R0FhRztBQUNILE1BQU0sQ0FBQyxNQUFNLGFBQWEsR0FBRyxLQUFLLEVBQzlCLE1BQXFCLEVBQ3JCLG1CQUF5QyxFQUFFLEVBQzNDLE9BQWdCLEVBQ2hCLFNBQWtCLEVBQ3BCLEVBQUU7SUFDQSx3QkFBd0I7SUFDeEIsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUM7SUFDeEMsTUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLGFBQWEsRUFBRSxPQUFPLENBQUM7SUFDOUMsa0JBQWtCO0lBQ2xCLE1BQU0sTUFBTSxHQUFHLE9BQU8sSUFBSSxNQUFNLENBQUMsUUFBUSxFQUFFLE1BQU0sSUFBSSxFQUFFLENBQUM7SUFDeEQsTUFBTSxRQUFRLEdBQUcsU0FBUyxJQUFJLE1BQU0sQ0FBQyxRQUFRLEVBQUUsUUFBUSxJQUFJLEVBQUUsQ0FBQztJQUM5RCxzQkFBc0I7SUFDdEIsTUFBTSxHQUFHLEdBQUcsQ0FBQyxJQUFZLEVBQUUsRUFBRSxDQUN4QixnQkFBZ0IsQ0FBQyxJQUFJLENBQVksSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO0lBQzVELE1BQU0sS0FBSyxHQUFHLGNBQWMsQ0FBQztRQUN6QixHQUFHLGFBQWEsQ0FBQyxj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QUNQLFFBQVEsQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzdDLENBQUM7SUFFRCxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDcEMsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgY3JlYXRlUmVtb3RlSldLU2V0LCBKV1RQYXlsb2FkLCBqd3RWZXJpZnkgfSBmcm9tIFwiam9zZVwiO1xuaW1wb3J0IHsgSU9BdXRoMkNvbmZpZywgY3VzdG9tUGFyYW1ldGVyc1R5cGUgfSBmcm9tIFwiLi4vZG9tYWluXCI7XG5pbXBvcnQgeyBzZXRTdG9yZSB9IGZyb20gXCIuL19zdG9yZVwiO1xuaW1wb3J0IHsgZ2V0UGFyYW1ldGVycyB9IGZyb20gXCIuL19nZXRQYXJhbWV0ZXJzXCI7XG5pbXBvcnQgeyBfc2V0UGFyYW1ldGVycyB9IGZyb20gXCIuL19zZXRQYXJhbWV0ZXJzXCI7XG5cbi8qKlxuICogVmVyaWZpY2F0aW9uIG9mIHRoZSBpZF90b2tlbiBzYXZlZCBpbiB0aGUgY29uZmlndXJhdGlvbi4gTWFrZXMgdXNlIG9mIHRoZSAnam9zZScgbGlicmFyeS5cbiAqICAgTmVlZHMgdGhlIFwiandrc191cmlcIiBhbmQgXCJpc3N1ZXJcIiBtZXRhZGF0YSAoc2VlIGpvc2UgbGlicmFyeSkuIFlvdSBhbHNvIG5lZWQgdGhlIHBhcmFtZXRlcnMuXG4gKiAgIGlkX3Rva2VuLCBjbGllbnRfaWQsIGF1ZGllbmNlIChvciBjbGllbnRfaWQpIGFuZCBub25jZS4gVGhpcyBkYXRhIGNhbiBiZSBvdmVyd3JpdHRlbiBieSB0aGVcbiAqICAgb3B0aW9ucyBwYXJhbWV0ZXIgZGF0YS4gUmV0dXJucyB0aGUgcGF5bG9hZCBvZiB0aGUgaWRfdG9rZW4gYW5kIHNhdmVzIGl0IHRvIHN0b3JhZ2UgYW5kXG4gKiAgIG1lbW9yeS4gSW4gdGVzdCBtb2RlLCB0aGUgcmVxdWVzdCBwYXlsb2FkIGlzIGFsc28gc3RvcmVkIGluc2lkZSBzZXNzaW9uU3RvcmFnZS5cbiAqXG4gKiBAcGFyYW0gY29uZmlnIENvbmZpZ3VyYXRpb24gb2JqZWN0IHNhdmVkIGluIG1lbW9yeS5cbiAqIEBwYXJhbSBjdXN0b21QYXJhbWV0ZXJzIEN1c3RvbSBwYXJhbWV0ZXJzIGZvciB0aGUgcmVxdWVzdC4gTWF5IGluY2x1ZGUgdmFsdWVzIOKAi+KAi3RvIG92ZXJyaWRlICdqd2tzX3VyaSdcbiAqICAgICAgYW5kICdpc3N1ZXInIG1ldGFkYXRhLlxuICogQHBhcmFtIGlzc3VlciBBdXRob3JpemF0aW9uIHNlcnZlcidzIGlzc3VlciBpZGVudGlmaWVyIFVSTFxuICogQHBhcmFtIGp3a3NfdXJpIFVSTCBvZiB0aGUgYXV0aG9yaXphdGlvbiBzZXJ2ZXIncyBKV0sgU2V0IGRvY3VtZW50XG4gKiBAcmV0dXJucyBUaGUgUHJvbWlzZSB3aXRoIHRoZSBpZF90b2tlbiBwYXlsb2FkIG9yIGVycm9yXG4gKi9cbmV4cG9ydCBjb25zdCBfdmVyaWZ5X3Rva2VuID0gYXN5bmMgKFxuICAgIGNvbmZpZzogSU9BdXRoMkNvbmZpZyxcbiAgICBjdXN0b21QYXJhbWV0ZXJzID0gPGN1c3RvbVBhcmFtZXRlcnNUeXBlPnt9LFxuICAgIF9pc3N1ZXI/OiBzdHJpbmcsXG4gICAgX2p3a3NfdXJpPzogc3RyaW5nXG4pID0+IHtcbiAgICAvLyBDb25maWd1cmF0aW9uIG9wdGlvbnNcbiAgICBjb25zdCB0ZXN0ID0gY29uZmlnLmNvbmZpZ3VyYXRpb24/LnRlc3Q7XG4gICAgY29uc3Qgc3RvcmFnZSA9IGNvbmZpZy5jb25maWd1cmF0aW9uPy5zdG9yYWdlO1xuICAgIC8vIE1ldGFkYXRhIGZpZWxkc1xuICAgIGNvbnN0IGlzc3VlciA9IF9pc3N1ZXIgPz8gY29uZmlnLm1ldGFkYXRhPy5pc3N1ZXIgPz8gXCJcIjtcbiAgICBjb25zdCBqd2tzX3VyaSA9IF9qd2tzX3VyaSA/PyBjb25maWcubWV0YWRhdGE/Lmp3a3NfdXJpID8/IFwiXCI7XG4gICAgLy8gRW5kcG9pbnQgcGFyYW1ldGVyc1xuICAgIGNvbnN0IHN0ciA9IChuYW1lOiBzdHJpbmcpID0+XG4gICAgICAgIChjdXN0b21QYXJhbWV0ZXJzW25hbWVdIGFzIHN0cmluZykgPz8gcGFybXNbbmFtZV0gPz8gXCJcIjtcbiAgICBjb25zdCBwYXJtcyA9IF9zZXRQYXJhbWV0ZXJzKHtcbiAgICAgICAgLi4uZ2V0UGFyYW1ldGVycyhcInZlcmlmeV90b2tlblwiLCBjb25maWcpLFxuICAgICAgICAuLi5jdXN0b21QYXJhbWV0ZXJzLFxuICAgIH0pO1xuICAgIGNvbnN0IGlkX3Rva2VuID0gc3RyKFwiaWRfdG9rZW5cIik7XG4gICAgY29uc3Qgbm9uY2UgPSBzdHIoXCJub25jZVwiKTtcblxuICAgIHNldFN0b3JlKFwidGVzdFwiLCBzdG9yYWdlICYmIHRlc3QgPyB7fSA6IG51bGwpO1xuXG4gICAgaWYgKCFpZF90b2tlbikgcmV0dXJuO1xuXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAgIC8vXG4gICAgLy8gRXJyb3JzICYgd2FybmluZ3NcbiAgICAvL1xuXG4gICAgaWYgKCFqd2tzX3VyaSlcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBWYWx1ZSDigIvigItmb3IgJ2p3a3NfdXJpJyBtZXRhZGF0YSBpcyBtaXNzaW5nLmAsIHtcbiAgICAgICAgICAgIGNhdXNlOiBcIm9hdXRoMiB2ZXJpZnlfdG9rZW5cIixcbiAgICAgICAgfSk7XG5cbiAgICBpZiAoIWlzc3VlcilcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBWYWx1ZSDigIvigItmb3IgJ2lzc3VlcicgbWV0YWRhdGEgaXMgbWlzc2luZy5gLCB7XG4gICAgICAgICAgICBjYXVzZTogXCJvYXV0aDIgdmVyaWZ5X3Rva2VuXCIsXG4gICAgICAgIH0pO1xuXG4gICAgLy9cbiAgICAvLyBFbmQgb2YgZXJyb3JzICYgd2FybmluZ3NcbiAgICAvL1xuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgICAvL1xuICAgIC8vIE1vZGlmeSBlbmRwb2ludCBwYXJhbWV0ZXJzIGJhc2VkIG9uIHRoZSB2YWx1ZXMg4oCL4oCLb2Ygb3RoZXIgcGFyYW1ldGVyc1xuICAgIC8vICAgICAgYW5kIGNvbmZpZ3VyYXRpb24gb3B0aW9uc1xuICAgIC8vXG5cbiAgICAvLyBBVURJRU5DRVxuXG4gICAgY29uc3QgYXVkaWVuY2UgPVxuICAgICAgICAocGFybXNbXCJhdWRpZW5jZVwiXSBhcyBzdHJpbmcgfCBzdHJpbmdbXSkgPz8gcGFybXNbXCJjbGllbnRfaWRcIl0gPz8gXCJcIjtcblxuICAgIGlmICghYXVkaWVuY2UpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgIGBUaGUgdmFsdWVzIOKAi+KAi2ZvciB0aGUgJ2NsaWVudF9pZCcgcGFyYW1ldGVyLCAnY2xpZW50X2lkJyBvcHRpb24sIGFuZCAnYXVkaWVuY2UnIG9wdGlvbiBhcmUgbWlzc2luZy5gLFxuICAgICAgICAgICAgeyBjYXVzZTogXCJvYXV0aDIgdmVyaWZ5X3Rva2VuXCIgfVxuICAgICAgICApO1xuXG4gICAgLy8gSlZUVkVSSUZZT1BUSU9OU1xuXG4gICAgT2JqZWN0LmFzc2lnbihwYXJtcywgeyBub25jZSwgaXNzdWVyLCBhdWRpZW5jZSwgandrc191cmkgfSk7XG5cbiAgICBjb25zdCBKV0tTID0gY3JlYXRlUmVtb3RlSldLU2V0KG5ldyBVUkwoandrc191cmkpKTtcbiAgICBjb25zdCBqdnRWZXJpZnlPcHRpb25zID0geyAuLi5wYXJtcyB9IGFzIGN1c3RvbVBhcmFtZXRlcnNUeXBlO1xuXG4gICAgZGVsZXRlIGp2dFZlcmlmeU9wdGlvbnNbXCJpZF90b2tlblwiXTtcbiAgICBkZWxldGUganZ0VmVyaWZ5T3B0aW9uc1tcImp3a3NfdXJpXCJdO1xuICAgIGRlbGV0ZSBqdnRWZXJpZnlPcHRpb25zW1wiY2xpZW50X2lkXCJdO1xuXG4gICAgLy8gUEFZTE9BRFxuXG4gICAgbGV0IHBheWxvYWQ6IEpXVFBheWxvYWQgPSB7fTtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCB7IHBheWxvYWQ6IHJlYWRQYXlsb2FkIH0gPSBhd2FpdCBqd3RWZXJpZnkoXG4gICAgICAgICAgICBpZF90b2tlbixcbiAgICAgICAgICAgIEpXS1MsXG4gICAgICAgICAgICBqdnRWZXJpZnlPcHRpb25zXG4gICAgICAgICk7XG4gICAgICAgIHBheWxvYWQgPSByZWFkUGF5bG9hZDtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgY29uc3QgZXJyb3IgPSBuZXcgRXJyb3IoKGVyciBhcyBFcnJvcikubWVzc2FnZSwge1xuICAgICAgICAgICAgY2F1c2U6IFwib2F1dGgyIHZlcmlmeV90b2tlblwiLFxuICAgICAgICB9KTtcbiAgICAgICAgZXJyb3IubmFtZSA9IChlcnIgYXMgRXJyb3IpLm5hbWU7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgIH1cblxuICAgIGlmIChwYXlsb2FkW1wibm9uY2VcIl0gJiYgcGF5bG9hZFtcIm5vbmNlXCJdICE9IG5vbmNlKSB7XG4gICAgICAgIGNvbnN0IGVycm9yID0gRXJyb3IoJ3VuZXhwZWN0ZWQgXCJub25jZVwiIGNsYWltIHZhbHVlJywge1xuICAgICAgICAgICAgY2F1c2U6IFwib2F1dGgyIHZlcmlmeV90b2tlblwiLFxuICAgICAgICB9KTtcbiAgICAgICAgZXJyb3IubmFtZSA9IFwiSldUQ2xhaW1WYWxpZGF0aW9uRmFpbGVkXCI7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgIH1cblxuICAgIC8vXG4gICAgLy8gRW5kIG9mIG1vZGlmeWluZyBlbmRwb2ludCBwYXJhbWV0ZXJzXG4gICAgLy9cbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbiAgICBpZiAodGVzdCkge1xuICAgICAgICBzZXRTdG9yZShcInRlc3RcIiwgc3RvcmFnZSA/IHBhcm1zIDogbnVsbCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShwYXlsb2FkKTtcbn07XG4iXX0=