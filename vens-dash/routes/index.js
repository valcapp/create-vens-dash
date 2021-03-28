/** loads routers for the app */
module.exports = db => ({
    pages: require('./pages'),
    api: require('./api')(db),
    diagram: require('./diagrams')(db),
});