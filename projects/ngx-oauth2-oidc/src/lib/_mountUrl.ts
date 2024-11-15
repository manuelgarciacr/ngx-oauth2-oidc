import { debugFn } from "../utils";

/**
 * Returns a new URL form a base URL.
 *   Replaces the protocol if provided. Adds sufix if provided.
 *   Removes trailing slashes if removeTrailingSlash is true.
 *
 * @param base Initial URL
 * @param protocol New protocol
 * @param sufix URL sufix
 * @param removeTrailingSlash If true, removes trailing slashes
 * @returns New URL
 */
export const mountUrl = (
    base: string,
    protocol?: string,
    sufix?: string,
    removeTrailingSlash?: boolean
) => {
    debugFn("prv", "MOUNT_URL");

    let url = base;

    if (protocol) {
        const matches = url.match(/^.+:\/\//);
        const currentProtocol = matches ? matches[0].toLowerCase() : "";
        const newProtocol = `${protocol}://`.toLowerCase();

        if (currentProtocol && currentProtocol != newProtocol) {
            url = url.replace(currentProtocol, newProtocol);
        }

        if (!currentProtocol) {
            const error = () => url.startsWith(":") || url.startsWith("/");

            while (error()) url = url.slice(1);
            url = `${newProtocol}${url}`;
        }
    }

    if (sufix) {
        const error = () => url.endsWith(":") || url.endsWith("/");

        while (error()) url = url.slice(0, -1);

        url = `${url}/${sufix}`;
    }

    if (removeTrailingSlash) {
        const error = () => url.endsWith("/");

        while (error()) url = url.slice(0, -1);
    }

    return url;
};
