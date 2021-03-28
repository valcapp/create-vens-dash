const path = require('path');
const fs = require('fs');

const {
    validName,
    copyFiles,
    giveAppName
} = require('../index');

const sample = [
    ['-my-friend-','my-friend'],
    ['\hello?boy','hello-boy'],
    ['my>favourite%game*','my-favourite-game'],
    ['check|any"mistake','check-any-mistake']
];
for( const [rawName,expected] of sample ){
    test(`validName("${rawName}")\n -> ${expected}\n`, () => {
        expect(validName(rawName)).toBe(expected);
    });
}

const vensDashRequiredFiles = [
    'build','load','public', 'routes',
    'views', 'app.js','package.json'
];


const newAppCreationTest = () => {
    const destRelPath = 'my-test/my-vens-dash-test';
    const destPath = path.resolve( process.cwd(), destRelPath );
    const cleanUp = () => {
        const deleteTarget = path.resolve(
            process.cwd(),
            destRelPath.split(path.sep)[0]
        );
        fs.rmdirSync(deleteTarget, { recursive: true });
    };
    // console.log(`copying files:\nfrom: ${srcPath}\nto: ${destPath}`);
    
    test(`\ncopyFiles("./${destRelPath}")
-> then: "./${destRelPath}" exists.\n`,
        async () => {
            try{
                await copyFiles(destPath);
                expect( fs.existsSync(destPath) ).toBe(true);
            } finally {
                cleanUp(destPath);
            }
        }
    );
        
    test(`\ncopyFiles("./${destRelPath}")
-> then: [${vensDashRequiredFiles.join(', ')}] all exist.\n`,
        async () => {
            try{
                await copyFiles(destPath);
                vensDashRequiredFiles.forEach( file => {
                    expect(
                        fs.existsSync(
                            path.join(destPath, file)
                        )
                    ).toBe(true);
                });
            } finally {
                cleanUp();
            }
        }
    );

    test(`\ngiveAppName("./${destRelPath}")
-> then: packageJson.name === ${path.basename(destPath)}\n`,
        async () => {
            try{
                await copyFiles(destPath);
                await giveAppName(destPath);
                ['package.json','package-lock.json'].forEach( pkgFile => {
                    const pkgJson = require(
                        path.join(destPath,pkgFile)
                    );
                    expect(pkgJson.name).toBe(
                        path.basename(destPath)
                    );
                });
            } finally {
                cleanUp();
            }
        }
    );
};

newAppCreationTest();



