[![License](https://img.shields.io/github/license/manuelgarciacr/ngx-oauth2-oidc)](./LICENSE)

[//]: # "
![Release](https://img.shields.io/npm/v/jwks-rsa)
[![Codecov](https://img.shields.io/codecov/c/github/auth0/node-jwks-rsa)](https://codecov.io/gh/auth0/node-jwks-rsa)
![Downloads](https://img.shields.io/npm/dw/jwks-rsa)
[![License](https://img.shields.io/:license-mit-blue.svg?style=flat)](https://opensource.org/licenses/MIT)
![CircleCI](https://img.shields.io/circleci/build/github/auth0/node-jwks-rsa)"

# Table of Contents
- :eyes: [Overview](#eyes-overview)
- :rocket: [Getting Started](./docs/getting_started.md)
- :arrow_forward: Endpoints and methods
    - [authorization](./docs/authorization.md)
- :bookmark_tabs: [Configuration object](#bookmark_tabs-configuration-object)
    - [Configuration section](#configuration-section)
    - [Metadata section](#metadata-section)
    - [Parameters section](#parameters-section)
- :rocket: [Getting Started](./docs/getting_started.md)
- [Fourth Example](#fourth-examplehttpwwwfourthexamplecom)
https://github.com/manuelgarciacr/ngx-oauth2-oidc/edit/main/README.md#bookmark_tabs-configuration-object
<div id="overview"></div>

## :eyes: Overview

This library provides a very easy-to-use service for authentication and authorization via the OAuth 2.0 OIDC protocol.

You could call the different oauth2 endpoints and methods using just the [ ( :eye: ) "config"](#config) object inside the service.

The ["config"](#config) object is saved in memory, this action prevents, among others, Cross-Site Request Forgery (CSRF) attacks.

When you receive an ["id_token"](#id_token) parameter, by calling the [ ( :eye: ) "verifyToken"](#verifyToken) method, you verify its integrity and save the token claims within the ["idToken"](#idToken) object in the service.

The ["storage"](#storage) configuration option, if set to true, saves the [ ( :eye: ) state objects](#state_objects) ( ["config"](#config) and ["idToken"](#idToken) ) within the session storage, always ommiting the sensitive parameters: ["client_secret"](#client_secret), ["code"](#code), ["access_token"](#access_token), ["refresh_token"](#refresh_token), ["id_token"](#id_token) and ["code_challenge"](#code_challenge).

Before any HTTP redirect, you can call the [ ( :eye: ) "saveState"](#saveState) method. [State objects](#state_objects) are encrypted and stored withine the session storage, and the necessary decryption data is encoded in a secure session cookie. The [ ( :eye: ) "authorization"](#authorization)
endpoint automatically saves this state.

The saved and encrypted state is recovered and deleted by calling the [ ( :eye: ) "idTokenGuard"](#sidTokenGuard) route guard, the [ ( :eye: ) "interceptor"](#interceptor) method or the [ ( :eye: ) "recoverState"](#recoverState) method.

## :bookmark_tabs: Configuration object
### Configuration section
### Metadata section
### Parameters section
