// load .mdl as a string
const fs = require('fs').promises;
const path = require('path');
const destinationDir = path.resolve(__dirname,'../db/mdl');
const destination = path.resolve(destinationDir,'mdlstr.json');
const modLoc = './build/mdlstr';

/** writes the sd-model as raw string in the database
 * so that can be served by the app
*/
module.exports = async () => {
    let mdlString;
    try {
        mdlString = await fs.readFile(process.env.MDL_PATH,"utf8");
        mdlString = mdlString
            .replace("{UTF-8}","")
            .slice(0,mdlString.indexOf("\n\\\\\\---///"));
    } catch(err){
        console.error(err);
    }

    if(mdlString){ 
        try {
            await fs.writeFile(destination, JSON.stringify(mdlString) );
            console.log(`${modLoc}: Written:`, destination);
        }
        catch(err){
            console.error(err);
        }
    }


};


