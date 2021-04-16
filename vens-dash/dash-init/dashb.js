const path = require("path");
const fs = require("fs").promises;
const { JSDOM } = require("jsdom");
const jquery = require('jquery');
const dashbPath = path.resolve(__dirname + '/../dash-data/json/dashb.json');
const log = require('loglevel').getLogger(
    path.basename(__dirname)+'/'+
    path.basename(__filename).split('.')[0]
);

/** check existance of file */
const isThere = async pth => (
    fs.stat(pth)
    .then(st => st.isFile())
    .catch(err => log.info(log.name, `Not Exists: ${err.path}`))
);

/** extract list of sliders and charts from index.html published by Vnesim */
const readVensimIndexHTML = async (sources) => {
    const sliders = [];
    const charts = [];
    const sdPath = sources.SD_PATH; 
    const sourcePath = path.join( sdPath, 'web', 'index.html');
    if (await isThere(sourcePath)) {
        try {
            const dom = await JSDOM.fromFile(sourcePath);
            const $ = jquery(dom.window);
            $(".io-slider-slide").each(function() {
                sliders.push($(this).attr('name'));
            });
            $(".io-chart").each(function() {
                charts.push($(this).attr('name'));
            });
        } catch (err) {
            // info bcs it fails with jest but not when running normally, not essential in productio either
            log.info(log.name,`Error reading ${sourcePath}:\n`);
            log.debug( log.name, err);
        }
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
const writeDashb = async (sources, overwrite = false) => {
    // check if the config file exists already
    const alreadyThere = await isThere(dashbPath);
    if (alreadyThere) {
        if (overwrite) {
            const confirmation = await confirmOverwrite();
            if (!confirmation) return;
        } else {
            log.info(log.name, `Skipped: ${dashbPath}`);
            return;
        }
    }

    // load sliders and charts from the sd/web/index.html file
    const dashbViews = {
        tabs: [{
            name: 'main',
            ...await readVensimIndexHTML(sources)
        }]
    };

    // save the config on file
    return fs.writeFile(dashbPath,
            JSON.stringify(dashbViews, null, 3)
        ).then(() => log.info(log.name,`Written: ${dashbPath}`))
        .catch(err => console.error(err));
};

module.exports = writeDashb;

if (require.main === module){
    writeDashb({ SD_PATH: path.resolve('./sd')},true);
}