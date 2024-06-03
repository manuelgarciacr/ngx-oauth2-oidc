export const isObject = (obj: unknown) => obj != null && obj.constructor && obj.constructor.name === "Object";
