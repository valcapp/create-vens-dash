const fs = require('fs');
const path = require('path');

const dbPath = path.resolve(__dirname,'../db');
const loc = './build/dbdir.';
const getLogger = subLoc => (
    (...args) => console.log(loc+subLoc, ...args)
);

/** delete the db directory to restart the configuration from scratch */
const reset = () => {
    const hereLog = getLogger('reset:');
    if( fs.existsSync(dbPath) ) {
        return new Promise( (res, rej) => {
            fs.rmdir(dbPath, {recursive: true}, err => {
                if (err){
                    hereLog('Failed Delete: ',dbPath, '\n',err);
                    rej(err);
                }
                hereLog('Deleted: ',dbPath);
                res();
            });
        });
    } else {
        hereLog('Not Exists: ',dbPath);
    }
};

/** creates empty db dir */
const make = () => {
    const hereLog = getLogger('make:');
    if( fs.existsSync(dbPath)) {
        hereLog('Already exists: ',dbPath);
    } else {
        return Promise.all(
            ['img','json','mdl'].map(
                subdir => new Promise( (res, rej) => {
                    const dirPath = path.resolve(dbPath, subdir);
                    fs.mkdir(dirPath, {recursive: true}, err => {
                        if (err){
                            hereLog('Failed to create: ',dirPath, err);
                            rej(err);
                        }
                        hereLog('Created: ', dirPath);
                        res();
                    });
                })
            )
        );
    }
};

// fill
const fill = async () => {
    await Promise.all(
        ['./mdlstr','./dashb','./storage' /*,'./vensim'*/]
        .map(async mod => await
            require(mod)()
        )
    );
};

module.exports = { reset, make, fill }