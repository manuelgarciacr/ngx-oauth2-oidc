import { request as fnRequest } from "./_request";
import { getParameters } from "./_getParameters";
import { setStore } from "./_store";
import { _setParameters } from "./_setParameters";
/**
 * Request to the token endpoint. Returns the tokens and othe date returned by
 *   the endpoint and saves it in the configuration parameters (in memory and storage).
 *   HttpClient post request. In test mode, the request payload is also stored within
 *   sessionStorage.
 *
 * @param request HttpClient object or worker request
 * @param config Configuration object saved in memory. Passed by reference and
 *      updated (configuration.parameters)
 * @param customParameters Custom parameters for the request.
 * @param url Custom endpoint URL.
 * @returns Promise with the request response (IOAuth2Parameters or error)
 */
export const _token = async (request, config, // Passed by reference and updated (configuration.parameters)
customParameters = {}, url) => {
    // Configuration options
    const test = config.configuration?.test;
    const storage = config.configuration?.storage;
    const no_pkce = !!config.configuration?.no_pkce;
    // Metadata fields
    const token_endpoint = config?.metadata?.token_endpoint;
    // url
    url ??= token_endpoint ?? "";
    // Endpoint parameters
    const parms = _setParameters({
        ...getParameters("token", config),
        ...customParameters,
    });
    const grant_type = parms["grant_type"];
    setStore("test", storage && test ? {} : null);
    ///////////////////////////////////////////////////////////////////
    //
    // Errors & warnings
    //
    if (!url)
        throw new Error(`Missing Value ​​for metadata field 'token_endpoint' or option 'url'.`, { cause: `oauth2 token ${grant_type}` });
    if (!grant_type)
        throw new Error(`Missing value ​​for configuration parameter 'grant_type'.`, {
            cause: `oauth2 token`,
        });
    //
    // End of errors & warnings
    //
    ///////////////////////////////////////////////////////////////////
    //
    // Modify endpoint parameters based on the values ​​of other parameters
    //      and configuration options
    //
    if (grant_type == "authorization_code") {
        delete parms["assertion"];
        delete parms["device_code"];
        delete parms["refresh_token"];
        if (!no_pkce) {
            // "code_verifier" is for only one use
            delete config.token?.["code_verifier"];
            delete config.parameters?.code_verifier;
            const id_token = config.parameters?.id_token;
            setStore("config", storage
                ? config
                : null);
        }
    }
    if (grant_type == "refresh_token") {
        delete parms["assertion"];
        delete parms["code"];
        delete parms["code_verifier"];
        delete parms["device_code"];
    }
    if (no_pkce) {
        delete parms["code_verifier"];
    }
    //
    // End of modifying endpoint parameters
    //
    ///////////////////////////////////////////////////////////////////
    return fnRequest("POST", url, request, config, parms, "token");
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiX3Rva2VuLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vcHJvamVjdHMvbmd4LW9hdXRoMi1vaWRjL3NyYy9saWIvX3Rva2VuLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUtBLE9BQU8sRUFBRSxPQUFPLElBQUksU0FBUyxFQUFDLE1BQU0sWUFBWSxDQUFDO0FBRWpELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUNqRCxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBQ3BDLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUVsRDs7Ozs7Ozs7Ozs7O0dBWUc7QUFDSCxNQUFNLENBQUMsTUFBTSxNQUFNLEdBQUcsS0FBSyxFQUN2QixPQUFtQixFQUNuQixNQUFxQixFQUFFLDZEQUE2RDtBQUNwRixtQkFBeUMsRUFBRSxFQUMzQyxHQUFZLEVBQ2QsRUFBRTtJQUNBLHdCQUF3QjtJQUN4QixNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQztJQUN4QyxNQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsYUFBYSxFQUFFLE9BQU8sQ0FBQztJQUM5QyxNQUFNLE9BQU8sR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLGFBQWEsRUFBRSxPQUFPLENBQUM7SUFDaEQsa0JBQWtCO0lBQ2xCLE1BQU0sY0FBYyxHQUFHLE1BQU0sRUFBRSxRQUFRLEVBQUUsY0FBYyxDQUFDO0lBQ3hELE1BQU07SUFDTixHQUFHLEtBQUssY0FBYyxJQUFJLEVBQUUsQ0FBQztJQUM3QixzQkFBc0I7SUFDdEIsTUFBTSxLQUFLLEdBQUcsY0FBYyxDQUFDO1FBQ3pCLEdBQUcsYUFBYSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUM7UUFDakMsR0FBRyxnQkFBZ0I7S0FDdEIsQ0FBQyxDQUFDO0lBQ0gsTUFBTSxVQUFVLEdBQUcsS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBRXZDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsT0FBTyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUU5QyxtRUFBbUU7SUFDbkUsRUFBRTtJQUNGLG9CQUFvQjtJQUNwQixFQUFFO0lBRUYsSUFBSSxDQUFDLEdBQUc7UUFDSixNQUFNLElBQUksS0FBSyxDQUNYLHNFQUFzRSxFQUN0RSxFQUFFLEtBQUssRUFBRSxnQkFBZ0IsVUFBVSxFQUFFLEVBQUUsQ0FDMUMsQ0FBQztJQUVOLElBQUksQ0FBQyxVQUFVO1FBQ1gsTUFBTSxJQUFJLEtBQUssQ0FDWCwyREFBMkQsRUFDM0Q7WUFDSSxLQUFLLEVBQUUsY0FBYztTQUN4QixDQUNKLENBQUM7SUFFTixFQUFFO0lBQ0YsMkJBQTJCO0lBQzNCLEVBQUU7SUFDRixtRUFBbUU7SUFDbkUsRUFBRTtJQUNGLHVFQUF1RTtJQUN2RSxpQ0FBaUM7SUFDakMsRUFBRTtJQUVGLElBQUksVUFBVSxJQUFJLG9CQUFvQixFQUFFLENBQUM7UUFDckMsT0FBTyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDMUIsT0FBTyxLQUFLLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDNUIsT0FBTyxLQUFLLENBQUMsZUFBZSxDQUFDLENBQUM7UUFFOUIsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ1gsc0NBQXNDO1lBQ3RDLE9BQU8sTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBQ3ZDLE9BQU8sTUFBTSxDQUFDLFVBQVUsRUFBRSxhQUFhLENBQUM7WUFFeEMsTUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLFVBQVUsRUFBRSxRQUFRLENBQUM7WUFFN0MsUUFBUSxDQUNKLFFBQVEsRUFDUixPQUFPO2dCQUNILENBQUMsQ0FBQyxNQUFNO2dCQUNSLENBQUMsQ0FBQyxJQUFJLENBQ2IsQ0FBQztRQUVOLENBQUM7SUFDTCxDQUFDO0lBRUQsSUFBSSxVQUFVLElBQUksZUFBZSxFQUFFLENBQUM7UUFDaEMsT0FBTyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDMUIsT0FBTyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDckIsT0FBTyxLQUFLLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDOUIsT0FBTyxLQUFLLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDaEMsQ0FBQztJQUVELElBQUksT0FBTyxFQUFFLENBQUM7UUFDVixPQUFPLEtBQUssQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUNsQyxDQUFDO0lBRUQsRUFBRTtJQUNGLHVDQUF1QztJQUN2QyxFQUFFO0lBQ0YsbUVBQW1FO0lBRW5FLE9BQU8sU0FBUyxDQUNaLE1BQU0sRUFDTixHQUFHLEVBQ0gsT0FBTyxFQUNQLE1BQU0sRUFDTixLQUFLLEVBQ0wsT0FBTyxDQUNWLENBQUM7QUFDTixDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICAgIElPQXV0aDJDb25maWcsXG4gICAgSU9BdXRoMlBhcmFtZXRlcnMsXG4gICAgY3VzdG9tUGFyYW1ldGVyc1R5cGUsXG59IGZyb20gXCIuLi9kb21haW5cIjtcbmltcG9ydCB7IHJlcXVlc3QgYXMgZm5SZXF1ZXN0fSBmcm9tIFwiLi9fcmVxdWVzdFwiO1xuaW1wb3J0IHsgSHR0cENsaWVudCB9IGZyb20gXCJAYW5ndWxhci9jb21tb24vaHR0cFwiO1xuaW1wb3J0IHsgZ2V0UGFyYW1ldGVycyB9IGZyb20gXCIuL19nZXRQYXJhbWV0ZXJzXCI7XG5pbXBvcnQgeyBzZXRTdG9yZSB9IGZyb20gXCIuL19zdG9yZVwiO1xuaW1wb3J0IHsgX3NldFBhcmFtZXRlcnMgfSBmcm9tIFwiLi9fc2V0UGFyYW1ldGVyc1wiO1xuXG4vKipcbiAqIFJlcXVlc3QgdG8gdGhlIHRva2VuIGVuZHBvaW50LiBSZXR1cm5zIHRoZSB0b2tlbnMgYW5kIG90aGUgZGF0ZSByZXR1cm5lZCBieVxuICogICB0aGUgZW5kcG9pbnQgYW5kIHNhdmVzIGl0IGluIHRoZSBjb25maWd1cmF0aW9uIHBhcmFtZXRlcnMgKGluIG1lbW9yeSBhbmQgc3RvcmFnZSkuXG4gKiAgIEh0dHBDbGllbnQgcG9zdCByZXF1ZXN0LiBJbiB0ZXN0IG1vZGUsIHRoZSByZXF1ZXN0IHBheWxvYWQgaXMgYWxzbyBzdG9yZWQgd2l0aGluXG4gKiAgIHNlc3Npb25TdG9yYWdlLlxuICpcbiAqIEBwYXJhbSByZXF1ZXN0IEh0dHBDbGllbnQgb2JqZWN0IG9yIHdvcmtlciByZXF1ZXN0XG4gKiBAcGFyYW0gY29uZmlnIENvbmZpZ3VyYXRpb24gb2JqZWN0IHNhdmVkIGluIG1lbW9yeS4gUGFzc2VkIGJ5IHJlZmVyZW5jZSBhbmRcbiAqICAgICAgdXBkYXRlZCAoY29uZmlndXJhdGlvbi5wYXJhbWV0ZXJzKVxuICogQHBhcmFtIGN1c3RvbVBhcmFtZXRlcnMgQ3VzdG9tIHBhcmFtZXRlcnMgZm9yIHRoZSByZXF1ZXN0LlxuICogQHBhcmFtIHVybCBDdXN0b20gZW5kcG9pbnQgVVJMLlxuICogQHJldHVybnMgUHJvbWlzZSB3aXRoIHRoZSByZXF1ZXN0IHJlc3BvbnNlIChJT0F1dGgyUGFyYW1ldGVycyBvciBlcnJvcilcbiAqL1xuZXhwb3J0IGNvbnN0IF90b2tlbiA9IGFzeW5jIChcbiAgICByZXF1ZXN0OiBIdHRwQ2xpZW50LFxuICAgIGNvbmZpZzogSU9BdXRoMkNvbmZpZywgLy8gUGFzc2VkIGJ5IHJlZmVyZW5jZSBhbmQgdXBkYXRlZCAoY29uZmlndXJhdGlvbi5wYXJhbWV0ZXJzKVxuICAgIGN1c3RvbVBhcmFtZXRlcnMgPSA8Y3VzdG9tUGFyYW1ldGVyc1R5cGU+e30sXG4gICAgdXJsPzogc3RyaW5nXG4pID0+IHtcbiAgICAvLyBDb25maWd1cmF0aW9uIG9wdGlvbnNcbiAgICBjb25zdCB0ZXN0ID0gY29uZmlnLmNvbmZpZ3VyYXRpb24/LnRlc3Q7XG4gICAgY29uc3Qgc3RvcmFnZSA9IGNvbmZpZy5jb25maWd1cmF0aW9uPy5zdG9yYWdlO1xuICAgIGNvbnN0IG5vX3BrY2UgPSAhIWNvbmZpZy5jb25maWd1cmF0aW9uPy5ub19wa2NlO1xuICAgIC8vIE1ldGFkYXRhIGZpZWxkc1xuICAgIGNvbnN0IHRva2VuX2VuZHBvaW50ID0gY29uZmlnPy5tZXRhZGF0YT8udG9rZW5fZW5kcG9pbnQ7XG4gICAgLy8gdXJsXG4gICAgdXJsID8/PSB0b2tlbl9lbmRwb2ludCA/PyBcIlwiO1xuICAgIC8vIEVuZHBvaW50IHBhcmFtZXRlcnNcbiAgICBjb25zdCBwYXJtcyA9IF9zZXRQYXJhbWV0ZXJzKHtcbiAgICAgICAgLi4uZ2V0UGFyYW1ldGVycyhcInRva2VuXCIsIGNvbmZpZyksXG4gICAgICAgIC4uLmN1c3RvbVBhcmFtZXRlcnMsXG4gICAgfSk7XG4gICAgY29uc3QgZ3JhbnRfdHlwZSA9IHBhcm1zW1wiZ3JhbnRfdHlwZVwiXTtcblxuICAgIHNldFN0b3JlKFwidGVzdFwiLCBzdG9yYWdlICYmIHRlc3QgPyB7fSA6IG51bGwpO1xuXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAgIC8vXG4gICAgLy8gRXJyb3JzICYgd2FybmluZ3NcbiAgICAvL1xuXG4gICAgaWYgKCF1cmwpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgIGBNaXNzaW5nIFZhbHVlIOKAi+KAi2ZvciBtZXRhZGF0YSBmaWVsZCAndG9rZW5fZW5kcG9pbnQnIG9yIG9wdGlvbiAndXJsJy5gLFxuICAgICAgICAgICAgeyBjYXVzZTogYG9hdXRoMiB0b2tlbiAke2dyYW50X3R5cGV9YCB9XG4gICAgICAgICk7XG5cbiAgICBpZiAoIWdyYW50X3R5cGUpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgIGBNaXNzaW5nIHZhbHVlIOKAi+KAi2ZvciBjb25maWd1cmF0aW9uIHBhcmFtZXRlciAnZ3JhbnRfdHlwZScuYCxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjYXVzZTogYG9hdXRoMiB0b2tlbmAsXG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG5cbiAgICAvL1xuICAgIC8vIEVuZCBvZiBlcnJvcnMgJiB3YXJuaW5nc1xuICAgIC8vXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAgIC8vXG4gICAgLy8gTW9kaWZ5IGVuZHBvaW50IHBhcmFtZXRlcnMgYmFzZWQgb24gdGhlIHZhbHVlcyDigIvigItvZiBvdGhlciBwYXJhbWV0ZXJzXG4gICAgLy8gICAgICBhbmQgY29uZmlndXJhdGlvbiBvcHRpb25zXG4gICAgLy9cblxuICAgIGlmIChncmFudF90eXBlID09IFwiYXV0aG9yaXphdGlvbl9jb2RlXCIpIHtcbiAgICAgICAgZGVsZXRlIHBhcm1zW1wiYXNzZXJ0aW9uXCJdO1xuICAgICAgICBkZWxldGUgcGFybXNbXCJkZXZpY2VfY29kZVwiXTtcbiAgICAgICAgZGVsZXRlIHBhcm1zW1wicmVmcmVzaF90b2tlblwiXTtcblxuICAgICAgICBpZiAoIW5vX3BrY2UpIHtcbiAgICAgICAgICAgIC8vIFwiY29kZV92ZXJpZmllclwiIGlzIGZvciBvbmx5IG9uZSB1c2VcbiAgICAgICAgICAgIGRlbGV0ZSBjb25maWcudG9rZW4/LltcImNvZGVfdmVyaWZpZXJcIl07XG4gICAgICAgICAgICBkZWxldGUgY29uZmlnLnBhcmFtZXRlcnM/LmNvZGVfdmVyaWZpZXI7XG5cbiAgICAgICAgICAgIGNvbnN0IGlkX3Rva2VuID0gY29uZmlnLnBhcmFtZXRlcnM/LmlkX3Rva2VuO1xuXG4gICAgICAgICAgICBzZXRTdG9yZShcbiAgICAgICAgICAgICAgICBcImNvbmZpZ1wiLFxuICAgICAgICAgICAgICAgIHN0b3JhZ2VcbiAgICAgICAgICAgICAgICAgICAgPyBjb25maWdcbiAgICAgICAgICAgICAgICAgICAgOiBudWxsXG4gICAgICAgICAgICApO1xuXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoZ3JhbnRfdHlwZSA9PSBcInJlZnJlc2hfdG9rZW5cIikge1xuICAgICAgICBkZWxldGUgcGFybXNbXCJhc3NlcnRpb25cIl07XG4gICAgICAgIGRlbGV0ZSBwYXJtc1tcImNvZGVcIl07XG4gICAgICAgIGRlbGV0ZSBwYXJtc1tcImNvZGVfdmVyaWZpZXJcIl07XG4gICAgICAgIGRlbGV0ZSBwYXJtc1tcImRldmljZV9jb2RlXCJdO1xuICAgIH1cblxuICAgIGlmIChub19wa2NlKSB7XG4gICAgICAgIGRlbGV0ZSBwYXJtc1tcImNvZGVfdmVyaWZpZXJcIl07XG4gICAgfVxuXG4gICAgLy9cbiAgICAvLyBFbmQgb2YgbW9kaWZ5aW5nIGVuZHBvaW50IHBhcmFtZXRlcnNcbiAgICAvL1xuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuICAgIHJldHVybiBmblJlcXVlc3Q8SU9BdXRoMlBhcmFtZXRlcnM+KFxuICAgICAgICBcIlBPU1RcIixcbiAgICAgICAgdXJsLFxuICAgICAgICByZXF1ZXN0LFxuICAgICAgICBjb25maWcsXG4gICAgICAgIHBhcm1zLFxuICAgICAgICBcInRva2VuXCJcbiAgICApO1xufTtcbiJdfQ==