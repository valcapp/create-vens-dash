const fs = require('fs');
const path = require('path');

/** exports data model to read sd-model raw string */
module.exports = (() => {
    const read = () => {
        let mdlstr = "";
        try {
            mdlstr = fs.readFileSync(
                path.resolve(__dirname,'../db/mdl/mdlstr.json'), "utf-8"
            );
        } catch (err) {
            console.error(err);
        }
        return mdlstr;
    };

    return { read };
})();