import { request as fnRequest } from "./_request";
import { getParameters } from "./_getParameters";
import { setStore } from "./_store";
import { _setParameters } from "./_setParameters";
/**
 * Access token revocation within configuration. If the parameter token_type_hint
 *   is equal to 'refresh_token' and the refresh_token exists, it is revoked. Default
 *   revokes access token; otherwise, the refresh token. You can indicate the option token,
 *   access_token or update_token.
 *
 * @param request HttpClient object
 * @param config Configuration object saved in memory. Passed by reference and
 *      could be updated (configuration.parameters)
 * @param customParameters Custom parameters for the request.
 * @param url Custom endpoint URL.
 * @returns Promise with the request response (IOAuth2Parameters or error)
 */
export const _revocation = async (request, config, // Passed by reference and could be updated (configuration.parameters)
customParameters = {}, url) => {
    // Configuration options
    const test = config.configuration?.test;
    const storage = config.configuration?.storage;
    // Metadata fields
    const revocation_endpoint = config.metadata?.revocation_endpoint;
    // url
    url ??= revocation_endpoint ?? "";
    // Endpoint parameters
    const parms = _setParameters({
        ...getParameters("revocation", config),
        ...customParameters,
    });
    const token_type_hint = parms["token_type_hint"];
    const access_token = parms["access_token"];
    const refresh_token = parms["refresh_token"];
    let token = parms["token"];
    setStore("test", storage && test ? {} : null);
    ///////////////////////////////////////////////////////////////////
    //
    // Errors & warnings
    //
    if (!url)
        throw new Error(`Missing value for option 'url' or metadata field 'revocation_endpoint'.`, { cause: "oauth2 revocation" });
    //
    // End of errors & warnings
    //
    ///////////////////////////////////////////////////////////////////
    //
    // Modify endpoint parameters based on the values ​​of other parameters
    //      and configuration options
    //
    // TOKEN & ACCESS_TOKEN & REFRESH_TOKEN
    delete parms["access_token"];
    delete parms["refresh_token"];
    token =
        parms["token"] ??
            (!token_type_hint
                ? undefined
                : token_type_hint == "refresh_token"
                    ? refresh_token
                    : access_token) ??
            (!token_type_hint ? access_token ?? refresh_token : undefined);
    // TOKEN ERRORS
    if (token_type_hint && !token)
        throw new Error(`The token indicated by the token_type_hint is missing.`, { cause: "oauth2 revocation" });
    if (!token)
        throw new Error(`Missing value for parameters 'token' or 'access_token' or 'refresh_token'.`, { cause: "oauth2 revocation" });
    //
    // End of modifying endpoint parameters
    //
    ///////////////////////////////////////////////////////////////////
    return fnRequest("POST", url, request, config, token ? { ...parms, token } : parms, "revocation");
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiX3Jldm9jYXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wcm9qZWN0cy9uZ3gtb2F1dGgyLW9pZGMvc3JjL2xpYi9fcmV2b2NhdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFNQSxPQUFPLEVBQUUsT0FBTyxJQUFJLFNBQVMsRUFBQyxNQUFNLFlBQVksQ0FBQztBQUVqRCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFDakQsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUNwQyxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFFbEQ7Ozs7Ozs7Ozs7OztHQVlHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sV0FBVyxHQUFHLEtBQUssRUFDNUIsT0FBbUIsRUFDbkIsTUFBcUIsRUFBRSxzRUFBc0U7QUFDN0YsbUJBQXlDLEVBQUUsRUFDM0MsR0FBWSxFQUNkLEVBQUU7SUFDQSx3QkFBd0I7SUFDeEIsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUM7SUFDeEMsTUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLGFBQWEsRUFBRSxPQUFPLENBQUM7SUFDOUMsa0JBQWtCO0lBQ2xCLE1BQU0sbUJBQW1CLEdBQUcsTUFBTSxDQUFDLFFBQVEsRUFBRSxtQkFBbUIsQ0FBQztJQUNqRSxNQUFNO0lBQ04sR0FBRyxLQUFLLG1CQUFtQixJQUFJLEVBQUUsQ0FBQztJQUNsQyxzQkFBc0I7SUFDdEIsTUFBTSxLQUFLLEdBQUcsY0FBYyxDQUFDO1FBQ3pCLEdBQUcsYUFBYSxDQUFDLFlBQVksRUFBRSxNQUFNLENBQUM7UUFDdEMsR0FBRyxnQkFBZ0I7S0FDdEIsQ0FBQyxDQUFDO0lBQ0gsTUFBTSxlQUFlLEdBQUcsS0FBSyxDQUFDLGlCQUFpQixDQUFDLENBQUM7SUFDakQsTUFBTSxZQUFZLEdBQUcsS0FBSyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBQzNDLE1BQU0sYUFBYSxHQUFHLEtBQUssQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUM3QyxJQUFJLEtBQUssR0FBRyxLQUFLLENBQUMsT0FBTyxDQUE4QixDQUFDO0lBRXhELFFBQVEsQ0FBQyxNQUFNLEVBQUUsT0FBTyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUU5QyxtRUFBbUU7SUFDbkUsRUFBRTtJQUNGLG9CQUFvQjtJQUNwQixFQUFFO0lBRUYsSUFBSSxDQUFDLEdBQUc7UUFDSixNQUFNLElBQUksS0FBSyxDQUNYLHlFQUF5RSxFQUN6RSxFQUFFLEtBQUssRUFBRSxtQkFBbUIsRUFBRSxDQUNqQyxDQUFDO0lBRU4sRUFBRTtJQUNGLDJCQUEyQjtJQUMzQixFQUFFO0lBQ0YsbUVBQW1FO0lBQ25FLEVBQUU7SUFDRix1RUFBdUU7SUFDdkUsaUNBQWlDO0lBQ2pDLEVBQUU7SUFFRix1Q0FBdUM7SUFFdkMsT0FBTyxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUM7SUFDN0IsT0FBTyxLQUFLLENBQUMsZUFBZSxDQUFDLENBQUM7SUFDOUIsS0FBSztRQUNELEtBQUssQ0FBQyxPQUFPLENBQUM7WUFDZCxDQUFDLENBQUMsZUFBZTtnQkFDYixDQUFDLENBQUMsU0FBUztnQkFDWCxDQUFDLENBQUMsZUFBZSxJQUFJLGVBQWU7b0JBQ3BDLENBQUMsQ0FBQyxhQUFhO29CQUNmLENBQUMsQ0FBQyxZQUFZLENBQUM7WUFDbkIsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsWUFBWSxJQUFJLGFBQWEsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUM7SUFFbkUsZUFBZTtJQUVmLElBQUksZUFBZSxJQUFJLENBQUMsS0FBSztRQUN6QixNQUFNLElBQUksS0FBSyxDQUNYLHdEQUF3RCxFQUN4RCxFQUFFLEtBQUssRUFBRSxtQkFBbUIsRUFBRSxDQUNqQyxDQUFDO0lBRU4sSUFBSSxDQUFDLEtBQUs7UUFDTixNQUFNLElBQUksS0FBSyxDQUNYLDRFQUE0RSxFQUM1RSxFQUFFLEtBQUssRUFBRSxtQkFBbUIsRUFBRSxDQUNqQyxDQUFDO0lBRU4sRUFBRTtJQUNGLHVDQUF1QztJQUN2QyxFQUFFO0lBQ0YsbUVBQW1FO0lBRW5FLE9BQU8sU0FBUyxDQUNaLE1BQU0sRUFDTixHQUFHLEVBQ0gsT0FBTyxFQUNQLE1BQU0sRUFDTixLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxLQUFLLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFDbkMsWUFBWSxDQUNmLENBQUM7QUFDTixDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICAgIElPQXV0aDJDb25maWcsXG4gICAgSU9BdXRoMlBhcmFtZXRlcnMsXG4gICAgY3VzdG9tUGFyYW1ldGVyc1R5cGUsXG4gICAgcGFyYW1ldGVyVHlwZSxcbn0gZnJvbSBcIi4uL2RvbWFpblwiO1xuaW1wb3J0IHsgcmVxdWVzdCBhcyBmblJlcXVlc3R9IGZyb20gXCIuL19yZXF1ZXN0XCI7XG5pbXBvcnQgeyBIdHRwQ2xpZW50IH0gZnJvbSBcIkBhbmd1bGFyL2NvbW1vbi9odHRwXCI7XG5pbXBvcnQgeyBnZXRQYXJhbWV0ZXJzIH0gZnJvbSBcIi4vX2dldFBhcmFtZXRlcnNcIjtcbmltcG9ydCB7IHNldFN0b3JlIH0gZnJvbSBcIi4vX3N0b3JlXCI7XG5pbXBvcnQgeyBfc2V0UGFyYW1ldGVycyB9IGZyb20gXCIuL19zZXRQYXJhbWV0ZXJzXCI7XG5cbi8qKlxuICogQWNjZXNzIHRva2VuIHJldm9jYXRpb24gd2l0aGluIGNvbmZpZ3VyYXRpb24uIElmIHRoZSBwYXJhbWV0ZXIgdG9rZW5fdHlwZV9oaW50XG4gKiAgIGlzIGVxdWFsIHRvICdyZWZyZXNoX3Rva2VuJyBhbmQgdGhlIHJlZnJlc2hfdG9rZW4gZXhpc3RzLCBpdCBpcyByZXZva2VkLiBEZWZhdWx0XG4gKiAgIHJldm9rZXMgYWNjZXNzIHRva2VuOyBvdGhlcndpc2UsIHRoZSByZWZyZXNoIHRva2VuLiBZb3UgY2FuIGluZGljYXRlIHRoZSBvcHRpb24gdG9rZW4sXG4gKiAgIGFjY2Vzc190b2tlbiBvciB1cGRhdGVfdG9rZW4uXG4gKlxuICogQHBhcmFtIHJlcXVlc3QgSHR0cENsaWVudCBvYmplY3RcbiAqIEBwYXJhbSBjb25maWcgQ29uZmlndXJhdGlvbiBvYmplY3Qgc2F2ZWQgaW4gbWVtb3J5LiBQYXNzZWQgYnkgcmVmZXJlbmNlIGFuZFxuICogICAgICBjb3VsZCBiZSB1cGRhdGVkIChjb25maWd1cmF0aW9uLnBhcmFtZXRlcnMpXG4gKiBAcGFyYW0gY3VzdG9tUGFyYW1ldGVycyBDdXN0b20gcGFyYW1ldGVycyBmb3IgdGhlIHJlcXVlc3QuXG4gKiBAcGFyYW0gdXJsIEN1c3RvbSBlbmRwb2ludCBVUkwuXG4gKiBAcmV0dXJucyBQcm9taXNlIHdpdGggdGhlIHJlcXVlc3QgcmVzcG9uc2UgKElPQXV0aDJQYXJhbWV0ZXJzIG9yIGVycm9yKVxuICovXG5leHBvcnQgY29uc3QgX3Jldm9jYXRpb24gPSBhc3luYyAoXG4gICAgcmVxdWVzdDogSHR0cENsaWVudCxcbiAgICBjb25maWc6IElPQXV0aDJDb25maWcsIC8vIFBhc3NlZCBieSByZWZlcmVuY2UgYW5kIGNvdWxkIGJlIHVwZGF0ZWQgKGNvbmZpZ3VyYXRpb24ucGFyYW1ldGVycylcbiAgICBjdXN0b21QYXJhbWV0ZXJzID0gPGN1c3RvbVBhcmFtZXRlcnNUeXBlPnt9LFxuICAgIHVybD86IHN0cmluZ1xuKSA9PiB7XG4gICAgLy8gQ29uZmlndXJhdGlvbiBvcHRpb25zXG4gICAgY29uc3QgdGVzdCA9IGNvbmZpZy5jb25maWd1cmF0aW9uPy50ZXN0O1xuICAgIGNvbnN0IHN0b3JhZ2UgPSBjb25maWcuY29uZmlndXJhdGlvbj8uc3RvcmFnZTtcbiAgICAvLyBNZXRhZGF0YSBmaWVsZHNcbiAgICBjb25zdCByZXZvY2F0aW9uX2VuZHBvaW50ID0gY29uZmlnLm1ldGFkYXRhPy5yZXZvY2F0aW9uX2VuZHBvaW50O1xuICAgIC8vIHVybFxuICAgIHVybCA/Pz0gcmV2b2NhdGlvbl9lbmRwb2ludCA/PyBcIlwiO1xuICAgIC8vIEVuZHBvaW50IHBhcmFtZXRlcnNcbiAgICBjb25zdCBwYXJtcyA9IF9zZXRQYXJhbWV0ZXJzKHtcbiAgICAgICAgLi4uZ2V0UGFyYW1ldGVycyhcInJldm9jYXRpb25cIiwgY29uZmlnKSxcbiAgICAgICAgLi4uY3VzdG9tUGFyYW1ldGVycyxcbiAgICB9KTtcbiAgICBjb25zdCB0b2tlbl90eXBlX2hpbnQgPSBwYXJtc1tcInRva2VuX3R5cGVfaGludFwiXTtcbiAgICBjb25zdCBhY2Nlc3NfdG9rZW4gPSBwYXJtc1tcImFjY2Vzc190b2tlblwiXTtcbiAgICBjb25zdCByZWZyZXNoX3Rva2VuID0gcGFybXNbXCJyZWZyZXNoX3Rva2VuXCJdO1xuICAgIGxldCB0b2tlbiA9IHBhcm1zW1widG9rZW5cIl0gYXMgcGFyYW1ldGVyVHlwZSB8IHVuZGVmaW5lZDtcblxuICAgIHNldFN0b3JlKFwidGVzdFwiLCBzdG9yYWdlICYmIHRlc3QgPyB7fSA6IG51bGwpO1xuXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAgIC8vXG4gICAgLy8gRXJyb3JzICYgd2FybmluZ3NcbiAgICAvL1xuXG4gICAgaWYgKCF1cmwpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgIGBNaXNzaW5nIHZhbHVlIGZvciBvcHRpb24gJ3VybCcgb3IgbWV0YWRhdGEgZmllbGQgJ3Jldm9jYXRpb25fZW5kcG9pbnQnLmAsXG4gICAgICAgICAgICB7IGNhdXNlOiBcIm9hdXRoMiByZXZvY2F0aW9uXCIgfVxuICAgICAgICApO1xuXG4gICAgLy9cbiAgICAvLyBFbmQgb2YgZXJyb3JzICYgd2FybmluZ3NcbiAgICAvL1xuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgICAvL1xuICAgIC8vIE1vZGlmeSBlbmRwb2ludCBwYXJhbWV0ZXJzIGJhc2VkIG9uIHRoZSB2YWx1ZXMg4oCL4oCLb2Ygb3RoZXIgcGFyYW1ldGVyc1xuICAgIC8vICAgICAgYW5kIGNvbmZpZ3VyYXRpb24gb3B0aW9uc1xuICAgIC8vXG5cbiAgICAvLyBUT0tFTiAmIEFDQ0VTU19UT0tFTiAmIFJFRlJFU0hfVE9LRU5cblxuICAgIGRlbGV0ZSBwYXJtc1tcImFjY2Vzc190b2tlblwiXTtcbiAgICBkZWxldGUgcGFybXNbXCJyZWZyZXNoX3Rva2VuXCJdO1xuICAgIHRva2VuID1cbiAgICAgICAgcGFybXNbXCJ0b2tlblwiXSA/P1xuICAgICAgICAoIXRva2VuX3R5cGVfaGludFxuICAgICAgICAgICAgPyB1bmRlZmluZWRcbiAgICAgICAgICAgIDogdG9rZW5fdHlwZV9oaW50ID09IFwicmVmcmVzaF90b2tlblwiXG4gICAgICAgICAgICA/IHJlZnJlc2hfdG9rZW5cbiAgICAgICAgICAgIDogYWNjZXNzX3Rva2VuKSA/P1xuICAgICAgICAoIXRva2VuX3R5cGVfaGludCA/IGFjY2Vzc190b2tlbiA/PyByZWZyZXNoX3Rva2VuIDogdW5kZWZpbmVkKTtcblxuICAgIC8vIFRPS0VOIEVSUk9SU1xuXG4gICAgaWYgKHRva2VuX3R5cGVfaGludCAmJiAhdG9rZW4pXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgIGBUaGUgdG9rZW4gaW5kaWNhdGVkIGJ5IHRoZSB0b2tlbl90eXBlX2hpbnQgaXMgbWlzc2luZy5gLFxuICAgICAgICAgICAgeyBjYXVzZTogXCJvYXV0aDIgcmV2b2NhdGlvblwiIH1cbiAgICAgICAgKTtcblxuICAgIGlmICghdG9rZW4pXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgIGBNaXNzaW5nIHZhbHVlIGZvciBwYXJhbWV0ZXJzICd0b2tlbicgb3IgJ2FjY2Vzc190b2tlbicgb3IgJ3JlZnJlc2hfdG9rZW4nLmAsXG4gICAgICAgICAgICB7IGNhdXNlOiBcIm9hdXRoMiByZXZvY2F0aW9uXCIgfVxuICAgICAgICApO1xuXG4gICAgLy9cbiAgICAvLyBFbmQgb2YgbW9kaWZ5aW5nIGVuZHBvaW50IHBhcmFtZXRlcnNcbiAgICAvL1xuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuICAgIHJldHVybiBmblJlcXVlc3Q8SU9BdXRoMlBhcmFtZXRlcnM+KFxuICAgICAgICBcIlBPU1RcIixcbiAgICAgICAgdXJsLFxuICAgICAgICByZXF1ZXN0LFxuICAgICAgICBjb25maWcsXG4gICAgICAgIHRva2VuID8geyAuLi5wYXJtcywgdG9rZW4gfSA6IHBhcm1zLFxuICAgICAgICBcInJldm9jYXRpb25cIlxuICAgICk7XG59O1xuIl19