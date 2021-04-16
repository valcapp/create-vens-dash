// sdPathBeforeConfig
const path = require('path');
const { SdPathValidator, SdPathError } = require('./sdvalid');
const { NudgingShortly } = require('../tests/utils');

const root = path.resolve(__dirname,'..');
const fullPath = name => path.resolve(root, name);
const sd = 'sd';
const testNames = {
    arg: 'sd-test-arg' , 
    manual: 'sd-test-manual', 
    config: 'sd-test-config', 
    default: sd,
    wrong: 'sd-test-wrong'
};
const testPaths = {};
for (let [key,name] of Object.entries(testNames)){
    testPaths[key] = fullPath(name);
}
const validate = SdPathValidator(testPaths.manual);
const mockingValidityOf = (endName) => {
    return NudgingShortly(fullPath(sd), endName);
};

// passed via argument
test(`SdPathValidator:Argument case:
Given: argument='${testNames.arg}'
Then: validate('${testNames.arg}') -> '${testPaths.arg}' (if valid)
`, mockingValidityOf(testNames.arg)(
    () => {
        process.env.SD_PATH = undefined;
        expect( validate(testNames.arg) )
        .toBe( testPaths.arg );
    })
);

// set manually, before .env config
test(`SdPathValidator:Manual case:
Given: no argument but manual='${testNames.manual}',
Then: validate() returns: '${testPaths.manual}' (if valid)
`, mockingValidityOf( testNames.manual )(
    () => {
        process.env.SD_PATH = undefined;
        expect(validate())
        .toBe(testPaths.manual);
    })
);

// set via .env config
test(`SdPathValidator:Config case:
Given: no argument, invalid manual but config='${testNames.config}'
Then: validate() -> '${testPaths.config}' (if valid)
`, mockingValidityOf( testNames.config )(
    () => {
        process.env.SD_PATH = testPaths.config;
        expect(validate())
        .toBe(testPaths.config);
    })
);

// default no arguments
test(`SdPathValidator:Default case:
Given: No argument, invalid manual, no config
Then: validate() -> '${testPaths.default}' (if valid)
`, () => {
    process.env.SD_PATH = undefined;
    expect(validate())
    .toBe(testPaths.default);
});

// no good argument
test(`SdPathValidator:Error case:
Given: No argument, invalid init, invalid config, invalid default
Then: validate('${testNames.wrong}') raises SdPathError (because invalid)
`, mockingValidityOf()( // invalidates the default option
    () => {
        process.env.SD_PATH = undefined;
        expect( () => validate(testNames.wrong) )
        .toThrow(SdPathError);
    })
);