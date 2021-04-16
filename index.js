#!/usr/bin/env node
const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');
const log = require('loglevel');
log.setLevel(log.levels.INFO);

const GitFilter = require('./gitfilter');
const dashIgnorePath = path.resolve(__dirname, '.dashignore');
const dashFilter = GitFilter(dashIgnorePath);


// const vensDashPath = path.resolve( __dirname, 'dash-ignore-test' );
const vensDashPath = path.resolve( __dirname, 'vens-dash' );
// copy and paste vens-dash as the specified appName
const copyDashFiles = async ( dest, successMsg="", filter) => {
    const options = filter? {filter} : undefined;
    try {
        await fse.copy(vensDashPath, dest, options );
        successMsg && log.info(successMsg);
    } catch (err) {
        console.error(err);
    }
};

// take the name of the dashboard app
const validName = rawName => {
    const name = rawName
    .replace(/[\\/?%*:|"<>\.]/g,"-")
    .replace(/^-+|-+$/g,"");
    return name;
};


// modify package name
const formatPkg = async destPath => {
    const appName = path.basename(destPath);
    const formatPkgStr = data => data
        .replace(
            /"name": "vens-dash",/g,
            `"name": "${appName}",`
        )
        .replace(
            /"author": ".*",/g,
            `"author": "",`
        );
    // const promises = ['package.json','package-lock.json'].map( pkgFile => {
    const promiseReplacePkgName = (pkgPath, resolve, reject) => {
        fs.readFile(pkgPath, 'utf8', (err, data) => {
            if (err) { log.error(err); return reject();}
            const formatted = formatPkgStr(data);
            fs.writeFile(pkgPath, formatted, 'utf8', (err) => {
                if (err) { log.error(err); return reject();}
                return resolve();
            });
        });
    };
    
    return Promise.all(
        ['package.json','package-lock.json'].map( pkgFile => {
            const pkgPath = path.join(destPath, pkgFile);
            return new Promise( (resolve, reject) => {
                promiseReplacePkgName(pkgPath, resolve, reject);
            });
        })
    );
    // return Promise.all(promises);
};
    
// npm install from the app
// const installAppReq = () => {
    
// }
    
if (require.main === module) {
    (async () => {
        const destRelPath = validName(
            process.argv[2] || 'my-vens-dash'
        );
        const destPath = path.resolve( process.cwd(), destRelPath );
        const successMsg = (`
Created ${path.basename(destPath)} app at ${destPath}.
Suggestion to continue:

    cd ./${destRelPath}
    npm install
    npm run init-start "./path/to/sd/model.mdl"

`
        );
        // log.info(`copying files:\nfrom: ${vensDashPath}\nto: ${destPath}`);
        await copyDashFiles(destPath, successMsg, dashFilter);
        await formatPkg(destPath);
        // installAppReq();
    })();
}   

module.exports = {
    validName,
    dashFilter,
    copyDashFiles,
    formatPkg
};

