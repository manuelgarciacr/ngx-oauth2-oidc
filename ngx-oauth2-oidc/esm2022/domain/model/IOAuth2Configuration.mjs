/** Configuration object */
const configuration = {
    /** File tag */
    tag: "",
    /**
     * Authorizationn grant values:
     *
     *  'code': Authorization code grant. Default value.
     *  'implicit': Implicit grant,
     *  'hybrid': Code and implicit mixed grant,
     *  'free: Parameters are not modified by the configuration options (config.configuration)
     *      or by other parameters.
     *
     */
    authorization_grant: "",
    /**
     * If true, discovery document is not fetched. Default is false.
     */
    // no_discovery: false,
    /**
     * If true, the service will not use PKCE support. Default is false.
     */
    no_pkce: false,
    /**
     * If true, the service will not use the oauth2 parameter "state". Default is false.
     */
    no_state: false,
    /**
     * If true, the service will have access to the storage. Default is false.
     */
    storage: false,
    /**
     * If true, the methods return the request parameters along with the response.
     */
    test: false,
    /**
     * If true, the revocation endpoint includes the the token in the authorization
     *  header. Default is false.
     */
    revocation_header: false,
    /**
     * Predefined discovery document URI.
     */
    discovery_endpoint: "",
    /**
     * Default is ".well-known/openid-configuration". Ignored if
     *      "discovery_endpoint" is defined. Sufix for the default
     *      discovery document URI.
     */
    well_known_sufix: "",
    /**
     * 'Content-Type' header value for GET/POST requests (without HREF
     *      redirection) from endpoints. Default "application/x-www-form-urlencoded".
     */
    content_type: "",
};
/** Option names */
export const configurationOptions = Object.keys(configuration);
/** Authorization grant values */
export const authorizationGrantValues = [
    "code", "implicit", "hybrid", "free"
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSU9BdXRoMkNvbmZpZ3VyYXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9uZ3gtb2F1dGgyLW9pZGMvc3JjL2RvbWFpbi9tb2RlbC9JT0F1dGgyQ29uZmlndXJhdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSwyQkFBMkI7QUFDM0IsTUFBTSxhQUFhLEdBQUc7SUFDbEIsZUFBZTtJQUNmLEdBQUcsRUFBRSxFQUFFO0lBRVA7Ozs7Ozs7OztPQVNHO0lBQ0gsbUJBQW1CLEVBQUUsRUFBNEI7SUFFakQ7O09BRUc7SUFDSCx1QkFBdUI7SUFFdkI7O09BRUc7SUFDSCxPQUFPLEVBQUUsS0FBSztJQUVkOztPQUVHO0lBQ0gsUUFBUSxFQUFFLEtBQUs7SUFFZjs7T0FFRztJQUNILE9BQU8sRUFBRSxLQUFLO0lBRWQ7O09BRUc7SUFDSCxJQUFJLEVBQUUsS0FBSztJQUVYOzs7T0FHRztJQUNILGlCQUFpQixFQUFFLEtBQUs7SUFFeEI7O09BRUc7SUFDSCxrQkFBa0IsRUFBRSxFQUFFO0lBRXRCOzs7O09BSUc7SUFDSCxnQkFBZ0IsRUFBRSxFQUFFO0lBRXBCOzs7T0FHRztJQUNILFlBQVksRUFBRSxFQUFFO0NBQ25CLENBQUM7QUFLRixtQkFBbUI7QUFDbkIsTUFBTSxDQUFDLE1BQU0sb0JBQW9CLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUUvRCxpQ0FBaUM7QUFDakMsTUFBTSxDQUFDLE1BQU0sd0JBQXdCLEdBQUc7SUFDcEMsTUFBTSxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsTUFBTTtDQUM5QixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgYXV0aG9yaXphdGlvbkdyYW50VHlwZSB9IGZyb20gXCIuLlwiO1xuXG4vKiogQ29uZmlndXJhdGlvbiBvYmplY3QgKi9cbmNvbnN0IGNvbmZpZ3VyYXRpb24gPSB7XG4gICAgLyoqIEZpbGUgdGFnICovXG4gICAgdGFnOiBcIlwiLFxuXG4gICAgLyoqXG4gICAgICogQXV0aG9yaXphdGlvbm4gZ3JhbnQgdmFsdWVzOlxuICAgICAqXG4gICAgICogICdjb2RlJzogQXV0aG9yaXphdGlvbiBjb2RlIGdyYW50LiBEZWZhdWx0IHZhbHVlLlxuICAgICAqICAnaW1wbGljaXQnOiBJbXBsaWNpdCBncmFudCxcbiAgICAgKiAgJ2h5YnJpZCc6IENvZGUgYW5kIGltcGxpY2l0IG1peGVkIGdyYW50LFxuICAgICAqICAnZnJlZTogUGFyYW1ldGVycyBhcmUgbm90IG1vZGlmaWVkIGJ5IHRoZSBjb25maWd1cmF0aW9uIG9wdGlvbnMgKGNvbmZpZy5jb25maWd1cmF0aW9uKVxuICAgICAqICAgICAgb3IgYnkgb3RoZXIgcGFyYW1ldGVycy5cbiAgICAgKlxuICAgICAqL1xuICAgIGF1dGhvcml6YXRpb25fZ3JhbnQ6IFwiXCIgYXMgYXV0aG9yaXphdGlvbkdyYW50VHlwZSxcblxuICAgIC8qKlxuICAgICAqIElmIHRydWUsIGRpc2NvdmVyeSBkb2N1bWVudCBpcyBub3QgZmV0Y2hlZC4gRGVmYXVsdCBpcyBmYWxzZS5cbiAgICAgKi9cbiAgICAvLyBub19kaXNjb3Zlcnk6IGZhbHNlLFxuXG4gICAgLyoqXG4gICAgICogSWYgdHJ1ZSwgdGhlIHNlcnZpY2Ugd2lsbCBub3QgdXNlIFBLQ0Ugc3VwcG9ydC4gRGVmYXVsdCBpcyBmYWxzZS5cbiAgICAgKi9cbiAgICBub19wa2NlOiBmYWxzZSxcblxuICAgIC8qKlxuICAgICAqIElmIHRydWUsIHRoZSBzZXJ2aWNlIHdpbGwgbm90IHVzZSB0aGUgb2F1dGgyIHBhcmFtZXRlciBcInN0YXRlXCIuIERlZmF1bHQgaXMgZmFsc2UuXG4gICAgICovXG4gICAgbm9fc3RhdGU6IGZhbHNlLFxuXG4gICAgLyoqXG4gICAgICogSWYgdHJ1ZSwgdGhlIHNlcnZpY2Ugd2lsbCBoYXZlIGFjY2VzcyB0byB0aGUgc3RvcmFnZS4gRGVmYXVsdCBpcyBmYWxzZS5cbiAgICAgKi9cbiAgICBzdG9yYWdlOiBmYWxzZSxcblxuICAgIC8qKlxuICAgICAqIElmIHRydWUsIHRoZSBtZXRob2RzIHJldHVybiB0aGUgcmVxdWVzdCBwYXJhbWV0ZXJzIGFsb25nIHdpdGggdGhlIHJlc3BvbnNlLlxuICAgICAqL1xuICAgIHRlc3Q6IGZhbHNlLFxuXG4gICAgLyoqXG4gICAgICogSWYgdHJ1ZSwgdGhlIHJldm9jYXRpb24gZW5kcG9pbnQgaW5jbHVkZXMgdGhlIHRoZSB0b2tlbiBpbiB0aGUgYXV0aG9yaXphdGlvblxuICAgICAqICBoZWFkZXIuIERlZmF1bHQgaXMgZmFsc2UuXG4gICAgICovXG4gICAgcmV2b2NhdGlvbl9oZWFkZXI6IGZhbHNlLFxuXG4gICAgLyoqXG4gICAgICogUHJlZGVmaW5lZCBkaXNjb3ZlcnkgZG9jdW1lbnQgVVJJLlxuICAgICAqL1xuICAgIGRpc2NvdmVyeV9lbmRwb2ludDogXCJcIixcblxuICAgIC8qKlxuICAgICAqIERlZmF1bHQgaXMgXCIud2VsbC1rbm93bi9vcGVuaWQtY29uZmlndXJhdGlvblwiLiBJZ25vcmVkIGlmXG4gICAgICogICAgICBcImRpc2NvdmVyeV9lbmRwb2ludFwiIGlzIGRlZmluZWQuIFN1Zml4IGZvciB0aGUgZGVmYXVsdFxuICAgICAqICAgICAgZGlzY292ZXJ5IGRvY3VtZW50IFVSSS5cbiAgICAgKi9cbiAgICB3ZWxsX2tub3duX3N1Zml4OiBcIlwiLFxuXG4gICAgLyoqXG4gICAgICogJ0NvbnRlbnQtVHlwZScgaGVhZGVyIHZhbHVlIGZvciBHRVQvUE9TVCByZXF1ZXN0cyAod2l0aG91dCBIUkVGXG4gICAgICogICAgICByZWRpcmVjdGlvbikgZnJvbSBlbmRwb2ludHMuIERlZmF1bHQgXCJhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWRcIi5cbiAgICAgKi9cbiAgICBjb250ZW50X3R5cGU6IFwiXCIsXG59O1xuXG4vKiogT3B0aW9ucyBvYmplY3QgdHlwZSAqL1xuZXhwb3J0IGludGVyZmFjZSBJT0F1dGgyQ29uZmlndXJhdGlvbiBleHRlbmRzIFBhcnRpYWw8dHlwZW9mIGNvbmZpZ3VyYXRpb24+IHt9XG5cbi8qKiBPcHRpb24gbmFtZXMgKi9cbmV4cG9ydCBjb25zdCBjb25maWd1cmF0aW9uT3B0aW9ucyA9IE9iamVjdC5rZXlzKGNvbmZpZ3VyYXRpb24pO1xuXG4vKiogQXV0aG9yaXphdGlvbiBncmFudCB2YWx1ZXMgKi9cbmV4cG9ydCBjb25zdCBhdXRob3JpemF0aW9uR3JhbnRWYWx1ZXMgPSBbXG4gICAgXCJjb2RlXCIsIFwiaW1wbGljaXRcIiwgXCJoeWJyaWRcIiwgXCJmcmVlXCJcbl0gYXMgY29uc3Q7XG4iXX0=