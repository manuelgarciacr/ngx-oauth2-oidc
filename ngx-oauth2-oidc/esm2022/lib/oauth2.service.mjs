import { setStore } from "./_store";
import { HttpClient, } from "@angular/common/http";
import { Inject, Injectable, InjectionToken, inject } from "@angular/core";
import { _oauth2ConfigFactory } from "./_oauth2ConfigFactory";
import { _interceptor } from "./_interceptor";
import { _verify_token } from "./_verify_token";
import { _fetchDiscoveryDoc } from "./_fetchDiscoveryDoc";
import { _authorization } from "./_authorization";
import { _token } from "./_token";
import { _revocation } from "./_revocation";
import { _errorArray } from "./_errorArray";
import { _setParameters } from "./_setParameters";
import { _api_request } from "./_apiReguest";
import { _save_state } from "./_saveState";
import { _recover_state } from "./_recoverState";
import * as i0 from "@angular/core";
export const OAUTH2_CONFIG_TOKEN = new InjectionToken("OAuth2 Config");
export class Oauth2Service {
    get config() {
        return this._config;
    }
    get idToken() {
        return this._idToken;
    }
    // FLAGS
    get isIdTokenIntercepted() {
        return this._isIdTokenIntercepted;
    }
    get isAccessTokenIntercepted() {
        return this._isAccessTokenIntercepted;
    }
    get isCodeIntercepted() {
        return this._isCodeIntercepted;
    }
    constructor(oauth2Config) {
        this.oauth2Config = oauth2Config;
        this.http = inject(HttpClient);
        this._config = {};
        this._idToken = {}; // Api user id_token claims
        this._isIdTokenIntercepted = false;
        this._isAccessTokenIntercepted = false;
        this._isCodeIntercepted = false;
        this.setConfig = (oauth2Config) => {
            const config = _oauth2ConfigFactory(oauth2Config);
            const storage = config.configuration?.storage;
            this._config = config;
            this._idToken = {};
            if (!storage)
                return;
            setStore("config", storage ? config : null);
            setStore("idToken");
            setStore("test");
            return this.config;
        };
        this.setParameters = (parameters) => {
            const parms = { ...parameters };
            const configParms = { ...this.config.parameters };
            const storage = this.config.configuration?.storage;
            for (const parm in parameters) {
                const key = parm;
                const value = parameters[key];
                if (value === undefined || value === null) {
                    delete configParms[key];
                }
            }
            parameters = _setParameters(parms, "setParameters");
            this._config.parameters = { ...configParms, ...parameters };
            setStore("config", storage ? this.config : null);
        };
        /**
         * Each endpoint uses the parameters defined within the 'parameters' section (config.parameters)
         *      that are applicable to it. Custom endpoint parameters (config.endpoint_name} can
         *      override standard parameters. Inline custom parameters (o auth2Service.endpoint(customParameters, ...) )
         *      can override the configured parameters (standard or custom). An inline parameter with a
         *      null value removes the configured parameter ( oauth2Service.endpoint({parm: null}, ...) ).
         *
         * @param customParameters
         * @param url
         * @returns
         */
        this.fetchDiscoveryDoc = (customParameters = {}, url) => {
            return _fetchDiscoveryDoc(this.http, this._config, // Parameter passed by reference and updated (config.metadata)
            customParameters, url);
        };
        /**
         * Each endpoint uses the parameters defined within the 'parameters' section (config.parameters)
         *      that are applicable to it. Custom endpoint parameters (config.endpoint_name} can
         *      override standard parameters. Inline custom parameters (o auth2Service.endpoint(customParameters, ...) )
         *      can override the configured parameters (standard or custom). An inline parameter with a
         *      null value removes the configured parameter ( oauth2Service.endpoint({parm: null}, ...) ).
         *
         * @param customParameters
         * @param statePayload
         * @param url
         * @returns
         */
        this.authorization = async (customParameters = {}, statePayload, url) => {
            return _authorization(this.http, this._config, // Parameter passed by reference and updated (config.parameters)
            customParameters, statePayload, url);
        };
        this.token = async (customParameters = {}, url) => {
            return _token(this.http, this._config, // Parameter passed by reference and updated (config.parameters)
            {
                grant_type: "authorization_code",
                ...customParameters,
            }, url);
        };
        this.apiRequest = async (customParameters = {}, url, method = "GET", headers = {}, body = {}) => {
            return _api_request(this.http, this.config, customParameters, url, method, headers, body);
        };
        this.refresh = async (customParameters = {}, url) => {
            return _token(this.http, this._config, // Parameter passed by reference and updated (config.parameters)
            {
                grant_type: "refresh_token",
                redirect_uri: null,
                ...customParameters,
            }, url);
        };
        this.revocation = async (customParameters = {}, url) => {
            return _revocation(this.http, this._config, // Parameter passed by reference and could be updated (config.parameters)
            customParameters, url);
        };
        this.verify_token = async (customParameters = {}, issuer, jwks_uri) => {
            const storage = this.config.configuration?.storage;
            this._idToken = {};
            setStore("idToken");
            await _verify_token(this.config, customParameters, issuer, jwks_uri).then(idToken => {
                this._idToken = idToken ?? {};
                setStore("idToken", storage ? this.idToken : null);
            });
        };
        this.interceptor = async () => {
            const int = _interceptor(this._config, // Parameter passed by reference and updated (oauth2Service.config.parameters)
            this._idToken // Parameter passed by reference and updated (oauth2Service.idToken)
            );
            await int.then(v => {
                this._isIdTokenIntercepted = !!v.id_token;
                this._isAccessTokenIntercepted = !!v.access_token;
                this._isCodeIntercepted = !!v.code;
            });
            return int;
        };
        this.saveState = async () => await _save_state(this._config, this._idToken);
        this.recoverState = async () => {
            await _recover_state(this._config, this._idToken);
        };
        this.errorArray = (err) => {
            return _errorArray(err);
        };
        const newConfig = oauth2Config ?? {};
        const config = _oauth2ConfigFactory(newConfig);
        const storage = config.configuration?.storage;
        this._config = config;
        setStore("config", storage ? config : null);
        setStore("idToken");
        setStore("test");
    }
    static { this.ɵfac = function Oauth2Service_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || Oauth2Service)(i0.ɵɵinject(OAUTH2_CONFIG_TOKEN)); }; }
    static { this.ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: Oauth2Service, factory: Oauth2Service.ɵfac, providedIn: "root" }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(Oauth2Service, [{
        type: Injectable,
        args: [{
                providedIn: "root",
            }]
    }], () => [{ type: undefined, decorators: [{
                type: Inject,
                args: [OAUTH2_CONFIG_TOKEN]
            }] }], null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2F1dGgyLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wcm9qZWN0cy9uZ3gtb2F1dGgyLW9pZGMvc3JjL2xpYi9vYXV0aDIuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBQ3BDLE9BQU8sRUFDSCxVQUFVLEdBQ2IsTUFBTSxzQkFBc0IsQ0FBQztBQUM5QixPQUFPLEVBQ0gsTUFBTSxFQUNOLFVBQVUsRUFDVixjQUFjLEVBQ2QsTUFBTSxFQUNULE1BQU0sZUFBZSxDQUFDO0FBU3ZCLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBQzlELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUM5QyxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDaEQsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDMUQsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBQ2xELE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFDbEMsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUM1QyxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzVDLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUNsRCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzdDLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFDM0MsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLGlCQUFpQixDQUFDOztBQUVqRCxNQUFNLENBQUMsTUFBTSxtQkFBbUIsR0FBRyxJQUFJLGNBQWMsQ0FDakQsZUFBZSxDQUNsQixDQUFDO0FBS0YsTUFBTSxPQUFP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QWEsbUJBRlYsTUFBTTs7aUZBRVQsYUFBYTtjQUh6QixVQUFVO2VBQUM7Z0JBQ1IsVUFBVSxFQUFFLE1BQU07YUFDckI7O3NCQTZCUSxNQUFNO3VCQUFDLG1CQUFtQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHNldFN0b3JlIH0gZnJvbSBcIi4vX3N0b3JlXCI7XG5pbXBvcnQge1xuICAgIEh0dHBDbGllbnQsXG59IGZyb20gXCJAYW5ndWxhci9jb21tb24vaHR0cFwiO1xuaW1wb3J0IHtcbiAgICBJbmplY3QsXG4gICAgSW5qZWN0YWJsZSxcbiAgICBJbmplY3Rpb25Ub2tlbixcbiAgICBpbmplY3Rcbn0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcbmltcG9ydCB7XG4gICAgSU9BdXRoMkNvbmZpZyxcbiAgICBJT0F1dGgyUGFyYW1ldGVycyxcbiAgICBjdXN0b21QYXJhbWV0ZXJzVHlwZSxcbiAgICBqc29uT2JqZWN0LFxuICAgIG1ldGhvZFR5cGUsXG4gICAgcGF5bG9hZFR5cGUsXG59IGZyb20gXCIuLi9kb21haW5cIjtcbmltcG9ydCB7IF9vYXV0aDJDb25maWdGYWN0b3J5IH0gZnJvbSBcIi4vX29hdXRoMkNvbmZpZ0ZhY3RvcnlcIjtcbmltcG9ydCB7IF9pbnRlcmNlcHRvciB9IGZyb20gXCIuL19pbnRlcmNlcHRvclwiO1xuaW1wb3J0IHsgX3ZlcmlmeV90b2tlbiB9IGZyb20gXCIuL192ZXJpZnlfdG9rZW5cIjtcbmltcG9ydCB7IF9mZXRjaERpc2NvdmVyeURvYyB9IGZyb20gXCIuL19mZXRjaERpc2NvdmVyeURvY1wiO1xuaW1wb3J0IHsgX2F1dGhvcml6YXRpb24gfSBmcm9tIFwiLi9fYXV0aG9yaXphdGlvblwiO1xuaW1wb3J0IHsgX3Rva2VuIH0gZnJvbSBcIi4vX3Rva2VuXCI7XG5pbXBvcnQgeyBfcmV2b2NhdGlvbiB9IGZyb20gXCIuL19yZXZvY2F0aW9uXCI7XG5pbXBvcnQgeyBfZXJyb3JBcnJheSB9IGZyb20gXCIuL19lcnJvckFycmF5XCI7XG5pbXBvcnQgeyBfc2V0UGFyYW1ldGVycyB9IGZyb20gXCIuL19zZXRQYXJhbWV0ZXJzXCI7XG5pbXBvcnQgeyBfYXBpX3JlcXVlc3QgfSBmcm9tIFwiLi9fYXBpUmVndWVzdFwiO1xuaW1wb3J0IHsgX3NhdmVfc3RhdGUgfSBmcm9tIFwiLi9fc2F2ZVN0YXRlXCI7XG5pbXBvcnQgeyBfcmVjb3Zlcl9zdGF0ZSB9IGZyb20gXCIuL19yZWNvdmVyU3RhdGVcIjtcblxuZXhwb3J0IGNvbnN0IE9BVVRIMl9DT05GSUdfVE9LRU4gPSBuZXcgSW5qZWN0aW9uVG9rZW48SU9BdXRoMkNvbmZpZz4oXG4gICAgXCJPQXV0aDIgQ29uZmlnXCJcbik7XG5cbkBJbmplY3RhYmxlKHtcbiAgICBwcm92aWRlZEluOiBcInJvb3RcIixcbn0pXG5leHBvcnQgY2xhc3MgT2F1dGgyU2VydmljZSB7XG4gICAgcHJpdmF0ZSByZWFkb25seSBodHRwID0gaW5qZWN0KEh0dHBDbGllbnQpO1xuXG4gICAgcHJpdmF0ZSBfY29uZmlnOiBJT0F1dGgyQ29uZmlnID0ge307XG4gICAgcHJpdmF0ZSBfaWRUb2tlbjoganNvbk9iamVjdCA9IHt9OyAvLyBBcGkgdXNlciBpZF90b2tlbiBjbGFpbXNcbiAgICBwcml2YXRlIF9pc0lkVG9rZW5JbnRlcmNlcHRlZCA9IGZhbHNlO1xuICAgIHByaXZhdGUgX2lzQWNjZXNzVG9rZW5JbnRlcmNlcHRlZCA9IGZhbHNlO1xuICAgIHByaXZhdGUgX2lzQ29kZUludGVyY2VwdGVkID0gZmFsc2U7XG5cbiAgICBnZXQgY29uZmlnKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fY29uZmlnO1xuICAgIH1cbiAgICBnZXQgaWRUb2tlbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2lkVG9rZW47XG4gICAgfVxuXG4gICAgLy8gRkxBR1NcbiAgICBnZXQgaXNJZFRva2VuSW50ZXJjZXB0ZWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9pc0lkVG9rZW5JbnRlcmNlcHRlZDtcbiAgICB9XG4gICAgZ2V0IGlzQWNjZXNzVG9rZW5JbnRlcmNlcHRlZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2lzQWNjZXNzVG9rZW5JbnRlcmNlcHRlZDtcbiAgICB9XG4gICAgZ2V0IGlzQ29kZUludGVyY2VwdGVkKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5faXNDb2RlSW50ZXJjZXB0ZWQ7XG4gICAgfVxuXG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIEBJbmplY3QoT0FVVEgyX0NPTkZJR19UT0tFTikgcHJvdGVjdGVkIG9hdXRoMkNvbmZpZz86IElPQXV0aDJDb25maWdcbiAgICApIHtcbiAgICAgICAgY29uc3QgbmV3Q29uZmlnID0gb2F1dGgyQ29uZmlnID8/IHt9O1xuICAgICAgICBjb25zdCBjb25maWcgPSBfb2F1dGgyQ29uZmlnRmFjdG9yeShuZXdDb25maWcpO1xuICAgICAgICBjb25zdCBzdG9yYWdlID0gY29uZmlnLmNvbmZpZ3VyYXRpb24/LnN0b3JhZ2U7XG5cbiAgICAgICAgdGhpcy5fY29uZmlnID0gY29uZmlnO1xuXG4gICAgICAgIHNldFN0b3JlKFwiY29uZmlnXCIsIHN0b3JhZ2UgPyBjb25maWcgOiBudWxsKTtcbiAgICAgICAgc2V0U3RvcmUoXCJpZFRva2VuXCIpO1xuICAgICAgICBzZXRTdG9yZShcInRlc3RcIik7XG4gICAgfVxuXG4gICAgc2V0Q29uZmlnID0gKG9hdXRoMkNvbmZpZzogSU9BdXRoMkNvbmZpZykgPT4ge1xuICAgICAgICBjb25zdCBjb25maWcgPSBfb2F1dGgyQ29uZmlnRmFjdG9yeShvYXV0aDJDb25maWcpO1xuICAgICAgICBjb25zdCBzdG9yYWdlID0gY29uZmlnLmNvbmZpZ3VyYXRpb24/LnN0b3JhZ2U7XG5cbiAgICAgICAgdGhpcy5fY29uZmlnID0gY29uZmlnO1xuICAgICAgICB0aGlzLl9pZFRva2VuID0ge307XG5cbiAgICAgICAgaWYgKCFzdG9yYWdlKSByZXR1cm47XG5cbiAgICAgICAgc2V0U3RvcmUoXCJjb25maWdcIiwgc3RvcmFnZSA/IGNvbmZpZyA6IG51bGwpO1xuICAgICAgICBzZXRTdG9yZShcImlkVG9rZW5cIik7XG4gICAgICAgIHNldFN0b3JlKFwidGVzdFwiKTtcblxuICAgICAgICByZXR1cm4gdGhpcy5jb25maWc7XG4gICAgfTtcblxuICAgIHNldFBhcmFtZXRlcnMgPSAocGFyYW1ldGVyczogSU9BdXRoMlBhcmFtZXRlcnMpID0+IHtcbiAgICAgICAgY29uc3QgcGFybXMgPSB7IC4uLnBhcmFtZXRlcnMgfTtcbiAgICAgICAgY29uc3QgY29uZmlnUGFybXMgPSB7IC4uLnRoaXMuY29uZmlnLnBhcmFtZXRlcnMgfTtcbiAgICAgICAgY29uc3Qgc3RvcmFnZSA9IHRoaXMuY29uZmlnLmNvbmZpZ3VyYXRpb24/LnN0b3JhZ2U7XG5cbiAgICAgICAgZm9yIChjb25zdCBwYXJtIGluIHBhcmFtZXRlcnMpIHtcbiAgICAgICAgICAgIGNvbnN0IGtleSA9IHBhcm0gYXMga2V5b2YgSU9BdXRoMlBhcmFtZXRlcnM7XG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IHBhcmFtZXRlcnNba2V5XSBhcyBhbnk7XG5cbiAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IHZhbHVlID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgZGVsZXRlIGNvbmZpZ1Bhcm1zW2tleV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBwYXJhbWV0ZXJzID0gX3NldFBhcmFtZXRlcnMoXG4gICAgICAgICAgICBwYXJtcyBhcyBjdXN0b21QYXJhbWV0ZXJzVHlwZSxcbiAgICAgICAgICAgIFwic2V0UGFyYW1ldGVyc1wiXG4gICAgICAgICk7XG5cbiAgICAgICAgdGhpcy5fY29uZmlnLnBhcmFtZXRlcnMgPSB7IC4uLmNvbmZpZ1Bhcm1zLCAuLi5wYXJhbWV0ZXJzIH07XG5cbiAgICAgICAgc2V0U3RvcmUoXCJjb25maWdcIiwgc3RvcmFnZSA/IHRoaXMuY29uZmlnIDogbnVsbCk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEVhY2ggZW5kcG9pbnQgdXNlcyB0aGUgcGFyYW1ldGVycyBkZWZpbmVkIHdpdGhpbiB0aGUgJ3BhcmFtZXRlcnMnIHNlY3Rpb24gKGNvbmZpZy5wYXJhbWV0ZXJzKVxuICAgICAqICAgICAgdGhhdCBhcmUgYXBwbGljYWJsZSB0byBpdC4gQ3VzdG9tIGVuZHBvaW50IHBhcmFtZXRlcnMgKGNvbmZpZy5lbmRwb2ludF9uYW1lfSBjYW5cbiAgICAgKiAgICAgIG92ZXJyaWRlIHN0YW5kYXJkIHBhcmFtZXRlcnMuIElubGluZSBjdXN0b20gcGFyYW1ldGVycyAobyBhdXRoMlNlcnZpY2UuZW5kcG9pbnQoY3VzdG9tUGFyYW1ldGVycywgLi4uKSApXG4gICAgICogICAgICBjYW4gb3ZlcnJpZGUgdGhlIGNvbmZpZ3VyZWQgcGFyYW1ldGVycyAoc3RhbmRhcmQgb3IgY3VzdG9tKS4gQW4gaW5saW5lIHBhcmFtZXRlciB3aXRoIGFcbiAgICAgKiAgICAgIG51bGwgdmFsdWUgcmVtb3ZlcyB0aGUgY29uZmlndXJlZCBwYXJhbWV0ZXIgKCBvYXV0aDJTZXJ2aWNlLmVuZHBvaW50KHtwYXJtOiBudWxsfSwgLi4uKSApLlxuICAgICAqXG4gICAgICogQHBhcmFtIGN1c3RvbVBhcmFtZXRlcnNcbiAgICAgKiBAcGFyYW0gdXJsXG4gICAgICogQHJldHVybnNcbiAgICAgKi9cbiAgICBmZXRjaERpc2NvdmVyeURvYyA9IChcbiAgICAgICAgY3VzdG9tUGFyYW1ldGVycyA9IDxjdXN0b21QYXJhbWV0ZXJzVHlwZT57fSxcbiAgICAgICAgdXJsPzogc3RyaW5nXG4gICAgKSA9PiB7XG4gICAgICAgIHJldHVybiBfZmV0Y2hEaXNjb3ZlcnlEb2MoXG4gICAgICAgICAgICB0aGlzLmh0dHAsXG4gICAgICAgICAgICB0aGlzLl9jb25maWcsIC8vIFBhcmFtZXRlciBwYXNzZWQgYnkgcmVmZXJlbmNlIGFuZCB1cGRhdGVkIChjb25maWcubWV0YWRhdGEpXG4gICAgICAgICAgICBjdXN0b21QYXJhbWV0ZXJzLFxuICAgICAgICAgICAgdXJsXG4gICAgICAgICk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEVhY2ggZW5kcG9pbnQgdXNlcyB0aGUgcGFyYW1ldGVycyBkZWZpbmVkIHdpdGhpbiB0aGUgJ3BhcmFtZXRlcnMnIHNlY3Rpb24gKGNvbmZpZy5wYXJhbWV0ZXJzKVxuICAgICAqICAgICAgdGhhdCBhcmUgYXBwbGljYWJsZSB0byBpdC4gQ3VzdG9tIGVuZHBvaW50IHBhcmFtZXRlcnMgKGNvbmZpZy5lbmRwb2ludF9uYW1lfSBjYW5cbiAgICAgKiAgICAgIG92ZXJyaWRlIHN0YW5kYXJkIHBhcmFtZXRlcnMuIElubGluZSBjdXN0b20gcGFyYW1ldGVycyAobyBhdXRoMlNlcnZpY2UuZW5kcG9pbnQoY3VzdG9tUGFyYW1ldGVycywgLi4uKSApXG4gICAgICogICAgICBjYW4gb3ZlcnJpZGUgdGhlIGNvbmZpZ3VyZWQgcGFyYW1ldGVycyAoc3RhbmRhcmQgb3IgY3VzdG9tKS4gQW4gaW5saW5lIHBhcmFtZXRlciB3aXRoIGFcbiAgICAgKiAgICAgIG51bGwgdmFsdWUgcmVtb3ZlcyB0aGUgY29uZmlndXJlZCBwYXJhbWV0ZXIgKCBvYXV0aDJTZXJ2aWNlLmVuZHBvaW50KHtwYXJtOiBudWxsfSwgLi4uKSApLlxuICAgICAqXG4gICAgICogQHBhcmFtIGN1c3RvbVBhcmFtZXRlcnNcbiAgICAgKiBAcGFyYW0gc3RhdGVQYXlsb2FkXG4gICAgICogQHBhcmFtIHVybFxuICAgICAqIEByZXR1cm5zXG4gICAgICovXG4gICAgYXV0aG9yaXphdGlvbiA9IGFzeW5jIChcbiAgICAgICAgY3VzdG9tUGFyYW1ldGVycyA9IDxjdXN0b21QYXJhbWV0ZXJzVHlwZT57fSxcbiAgICAgICAgc3RhdGVQYXlsb2FkPzogc3RyaW5nLFxuICAgICAgICB1cmw/OiBzdHJpbmdcbiAgICApID0+IHtcbiAgICAgICAgcmV0dXJuIF9hdXRob3JpemF0aW9uKFxuICAgICAgICAgICAgdGhpcy5odHRwLFxuICAgICAgICAgICAgdGhpcy5fY29uZmlnLCAvLyBQYXJhbWV0ZXIgcGFzc2VkIGJ5IHJlZmVyZW5jZSBhbmQgdXBkYXRlZCAoY29uZmlnLnBhcmFtZXRlcnMpXG4gICAgICAgICAgICBjdXN0b21QYXJhbWV0ZXJzLFxuICAgICAgICAgICAgc3RhdGVQYXlsb2FkLFxuICAgICAgICAgICAgdXJsXG4gICAgICAgICk7XG4gICAgfTtcblxuICAgIHRva2VuID0gYXN5bmMgKFxuICAgICAgICBjdXN0b21QYXJhbWV0ZXJzID0gPGN1c3RvbVBhcmFtZXRlcnNUeXBlPnt9LFxuICAgICAgICB1cmw/OiBzdHJpbmdcbiAgICApID0+IHtcbiAgICAgICAgcmV0dXJuIF90b2tlbihcbiAgICAgICAgICAgIHRoaXMuaHR0cCxcbiAgICAgICAgICAgIHRoaXMuX2NvbmZpZywgLy8gUGFyYW1ldGVyIHBhc3NlZCBieSByZWZlcmVuY2UgYW5kIHVwZGF0ZWQgKGNvbmZpZy5wYXJhbWV0ZXJzKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGdyYW50X3R5cGU6IFwiYXV0aG9yaXphdGlvbl9jb2RlXCIsXG4gICAgICAgICAgICAgICAgLi4uY3VzdG9tUGFyYW1ldGVycyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB1cmxcbiAgICAgICAgKTtcbiAgICB9O1xuXG4gICAgYXBpUmVxdWVzdCA9IGFzeW5jIChcbiAgICAgICAgY3VzdG9tUGFyYW1ldGVycyA9IDxjdXN0b21QYXJhbWV0ZXJzVHlwZT57fSxcbiAgICAgICAgdXJsPzogc3RyaW5nLFxuICAgICAgICBtZXRob2Q6IG1ldGhvZFR5cGUgPSBcIkdFVFwiLFxuICAgICAgICBoZWFkZXJzOiBqc29uT2JqZWN0ID0ge30sXG4gICAgICAgIGJvZHk6IHBheWxvYWRUeXBlID0ge31cbiAgICApID0+IHtcbiAgICAgICAgcmV0dXJuIF9hcGlfcmVxdWVzdChcbiAgICAgICAgICAgIHRoaXMuaHR0cCxcbiAgICAgICAgICAgIHRoaXMuY29uZmlnLFxuICAgICAgICAgICAgY3VzdG9tUGFyYW1ldGVycyxcbiAgICAgICAgICAgIHVybCxcbiAgICAgICAgICAgIG1ldGhvZCxcbiAgICAgICAgICAgIGhlYWRlcnMsXG4gICAgICAgICAgICBib2R5XG4gICAgICAgICk7XG4gICAgfTtcblxuICAgIHJlZnJlc2ggPSBhc3luYyAoXG4gICAgICAgIGN1c3RvbVBhcmFtZXRlcnMgPSA8Y3VzdG9tUGFyYW1ldGVyc1R5cGU+e30sXG4gICAgICAgIHVybD86IHN0cmluZ1xuICAgICkgPT4ge1xuICAgICAgICByZXR1cm4gX3Rva2VuKFxuICAgICAgICAgICAgdGhpcy5odHRwLFxuICAgICAgICAgICAgdGhpcy5fY29uZmlnLCAvLyBQYXJhbWV0ZXIgcGFzc2VkIGJ5IHJlZmVyZW5jZSBhbmQgdXBkYXRlZCAoY29uZmlnLnBhcmFtZXRlcnMpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgZ3JhbnRfdHlwZTogXCJyZWZyZXNoX3Rva2VuXCIsXG4gICAgICAgICAgICAgICAgcmVkaXJlY3RfdXJpOiBudWxsLFxuICAgICAgICAgICAgICAgIC4uLmN1c3RvbVBhcmFtZXRlcnMsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdXJsXG4gICAgICAgICk7XG4gICAgfTtcblxuICAgIHJldm9jYXRpb24gPSBhc3luYyAoXG4gICAgICAgIGN1c3RvbVBhcmFtZXRlcnMgPSA8Y3VzdG9tUGFyYW1ldGVyc1R5cGU+e30sXG4gICAgICAgIHVybD86IHN0cmluZ1xuICAgICkgPT4ge1xuICAgICAgICByZXR1cm4gX3Jldm9jYXRpb24oXG4gICAgICAgICAgICB0aGlzLmh0dHAsXG4gICAgICAgICAgICB0aGlzLl9jb25maWcsIC8vIFBhcmFtZXRlciBwYXNzZWQgYnkgcmVmZXJlbmNlIGFuZCBjb3VsZCBiZSB1cGRhdGVkIChjb25maWcucGFyYW1ldGVycylcbiAgICAgICAgICAgIGN1c3RvbVBhcmFtZXRlcnMsXG4gICAgICAgICAgICB1cmxcbiAgICAgICAgKTtcbiAgICB9O1xuXG4gICAgdmVyaWZ5X3Rva2VuID0gYXN5bmMgKFxuICAgICAgICBjdXN0b21QYXJhbWV0ZXJzID0gPGN1c3RvbVBhcmFtZXRlcnNUeXBlPnt9LFxuICAgICAgICBpc3N1ZXI/OiBzdHJpbmcsXG4gICAgICAgIGp3a3NfdXJpPzogc3RyaW5nXG4gICAgKSA9PiB7XG4gICAgICAgIGNvbnN0IHN0b3JhZ2UgPSB0aGlzLmNvbmZpZy5jb25maWd1cmF0aW9uPy5zdG9yYWdlO1xuXG4gICAgICAgIHRoaXMuX2lkVG9rZW4gPSB7fTtcblxuICAgICAgICBzZXRTdG9yZShcImlkVG9rZW5cIik7XG5cbiAgICAgICAgYXdhaXQgX3ZlcmlmeV90b2tlbihcbiAgICAgICAgICAgIHRoaXMuY29uZmlnLFxuICAgICAgICAgICAgY3VzdG9tUGFyYW1ldGVycyxcbiAgICAgICAgICAgIGlzc3VlcixcbiAgICAgICAgICAgIGp3a3NfdXJpXG4gICAgICAgICkudGhlbihpZFRva2VuID0+IHtcbiAgICAgICAgICAgIHRoaXMuX2lkVG9rZW4gPSAoaWRUb2tlbiBhcyBqc29uT2JqZWN0KSA/PyB7fTtcbiAgICAgICAgICAgIHNldFN0b3JlKFwiaWRUb2tlblwiLCBzdG9yYWdlID8gdGhpcy5pZFRva2VuIDogbnVsbCk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBpbnRlcmNlcHRvciA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgY29uc3QgaW50ID0gX2ludGVyY2VwdG9yKFxuICAgICAgICAgICAgdGhpcy5fY29uZmlnLCAvLyBQYXJhbWV0ZXIgcGFzc2VkIGJ5IHJlZmVyZW5jZSBhbmQgdXBkYXRlZCAob2F1dGgyU2VydmljZS5jb25maWcucGFyYW1ldGVycylcbiAgICAgICAgICAgIHRoaXMuX2lkVG9rZW4gLy8gUGFyYW1ldGVyIHBhc3NlZCBieSByZWZlcmVuY2UgYW5kIHVwZGF0ZWQgKG9hdXRoMlNlcnZpY2UuaWRUb2tlbilcbiAgICAgICAgKTtcblxuICAgICAgICBhd2FpdCBpbnQudGhlbih2ID0+IHtcbiAgICAgICAgICAgIHRoaXMuX2lzSWRUb2tlbkludGVyY2VwdGVkID0gISF2LmlkX3Rva2VuO1xuICAgICAgICAgICAgdGhpcy5faXNBY2Nlc3NUb2tlbkludGVyY2VwdGVkID0gISF2LmFjY2Vzc190b2tlbjtcbiAgICAgICAgICAgIHRoaXMuX2lzQ29kZUludGVyY2VwdGVkID0gISF2LmNvZGU7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBpbnQ7XG4gICAgfTtcblxuICAgIHNhdmVTdGF0ZSA9IGFzeW5jICgpID0+XG4gICAgICAgIGF3YWl0IF9zYXZlX3N0YXRlKHRoaXMuX2NvbmZpZywgdGhpcy5faWRUb2tlbik7XG5cbiAgICByZWNvdmVyU3RhdGUgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIGF3YWl0IF9yZWNvdmVyX3N0YXRlKHRoaXMuX2NvbmZpZywgdGhpcy5faWRUb2tlbik7XG4gICAgfTtcblxuICAgIGVycm9yQXJyYXkgPSAoZXJyOiB1bmtub3duKSA9PiB7XG4gICAgICAgIHJldHVybiBfZXJyb3JBcnJheShlcnIpO1xuICAgIH07XG59XG4iXX0=