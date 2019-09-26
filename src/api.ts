export interface NoMatch {
    isMatched: false;
}

export interface Match<TParams, TQueryString> {
    isMatched: true;
    params: TParams;
    query?: TQueryString & { [key: string]: string };
}

export interface LocationDescriptor {
    search?: string;
    pathname: string;
}

export interface UrlPath<TParams, TQueryString> {
    urlTemplate: string;

    paramType: TParams;
    queryType: TQueryString;

    /**
     * Checks if URL matches pattern specified on creating URL and extracts parameters and query if matched.
     * @param url An URL to check
     * @param exact If true method would check if pattern matched full URL, if false - only start of URL would be checked.
     */
    match(url: string | LocationDescriptor, exact: boolean): NoMatch | Match<TParams, TQueryString>;

    format(params: TParams, query?: any): string;

    /**
     * Parses URL and constructs new URL with
     * updated parameters and query string.
     *
     * If given URL doesn't match current UrlPath instance, method returns undefined.
     */
    replace(
        url: string | LocationDescriptor,
        params?: Partial<TParams>,
        query?: Partial<TQueryString>
    ): string | undefined;
}
