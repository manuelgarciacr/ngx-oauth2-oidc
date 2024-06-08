export const toLowerCaseProperties = <T>(obj?: T) => {
    if (!obj)
        return undefined;

    const genericObj = obj as {
        [key: string]: unknown;
    };
    const lowerObj = Object.fromEntries(
        Object.entries(genericObj).map(([k, v]) => [k.toLowerCase(), v])
    );
    return lowerObj as T;
};
