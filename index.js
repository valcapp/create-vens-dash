#!/usr/bin/env node
const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');
const srcPath = path.resolve( __dirname, 'vens-dash' );

// take the name of the dashboard app
const validName = rawName => {
    const name = rawName
    .replace(/[\\/?%*:|"<>\.]/g,"-")
    .replace(/^-+|-+$/g,"");
    return name;
};

// copy and paste vens-dash as the specified appName
const copyFiles = async ( dest, successMsg="") => {
    try {
        await fse.copy(srcPath, dest);
        successMsg && console.log(successMsg);
    } catch (err) {
        console.error(err);
    }
};

// modify package name
const giveAppName = async destPath => {
    const appName = path.basename(destPath);
    const withNameReplaced = data => data.replace(
        /"name": "vens-dash",/g,
        `"name": "${appName}",`
    );
    // const promises = ['package.json','package-lock.json'].map( pkgFile => {
    const promiseReplacePkgName = (pkgPath, resolve, reject) => {
        fs.readFile(pkgPath, 'utf8', (err, data) => {
            if (err) { console.log(err); return reject();}
            const formatted = withNameReplaced(data);
            fs.writeFile(pkgPath, formatted, 'utf8', (err) => {
                if (err) { console.log(err); return reject();}
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
    npm run build-start "./path/to/sd/model.mdl"

`
        );
        // console.log(`copying files:\nfrom: ${srcPath}\nto: ${destPath}`);
        await copyFiles(destPath, successMsg);
        await giveAppName(destPath);
        // installAppReq();
    })();
}   

module.exports = {
    validName,
    copyFiles,
    giveAppName
}

