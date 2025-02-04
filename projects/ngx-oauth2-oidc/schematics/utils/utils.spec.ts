import { GlobalData, getData, setData} from "./utils";

describe("utils utils", () => {
    beforeEach(async () => {
    });

    it("globalData/getGlobalData function", async () => {
        let res, res1, res2;
        let gd: GlobalData = {
            a1: {
                b1: {},
                b2: {
                    c1: { val: false, all: true },
                    c2: { val: false, all: true },
                },
            },
            a2: {},
        };

        setData(gd, { val: true, d: {} }, "a3", "b1", "c1");
        expect(gd).toEqual({
            a1: {
                b1: {},
                b2: {
                    c1: { val: false, all: true },
                    c2: { val: false, all: true },
                },
            },
            a2: {},
            a3: { b1: { c1: { val: true, d: {} } } },
        });

        setData(gd, { val: true, d: {} }, "a1", "b3", "c1");
        expect(gd).toEqual({
            a1: {
                b1: {},
                b2: {
                    c1: { val: false, all: true },
                    c2: { val: false, all: true },
                },
                b3: { c1: { val: true, d: {} } },
            },
            a2: {},
            a3: { b1: { c1: { val: true, d: {} } } },
        });

        setData(gd, { val: true, d: {} }, "a1", "b2", "c3");
        expect(gd).toEqual({
            a1: {
                b1: {},
                b2: {
                    c1: { val: false, all: true },
                    c2: { val: false, all: true },
                    c3: { val: true, d: {} },
                },
                b3: { c1: { val: true, d: {} } },
            },
            a2: {},
            a3: { b1: { c1: { val: true, d: {} } } },
        });

        setData(gd, { val: true, d: {} }, "a1", "b1", "c2");
        expect(gd).toEqual({
            a1: {
                b1: { c2: { val: true, d: {} } },
                b2: {
                    c1: { val: false, all: true },
                    c2: { val: false, all: true },
                    c3: { val: true, d: {} },
                },
                b3: { c1: { val: true, d: {} } },
            },
            a2: {},
            a3: { b1: { c1: { val: true, d: {} } } },
        });

        setData(gd, { val: true, d: {} }, "a1", "b2");
        expect(gd).toEqual({
            a1: {
                b1: { c2: { val: true, d: {} } },
                b2: {
                    c1: { val: false, all: true },
                    c2: { val: false, all: true },
                    c3: { val: true, d: {} },
                    val: true,
                    d: {},
                },
                b3: { c1: { val: true, d: {} } },
            },
            a2: {},
            a3: { b1: { c1: { val: true, d: {} } } },
        });

        setData(gd, { val: true, d: {} }, "a3", "b1", "c2");
        expect(gd).toEqual({
            a1: {
                b1: { c2: { val: true, d: {} } },
                b2: {
                    c1: { val: false, all: true },
                    c2: { val: false, all: true },
                    c3: { val: true, d: {} },
                    val: true,
                    d: {},
                },
                b3: { c1: { val: true, d: {} } },
            },
            a2: {},
            a3: { b1: { c1: { val: true, d: {} }, c2: { val: true, d: {} } } },
        });

        res = getData(gd, "a1", "b2");
        expect(res).toEqual({
            c1: { val: false, all: true },
            c2: { val: false, all: true },
            c3: { val: true, d: {} },
            val: true,
            d: {},
        });

        // null or undefined value deletes the element
        setData(gd, undefined, "a3", "b1", "c2");
        res1 = getData(gd, "a3", "b1", "c2");
        res2 = getData(gd, "a3", "b1");
        expect(res1).toEqual(undefined);
        expect(res2).toEqual({ c1: { val: true, d: {} } });

        setData(gd, null, "a3", "b1");
        res1 = getData(gd, "a3", "b1");
        res2 = getData(gd, "a3");
        expect(res1).toEqual(undefined);
        expect(res2).toEqual({});

        setData(gd, null, "a3");
        res1 = getData(gd, "a3");
        res2 = getData(gd);
        expect(res1).toEqual(undefined);
        expect(res2).toEqual({
            a1: {
                b1: { c2: { val: true, d: {} } },
                b2: {
                    c1: { val: false, all: true },
                    c2: { val: false, all: true },
                    c3: { val: true, d: {} },
                    val: true,
                    d: {},
                },
                b3: { c1: { val: true, d: {} } },
            },
            a2: {},
        });

        setData(gd, null);
        res = getData(gd);
        expect(res).toEqual({});

        // getGlobalData returns a deep clone.
        expect(res).not.toBe(gd);

        setData(gd, { 0: "a1" });
        res = getData(gd);
        expect(res).toEqual({ 0: "a1" });
        expect(res).not.toBe(gd);

        setData(gd, { val: 3 }, "a1", "b2");
        res = getData(gd, "a1");
        expect(res).toEqual({ b2: { val: 3 } });
        expect(res).not.toBe(gd);

        // getGlobalData without keys, returns a deep clone of any type
        // of object, not just GlobalData.
        const obj1 = { 0: "a1" };
        res = getData(obj1);
        expect(res).toEqual({ 0: "a1" });
        expect(res).not.toBe(obj1);

        const obj2 = new String("getGlobalData testing");
        res = getData(obj2);
        expect(res).toEqual("getGlobalData testing");
        expect(res).not.toBe(obj2);
    });

})
