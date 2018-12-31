# Edna

Edna is the husk of a full-stack JavaScript [app](https://github.com/isaaclyman/Edward-the-App) that just molted.

- Used, but in good condition.
- Smells of berries and cardboard.
- Seems to be watching you, fascinated, as though she's been waiting for you to arrive.
- That's ridiculous, she's an inanimate object made out of code.
- Is she calling you? How could she know your name?
- Suddenly it all makes sense: snapping awake at night without knowing why; a flood of waking dreams and ideas coming to you during your morning shower; that directionless yet intense urge to *create*; the way strangers look at you as if they recognize you, as if their future selves have seen you in papers and magazines but they don't know how to tell you.
- Perhaps this is the first step on a long journey--not just for you, but for the bright spark of an idea you've been carrying quietly inside of yourself, waiting for the right kindling to set it ablaze.
- Yes, that must be it.

## Founding Principles

Edna is opinionated, but her opinions are excellent. She thinks you should use:

- [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript) as an all-purpose programming language.
- [Webpack](https://webpack.js.org/) as a module bundler and build toolset.
- [PostgreSQL](https://www.postgresql.org/) as a database.
- [Knex.js](https://knexjs.org/) as a query builder and database migration runner.
- *Nothing* as an ORM. Edna tried an ORM. She didn't like it and soon found she didn't need it.
- [Node.js](https://nodejs.org/en/) as a server-side JavaScript environment.
- [Express](https://expressjs.com/) as a server API framework.
- [Passport](http://www.passportjs.org/) as a user authentication library.
- [Vue.js](https://vuejs.org/) as a front-end framework.
- [axios](https://github.com/axios/axios) as a front-end HTTP request library.
- [Jest](https://jestjs.io/) as a unit testing framework.
- [Cypress](https://www.cypress.io/) as an e2e testing framework.
- [Heroku](https://www.heroku.com/) as an app engine and web host.

If you can tolerate her opinions, you've got an instant full-stack web app--just add ideas. If not, it's going to take some work on your end to switch things out. Maybe too much work.

Edna assumes that you're building a single-page, client-rendered Progressive Web App that requires a static landing page, a signup page, a login page, email verification, password reset, and multiple account types.

If you're an absolute beginner to web technologies, Edna may not be the right foundation for your project. You should be familiar with Webpack and Vue, or at least be prepared to spend a few days on complex configuration and build issues any time you diverge from Edna's assumptions about the structure and content of your web app.

The best way to get started is to clone the repository, fill out the environment variables, and start poking around. Here's a high-level overview of where stuff is:

`api/` contains the server-side API endpoints. It's imported by `server.js`.

`build/` and `config/` are created by the Vue CLI and contain the webpack, build, and serve configurations.

`migrations/` contains knex database migrations.

`models/` contains the code that runs knex migrations, API utilities, and account types.

`passport/` contains the Passport configuration used for login, signup, and auth token serialization and deserialization.

`public/` contains images, injectable HTML files, the landing page, and the app manifest.

`src/` contains the front end of the app.

`tests/` contains unit and e2e tests.

`db.js` is the database setup and connection file.

`server.js` is the server setup file.

## Build Setup

``` bash
# install dependencies
npm install

# serve client app with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build and serve full-stack app at localhost:3000
npm run start
# OR
npm run server

# serve Node server app with auto reload at localhost:3000
npm run server-dev

# run Jest unit tests and API integration tests
npm run test

# run Cypress integration tests in the command line (headless)
npm run integration

# run Cypress integration tests in interactive mode
npm run cypress
```

## Environment Variables

For local development, you'll need an `.env` file at the project root with the following keys:

- `DATABASE_URL={connectionString}`: A connection string for a local Postgres database. An empty database with a `public` schema and no tables should be sufficient; the ORM will create the tables and relations automatically.
- `DEBUG_DB={true|false}`: When true, all database calls will be logged to the server console.
- `NO_SSL_DB={true|false}`: When true, an SSL connection will not be used to connect to the Postgres database. This should be "true" for local development.
- `INSECURE_COOKIES={true|false}`: When true, the "secure" parameter will not be set for auth cookies. This should be "true" for local development.
- `RECAPTCHA_SECRET={secret}`: A valid Google Recaptcha site secret. If you're developing locally on /auth, you'll also need to set `window.recaptchaSiteKey` to a valid site key after page load. By default, this is set in `auth.html`.
- `SESSION_COOKIE_SECRET={secret}`: A secret to use for encrypting and decrypting session cookies.
- `BASE_URL=127.0.0.1:8080`: The base URL of the app.
- `SMTP_HOST={hostname}`: A host for sending emails via SMTP. For development, you might consider using `smtp.ethereal.email`. NOTE: you can leave the SMTP attributes blank if you're not developing email or signup functionality.
- `SMTP_USER={username}`: Your username for accessing the SMTP server.
- `SMTP_PASS={password}`: Your password for accessing the SMTP server.
- `STRIPE_SECRET_KEY={key}`: A secret key for use with the Stripe API. If you're developing locally on /auth, you'll also need to set `window.stripePublicKey` to a valid publishable key after page load. By default, this is set in `auth.html`.

## Running the app locally

`npm run dev` serves the front-end site on port 8080. `npm run server-dev` runs the API server on port 3000. Run these in separate console windows, and API requests will automatically be proxied from port 8080 to port 3000.

The webpack dev server (port 8080) will automatically redirect from routes like `/app` and `/auth` to `/app.html` and `/auth.html`. On the express server (port 3000) the original routes work without a redirect.

For best results, it's recommended to visit `127.0.0.1` instead of `localhost`.

## Tests

`npm run test` is self-contained. Do not try to run it while a local server is already running. Port 3000 must be available.

If tests fail on a fresh install of Edna, it's probably due to missing tables. Run the tests a second time.

The Cypress tests require `npm run server` to be running in order to function. I recommend that you run this (and `npm run cypress`) in the Powershell console or Linux Bash, not in the Git Bash.
