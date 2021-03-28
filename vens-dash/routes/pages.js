/** router to serve pages */
const express = require('express');
const router = express.Router();

router.get("/", (req, res) => {
    res.render("home");
});

router.get("/run", (req, res) => {
    res.render("dashb");
});

['about', 'setup', 'links', 'welcome'].forEach(route => {
    router.get("/" + route, (req, res) => {
        res.render(route);
    });
});

// router.get("/debug", (req, res) => {
//     res.render("debug");
// });

module.exports = router;