import * as querystring from "querystring";
import * as URL from "url";
import pathToRegexp from "path-to-regexp";
import { Key } from "path-to-regexp";
import { Location } from "history";

import { LocationDescriptor, UrlPath, NoMatch, Match, ForceMatch } from "./api";

export function createPath<TParams = {}, TQueryString = {}>(urlTemplate: string): UrlPath<TParams, TQueryString> {
    if (!urlTemplate) {
        throw new Error("URL template is not defined.");
    }

    return new UrlPathImpl<TParams, TQueryString>(urlTemplate);
}

class UrlPathImpl<TParams, TQueryString> implements UrlPath<TParams, TQueryString> {
    public readonly urlTemplate: string;

    get paramType(): TParams {
        throw new Error("Use this property in Typescript typeof operator only");
    }

    get queryType(): TQueryString {
        throw new Error("Use this property in Typescript typeof operator only");
    }

    constructor(urlTemplate: string) {
        if (urlTemplate.endsWith("/") && urlTemplate !== "/") {
            urlTemplate = urlTemplate.replace(/\/$/, "");
        }

        this.urlTemplate = urlTemplate;
    }

    match(
        url: string | Location,
        exact: boolean
    ): (NoMatch | Match<TParams, TQueryString>) & ForceMatch<TParams, TQueryString> {
        const location = this.normalizeUrl(url);

        //
        const paramNames: Key[] = [];
        const regexpTemplate = exact
            ? pathToRegexp(this.urlTemplate, paramNames)
            : pathToRegexp(this.urlTemplate, paramNames, { end: false });
        const result = regexpTemplate.exec(location.pathname);
        const noMatch: NoMatch & ForceMatch<TParams, TQueryString> = {
            isMatched: false,
            forceMatch() {
                throw Error("The URL is not matched");
            }
        };

        if (!result || result.length < paramNames.length + 1) {
            return noMatch;
        }

        const matches = result.slice(1);

        if (matches.length !== paramNames.length) {
            return noMatch;
        }

        const params = (matches as any).reduce(
            (result: any, value: any, index: number) => {
                (result as any)[paramNames[index].name] = value;

                return result;
            },
            {} as any
        );

        let query: TQueryString | undefined = undefined;

        if (location.search) {
            const searchString = location.search.startsWith("?")
                ? location.search.substring(location.search.indexOf("?") + 1)
                : location.search;

            query = querystring.parse(searchString) as any;
        }

        return {
            isMatched: true,
            params,
            query: query as any,
            forceMatch() {
                return this;
            }
        };
    }

    format(params: TParams, query?: any): string {
        params = params || ({} as any);

        const qs = query ? "?" + querystring.stringify(query) : "";

        const toPath = pathToRegexp.compile(this.urlTemplate);
        const result = toPath(params as any);

        return result + qs;
    }

    /**
     * Parses URL and constructs new URL with
     * partially updated parameters and query string.
     *
     * If given URL doesn't match current UrlPath instance, method returns undefined.
     */
    replace(url: string | Location, params?: Partial<TParams>, query?: Partial<TQueryString>): string | undefined {
        const match = this.match(url, true);

        if (!match.isMatched) {
            return undefined;
        }

        return this.format(
            {
                ...(match.params as any),
                ...(params || ({} as any))
            },
            {
                ...(match.query || ({} as any)),
                ...(query || ({} as any))
            }
        );
    }

    private normalizeUrl(url: string | LocationDescriptor): LocationDescriptor {
        if (typeof url === "string") {
            const parsedUrl = URL.parse(url);
            return {
                pathname: parsedUrl.pathname || "/",
                search: parsedUrl.search
            };
        }

        if (typeof url === "object") {
            return {
                pathname: url.pathname,
                search: !url.search || url.search.indexOf("?") !== 0 ? url.search : url.search.substring(1)
            };
        }

        return {
            pathname: ""
        };
    }
}
