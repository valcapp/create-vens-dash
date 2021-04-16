// load .mdl as a string
const fs = require('fs').promises;
const path = require('path');
const destinationDir = path.resolve(__dirname,'../dash-data/mdl');
const destination = path.resolve(destinationDir,'mdlstr.json');
const log = require('loglevel').getLogger(path.basename(__dirname)+'/'+path.basename(__filename).split('.')[0]);
// log.setLevel('info');
// const modLoc = './dash-init/mdlstr';

/** writes the sd-model as raw string in the database
 * so that can be served by the app
*/
module.exports = async sources => {
    return new Promise( async (resolve,reject) => {

        const mdlPath = sources.MDL_PATH;
        let mdlString;
        try {
            mdlString = await fs.readFile(mdlPath,"utf8");
            mdlString = mdlString
                .replace("{UTF-8}","")
                .slice(0,mdlString.indexOf("\n\\\\\\---///"));
        } catch(err){
            log.error(err);
            reject(err);
        }

        if(mdlString){ 
            try {
                await fs.writeFile(destination, JSON.stringify(mdlString) );
                log.info(log.name, `Written:`, destination);
                resolve();
            }
            catch(err){
                log.error(err);
                reject(err);
            }
        }

        resolve();
    });
};


