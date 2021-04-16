const path = require('path');
const fs = require('fs');

const {
    copyDashFiles,
    formatPkg,
    dashFilter
} = require('../index');

const vensDashRequiredFiles = [
    'dash-init','db','public', 'routes',
    'views', 'app.js','package.json'
];
const testName = 'vens-dash-test';
const destPath = path.resolve( process.cwd(), testName );

const DashContext = (destPath, extraSetup) => {
    const context = {queue: 0};
    const cleanUp = () => {
        fs.existsSync(destPath) &&
            fs.rmdirSync(destPath, { recursive: true });
    };
    const setUp = async () => {
        cleanUp();
        await copyDashFiles(destPath,'',dashFilter);
        await (extraSetup && extraSetup());
        return;
    };

    /** decorator: return a function that
     * sets up and cleans up the context
     * when queue is empty */
    context.willCleanUp = (func) => {
        const withCleanUp = async (done, ...args) => {
            try {
                await ((context.queue === 0) && setUp());
                context.queue++;
                await func(...args);
                done && done();
            } catch (err) {
                console.log(err);
            } finally {
                (context.queue <= 1) && cleanUp();
                context.queue--;
            }
        };
        return withCleanUp;
    };

    return context;
};

const context = DashContext(destPath);

test(`
copyDashFiles("./${testName}")
-> then: "./${testName}" exists.
`, context.willCleanUp(
    done => {
        expect( fs.existsSync(destPath) ).toBeTruthy();
    } 
));
        
test(`
copyDashFiles("./${testName}")
-> then: [${vensDashRequiredFiles.join(', ')}] all exist.
`, context.willCleanUp(
    done => {
        vensDashRequiredFiles.forEach( file => {
            expect( fs.existsSync(
                path.join(destPath, file)
            )).toBeTruthy();
        });
    }
));

test(`
formatPkg("./${testName}")
-> then: packageJson.name === ${path.basename(destPath)}
`, context.willCleanUp( async done => {
    await formatPkg(destPath);
    ['package.json','package-lock.json'].forEach( pkgFile => {
        const pkgFilePath = path.join(destPath, pkgFile);
        if ( fs.existsSync(pkgFilePath )){
            const pkgJson = require( pkgFilePath );
            expect(pkgJson.name)
            .toBe( path.basename(destPath) );
        }
    });
}));

const badContext = DashContext(destPath+'-bad', () => {
    ['dash-init','db'].forEach( file => {
        fs.rmdirSync(
            path.join(destPath, file),
            { recursive: true }
        );
    });
});

test(`
copyDashFiles("./${testName}") with bad source
-> then: [${vensDashRequiredFiles.join(', ')}] not all exist.
`, badContext.willCleanUp( done => {
    expect(
        vensDashRequiredFiles.every(
            file => fs.existsSync( path.join(destPath, file) )
        )
    ).toBeFalsy();
}));



