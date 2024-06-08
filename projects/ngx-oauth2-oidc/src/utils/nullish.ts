export const isNull = <T>(data: T, isNull?: (v: T) => boolean) =>
    (data == null) || (isNull?.(data) ?? false);

export const notNull = <T>(data: T, _default: T, isNull?: (v: T) => boolean) =>
    (data == null) || (isNull?.(data) ?? false) ? _default : data;

export const isStrNull = (data: unknown) => {
    if (typeof data != "string" && data != null)
        throw "isStrNull: data is not a string or nullish";

    else return (data == null) || (data == "");
}

export const notStrNull = (data: unknown, _default: string) => {
    if (typeof data != "string" && data != null)
        throw "notStrNull: data is not a string or nullish";

    else return data == null || data == "" ? _default : data.toString();
}
