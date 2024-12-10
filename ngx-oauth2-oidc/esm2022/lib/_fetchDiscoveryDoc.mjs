import { mountUrl } from "./_mountUrl";
import { setStore } from "./_store";
import { request as fnRequest } from "./_request";
import { _setParameters } from "./_setParameters";
import { getParameters } from "./_getParameters";
/**
 * Request to the discovery endpoint. Returns the discovery document and saves
 *   the metadata in the configuration object (in memory and storage). HttpClient
 *   get request. In test mode, the request payload is also stored within
 *   sessionStorage.
 *
 * @param request HttpClient object
 * @param config Configuration object saved in memory. Passed by reference and
 *      updated (configuration.metadata)
 * @param customParameters Custom parameters for the request.
 * @param url Custom endpoint URL.
 * @returns Promise with the request response (IOAuth2Metadata or error)
 */
export const _fetchDiscoveryDoc = async (request, config, // Passed by reference and updated (configuration.metadata)
customParameters = {}, url) => {
    // Configuration options
    const test = config.configuration?.test;
    const storage = config.configuration?.storage;
    const discovery_endpoint = config.configuration?.discovery_endpoint;
    const sufix = config.configuration?.well_known_sufix ??
        ".well-known/openid-configuration";
    // Metadata fields
    const issuer = config.metadata?.issuer ?? "";
    // url
    url ??= discovery_endpoint ?? mountUrl(issuer, "https", sufix);
    // Endpoint parameters
    const parms = _setParameters({
        ...getParameters("discovery", config),
        ...customParameters,
    });
    setStore("test", storage && test ? {} : null);
    if (!url)
        throw new Error(`The value of the 'url' option or the 'discovery_endpoint' configuration field or the 'issuer' metadata field is missing.`, {
            cause: `oauth2 fetchDiscoveryDoc`,
        });
    // @ts-expect-error: Until HTMLFencedFrameElement is not experimental
    if (window.HTMLFencedFrameElement) {
        // TODO: Test use when not experimental
    }
    return fnRequest("GET", url, request, config, parms, "discovery");
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiX2ZldGNoRGlzY292ZXJ5RG9jLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vcHJvamVjdHMvbmd4LW9hdXRoMi1vaWRjL3NyYy9saWIvX2ZldGNoRGlzY292ZXJ5RG9jLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFFdkMsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUNwQyxPQUFPLEVBQUUsT0FBTyxJQUFJLFNBQVMsRUFBRSxNQUFNLFlBQVksQ0FBQztBQUNsRCxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFDbEQsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBRWpEOzs7Ozs7Ozs7Ozs7R0FZRztBQUNILE1BQU0sQ0FBQyxNQUFNLGtCQUFrQixHQUFHLEtBQUssRUFDbkMsT0FBbUIsRUFDbkIsTUFBcUIsRUFBRSwyREFBMkQ7QUFDbEYsbUJBQXlDLEVBQUUsRUFDM0MsR0FBWSxFQUNZLEVBQUU7SUFDMUIsd0JBQXdCO0lBQ3hCLE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDO0lBQ3hDLE1BQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxhQUFhLEVBQUUsT0FBTyxDQUFDO0lBQzlDLE1BQU0sa0JBQWtCLEdBQUcsTUFBTSxDQUFDLGFBQWEsRUFBRSxrQkFBa0IsQ0FBQztJQUNwRSxNQUFNLEtBQUssR0FDUCxNQUFNLENBQUMsYUFBYSxFQUFFLGdCQUFnQjtRQUN0QyxrQ0FBa0MsQ0FBQztJQUN2QyxrQkFBa0I7SUFDbEIsTUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLFFBQVEsRUFBRSxNQUFNLElBQUksRUFBRSxDQUFDO0lBQzdDLE1BQU07SUFDTixHQUFHLEtBQUssa0JBQWtCLElBQUksUUFBUSxDQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDL0Qsc0JBQXNCO0lBQ3RCLE1BQU0sS0FBSyxHQUFHLGNBQWMsQ0FBQztRQUN6QixHQUFHLGFBQWEsQ0FBQyxXQUFXLEVBQUUsTUFBTSxDQUFDO1FBQ3JDLEdBQUcsZ0JBQWdCO0tBQ3RCLENBQUMsQ0FBQztJQUVILFFBQVEsQ0FBQyxNQUFNLEVBQUUsT0FBTyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUU5QyxJQUFJLENBQUMsR0FBRztRQUNKLE1BQU0sSUFBSSxLQUFLLENBQ1gsMEhBQTBILEVBQzFIO1lBQ0ksS0FBSyxFQUFFLDBCQUEwQjtTQUNwQyxDQUNKLENBQUM7SUFFTixxRUFBcUU7SUFDckUsSUFBSSxNQUFNLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztRQUNoQyx1Q0FBdUM7SUFDM0MsQ0FBQztJQUVELE9BQU8sU0FBUyxDQUNaLEtBQUssRUFDTCxHQUFHLEVBQ0gsT0FBTyxFQUNQLE1BQU0sRUFDTixLQUFLLEVBQ0wsV0FBVyxDQUNLLENBQUM7QUFDekIsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgY3VzdG9tUGFyYW1ldGVyc1R5cGUsIElPQXV0aDJDb25maWcsIElPQXV0aDJNZXRhZGF0YSB9IGZyb20gXCIuLi9kb21haW5cIjtcbmltcG9ydCB7IG1vdW50VXJsIH0gZnJvbSBcIi4vX21vdW50VXJsXCI7XG5pbXBvcnQgeyBIdHRwQ2xpZW50IH0gZnJvbSBcIkBhbmd1bGFyL2NvbW1vbi9odHRwXCI7XG5pbXBvcnQgeyBzZXRTdG9yZSB9IGZyb20gXCIuL19zdG9yZVwiO1xuaW1wb3J0IHsgcmVxdWVzdCBhcyBmblJlcXVlc3QgfSBmcm9tIFwiLi9fcmVxdWVzdFwiO1xuaW1wb3J0IHsgX3NldFBhcmFtZXRlcnMgfSBmcm9tIFwiLi9fc2V0UGFyYW1ldGVyc1wiO1xuaW1wb3J0IHsgZ2V0UGFyYW1ldGVycyB9IGZyb20gXCIuL19nZXRQYXJhbWV0ZXJzXCI7XG5cbi8qKlxuICogUmVxdWVzdCB0byB0aGUgZGlzY292ZXJ5IGVuZHBvaW50LiBSZXR1cm5zIHRoZSBkaXNjb3ZlcnkgZG9jdW1lbnQgYW5kIHNhdmVzXG4gKiAgIHRoZSBtZXRhZGF0YSBpbiB0aGUgY29uZmlndXJhdGlvbiBvYmplY3QgKGluIG1lbW9yeSBhbmQgc3RvcmFnZSkuIEh0dHBDbGllbnRcbiAqICAgZ2V0IHJlcXVlc3QuIEluIHRlc3QgbW9kZSwgdGhlIHJlcXVlc3QgcGF5bG9hZCBpcyBhbHNvIHN0b3JlZCB3aXRoaW5cbiAqICAgc2Vzc2lvblN0b3JhZ2UuXG4gKlxuICogQHBhcmFtIHJlcXVlc3QgSHR0cENsaWVudCBvYmplY3RcbiAqIEBwYXJhbSBjb25maWcgQ29uZmlndXJhdGlvbiBvYmplY3Qgc2F2ZWQgaW4gbWVtb3J5LiBQYXNzZWQgYnkgcmVmZXJlbmNlIGFuZFxuICogICAgICB1cGRhdGVkIChjb25maWd1cmF0aW9uLm1ldGFkYXRhKVxuICogQHBhcmFtIGN1c3RvbVBhcmFtZXRlcnMgQ3VzdG9tIHBhcmFtZXRlcnMgZm9yIHRoZSByZXF1ZXN0LlxuICogQHBhcmFtIHVybCBDdXN0b20gZW5kcG9pbnQgVVJMLlxuICogQHJldHVybnMgUHJvbWlzZSB3aXRoIHRoZSByZXF1ZXN0IHJlc3BvbnNlIChJT0F1dGgyTWV0YWRhdGEgb3IgZXJyb3IpXG4gKi9cbmV4cG9ydCBjb25zdCBfZmV0Y2hEaXNjb3ZlcnlEb2MgPSBhc3luYyAoXG4gICAgcmVxdWVzdDogSHR0cENsaWVudCxcbiAgICBjb25maWc6IElPQXV0aDJDb25maWcsIC8vIFBhc3NlZCBieSByZWZlcmVuY2UgYW5kIHVwZGF0ZWQgKGNvbmZpZ3VyYXRpb24ubWV0YWRhdGEpXG4gICAgY3VzdG9tUGFyYW1ldGVycyA9IDxjdXN0b21QYXJhbWV0ZXJzVHlwZT57fSxcbiAgICB1cmw/OiBzdHJpbmdcbik6IFByb21pc2U8SU9BdXRoMk1ldGFkYXRhPiA9PiB7XG4gICAgLy8gQ29uZmlndXJhdGlvbiBvcHRpb25zXG4gICAgY29uc3QgdGVzdCA9IGNvbmZpZy5jb25maWd1cmF0aW9uPy50ZXN0O1xuICAgIGNvbnN0IHN0b3JhZ2UgPSBjb25maWcuY29uZmlndXJhdGlvbj8uc3RvcmFnZTtcbiAgICBjb25zdCBkaXNjb3ZlcnlfZW5kcG9pbnQgPSBjb25maWcuY29uZmlndXJhdGlvbj8uZGlzY292ZXJ5X2VuZHBvaW50O1xuICAgIGNvbnN0IHN1Zml4ID1cbiAgICAgICAgY29uZmlnLmNvbmZpZ3VyYXRpb24/LndlbGxfa25vd25fc3VmaXggPz9cbiAgICAgICAgXCIud2VsbC1rbm93bi9vcGVuaWQtY29uZmlndXJhdGlvblwiO1xuICAgIC8vIE1ldGFkYXRhIGZpZWxkc1xuICAgIGNvbnN0IGlzc3VlciA9IGNvbmZpZy5tZXRhZGF0YT8uaXNzdWVyID8/IFwiXCI7XG4gICAgLy8gdXJsXG4gICAgdXJsID8/PSBkaXNjb3ZlcnlfZW5kcG9pbnQgPz8gbW91bnRVcmwoaXNzdWVyLCBcImh0dHBzXCIsIHN1Zml4KTtcbiAgICAvLyBFbmRwb2ludCBwYXJhbWV0ZXJzXG4gICAgY29uc3QgcGFybXMgPSBfc2V0UGFyYW1ldGVycyh7XG4gICAgICAgIC4uLmdldFBhcmFtZXRlcnMoXCJkaXNjb3ZlcnlcIiwgY29uZmlnKSxcbiAgICAgICAgLi4uY3VzdG9tUGFyYW1ldGVycyxcbiAgICB9KTtcblxuICAgIHNldFN0b3JlKFwidGVzdFwiLCBzdG9yYWdlICYmIHRlc3QgPyB7fSA6IG51bGwpO1xuXG4gICAgaWYgKCF1cmwpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgIGBUaGUgdmFsdWUgb2YgdGhlICd1cmwnIG9wdGlvbiBvciB0aGUgJ2Rpc2NvdmVyeV9lbmRwb2ludCcgY29uZmlndXJhdGlvbiBmaWVsZCBvciB0aGUgJ2lzc3VlcicgbWV0YWRhdGEgZmllbGQgaXMgbWlzc2luZy5gLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGNhdXNlOiBgb2F1dGgyIGZldGNoRGlzY292ZXJ5RG9jYCxcbiAgICAgICAgICAgIH1cbiAgICAgICAgKTtcblxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3I6IFVudGlsIEhUTUxGZW5jZWRGcmFtZUVsZW1lbnQgaXMgbm90IGV4cGVyaW1lbnRhbFxuICAgIGlmICh3aW5kb3cuSFRNTEZlbmNlZEZyYW1lRWxlbWVudCkge1xuICAgICAgICAvLyBUT0RPOiBUZXN0IHVzZSB3aGVuIG5vdCBleHBlcmltZW50YWxcbiAgICB9XG5cbiAgICByZXR1cm4gZm5SZXF1ZXN0KFxuICAgICAgICBcIkdFVFwiLFxuICAgICAgICB1cmwsXG4gICAgICAgIHJlcXVlc3QsXG4gICAgICAgIGNvbmZpZyxcbiAgICAgICAgcGFybXMsXG4gICAgICAgIFwiZGlzY292ZXJ5XCJcbiAgICApIGFzIElPQXV0aDJNZXRhZGF0YTtcbn07XG4iXX0=