<div id="getting-started">

| <label id="getting-started" style="float: right">[![Static Badge](https://img.shields.io/badge/Back_to_README-37a779?style=for-the-badge)](../README.md)</label>![](cell-1.png) |
|  --: |
## :rocket: Getting started

Installation using npm from your project folder:

````bash
npm install ngx-oauth2-oidc
````

Importing the service:

````js
import { Oauth2Service } from "ngx-oauth2-oidc";
...

@Component({ ...
})
export class LoginComponent implements OnInit {
    private readonly oauth2 = inject(Oauth2Service);
    
    ...
}
````

Creating a very basic configuration object:

````js
const config = {
    configuration: {
        "authorization_grant_type": "code"
    },
    metadata: {
        "issuer": "https://accounts.google.com"
    },
    parameters: {
        "client_id": "CLIENT_IDENTIFIER_ISSUED_BY_THE_AUTHORIZATION_SERVER",
        "redirect_uri": "http://localhost:4300/login",
        "scope": ["https://www.googleapis.com/auth/drive"],
    }
}
````

Configure the service, retrieve the discovery document, and access the authorization endpoint on the authorization server:

````js
    try {
        this.oauth2.setConfig(config);

        await this.oauth2.fetchDiscoveryDoc();
        await this.oauth2.authorization();
    } catch (err) {
        console.error(err);
    }
````

Intercepting the response from the authorization server:

````js
    async ngOnInit() {
        const params = await this.oauth2.interceptor();
        // The interceptor returns the parameters received from the 
        //      authorization server and also saves them in the internal
        //      configuration of the service.
        const code = params.code;
        const id_token = params.id_token;
        // Some flows after redirection return a "code" parameter
        if (code) {
            // The "code" is not saved in the sessionStorage, but in the 
            //      internal configuration of the service, so it is not
            //      necessary to pass it by parameter to the endpoint.
            this.accessToken()
        }
        // Some flows after redirection return an "id_token" parameter
        if (id_token) {
            try {
                // The "verify_token()" method returns the received 
                //      "token_id" claims and also saves them to the 
                //      internal configuration of the service.
                await this.oauth2.verify_token();
            } catch (err) {
                console.error(err);
            }
        }
        window.history.replaceState({}, "", window.location.pathname);
        ...
    }
````

The internal configuration of the service preserves all parameters received from the authorization server. These parameters are not removed until the configuration is set again by calling the 'setConfig()' method:

````js
    const config = this.oauth2.config;
    console.log(
        config.parameters.id_token, 
        config.parameters.access_token,
        config.parameters.refresh_token
    )
    this.oauth2.setConfig({});

````
| ![](cell-1.png)<label style="float: right">[![Static Badge](https://img.shields.io/badge/Go_top-37a779)](#getting-started)</label> |
|  --: |

