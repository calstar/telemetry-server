[Design doc](https://docs.google.com/document/d/119mO6KgK3HY6Tx_hRBTXcs0BSQwWCaGpI0whlhqaW74/edit)


(server to be temporarily hosted here until the calstar org gets private repos)

The instructions below for installing assume you have some familiarity with nodejs: if you don't, talk to Jonathan and he'll get you up to speed.

## Setting up
1. Install nodejs and npm (look this up if you don't know how)
2. Run `npm install`
3. Install [MariaDB](https://mariadb.org/download/) (this is the SQL server the OCF uses, and is compatible with MySQL libraries)
4. Run `mysql -uroot < server/sql/setup.sql`; this initializes the database with a user and stuff.

## Running
1. <b>Start the SQL server</b> run `mysql.server start`, or whatever the docs tell you to do.
2. <b>Start the webserver</b> To start the webserver locally, run `npm start`. If you make any changes to server files, you'll need to ctrl-C and restart the server for the changes to take place. Make sure the SQL server is running.
3. To have client-side files update as you make changes, run `npm run watch`. Output files will go in the `dist` folder.
4. Visit `lvh.me:<port number>` in your web browser (`lvh.me` is an alias for localhost, and is needed to allow oauth to work). The port number is 8000 for now.

## File Structure
```
telemetry_server
├── dist/ (minified client-side JS)
├── html/ (client-side HTML files)
├── node_modules/ (external dependencies for both client and server)
├── server/ (code for webserver)
├── src/ (client-side JS files)
└── test/ (tests, format TBD for now)
```

## Style and Practice
### general
Make sure that you'll be able to understand what your code does 3 weeks from now, and make sure other people will be able to understand your code. To that end, please comment things as much as possible.

### js
Please adhere to the [standardjs](https://standardjs.com/) conventions: (tl;dr 2 space indents, single quoted strings, no semicolons—if you feel really strongly about anything, please inform me as such and we can compromise). This is just for consistency and readability, and because Jonathan doesn't want to configure eslint.

Imports (from `require`) should be declared as `const`.

Prefer `path.join` to string concatenation when specifying file paths.

Feel free to rename the variables Jonathan gave in the skeleton code. Just make sure the variable names make sense are at least somewhat descriptive.

Also, there's probably important npm packages that Jonathan hasn't imported (like a CSV parser or compression library or whatever). You're welcome to import what you need (remember to do `--save`), but use discretion, i.e. don't import libraries that do trivial tasks. File size probably isn't a huge concern for us, but it's probably a good idea to keep bloat down as much as possible as a matter of good practice.

### sql
Capitalize keywords and lowercase names, e.g. `SELECT points FROM data`. For longer statements, try to put clauses like `FROM` and `WHERE` on their own lines for readability.

If the schema of a table exists and you want to change it, remember to change it in `setup.sql` with `ALTER TABLE IF EXISTS`.

USE PREPARED STATEMENTS (as opposed to string concatenating parameters into a query). They help avoid SQL injection attacks and makes code more maintainable.

### html
Please 2 space indent. Jonathan doesn't really have much else to say.

### writing tests
Unit tests are probably good (and JS is a dangerous enough language as is), but Jonathan typically lives dangerously and thus has not chosen a testing framework for this project. If you have any suggestions, talk to Jonathan about it.

That said, please write tests (both unit and integration). This is especially important if your function handles SQL stuff, as we don't want to mess up anybody's databases with bad code.

## Library docs
The following documentation pages may be useful:
- [loggy](https://www.npmjs.com/package/loggy)
- [express](https://expressjs.com/en/4x/api.html)
- [mysql2](https://www.npmjs.com/package/mysql2)
- [MariaDB](https://mariadb.com/kb/en/library/documentation/)

If there's any other libraries not listed here, Google is your friend. If you find anything you think is worth putting here, add it.

## TODO
Tasks are listed as issues in the Github repo. If you wish to work on a task, please assign the issue to yourself.

You're welcome to work on multiple issues at a time, just make sure you're in communication with whoever has it assigned to them.

If Jonathan forgot/messed up something major (e.g. missing API endpoint), make an issue for it if it's not a quick fix and attach it to the project.

