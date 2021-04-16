const path = require('path');
const fs = require('fs');
const app = require('./app');
const dashInit = require('./dash-init');

const readOptions = () => {

    const mdlChanged = (
        process.argv.includes('mdlChanged') ||
        process.env.MDL_CHANGED
    );

    // check argv is viewMode is requested, global because used in ejs snippets
    const viewMode = Boolean(
        process.argv.includes('viewMode')
        || process.env.VIEW_MODE
    );

    const openAtStart = (
        process.argv.includes('openAtStart') ||
        process.env.OPEN_AT_START
    );

    return {mdlChanged, viewMode, openAtStart}
};

// launch the app
if ( require.main === module ) {
    (async () => {
        require('dotenv').config();
        const options = readOptions();
        const { mdlChanged, openAtStart} = options;
        viewMode = options.viewMode;
        await ( mdlChanged && dashInit() );
        app.plugResources(viewMode);
        app.launch(openAtStart);
    })();
}

