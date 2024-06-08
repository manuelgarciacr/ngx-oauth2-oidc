import { IOAuth2Config, IOAuth2Configuration } from "../domain";

export const initConfig = (ioauth2Config: IOAuth2Config | null) => {
    if (!ioauth2Config) ioauth2Config = <IOAuth2Config>{};
    if (!ioauth2Config.configuration)
        ioauth2Config.configuration = <IOAuth2Configuration>{};

    return ioauth2Config;
};
