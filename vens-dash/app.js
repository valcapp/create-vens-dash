// const path = require('path');
// const fs = require('fs');
const express = require('express');
const app = express();
viewMode = true; // global to make it available to the ejs engine

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/dash-data"));

// cors for debug
// const enableCors = app => {
//     const cors = require('cors');
//     app.use(cors());
//     console.log('cors enabled');
// };

const plugResources = (readOnly=true) => {
    const db = require('./db')();
    // load routes connected to the database
    const routes = require('./routes')(db, readOnly);
    // load the routes on the app
    Object.values(routes).forEach(route => app.use(route));
};

// launch the app
const launch = (openAtStart=false) => {
    const PORT = process.env.PORT || 3000;

    // LISTEN
    app.listen(PORT, () => {
        console.log(`
        ------------------------------------
                server running at:
              http://localhost:${PORT}/
        ------------------------------------
        `);
    });

    // OPEN BROWSER
    openAtStart &&
        require('open')(
            `http://localhost:${PORT}/welcome`,
            { app: 'msedge' }
            // {app: 'google chrome'}
        );
};

module.exports = {
    app,
    plugResources,
    launch
};

if (require.main === module) {
    plugResources(),
    launch();
}
