/** exports a class to read and write custom-project data */
const fs = require('fs');
const path = require('path');

const dbPath = path.resolve(__dirname,'../db/json/');
const loc = name => path.resolve(dbPath, name+'.json');

/** return data object that can read and write the file <name>.json of the porject in the database */
function Model(name, defaultObj, /*view,*/ overwrite){
    const pth = loc(name);

    const read = () => {
        try {
            return JSON.parse( fs.readFileSync(pth) );
        } catch (err) {
            console.error(err);
        }
    };

    const write = ob => {
        try {
            fs.writeFileSync( pth, JSON.stringify(ob, null, 3) );
            console.log(`\n${new Date()}\nWritten: ${pth}`);
        } catch (err) {
            console.error(err);
        }
    };


    //constructor
    (!fs.existsSync(pth) || overwrite) && write(defaultObj);

    return { read, write };

}

module.exports = Model;