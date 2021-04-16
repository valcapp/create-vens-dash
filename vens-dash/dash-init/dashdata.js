const fs = require('fs');
const path = require('path');
const log = require('loglevel').getLogger(path.join(
    path.basename(__dirname),
    path.basename(__filename).split('.')[0]
));
// log.setLevel('debug');

const dashDataPath = path.resolve(__dirname,'../dash-data');
// const loc = './dash-init/dashdata.';

const fillerModules = [
    './mdlstr','./dashb','./storage' /*,'./vensim'*/
].map( moduleLoc => require(moduleLoc));

/** delete the dashData directory to restart the configuration from scratch */
const reset = () => {
    const here = 'reset:';
    if( fs.existsSync(dashDataPath) ) {
        return new Promise( (res, rej) => {
            fs.rmdir(dashDataPath, {recursive: true}, err => {
                if (err){
                    log.info(log.name,'Failed Delete: ',dashDataPath, '\n',err);
                    rej(err);
                }
                log.info(log.name,'Deleted: ',dashDataPath);
                res();
            });
        });
    } else {
        log.info(log.name,'Not Exists: ',dashDataPath);
    }
};

/** creates empty dashData dir */
const make = () => {
    const here = 'make:';
    if( fs.existsSync(dashDataPath)) {
        log.info(log.name,'Already exists: ',dashDataPath);
    } else {
        return Promise.all(
            ['img','json','mdl'].map(
                subdir => new Promise( (res, rej) => {
                    const dirPath = path.resolve(dashDataPath, subdir);
                    fs.mkdir(dirPath, {recursive: true}, err => {
                        if (err){
                            log.info(log.name,'Failed to create: ',dirPath, err);
                            rej(err);
                        }
                        log.info(log.name,'Created: ', dirPath);
                        res();
                    });
                })
            )
        );
    }
};

// fill
const fill = async sources => {
    await Promise.all(
        fillerModules.map( async modul => {
            await modul(sources);
        })
    );
};

const DashData = sources => {
    return { 
        reset,
        make,
        fill: () => fill(sources)
    }
};

module.exports = DashData;