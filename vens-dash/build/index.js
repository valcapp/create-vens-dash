/** Prepares files in database to be served by the app */

const path = require('path');
const fs = require('fs');
const fsp = require('fs').promises;
const updateEnv = require('./denv');
const sdp = require('./sdpath');
const dbDir = require('./dbdir');
const procArgs = process.argv.slice(2);

/** checks passed arguments */
const fromScratch = procArgs.includes('fromScratch');
const mdlArg = procArgs.find( arg => path.extname(arg) === '.mdl' );
// const sdArg = procArgs.find(
//     async (arg, val) => (
//         arg==='sd' &&
//         await fsp.stat(val).then( st => st.isDirectory() )
//             .catch( err => false )
//         )
//     );
const sdArg = procArgs.find(
    async (arg, val) => (
        arg==='sd'
        && fs.existsSync(val)
        && fs.lstatSync(val).isDirectory()
    )
);
const sdPath = sdArg ||
    process.env.SD_PATH ||
    path.resolve(__dirname,'../sd');

/** set env var SD_PATH */ 
const setSdEnv = () => {
    if (mdlArg){
        const mdlDir = path.resolve(path.dirname(mdlArg));
        sdp.write(mdlDir);
    } else {
        sdp.write(path.resolve(sdPath));
    }
};

/** set env var MDL_PATH */
const setMdlPath = async () => {
    if (mdlArg){
        updateEnv('MDL_PATH', path.resolve(mdlArg));
    } else {
        const sdFiles = await fsp.readdir(process.env.SD_PATH);
        const mdlFile = sdFiles.find( file => path.extname(file) === '.mdl');
        updateEnv('MDL_PATH', path.resolve(process.env.SD_PATH, mdlFile ) );
    } 
};

/** Prepares files in database to be served by the app */
const build = async () => {
    console.log('Running build\n');
    setSdEnv();
    await setMdlPath();
    updateEnv('TITLE', path.basename(process.env.MDL_PATH).slice(0,-4));
    console.log('Updtaed environment variables\n');
    console.log('Updating files:');
    fromScratch && await dbDir.reset();
    await dbDir.make();
    await dbDir.fill();
    console.log('\nCompleted build');
};

if ( require.main === module ){
    build();
};

module.exports = build;
