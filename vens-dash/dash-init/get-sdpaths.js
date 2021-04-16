const path = require('path');
const fs = require('fs');
const log = require('loglevel').getLogger(path.basename(__dirname));
// log.setLevel('info');

const findMdlChild = parentPath => {
    if (!parentPath) return;
    const fullParent = path.resolve(parentPath);
    const mdlFile = fs.readdirSync( fullParent )
        .find( file => path.extname(file) === '.mdl')
    return path.join( fullParent, mdlFile);
};

/** read process.argv to find either path to sd folder or mdl file */
const readPathArgs = () => {
    const procArgs = process.argv.slice(2);
    const mdlArg = procArgs.find(
        arg => path.extname(arg) === '.mdl'
    );
    const sdArg = procArgs.find( arg => {
        const argPth = path.resolve(arg);
        return (
            fs.existsSync(argPth)
            && fs.lstatSync(argPth).isDirectory()
        );
    });
    return {
        mdl: mdlArg? path.resolve(mdlArg): undefined,
        sd: sdArg? path.resolve(sdArg): undefined
    };
};

/** takes {mdl,sd} object, check paths and return valid {MDL_PATH, SD_PATH, TITLE } */
const digestPaths = (pathArgs, validate) => {
    const { mdl, sd } = pathArgs;
    let mdlPath, sdPath;
    if (mdl) {
        const mdlParent = path.dirname( mdl );
        sdPath = validate( mdlParent );
        mdlPath = (sdPath === mdlParent)?
            mdl :
            findMdlChild(sdPath);
    } else {
        sdPath = validate(sd);
        mdlPath = findMdlChild(sdPath);
    }
    // log.debug(`Digested Paths:\nSD_PATH:\t${sdPath}\nMDL_PATH:\t${mdlPath}`);
    if (!mdlPath) throw new TypeError(`After validation MDL_PATH should be non empty string, received falsy`);
    if (!sdPath) throw new TypeError(`After validation SD_PATH should be non empty string, received falsy`);
    return {
        MDL_PATH: mdlPath,
        SD_PATH: sdPath
    };
};

const getSdPaths = (validate) => {
    const cliArgs = readPathArgs();
    return digestPaths( cliArgs, validate );
};

module.exports = getSdPaths;