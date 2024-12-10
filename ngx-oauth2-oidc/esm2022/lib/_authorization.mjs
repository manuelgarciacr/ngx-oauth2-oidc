import pkceChallenge, { generateChallenge } from "pkce-challenge";
import { isStrNull, notStrNull, secureRandom } from "../utils";
import { request as fnRequest } from "./_request";
import { getParameters } from "./_getParameters";
import { setStore } from "./_store";
import { _setParameters } from "./_setParameters";
/**
 * Request to then OAuth2 authorization endpoint. Redirects to the endpoint.
 *   The interceptor function inside the onInit method gets the response and actualizes
 *   the config.parameters. In test mode, the request payload is also stored within
 *   sessionStorage.
 *
 * @param request HttpClient object
 * @param config Configuration object saved in memory. Passed by reference and
 *      updated (configuration.parameters)
 * @param customParameters Custom parameters for the request.
 * @param statePayload Payload to add to state parameter
 * @param url Custom endpoint URL.
 * @returns Promise with the request response (IOAuth2Parameters or error)
 */
export const _authorization = async (request, config, // Passed by reference and updated (configuration.parameters)
customParameters = {}, statePayload = "", url) => {
    // Configuration options
    const test = config.configuration?.test;
    const storage = config.configuration?.storage;
    const no_pkce = !!config.configuration?.no_pkce;
    const no_state = !!config.configuration?.no_state;
    // TODO: authorization_grant 'hybrid' and 'free'
    const grant = config.configuration?.authorization_grant ?? "code";
    const basicGrant = ["code", "implicit", "hybrid"].includes(grant);
    // Metadata fields
    const authorization_endpoint = config.metadata?.authorization_endpoint;
    // url
    url ??= authorization_endpoint ?? "";
    // Endpoint parameters
    const arr = (name) => (parms[name] ?? []).map(str => str.toLowerCase());
    const parms = _setParameters({
        ...getParameters("authorization", config),
        ...{ state: null, nonce: null }, // This parameters must be created or as custom parameters
        ...customParameters,
    });
    const scope = arr("scope");
    const response_type = arr("response_type");
    const code_verifier = (parms["code_verifier"] ??
        config.token?.["code_verifier"] ?? // Code verifier is used by the token endpoint
        config.parameters?.code_verifier);
    const code_challenge_method = parms["code_challenge_method"];
    const code_challenge = parms["code_challenge"];
    const pkce = { code_challenge, code_challenge_method, code_verifier };
    let stateString, state, nonce;
    setStore("test", storage && test ? {} : null);
    ///////////////////////////////////////////////////////////////////
    //
    // Errors & warnings
    //
    if (!url)
        throw new Error(`The value of the 'authorization_endpoint' metadata field or the 'url' option is missing.`, {
            cause: `oauth2 authorization`,
        });
    //
    // End of errors & warnings
    //
    ///////////////////////////////////////////////////////////////////
    //
    // Modify endpoint parameters based on the values ​​of other parameters
    //      and configuration options
    //
    // SCOPE (must be processed before response_type)
    if (!scope.length) {
        scope.push("openid", "email", "profile");
    }
    // RESPONSE_TYPE (must be processed before nonce)
    if (basicGrant || response_type.length > 1) {
        const noneIdx = response_type.indexOf("none");
        if (noneIdx >= 0)
            response_type.splice(noneIdx, 1);
    }
    if (grant == "code") {
        response_type.splice(0, 10, "code");
    }
    if (grant == "implicit") {
        // scope is not empty
        const userScopes = ["openid", "email", "profile"];
        const hasUserScope = scope.some(str => userScopes.includes(str));
        const hasApiScope = scope.some(str => !userScopes.includes(str));
        const codeIdx = response_type.indexOf("code");
        const tokenIdx = response_type.indexOf("token");
        const idTokenIdx = response_type.indexOf("id_token");
        codeIdx >= 0 && response_type.splice(codeIdx, 1);
        hasUserScope &&
            idTokenIdx < 0 &&
            tokenIdx < 0 &&
            response_type.push("id_token");
        hasApiScope && tokenIdx < 0 && response_type.push("token");
    }
    // PKCE
    for (const prop in pkce)
        delete pkce[prop];
    if (no_pkce || grant != "code") {
        delete parms["code_challenge"];
        delete parms["code_challenge_method"];
        delete parms["code_verifier"];
    }
    else {
        Object.assign(pkce, await getPkce(parms, code_verifier));
    }
    // STATE
    if (no_state && storage) {
        delete parms["state"];
    }
    else {
        stateString = notStrNull(parms["state"], secureRandom(2));
        state = { state: stateString + statePayload };
    }
    // NONCE
    const idTokenIdx = response_type.indexOf("id_token");
    if (grant == "code" || (grant == "implicit" && idTokenIdx >= 0)) {
        // TODO: Hashed nonce
        const str_nonce = notStrNull(parms["nonce"], secureRandom(2));
        nonce = { nonce: str_nonce };
    }
    else {
        delete parms["nonce"];
    }
    //
    // End of modifying endpoint parameters
    //
    ///////////////////////////////////////////////////////////////////
    const newParameters = {
        ...pkce,
        ...state,
        ...nonce,
    };
    const payload = {
        ...parms,
        ...newParameters,
        scope,
        response_type,
    };
    // The 'code_verifier' is used by the token endpoint
    delete payload["code_verifier"];
    // The 'code_challenge' and 'code_challenge_method' are no longer needed
    delete newParameters["code_challenge"];
    delete newParameters["code_challenge_method"];
    config.parameters = {
        ...config.parameters,
        ...newParameters,
    };
    setStore("config", storage
        ? config
        : null);
    return fnRequest("HREF", url, request, config, payload, "authorization");
};
const getPkce = async (parms, verifier) => {
    let method = parms["code_challenge_method"];
    if (!isStrNull(method))
        throw new Error(`The code challenge method "${method}",
            must be a string or nullish.`, { cause: "oauth2 authorization" });
    if (!isStrNull(verifier))
        throw new Error(`The code verifier "${verifier}",
                must be a string or nullish.`, { cause: "oauth2 authorization" });
    method = notStrNull(method, "S256");
    method = method.toLowerCase() == "plain" ? "plain" : method;
    method = method.toLowerCase() == "s256" ? "S256" : method;
    if (method != "plain" && method != "S256")
        throw new Error(`unexpected code challenge method "${method}".`, { cause: "oauth2 authorization" });
    verifier = notStrNull(verifier, (await pkceChallenge(128)).code_verifier);
    let challenge = (parms["code_challenge"]);
    challenge = notStrNull(challenge, await generateChallenge(verifier));
    return {
        code_challenge_method: method,
        code_verifier: verifier,
        code_challenge: challenge,
    };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiX2F1dGhvcml6YXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wcm9qZWN0cy9uZ3gtb2F1dGgyLW9pZGMvc3JjL2xpYi9fYXV0aG9yaXphdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLGFBQWEsRUFBRSxFQUFFLGlCQUFpQixFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFFbEUsT0FBTyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsWUFBWSxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBQy9ELE9BQU8sRUFBRSxPQUFPLElBQUksU0FBUyxFQUFDLE1BQU0sWUFBWSxDQUFDO0FBRWpELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUNqRCxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBQ3BDLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUlsRDs7Ozs7Ozs7Ozs7OztHQWFHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sY0FBYyxHQUFHLEtBQUssRUFDL0IsT0FBbUIsRUFDbkIsTUFBcUIsRUFBRSw2REFBNkQ7QUFDcEYsbUJBQXlDLEVBQUUsRUFDM0MsZUFBdUIsRUFBRSxFQUN6QixHQUFZLEVBQ2MsRUFBRTtJQUM1Qix3QkFBd0I7SUFDeEIsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUM7SUFDeEMsTUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLGFBQWEsRUFBRSxPQUFPLENBQUM7SUFDOUMsTUFBTSxPQUFPLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxhQUFhLEVBQUUsT0FBTyxDQUFDO0lBQ2hELE1BQU0sUUFBUSxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsYUFBYSxFQUFFLFFBQVEsQ0FBQztJQUNsRCxnREFBZ0Q7SUFDaEQsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLGFBQWEsRUFBRSxtQkFBbUIsSUFB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QUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDO0lBQzVELE1BQU0sR0FBRyxNQUFNLENBQUMsV0FBVyxFQUFFLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQztJQUUxRCxJQUFJLE1BQU0sSUFBSSxPQUFPLElBQUksTUFBTSxJQUFJLE1BQU07UUFDckMsTUFBTSxJQUFJLEtBQUssQ0FDWCxxQ0FBcUMsTUFBTSxJQUFJLEVBQy9DLEVBQUUsS0FBSyxFQUFFLHNCQUFzQixFQUFFLENBQ3BDLENBQUM7SUFFTixRQUFRLEdBQUcsVUFBVSxDQUFDLFFBQVEsRUFBRSxDQUFDLE1BQU0sYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUM7SUFFMUUsSUFBSSxTQUFTLEdBQUcsQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsQ0FFekIsQ0FBQztJQUNoQixTQUFTLEdBQUcsVUFBVSxDQUFDLFNBQVMsRUFBRSxNQUFNLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7SUFFckUsT0FBTztRQUNILHFCQUFxQixFQUFFLE1BQTBCO1FBQ2pELGFBQWEsRUFBRSxRQUE4QjtRQUM3QyxjQUFjLEVBQUUsU0FBUztLQUM1QixDQUFDO0FBQ04sQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHBrY2VDaGFsbGVuZ2UsIHsgZ2VuZXJhdGVDaGFsbGVuZ2UgfSBmcm9tIFwicGtjZS1jaGFsbGVuZ2VcIjtcbmltcG9ydCB7IElPQXV0aDJDb25maWcsIElPQXV0aDJQYXJhbWV0ZXJzLCBjdXN0b21QYXJhbWV0ZXJzVHlwZSwgb3B0aW9uYWxTdHJpbmdzT2JqZWN0IH0gZnJvbSBcIi4uL2RvbWFpblwiO1xuaW1wb3J0IHsgaXNTdHJOdWxsLCBub3RTdHJOdWxsLCBzZWN1cmVSYW5kb20gfSBmcm9tIFwiLi4vdXRpbHNcIjtcbmltcG9ydCB7IHJlcXVlc3QgYXMgZm5SZXF1ZXN0fSBmcm9tIFwiLi9fcmVxdWVzdFwiO1xuaW1wb3J0IHsgSHR0cENsaWVudCB9IGZyb20gXCJAYW5ndWxhci9jb21tb24vaHR0cFwiO1xuaW1wb3J0IHsgZ2V0UGFyYW1ldGVycyB9IGZyb20gXCIuL19nZXRQYXJhbWV0ZXJzXCI7XG5pbXBvcnQgeyBzZXRTdG9yZSB9IGZyb20gXCIuL19zdG9yZVwiO1xuaW1wb3J0IHsgX3NldFBhcmFtZXRlcnMgfSBmcm9tIFwiLi9fc2V0UGFyYW1ldGVyc1wiO1xuXG50eXBlIHBhcm1zT2JqZWN0ID0gb3B0aW9uYWxTdHJpbmdzT2JqZWN0O1xuXG4vKipcbiAqIFJlcXVlc3QgdG8gdGhlbiBPQXV0aDIgYXV0aG9yaXphdGlvbiBlbmRwb2ludC4gUmVkaXJlY3RzIHRvIHRoZSBlbmRwb2ludC5cbiAqICAgVGhlIGludGVyY2VwdG9yIGZ1bmN0aW9uIGluc2lkZSB0aGUgb25Jbml0IG1ldGhvZCBnZXRzIHRoZSByZXNwb25zZSBhbmQgYWN0dWFsaXplc1xuICogICB0aGUgY29uZmlnLnBhcmFtZXRlcnMuIEluIHRlc3QgbW9kZSwgdGhlIHJlcXVlc3QgcGF5bG9hZCBpcyBhbHNvIHN0b3JlZCB3aXRoaW5cbiAqICAgc2Vzc2lvblN0b3JhZ2UuXG4gKlxuICogQHBhcmFtIHJlcXVlc3QgSHR0cENsaWVudCBvYmplY3RcbiAqIEBwYXJhbSBjb25maWcgQ29uZmlndXJhdGlvbiBvYmplY3Qgc2F2ZWQgaW4gbWVtb3J5LiBQYXNzZWQgYnkgcmVmZXJlbmNlIGFuZFxuICogICAgICB1cGRhdGVkIChjb25maWd1cmF0aW9uLnBhcmFtZXRlcnMpXG4gKiBAcGFyYW0gY3VzdG9tUGFyYW1ldGVycyBDdXN0b20gcGFyYW1ldGVycyBmb3IgdGhlIHJlcXVlc3QuXG4gKiBAcGFyYW0gc3RhdGVQYXlsb2FkIFBheWxvYWQgdG8gYWRkIHRvIHN0YXRlIHBhcmFtZXRlclxuICogQHBhcmFtIHVybCBDdXN0b20gZW5kcG9pbnQgVVJMLlxuICogQHJldHVybnMgUHJvbWlzZSB3aXRoIHRoZSByZXF1ZXN0IHJlc3BvbnNlIChJT0F1dGgyUGFyYW1ldGVycyBvciBlcnJvcilcbiAqL1xuZXhwb3J0IGNvbnN0IF9hdXRob3JpemF0aW9uID0gYXN5bmMgKFxuICAgIHJlcXVlc3Q6IEh0dHBDbGllbnQsXG4gICAgY29uZmlnOiBJT0F1dGgyQ29uZmlnLCAvLyBQYXNzZWQgYnkgcmVmZXJlbmNlIGFuZCB1cGRhdGVkIChjb25maWd1cmF0aW9uLnBhcmFtZXRlcnMpXG4gICAgY3VzdG9tUGFyYW1ldGVycyA9IDxjdXN0b21QYXJhbWV0ZXJzVHlwZT57fSxcbiAgICBzdGF0ZVBheWxvYWQ6IHN0cmluZyA9IFwiXCIsXG4gICAgdXJsPzogc3RyaW5nXG4pOiBQcm9taXNlPElPQXV0aDJQYXJhbWV0ZXJzPiA9PiB7XG4gICAgLy8gQ29uZmlndXJhdGlvbiBvcHRpb25zXG4gICAgY29uc3QgdGVzdCA9IGNvbmZpZy5jb25maWd1cmF0aW9uPy50ZXN0O1xuICAgIGNvbnN0IHN0b3JhZ2UgPSBjb25maWcuY29uZmlndXJhdGlvbj8uc3RvcmFnZTtcbiAgICBjb25zdCBub19wa2NlID0gISFjb25maWcuY29uZmlndXJhdGlvbj8ubm9fcGtjZTtcbiAgICBjb25zdCBub19zdGF0ZSA9ICEhY29uZmlnLmNvbmZpZ3VyYXRpb24/Lm5vX3N0YXRlO1xuICAgIC8vIFRPRE86IGF1dGhvcml6YXRpb25fZ3JhbnQgJ2h5YnJpZCcgYW5kICdmcmVlJ1xuICAgIGNvbnN0IGdyYW50ID0gY29uZmlnLmNvbmZpZ3VyYXRpb24/LmF1dGhvcml6YXRpb25fZ3JhbnQgPz8gXCJjb2RlXCI7XG4gICAgY29uc3QgYmFzaWNHcmFudCA9IFtcImNvZGVcIiwgXCJpbXBsaWNpdFwiLCBcImh5YnJpZFwiXS5pbmNsdWRlcyhncmFudCk7XG4gICAgLy8gTWV0YWRhdGEgZmllbGRzXG4gICAgY29uc3QgYXV0aG9yaXphdGlvbl9lbmRwb2ludCA9IGNvbmZpZy5tZXRhZGF0YT8uYXV0aG9yaXphdGlvbl9lbmRwb2ludDtcbiAgICAvLyB1cmxcbiAgICB1cmwgPz89IGF1dGhvcml6YXRpb25fZW5kcG9pbnQgPz8gXCJcIjtcbiAgICAvLyBFbmRwb2ludCBwYXJhbWV0ZXJzXG4gICAgY29uc3QgYXJyID0gKG5hbWU6IHN0cmluZykgPT5cbiAgICAgICAgKDxzdHJpbmdbXT5wYXJtc1tuYW1lXSA/PyBbXSkubWFwKHN0ciA9PiBzdHIudG9Mb3dlckNhc2UoKSk7XG4gICAgY29uc3QgcGFybXMgPSBfc2V0UGFyYW1ldGVycyh7XG4gICAgICAgIC4uLmdldFBhcmFtZXRlcnMoXCJhdXRob3JpemF0aW9uXCIsIGNvbmZpZyksXG4gICAgICAgIC4uLnsgc3RhdGU6IG51bGwsIG5vbmNlOiBudWxsIH0sIC8vIFRoaXMgcGFyYW1ldGVycyBtdXN0IGJlIGNyZWF0ZWQgb3IgYXMgY3VzdG9tIHBhcmFtZXRlcnNcbiAgICAgICAgLi4uY3VzdG9tUGFyYW1ldGVycyxcbiAgICB9KTtcbiAgICBjb25zdCBzY29wZSA9IGFycihcInNjb3BlXCIpO1xuICAgIGNvbnN0IHJlc3BvbnNlX3R5cGUgPSBhcnIoXCJyZXNwb25zZV90eXBlXCIpO1xuICAgIGNvbnN0IGNvZGVfdmVyaWZpZXIgPSAocGFybXNbXCJjb2RlX3ZlcmlmaWVyXCJdID8/XG4gICAgICAgIGNvbmZpZy50b2tlbj8uW1wiY29kZV92ZXJpZmllclwiXSA/PyAvLyBDb2RlIHZlcmlmaWVyIGlzIHVzZWQgYnkgdGhlIHRva2VuIGVuZHBvaW50XG4gICAgICAgIGNvbmZpZy5wYXJhbWV0ZXJzPy5jb2RlX3ZlcmlmaWVyKSBhcyBzdHJpbmcgfCB1bmRlZmluZWQ7XG4gICAgY29uc3QgY29kZV9jaGFsbGVuZ2VfbWV0aG9kID0gcGFybXNbXCJjb2RlX2NoYWxsZW5nZV9tZXRob2RcIl0gYXNcbiAgICAgICAgfCBcIlMyNTZcIlxuICAgICAgICB8IFwicGxhaW5cIlxuICAgICAgICB8IHVuZGVmaW5lZDtcbiAgICBjb25zdCBjb2RlX2NoYWxsZW5nZSA9IHBhcm1zW1wiY29kZV9jaGFsbGVuZ2VcIl0gYXMgc3RyaW5nIHwgdW5kZWZpbmVkO1xuICAgIGNvbnN0IHBrY2UgPSB7IGNvZGVfY2hhbGxlbmdlLCBjb2RlX2NoYWxsZW5nZV9tZXRob2QsIGNvZGVfdmVyaWZpZXIgfTtcbiAgICBsZXQgc3RhdGVTdHJpbmcsIHN0YXRlLCBub25jZTtcblxuICAgIHNldFN0b3JlKFwidGVzdFwiLCBzdG9yYWdlICYmIHRlc3QgPyB7fSA6IG51bGwpO1xuXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAgIC8vXG4gICAgLy8gRXJyb3JzICYgd2FybmluZ3NcbiAgICAvL1xuXG4gICAgaWYgKCF1cmwpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgIGBUaGUgdmFsdWUgb2YgdGhlICdhdXRob3JpemF0aW9uX2VuZHBvaW50JyBtZXRhZGF0YSBmaWVsZCBvciB0aGUgJ3VybCcgb3B0aW9uIGlzIG1pc3NpbmcuYCxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjYXVzZTogYG9hdXRoMiBhdXRob3JpemF0aW9uYCxcbiAgICAgICAgICAgIH1cbiAgICAgICAgKTtcblxuICAgIC8vXG4gICAgLy8gRW5kIG9mIGVycm9ycyAmIHdhcm5pbmdzXG4gICAgLy9cbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gICAgLy9cbiAgICAvLyBNb2RpZnkgZW5kcG9pbnQgcGFyYW1ldGVycyBiYXNlZCBvbiB0aGUgdmFsdWVzIOKAi+KAi29mIG90aGVyIHBhcmFtZXRlcnNcbiAgICAvLyAgICAgIGFuZCBjb25maWd1cmF0aW9uIG9wdGlvbnNcbiAgICAvL1xuXG4gICAgLy8gU0NPUEUgKG11c3QgYmUgcHJvY2Vzc2VkIGJlZm9yZSByZXNwb25zZV90eXBlKVxuXG4gICAgaWYgKCFzY29wZS5sZW5ndGgpIHtcbiAgICAgICAgc2NvcGUucHVzaChcIm9wZW5pZFwiLCBcImVtYWlsXCIsIFwicHJvZmlsZVwiKTtcbiAgICB9XG5cbiAgICAvLyBSRVNQT05TRV9UWVBFIChtdXN0IGJlIHByb2Nlc3NlZCBiZWZvcmUgbm9uY2UpXG5cbiAgICBpZiAoYmFzaWNHcmFudCB8fCByZXNwb25zZV90eXBlLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgY29uc3Qgbm9uZUlkeCA9IHJlc3BvbnNlX3R5cGUuaW5kZXhPZihcIm5vbmVcIik7XG5cbiAgICAgICAgaWYgKG5vbmVJZHggPj0gMCkgcmVzcG9uc2VfdHlwZS5zcGxpY2Uobm9uZUlkeCwgMSk7XG4gICAgfVxuXG4gICAgaWYgKGdyYW50ID09IFwiY29kZVwiKSB7XG4gICAgICAgIHJlc3BvbnNlX3R5cGUuc3BsaWNlKDAsIDEwLCBcImNvZGVcIik7XG4gICAgfVxuXG4gICAgaWYgKGdyYW50ID09IFwiaW1wbGljaXRcIikge1xuICAgICAgICAvLyBzY29wZSBpcyBub3QgZW1wdHlcbiAgICAgICAgY29uc3QgdXNlclNjb3BlcyA9IFtcIm9wZW5pZFwiLCBcImVtYWlsXCIsIFwicHJvZmlsZVwiXTtcbiAgICAgICAgY29uc3QgaGFzVXNlclNjb3BlID0gc2NvcGUuc29tZShzdHIgPT4gdXNlclNjb3Blcy5pbmNsdWRlcyhzdHIpKTtcbiAgICAgICAgY29uc3QgaGFzQXBpU2NvcGUgPSBzY29wZS5zb21lKHN0ciA9PiAhdXNlclNjb3Blcy5pbmNsdWRlcyhzdHIpKTtcbiAgICAgICAgY29uc3QgY29kZUlkeCA9IHJlc3BvbnNlX3R5cGUuaW5kZXhPZihcImNvZGVcIik7XG4gICAgICAgIGNvbnN0IHRva2VuSWR4ID0gcmVzcG9uc2VfdHlwZS5pbmRleE9mKFwidG9rZW5cIik7XG4gICAgICAgIGNvbnN0IGlkVG9rZW5JZHggPSByZXNwb25zZV90eXBlLmluZGV4T2YoXCJpZF90b2tlblwiKTtcblxuICAgICAgICBjb2RlSWR4ID49IDAgJiYgcmVzcG9uc2VfdHlwZS5zcGxpY2UoY29kZUlkeCwgMSk7XG5cbiAgICAgICAgaGFzVXNlclNjb3BlICYmXG4gICAgICAgICAgICBpZFRva2VuSWR4IDwgMCAmJlxuICAgICAgICAgICAgdG9rZW5JZHggPCAwICYmXG4gICAgICAgICAgICByZXNwb25zZV90eXBlLnB1c2goXCJpZF90b2tlblwiKTtcblxuICAgICAgICBoYXNBcGlTY29wZSAmJiB0b2tlbklkeCA8IDAgJiYgcmVzcG9uc2VfdHlwZS5wdXNoKFwidG9rZW5cIik7XG4gICAgfVxuXG4gICAgLy8gUEtDRVxuXG4gICAgZm9yIChjb25zdCBwcm9wIGluIHBrY2UpIGRlbGV0ZSAocGtjZSBhcyBwYXJtc09iamVjdClbcHJvcF07XG5cbiAgICBpZiAobm9fcGtjZSB8fCBncmFudCAhPSBcImNvZGVcIikge1xuICAgICAgICBkZWxldGUgcGFybXNbXCJjb2RlX2NoYWxsZW5nZVwiXTtcbiAgICAgICAgZGVsZXRlIHBhcm1zW1wiY29kZV9jaGFsbGVuZ2VfbWV0aG9kXCJdO1xuICAgICAgICBkZWxldGUgcGFybXNbXCJjb2RlX3ZlcmlmaWVyXCJdO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIE9iamVjdC5hc3NpZ24ocGtjZSwgYXdhaXQgZ2V0UGtjZShwYXJtcywgY29kZV92ZXJpZmllciBhcyBzdHJpbmcpKTtcbiAgICB9XG5cbiAgICAvLyBTVEFURVxuXG4gICAgaWYgKG5vX3N0YXRlICYmIHN0b3JhZ2UpIHtcbiAgICAgICAgZGVsZXRlIHBhcm1zW1wic3RhdGVcIl07XG4gICAgfSBlbHNlIHtcbiAgICAgICAgc3RhdGVTdHJpbmcgPSBub3RTdHJOdWxsKHBhcm1zW1wic3RhdGVcIl0sIHNlY3VyZVJhbmRvbSgyKSk7XG4gICAgICAgIHN0YXRlID0geyBzdGF0ZTogc3RhdGVTdHJpbmcgKyBzdGF0ZVBheWxvYWQgfVxuICAgIH1cblxuICAgIC8vIE5PTkNFXG5cbiAgICBjb25zdCBpZFRva2VuSWR4ID0gcmVzcG9uc2VfdHlwZS5pbmRleE9mKFwiaWRfdG9rZW5cIik7XG5cbiAgICBpZiAoZ3JhbnQgPT0gXCJjb2RlXCIgfHwgKGdyYW50ID09IFwiaW1wbGljaXRcIiAmJiBpZFRva2VuSWR4ID49IDApKSB7XG4gICAgICAgIC8vIFRPRE86IEhhc2hlZCBub25jZVxuICAgICAgICBjb25zdCBzdHJfbm9uY2UgPSBub3RTdHJOdWxsKHBhcm1zW1wibm9uY2VcIl0sIHNlY3VyZVJhbmRvbSgyKSk7XG5cbiAgICAgICAgbm9uY2UgPSB7IG5vbmNlOiBzdHJfbm9uY2UgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIGRlbGV0ZSBwYXJtc1tcIm5vbmNlXCJdO1xuICAgIH1cblxuICAgIC8vXG4gICAgLy8gRW5kIG9mIG1vZGlmeWluZyBlbmRwb2ludCBwYXJhbWV0ZXJzXG4gICAgLy9cbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbiAgICBjb25zdCBuZXdQYXJhbWV0ZXJzID0ge1xuICAgICAgICAuLi5wa2NlLFxuICAgICAgICAuLi5zdGF0ZSxcbiAgICAgICAgLi4ubm9uY2UsXG4gICAgfTtcblxuICAgIGNvbnN0IHBheWxvYWQgPSB7XG4gICAgICAgIC4uLnBhcm1zLFxuICAgICAgICAuLi5uZXdQYXJhbWV0ZXJzLFxuICAgICAgICBzY29wZSxcbiAgICAgICAgcmVzcG9uc2VfdHlwZSxcbiAgICB9O1xuXG4gICAgLy8gVGhlICdjb2RlX3ZlcmlmaWVyJyBpcyB1c2VkIGJ5IHRoZSB0b2tlbiBlbmRwb2ludFxuICAgIGRlbGV0ZSBwYXlsb2FkW1wiY29kZV92ZXJpZmllclwiXTtcbiAgICAvLyBUaGUgJ2NvZGVfY2hhbGxlbmdlJyBhbmQgJ2NvZGVfY2hhbGxlbmdlX21ldGhvZCcgYXJlIG5vIGxvbmdlciBuZWVkZWRcbiAgICBkZWxldGUgbmV3UGFyYW1ldGVyc1tcImNvZGVfY2hhbGxlbmdlXCJdO1xuICAgIGRlbGV0ZSBuZXdQYXJhbWV0ZXJzW1wiY29kZV9jaGFsbGVuZ2VfbWV0aG9kXCJdO1xuXG4gICAgY29uZmlnLnBhcmFtZXRlcnMgPSB7XG4gICAgICAgIC4uLmNvbmZpZy5wYXJhbWV0ZXJzLFxuICAgICAgICAuLi5uZXdQYXJhbWV0ZXJzLFxuICAgIH07XG5cbiAgICBzZXRTdG9yZShcbiAgICAgICAgXCJjb25maWdcIixcbiAgICAgICAgc3RvcmFnZVxuICAgICAgICAgICAgPyBjb25maWdcbiAgICAgICAgICAgIDogbnVsbFxuICAgICk7XG5cbiAgICByZXR1cm4gZm5SZXF1ZXN0PElPQXV0aDJQYXJhbWV0ZXJzPihcbiAgICAgICAgXCJIUkVGXCIsXG4gICAgICAgIHVybCxcbiAgICAgICAgcmVxdWVzdCxcbiAgICAgICAgY29uZmlnLFxuICAgICAgICBwYXlsb2FkIGFzIGN1c3RvbVBhcmFtZXRlcnNUeXBlLFxuICAgICAgICBcImF1dGhvcml6YXRpb25cIlxuICAgICkgYXMgSU9BdXRoMlBhcmFtZXRlcnM7XG59O1xuXG5jb25zdCBnZXRQa2NlID0gYXN5bmMgKFxuICAgIHBhcm1zOiBjdXN0b21QYXJhbWV0ZXJzVHlwZSxcbiAgICB2ZXJpZmllcjogc3RyaW5nXG4pID0+IHtcbiAgICBsZXQgbWV0aG9kID0gcGFybXNbXCJjb2RlX2NoYWxsZW5nZV9tZXRob2RcIl07XG5cbiAgICBpZiAoIWlzU3RyTnVsbChtZXRob2QpKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICBgVGhlIGNvZGUgY2hhbGxlbmdlIG1ldGhvZCBcIiR7bWV0aG9kfVwiLFxuICAgICAgICAgICAgbXVzdCBiZSBhIHN0cmluZyBvciBudWxsaXNoLmAsXG4gICAgICAgICAgICB7IGNhdXNlOiBcIm9hdXRoMiBhdXRob3JpemF0aW9uXCIgfSxcbiAgICAgICAgKTtcblxuICAgIGlmICghaXNTdHJOdWxsKHZlcmlmaWVyKSlcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgYFRoZSBjb2RlIHZlcmlmaWVyIFwiJHt2ZXJpZmllcn1cIixcbiAgICAgICAgICAgICAgICBtdXN0IGJlIGEgc3RyaW5nIG9yIG51bGxpc2guYCxcbiAgICAgICAgICAgIHsgY2F1c2U6IFwib2F1dGgyIGF1dGhvcml6YXRpb25cIiB9XG4gICAgICAgICk7XG5cbiAgICBtZXRob2QgPSBub3RTdHJOdWxsKG1ldGhvZCwgXCJTMjU2XCIpO1xuICAgIG1ldGhvZCA9IG1ldGhvZC50b0xvd2VyQ2FzZSgpID09IFwicGxhaW5cIiA/IFwicGxhaW5cIiA6IG1ldGhvZDtcbiAgICBtZXRob2QgPSBtZXRob2QudG9Mb3dlckNhc2UoKSA9PSBcInMyNTZcIiA/IFwiUzI1NlwiIDogbWV0aG9kO1xuXG4gICAgaWYgKG1ldGhvZCAhPSBcInBsYWluXCIgJiYgbWV0aG9kICE9IFwiUzI1NlwiKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICBgdW5leHBlY3RlZCBjb2RlIGNoYWxsZW5nZSBtZXRob2QgXCIke21ldGhvZH1cIi5gLFxuICAgICAgICAgICAgeyBjYXVzZTogXCJvYXV0aDIgYXV0aG9yaXphdGlvblwiIH1cbiAgICAgICAgKTtcblxuICAgIHZlcmlmaWVyID0gbm90U3RyTnVsbCh2ZXJpZmllciwgKGF3YWl0IHBrY2VDaGFsbGVuZ2UoMTI4KSkuY29kZV92ZXJpZmllcik7XG5cbiAgICBsZXQgY2hhbGxlbmdlID0gKHBhcm1zW1wiY29kZV9jaGFsbGVuZ2VcIl0pIGFzXG4gICAgICAgIHwgc3RyaW5nXG4gICAgICAgIHwgdW5kZWZpbmVkO1xuICAgIGNoYWxsZW5nZSA9IG5vdFN0ck51bGwoY2hhbGxlbmdlLCBhd2FpdCBnZW5lcmF0ZUNoYWxsZW5nZSh2ZXJpZmllcikpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29kZV9jaGFsbGVuZ2VfbWV0aG9kOiBtZXRob2QgYXMgXCJTMjU2XCIgfCBcInBsYWluXCIsXG4gICAgICAgIGNvZGVfdmVyaWZpZXI6IHZlcmlmaWVyIGFzIHN0cmluZyB8IHVuZGVmaW5lZCxcbiAgICAgICAgY29kZV9jaGFsbGVuZ2U6IGNoYWxsZW5nZSxcbiAgICB9O1xufVxuIl19