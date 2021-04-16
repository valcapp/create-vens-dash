/** test dash-init will initialize dash-data properly */
const path = require('path');
const fs = require('fs');
const { NudgingShortly, appendingArgv } = require('../tests/utils');

const dashInit = require('./index');
const log = require('loglevel').getLogger(path.basename(__dirname));
// log.setLevel('debug');
log.disableAll();

const dashData = path.resolve(__dirname,'../dash-data');
const withBackup = NudgingShortly(dashData);

expectedFiles = [
    '',
    'img',
    'json/dashb.json',
    'mdl',
    'mdl/mdl.js',
    'mdl/mdl.wasm',
    'mdl/mdlstr.json',
    'mdl/original.mdl'
].map( endString => path.resolve(dashData,endString));

test(`After dash-init, all the expected files in ./dash-data exists:
${expectedFiles.join(',\n')}
`,  withBackup(
    async done => {
        expect(fs.existsSync(dashData)).toBeFalsy();
        await dashInit();
        expectedFiles.forEach( file => {
            expect(fs.existsSync(file))
            .toBeTruthy();
        });
    }
));

test(`After dash-reset, files stored in dash-data are deleted and created again:
${expectedFiles.join(',\n')}
`,  withBackup(
    appendingArgv('fromScratch')(
        async done => {
            expect(fs.existsSync(dashData)).toBeFalsy();
            const pathToDelete = path.resolve(dashData,'delete-me.txt');
            fs.mkdirSync(path.dirname(pathToDelete),{recursive:true});
            fs.writeFileSync(
                pathToDelete,
                `And the vision that was planted in my brain
                Still remains
                Within the sound
                Of silence`
            );
            expect(fs.existsSync(pathToDelete)).toBeTruthy();
            await dashInit();
            expect(fs.existsSync(pathToDelete)).toBeFalsy();
            expectedFiles.forEach( file => {
                expect(fs.existsSync(file))
                .toBeTruthy();
            });
        }
    )
));

