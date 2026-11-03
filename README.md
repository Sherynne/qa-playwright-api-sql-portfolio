# QA Portfolio: API Testing, UI Automation and SQL Validation

Three small projects in one repo, built by Nicole Nyagah.

| Project | Tools | Target |
|---|---|---|
| API test suite | Playwright (JavaScript) | Restful-Booker, a public practice API |
| UI end-to-end suite | Playwright, Page Object Model | Sauce Demo, a public practice shop |
| SQL data validation | SQL (SQLite) | A small online store schema with planted defects |

A GitHub Actions workflow runs the Playwright suites on every push and uploads the HTML report.

## Run the Playwright tests

```
npm install
npx playwright install chromium
npm test              # API + UI
npm run test:api      # API only
npm run test:ui       # UI only
npm run report        # open the HTML report
```

## API suite (`tests/api`)

Covers auth, create, read, update and delete on bookings: 15 tests.

- Happy path and negative path for each operation
- Data-driven negative tests generated from a list of invalid payloads
- Authorisation checks: update and delete without a token must return 403
- Each test cleans up the bookings it creates

Observations on the API under test:

- Creating a booking with missing fields returns 500. It should be a 400 validation error.
- Invalid login credentials return 200 with a `reason` field instead of a 401.
- Deleting a booking returns 201 instead of 200 or 204.

## UI suite (`tests/ui`, `pages`)

Login, cart and checkout flows on Sauce Demo, written with the Page Object Model: 10 tests.

- Valid login, locked out user, wrong password, empty fields
- Direct access to the products page without logging in
- Cart badge update and full checkout
- Checkout validation for missing first name and postal code

## SQL validation (`sql`)

`schema.sql` and `seed.sql` build a small store database (users, products, vouchers, orders, order items) with defects planted on purpose. `queries.sql` has basic queries (joins, aggregates) and seven data validation checks that should return zero rows on healthy data.

| Check | Finds |
|---|---|
| B1 | Duplicate emails |
| B2 | Orders for users that do not exist |
| B3 | Order items for products that do not exist |
| B4 | Zero or negative quantities |
| B5 | Single-use vouchers redeemed more than once |
| B6 | Order totals that do not match items minus discount |
| B7 | Daily spend above a user's spending cap |

Run it with SQLite:

```
sqlite3 store.db < sql/schema.sql
sqlite3 store.db < sql/seed.sql
sqlite3 store.db < sql/queries.sql
```

Or paste the three files in order into DB Browser for SQLite or any online SQLite editor.
