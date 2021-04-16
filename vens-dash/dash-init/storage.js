const path = require("path");
const fs = require("fs").promises;
const appDir = path.resolve(__dirname,'..');
const dashDataPath = path.join(appDir,'dash-data');
const log = require('loglevel').getLogger(path.basename(__dirname)+'/'+path.basename(__filename).split('.')[0]);
// log.setLevel('info');

const copyPaste = async (from, to) => {
    return new Promise( async (resolve,reject) => {
        try {
            await fs.copyFile(from, to);
            log.info(log.name, `Written: ${to}`);
            resolve();
        }
        catch(err){
            log.error(err);
            reject();
        }
    });
};

/** copies and pastes storage files from web folder published by Vensim (in the SD_PATH dir)
 * into the right location in the database app
*/
module.exports = async (sources) => {
    const sdWeb = path.resolve(sources.SD_PATH,'web');
    await copyPaste(
        path.join(sources.MDL_PATH),
        path.join(dashDataPath, 'mdl' ,'original.mdl')
    );
    await copyPaste(
        path.join(sdWeb,'mdl.js'),
        path.join(dashDataPath, 'mdl' ,'mdl.js')
    );
    await copyPaste(
        path.join(sdWeb,'mdl.wasm'),
        path.join(dashDataPath, 'mdl' ,'mdl.wasm')
    );
    await copyPaste(
        path.join(sdWeb,'sketch.png'),
        path.join(dashDataPath, 'img' ,'diagram.png')
    );
};



// if (fs.existsSync(c0Path)){
//     fs.unlink(c0Path,(err)=>{
//         if (err) throw err;
//         console.log(`Deleted: ${c0Path}`);
//     });
// }
