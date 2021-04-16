const fs = require('fs');
const path = require('path');

const getSdPathsGeneric = require('./get-sdpaths');
const { SdPathValidator } = require('./sdvalid');
const { NudgingShortly, appendingArgv } = require('../tests/utils');
// const log = require('loglevel');
// log.setLevel('debug');

// to simplify most of the tests
const getSdPaths = () => getSdPathsGeneric( SdPathValidator() );

const findMdlChild = parentPath => {
    if(!parentPath) return;
    const fullParent = path.resolve(parentPath);
    const mdlFile = fs.readdirSync( fullParent )
        .find( file => path.extname(file) === '.mdl');
    return path.join( fullParent, mdlFile);
};
const defaultSdPath = path.resolve(__dirname,'../sd');
const defaultResult = {
    SD_PATH: defaultSdPath,
    MDL_PATH: findMdlChild( defaultSdPath )
};
const testSdName = 'sd-test';
const testSdPath = path.resolve(__dirname,'../'+testSdName);
const testResult = {
    SD_PATH: testSdPath,
    MDL_PATH: path.join(
        testSdPath,
        path.basename(defaultResult.MDL_PATH)
    )
};

const mockingValidityOf = (endName) => {
    return NudgingShortly( defaultSdPath, endName);
};

test(`getSdPaths with No arguments returns default paths
`, () => {
    expect( getSdPaths() )
    .toEqual(defaultResult);
});

test(`getSdPaths with valid sd argument return valid object
`, appendingArgv(testResult.SD_PATH)(
    mockingValidityOf(testSdName)(
        done => {
            expect(getSdPaths())
            .toEqual(testResult);
        }
    )
));

test(`getSdPaths with valid mdl argument return valid object
`, appendingArgv(testResult.MDL_PATH)(
    mockingValidityOf(testSdName)(
        done => {
            expect(getSdPaths())
            .toEqual(testResult);
        }
    )
));

// test TypeError with bad validation
const badValidator = pathToValidate => pathToValidate;
// const badValidator = pathToValidate => pathToValidate;
test(`getSdPaths with bad validator throw error
`, () => {
    // log.debug(process.argv);
    expect( () => getSdPathsGeneric(badValidator) )
    .toThrow(TypeError);
});

