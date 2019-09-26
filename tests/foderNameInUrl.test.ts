import { LocationDescriptor } from "history";
import { describe, it } from "mocha";
const assert = require("assert");
const createPath = require("../src/createPath.ts").createPath;
const querystring = require("querystring");

describe("create Path", function() {
    describe("match", function() {
        describe("URL no params", () => {
            generatePathTestCases("/p/settings", (path, expectedQuery, exact, testDescription) => {
                it(testDescription, () => {
                    assert.deepEqual(createPath("/p/settings").match(path, exact), {
                        isMatched: true,
                        params: {},
                        query: expectedQuery
                    });
                });
            });
        });

        describe("URL params first", () => {
            generatePathTestCases("/123/123/a", (path, expectedQuery, exact, testDescription) => {
                it(testDescription, () => {
                    assert.deepEqual(createPath("/:a/:b/a").match(path, exact), {
                        isMatched: true,
                        params: { a: "123", b: "123" },
                        query: expectedQuery
                    });
                });
            });
        });

        describe("URL params last", () => {
            generatePathTestCases("/p/123", (path, expectedQuery, exact, testDescription) => {
                it(testDescription, () => {
                    assert.deepEqual(createPath("/p/:settings").match(path, exact), {
                        isMatched: true,
                        params: { settings: "123" },
                        query: expectedQuery
                    });
                });
            });
        });

        describe("Optional parameter", () => {
            generatePathTestCases("/a/id/123", (path, expectedQuery, exact, testDescription) => {
                it(testDescription, () => {
                    assert.deepEqual(createPath("/a/id/:name?").match(path, exact), {
                        isMatched: true,
                        params: { name: "123" },
                        query: expectedQuery
                    });
                });
            });
        });

        describe("Few params one by one", () => {
            generatePathTestCases("/123/123/123", (path, expectedQuery, exact, testDescription) => {
                it(testDescription, () => {
                    assert.deepEqual(createPath("/:a/:id/:name").match(path, exact), {
                        isMatched: true,
                        params: { a: "123", id: "123", name: "123" },
                        query: expectedQuery
                    });
                });
            });
        });
    });

    describe("format", function() {
        it("Format URL no params", function() {
            assert.equal(createPath("/p/settings").format({}), "/p/settings");
        });

        it("Format URL params first", function() {
            assert.equal(createPath("/:p/settings").format({ p: "123" }), "/123/settings");
        });

        it("Format URL params last", function() {
            assert.equal(createPath("/p/:settings").format({ settings: "123" }), "/p/123");
        });

        it("Optional parameter", function() {
            assert.equal(createPath("/a/:id/:name?").format({ id: "123", name: "123" }), "/a/123/123");
            assert.equal(createPath("/a/:id/:name?").format({ id: "123", name: undefined }), "/a/123");
        });

        it("Few params one by one", function() {
            assert.equal(createPath("/:a/:id/:name").format({ a: "123", id: "123", name: "123" }), "/123/123/123");
        });

        it("With full or partial match", function() {
            assert.equal(createPath("/:a/:b/asdasd/asdas").format({ a: "123", b: "123" }), "/123/123/asdasd/asdas");
            assert.equal(createPath("/:a/:b").format({ a: "123", b: "123" }), "/123/123");
            // exact
        });

        it("With and without query string", function() {
            assert.equal(createPath("/1/2/3").format({}, { a: 1, b: 2, asda: 123123 }), "/1/2/3?a=1&b=2&asda=123123");
        });

        it("With or without query", function() {
            assert.equal(createPath("/:a/:b/:c").format({ a: 1, b: 2, c: 3 }, { val: 12321 }), "/1/2/3?val=12321");
        });
    });
});

function generatePathTestCases(
    path: string,
    callback: (path: string | LocationDescriptor, expectedQuery: any, exact: boolean, description: string) => void
) {
    describe("path as string", () => {
        describe("with exact match", () => {
            const query = { a: 1, b: 2 };

            callback(path, undefined, true, "no trailing slash and query");
            callback(path + "/", undefined, true, "trailing slash and without query");
            callback(path + "?" + querystring.stringify(query), query, true, "with query string and no trailing slash");
            callback(path + "/?" + querystring.stringify(query), query, true, "with query string and trailing slash");
        });

        describe("with partial match", () => {
            const query = { a: 1, b: 2 };

            callback(path + "/sda/asda/sda", undefined, false, "no trailing slash and query");
            callback(path + "/sda/asda/sda/", undefined, false, "with trailing slash without query");
            callback(
                path + "/sda/asda/sda?" + querystring.stringify(query),
                query,
                false,
                "with query string and no trailing slash"
            );
            callback(
                path + "/sda/asda/sda/?" + querystring.stringify(query),
                query,
                false,
                "with query string and trailing slash"
            );
        });
    });

    describe("path as LocationDescriptor", () => {
        describe("with exact match", () => {
            const query = { a: 1, b: 2 };

            callback({ pathname: path }, undefined, true, "no trailing slash and query");

            callback({ pathname: path + "/" }, undefined, true, "trailing slash and without query");

            callback(
                { pathname: path, search: querystring.stringify(query) },
                query,
                true,
                "with query string and no trailing slash"
            );

            callback(
                {
                    pathname: path + "/",
                    search: querystring.stringify(query)
                },
                query,
                true,
                "with query string and trailing slash"
            );
        });

        describe("with partial match", () => {
            const query = { a: 1, b: 2 };

            callback({ pathname: path + "/sda/asda/sda" }, undefined, false, "no trailing slash and query");

            callback({ pathname: path + "/sda/asda/sda/" }, undefined, false, "with trailing slash without query");

            callback(
                {
                    pathname: path + "/sda/asda/sda",
                    search: querystring.stringify(query)
                },
                query,
                false,
                "with query string and no trailing slash"
            );

            callback(
                {
                    pathname: path + "/sda/asda/sda/",
                    search: querystring.stringify(query)
                },
                query,
                false,
                "with query string and trailing slash"
            );
        });
    });
}
