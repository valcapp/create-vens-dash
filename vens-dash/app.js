// re-build if requested
const mdlChanged = process.argv.includes('mdlChanged') || process.env.MDL_CHANGED;
const buildDone = (async() => {
    await (
        mdlChanged && require('./build')()
    );
})();

const path = require('path');
const fs = require('fs');

// set environment
const env = fs.existsSync('./.env') ? require('dotenv').config() : null;
if (env && env.error) throw env.error;

// instantiate the express app
const express = require('express'),
    app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/db"));

const corsEnabled = false;
if (corsEnabled) {
    const cors = require('cors');
    app.use(cors());
    console.log('cors enabled');
}

// declare some global variables used to populate ejs templates
// check argv is viewMode is requested, global because used in ejs snippets
viewMode = process.argv.includes('viewMode') || process.env.VIEW_MODE;

// load routes based on databse 
const loadDone = (async() => {
    // wait for build bcs the db loads files written by build
    await buildDone;
    // load database
    db = require('./load')();
    // load routes connected to the database
    const routes = require('./routes')(db);
    // load the routes on the app
    Object.values(routes).forEach(route => app.use(route));
})();

const openAtStart = process.argv.includes('openAtStart') || process.env.OPEN_AT_START;

// launch the app
const PORT = process.env.PORT || 3000;
(async PORT => {
    await loadDone;
    app.listen(PORT, () => {
        console.log(`
        ------------------------------------
                server running at:
              http://localhost:${PORT}/
        ------------------------------------
        `);
    });
    openAtStart &&
        require('open')(
            `http://localhost:${PORT}/welcome`,
            { app: 'msedge' }
            // {app: 'google chrome'}
        );
})(PORT);