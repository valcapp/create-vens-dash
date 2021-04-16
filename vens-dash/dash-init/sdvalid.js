/** methods to verify validity of SD_PATH */
const path = require('path');
const fs = require('fs');
const sdPathInit = process.env.SD_PATH;

class SdPathError extends Error{
    constructor(attemptedPath, ...args){
        super(...args);
        if(Error.captureStackTrace){
            Error.captureStackTrace(this,SdPathError);
        }
        this.name = 'SdPathError';
        this.code = 'ENOENT';
        this.path = attemptedPath;
        this.date = new Date();
    }
} 

/** checks if the specified path is a valid sdPath:
 * returns undefined if the path is valid, string error message if not
 * To be a valid path it should:
 * 1) exist;
 * 2) contain an .mdl file
 * 3) contain a /web/mdl.js file
 * 4) contain a /web/mdl.wasm file
 * @param {string} sdPath 
 */
const complain = sdPath => {
    const checks = {};
    const e = fs.existsSync(sdPath);
    checks['./'] = e
    checks['./*.mdl'] = e&& fs.readdirSync(sdPath).some(f => path.extname(f) === '.mdl');
    checks['./web/mdl.js'] = e&& fs.existsSync(path.resolve(sdPath,'web/mdl.js'));
    checks['./web/mdl.wasm'] = e&& fs.existsSync(path.resolve(sdPath,'web/mdl.wasm'));
    const missing = Object.keys(checks).filter(file => !checks[file]);
    if(missing.length) return (`
        Invalid sdPath: ${sdPath}
        Missing: '${missing.join("', '")}'
    `);
};

/** Return function that validates the passed argument and return a valid sdPath */
const SdPathValidator = (manualSdPath) => {

    /**
     * This sets the sdPath in the process environment, but checking if it is a valid path first
     * It goes through a series of attempts, it stops as soon as it finds a valid path. The order is:
     * 1) the input argument; 2) the path specified manually through command line;
     * 3) the current path in process.env (that should be set based on .env config)
     * 4) the default is ./sd path
     * If none of the attempts is successful we raise an error, because vens-dash won't be able to work
     * @param {string} argPath 
     */
    const validate = argPath => {
        const sdPaths = {
            'arg': argPath,
            'manual': manualSdPath || sdPathInit,
            'config': process.env.SD_PATH,
            'default': path.resolve(__dirname,'../sd')
        };
        const attempts = Object.values(sdPaths).map(
            pth => pth? path.resolve(pth) :null
        );
        let flaws = '';
        let validPath;
        if(!
            attempts.some( newPath => {
                validPath = newPath;
                const flaw = complain(validPath);
                if(!flaw) return true;
                else flaws += flaw;
            })
        ) {
            // throw new Error(`No Valid SD path was found after the following attempts:\n${flaws}\n`);
            throw new SdPathError(validPath,`No Valid SD path was found after the following attempts:\n${flaws}\n`);
        }
        return validPath;
    };
    return validate;
};

module.exports = {
    SdPathError,
    SdPathValidator
};
