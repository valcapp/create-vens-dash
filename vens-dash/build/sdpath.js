/** methods to verify validity of SD_PATH */
const path = require('path');
const fs = require('fs');
const updateEnv = require('./denv');
const rootDir = path.resolve(__dirname,'..');
const envPath = path.resolve(rootDir,'.env');


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
    checks['sd/'] = e
    checks['sd/*.mdl'] = e&& fs.readdirSync(sdPath).some(f => path.extname(f) === '.mdl');
    checks['sd/web/mdl.js'] = e&& fs.existsSync(path.resolve(sdPath,'web/mdl.js'));
    checks['sd/web/mdl.wasm'] = e&& fs.existsSync(path.resolve(sdPath,'web/mdl.wasm'));
    const missing = Object.keys(checks).filter(file => !checks[file]);
    if(missing.length){ return `\n\nInvalid sd path: ${sdPath}\nFiles missing: '${missing.join("', '")}'`;}
};

/**
 * This sets the sdPath in the process environment, but checking if it is a valid path first
 * It goes through a series of attempts, it stops as soon as find a valid path. The order is:
 * 1) the argument explicitly passed; 2) the path in the .env file;
 * 3) if attempts to set the sdPath anew (1,2), we go back to the previous definition of process.env.SD_PATH
 * 4) if 3) is not a valid path either, we try the default ./sd path
 * If none of the attempts is successful we raise an error, because vens-dash won't be able to work
 * @param {string} argPath 
 */
const set = argPath => {
    const prevPath = process.env.SD_PATH;
    const attempts = [
        () => argPath,
        () => {
            const env = fs.existsSync(envPath)? require('dotenv').config(): null;
            if (env && env.error) { throw env.error; }
            return process.env.SD_PATH;
        },
        () => prevPath,
        () => path.resolve(rootDir,'sd') // default value
        // () => path.resolve(rootDir,'sdx') // error test
    ];
    let complains = '';
    const anyLuck = attempts.some( attempt => {
        const newPath = attempt();
        const err = complain(newPath);
        if(!err){
            // console.log('Setting process variable:\nSD_PATH = ', newPath);
            process.env.SD_PATH = newPath;
            return true;
        } else {
            complains += err;
            return false;
        }
    });
    if (!anyLuck) {
        throw new Error(`No Valid SD path was found after the following attempts:\n${complains}\n`);
    }
};

/**
 * Returns a valid sdPath, if arg was passed, it checks validity and return it,
 * if no argument is passed it checks the validity of process.env.SD_PATH and in case returns it,
 * if the above are not valid it tries to read from the .env file and as last resort tries the default path
 * @param {string} argPath 
 */
const get = argPath => {
    if(argPath && !complain(argPath)){
        return path.resolve(argPath);
    }
    // if the current process.env.SD_PATH is not valid it tries the various attempts
    complain(process.env.SD_PATH) && set();
    return process.env.SD_PATH;
};

/**
 * write the specified path on .env file if the path is valid,
 * otherwise write the first valid path if finds in the attempts
 * @param {string} argPath 
 */
const write = argPath => {
    set(argPath);
    updateEnv('SD_PATH',get());
};

module.exports = {
    get,
    set,
    write
};

// write();


// const set = sdPath => {
//     const defaultPath = path.resolve(__dirname, "/../sd");
//     let anyErrs;
//     // first try the passed argument if any was passed
//     if(sdPath){
//         anyErrs = complain(sdPath);
//         anyErrs?
//             console.log(anyErrs) :
//             process.env.SD_PATH = sdPath;
//     }
//     // if no argument was passed, try check .env file
//     else {
//         console.log(anyErrs);
//         const env = fs.existsSync(".env")? require('dotenv').config(): null;
//         if (env && env.error) { throw env.error; }
//     }
//     // if a path was specified in .env it should be now in the process.env.SD_PATH
//     if(process.env.hasOwnProperty('SD_PATH')){
//         anyErrs = complain(process.env.SD_PATH);
//         if (!anyErrs){ return; }
//         else { console.log(anyErrs); }
//     } else {
//         anyErrs = complain(defaultPath);
//         if(!anyErrs){
//             process.env.SD_PATH = defaultPath;
//         } else {
//             throw new Error(anyErrs);
//         }
//     }
// }

