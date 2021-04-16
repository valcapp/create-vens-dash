const path = require('path');
const log = require('loglevel');
// log.setLevel('debug');
// log.disableAll();

const GitFilter = require('../gitfilter');
const dashIgnorePath = path.resolve(__dirname, './ignore.txt');
const dashFilter = GitFilter(dashIgnorePath);

const sample = require('./filtersample.json');
const filterTests = [
    {
        description: `Files in .gitignore are ignored.\n`,
        expected: false,
        sample: sample.ignored
    },
    {
        description: `Files not in the .gitignore are included\n`,
        expected: true,
        sample: sample.included
    }
];

filterTests.forEach( ({description, expected, sample}) => {
    describe(description, ()=> {
        sample.forEach( pth => {
            test(pth, () => {
                expect(dashFilter(pth)).toBe(expected);
            });
        });
    });
});


