const path = require('path');
const fs = require('fs');
const log = require('loglevel');

/** Instantiate a decorator that backs up
 * specified directory during decorated func execution, 
 * it does it by  temporarily modifying the name of dir
 * and restoring it after the execution of decorated function
 */
module.exports.NudgingShortly = (importantData, tmpName) => {
    tmpName = tmpName || path.basename(importantData)+'-tmp';
    const safePlace = path.resolve(
        path.dirname(importantData),
        tmpName
    );
    const cleanDestination = destination => {
        fs.existsSync( destination ) &&
            fs.rmdirSync( destination, {recursive: true});
    }
    const nudgeAway = () => {
        cleanDestination(safePlace);
        fs.existsSync( importantData ) &&
            fs.renameSync( importantData, safePlace );
    }; 
    const nudgeBack = () => {
        cleanDestination( importantData );
        fs.existsSync( safePlace ) &&
            fs.renameSync( safePlace, importantData );
    };
    
    return (func) => {
        const backedUpFunc = async (done, ...args) => {
            nudgeAway();
            try {
                await func(done, ...args);
                done && done();
            }
            catch (err) {
                log.error(err);
            }
            finally {
                nudgeBack();
            }
        };
        return backedUpFunc;
    };
};

module.exports.appendingArgv = arg => (func) => {
    return async (done, ...args) => {
        process.argv.push(arg);
        try {
            await func(...args);
            done && done();
        }
        catch (err) {
            log.error(err);
        }
        finally {
            process.argv.splice(
                process.argv.indexOf(arg),
            1);
        }
    };
};