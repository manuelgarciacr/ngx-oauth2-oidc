

interface Object {
    filter(predicate: (key: string, value: any, object: object) => any): {[key: string]: unknown};
};

Object.defineProperty(Object.prototype, "filter", {
    value: function (
        predicate: (key: string, value: any, object: object) => any
    ) {
        const entries = Object.entries(this);
        return Object.fromEntries(
            entries.filter(value =>
                predicate(value[0], value[1], this)
            )
        );
    },
    enumerable: false, // this is actually the default
});

// Object.prototype.filter = function (
//     predicate: (key: string, value: any, object: object) => any
// ) {
//     return Object.fromEntries(
//         Object.entries(this).filter(value =>
//             predicate(value[0], value[1], this)
//         )
//     );
// };
