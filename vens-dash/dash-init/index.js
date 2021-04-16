/** Prepares files in database to be served by the app */
const path = require('path');
const updateEnv = require('./denv');
const getSdPaths = require('./get-sdpaths');
const DashData = require('./dashdata');
const { SdPathValidator } = require('./sdvalid');
const log = require('loglevel').getLogger(path.basename(__dirname));
log.setLevel('debug');

/** Prepares files in database to be served by the app */
const dashInit = async () => {
    return new Promise( async (resolve, reject) => {

        log.info('Initializing dashboard\n');

        log.info('Reading SD files.');
        const sdPaths = getSdPaths(SdPathValidator());

        updateEnv({
            ...sdPaths,
            TITLE: path.basename(sdPaths.MDL_PATH).replace('.mdl','')
        });
        log.info('Updtaed environment variables\n');
        
        log.info('Updating files:');
        const dashData = DashData(sdPaths);
        try {
            process.argv.includes('fromScratch') && (
                await dashData.reset()
            );
            await dashData.make();
            await dashData.fill();
            log.info('\nCompleted dashboard initialization');
        } catch (err) {
            log.error(err);
            reject(err);
        }
        resolve();
    });
};

if ( require.main === module ){
    require('dotenv').config();
    dashInit();
};

module.exports = dashInit;
