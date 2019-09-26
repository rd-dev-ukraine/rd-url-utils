What to test:

## `match` method:
* Match URL no params (/a/b/c)
* Match URL params first (/:a/b/c)
* Match URL params last (/a/b/:c)
* Optional parameter (/a/:id/:name?) - this is not working yet
* Few params one by one (/:a/:b/:c)
* All of above with full or partial match (/:a/:b/ should match /1/2/asdasd/asdas/ if `exact` option set to false)
* All of above with and without query string (/1/2/c and /1/2/3?a=1&b=2&asda=123123)
* All of above with LocationDescriptor ({ pathname: "1234", query: "a=1&b=2&asda=123123" })
* All of above with or without trailing slash (/1/2/3/ and /1/2/3)

## `format` method
* Same URLs as for `match`
* With or without query (/:a/:b/:c + { a: 1, b: 2, c: 3} + { val: 12321 } = /1/2/3?val=12321)