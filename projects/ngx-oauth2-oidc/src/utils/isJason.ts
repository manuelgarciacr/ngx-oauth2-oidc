export const isJSON = (v: unknown) => {
    try {
        return !!v && typeof v == "string" && !!JSON.parse(v);
    } catch {
        return false;
    }
};
