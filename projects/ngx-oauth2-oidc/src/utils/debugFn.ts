import { Oauth2Service } from "../lib/oauth2.service";

export enum debugEnum {
    mth = 1, // Method name
    prv = 2, // Private method name
    int = 4, // Internal debug data
    dev = 8, // Developing debug data
}
export type debugType = keyof typeof debugEnum;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const debugFn = (type: debugType, ...values: any[]) =>
    (debugEnum[type] & Oauth2Service.debug) === debugEnum[type] &&
        console.log("DEBUG", ...values);

