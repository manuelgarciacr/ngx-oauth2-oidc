import { IOAuth2Config, IOAuth2Configuration, IOAuth2Metadata, IOAuth2Parameters } from "../domain";

export const initConfig = (ioauth2Config: IOAuth2Config | null) => {
    ioauth2Config ??= <IOAuth2Config>{};
    ioauth2Config.configuration ??= <IOAuth2Configuration>{};
    ioauth2Config.metadata ??= <IOAuth2Metadata>{};
    ioauth2Config.parameters ??= <IOAuth2Parameters>{};

    return ioauth2Config;
};
