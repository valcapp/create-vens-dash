/** loads routers for the app */
module.exports = (db, readOnly) => ({
    pages: require('./pages'),
    api: require('./api')(db, readOnly),
    diagram: require('./diagrams')(db),
});