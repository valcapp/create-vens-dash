const path = require("path");
const fs = require("fs").promises;
const appDir = path.resolve(__dirname,'..');
const sdWeb = path.join(process.env.SD_PATH,'web');
const dbDir = path.join(appDir,'db');
const modLoc = './build/storage';
    
const copyPaste = async (from, to) => {
    try {
        await fs.copyFile(from, to);
        console.log(`${modLoc}: Written: ${to}`);
    } catch(err){
        console.error(err);
    }
};

/** copies and pastes storage files from web folder published by Vensim (in the SD_PATH dir)
 * into the right location in the database app
*/
module.exports = async () => {
    await copyPaste(
        path.join(process.env.MDL_PATH),
        path.join(dbDir, 'mdl' ,'original.mdl')
    );
    await copyPaste(
        path.join(sdWeb,'mdl.js'),
        path.join(dbDir, 'mdl' ,'mdl.js')
    );
    await copyPaste(
        path.join(sdWeb,'mdl.wasm'),
        path.join(dbDir, 'mdl' ,'mdl.wasm')
    );
    await copyPaste(
        path.join(sdWeb,'sketch.png'),
        path.join(dbDir, 'img' ,'diagram.png')
    );
};

// if (fs.existsSync(c0Path)){
//     fs.unlink(c0Path,(err)=>{
//         if (err) throw err;
//         console.log(`Deleted: ${c0Path}`);
//     });
// }
