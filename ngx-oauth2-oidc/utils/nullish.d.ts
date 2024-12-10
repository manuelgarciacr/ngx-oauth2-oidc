export declare const isNull: <T>(data: T, isNull?: (v: T) => boolean) => boolean;
export declare const notNull: <T>(data: T, _default: T, isNull?: (v: T) => boolean) => T;
/**
 * Returns true if 'data' is a string or nullish.
 *
 * @param data value to check
 * @returns
 */
export declare const isStrNull: (data: unknown) => boolean;
/**
 * Error if 'data' is not a string or nullish. If 'data'
 *   is nullish returns '_default', otherwise it returns 'data'.
 *
 * @param data value to check and convert
 * @param _default default returned value
 * @returns
 */
export declare const notStrNull: (data: unknown, _default: string) => string;
//# sourceMappingURL=nullish.d.ts.map