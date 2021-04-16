#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const log = require('loglevel');
log.setLevel('info')

const defaultPath = path.resolve(__dirname, '../.dashignore');

// const str2re = (string) => {
//     // const match = /^\/(.*)\/([a-z]*)$/.exec(string);
//     // return match? new RegExp(match[1], match[2]) : null;
//     const match = string.match(new RegExp('^/(.*?)/([gimy]*)$'));
//     return new RegExp(match[1], match[2]);
// };

const replacements = [
    [ /\./g,    '\\.' ],
    [ /\?/g,    '.' ],
    [ /\*\*/g,  '*' ],
    [ /\*/g,    '.*' ]
];

const gitignore2re = input => {
    let lines = input
        .toString()
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(line => line )
        .filter(line => line.charAt(0) !== '#');

    // log.debug(lines);
    replacements.forEach(([from,to])=>{
        // log.debug(from, to);
        lines = lines.map( line => {
            return line.replace(from,to);
        });
    });

    const res = lines
        .map(line => new RegExp(line))
        .filter(re => re);
    // log.debug(lines);
    // log.debug(res);

    return res;
};

module.exports = (gitIgnorePath) => {

    const srcPath = gitIgnorePath || defaultPath;
    if (!fs.existsSync(srcPath)) {
        console.warn('No .gitignore file identified.')
        return pth => true;
    }

    const reToIgnore = gitignore2re(
        fs.readFileSync( srcPath )
    );

    return pth => {
        log.debug('\n',pth);
        let match = false;
        for (const re of reToIgnore){
            match = re.test(pth);
            log.debug(match, re);
            if (match) break;
        }
        log.debug(`Ignore?`, match);
        return !match;
    };
};



// const minimatch = require('minimatch');
// const gitFilter = (gitignorePath) => {
//     const globsToIgnore = parseGitignore(
//         fs.readFileSync( gitignorePath )
//     );
//     // const regexToIgnore = globsToIgnore.map(minimatch);
//     const filter = pth => {
//         log.debug('\nPath: ',pth,'\nMatches:');
//         const isToIgnore = globsToIgnore.some( glob => {
//             log.debug( minimatch(pth, glob), glob );
//             return minimatch(pth, glob);
//         });
//         log.debug(`Ignore? ${isToIgnore}`);
//         return !isToIgnore;
//     };
//     return filter;
// };

