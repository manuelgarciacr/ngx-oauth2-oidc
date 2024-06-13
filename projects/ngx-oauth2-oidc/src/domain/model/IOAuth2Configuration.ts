import { IOAuth2Methods, IOAuth2Options, methodNames, optionNames } from "../index";

/** Configuration section type */
export interface IOAuth2Configuration extends IOAuth2Methods, IOAuth2Options {};

/** Configuration section property names */
export const configurationNames = [...methodNames, ...optionNames];
