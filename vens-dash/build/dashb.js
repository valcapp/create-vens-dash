const path = require("path");
const fs = require("fs").promises;
const { JSDOM } = require("jsdom");
const jquery = require('jquery');
const dashbPath = path.resolve(__dirname + '/../db/json/dashb.json');
const modLoc = './build/dashb';

/** check existance of file */
const isThere = async pth => (
    fs.stat(pth)
    .then(st => st.isFile())
    .catch(e => console.log(`${modLoc}: Not Exists: ${e.path}`))
);

/** extract list of sliders and charts from index.html published by Vnesim */
const readVensimIndexHTML = async() => {
    const sliders = [];
    const charts = [];
    const sourcePath = path.join(process.env.SD_PATH, 'web', 'index.html');
    if (await isThere(sourcePath)) {
        try {
            const { window } = await JSDOM.fromFile(sourcePath);
            const $ = jquery(window);
            $(".io-slider-slide").each(function() {
                sliders.push($(this).attr('name'));
            });
            $(".io-chart").each(function() {
                charts.push($(this).attr('name'));
            });
        } catch (err) { console.error(`\nError reading ${sourcePath}:\n`, err); }
    };
    return {
        sliders: sliders.filter(x => x),
        charts: charts.filter(x => x)
    };
};

/** check with the user if she wants to overwrite the dashb config if already exists */
const confirmOverwrite = () => {
    const readline = require("readline").createInterface({ input: process.stdin, output: process.stdout });
    return new Promise((resolve, reject) => {
        readline.question(
            `\nThe following file already exists: ${dashbPath}\nDo you want to overwrite it? (y/n)  `,
            answer => {
                readline.close();
                resolve(answer.includes('y') || answer.includes('Y'));
            }
        )
    });
};

/** generates a dashboard configuration file in the database
 * from sd/web/index.html (published by Vensim) */
module.exports = async(overwrite = false) => {
    // check if the config file exists already
    alreadyThere = await isThere(dashbPath);
    if (alreadyThere) {
        if (overwrite) {
            const confirmation = await confirmOverwrite();
            if (!confirmation) { return; }
        } else {
            console.log(`${modLoc}: Skipped: ${dashbPath}`);
            return;
        }
    }

    // load sliders and charts from the sd/web/index.html file
    const dashbViews = {
        tabs: [{
            name: 'main',
            ...await readVensimIndexHTML()
        }]
    };

    // save the config on file
    return fs.writeFile(dashbPath,
            JSON.stringify(dashbViews, null, 3)
        ).then(() => console.log(`${modLoc}: Written: ${dashbPath}`))
        .catch(err => console.error(err));
};