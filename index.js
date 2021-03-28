#!/usr/bin/env node
const fs = require('fs-extra');
const path = require('path');

// take the name of the dashboard app
const validName = require('./validname');
const name = validName(
    process.argv[2] || 'my-vens-dash'
);
const successMsg = (`
Created ${name}. To continue, please run:

  cd ${name}
  npm install

`);

// copy and paste vens-dash as the specified name
const copyFiles = async (src, dest) => {
    try {
        await fs.copy(src, dest);
        console.log(successMsg);
    } catch (err) {
        console.error(err);
    }
};
const srcPath = path.resolve( __dirname, 'vens-dash' );
const destPath = path.resolve( process.cwd(), name );
// console.log(`copying files:\nfrom: ${srcPath}\nto: ${destPath}`);
copyFiles(srcPath, destPath);


