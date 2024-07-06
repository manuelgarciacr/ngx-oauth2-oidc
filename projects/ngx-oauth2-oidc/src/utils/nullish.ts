export const isNull = <T>(data: T, isNull?: (v: T) => boolean) =>
    (data == null) || (isNull?.(data) ?? false);

export const notNull = <T>(data: T, _default: T, isNull?: (v: T) => boolean) =>
    (data == null) || (isNull?.(data) ?? false) ? _default : data;

/**
 * Returns true if 'data' is a string or nullish.
 *
 * @param data value to check
 * @returns
 */
export const isStrNull = (data: unknown) =>
    typeof data == "string" || data == undefined || data == null;

/**
 * Error if 'data' is not a string or nullish. If 'data'
 *   is nullish returns '_default', otherwise it returns 'data'.
 *
 * @param data value to check and convert
 * @param _default default returned value
 * @returns
 */
export const notStrNull = (data: unknown, _default: string) => {
    if (!isStrNull(data))
        throw new Error(
            `${data}" is not a string or nullish.`,
            { cause: "notStrNull" }
        );

    else return !data ? _default : data as string;
}
