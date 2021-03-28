/** exports data model to read information about requested diagram */
const path = require('path'),
    fs = require('fs'),
    sizeOf = require('image-size');
const imgDir = path.resolve(__dirname,'../db/img');

// const read = () => {

//     const appDir = path.resolve(__dirname+'/../..'),
//     diagrams = fs.readdirSync(appDir+'/public/img')
//     .filter(f=>f.split('.')[0]==='diagram');
    
//     const src = diagrams.length ?
//     'img/'+diagrams[0] :
//     fs.existsSync(appDir+'/public/img/sketch.png') ?
//     'img/sketch.png' :
//     false;
    
//     const width = src? sizeOf('public/'+src).width : 0;

//     return { src, width }
// };

const read = (reqName) => {
    const ret = {
        src: "",
        style: ""
    };
    // this is because I don't know if exists and the extension in advance
    const fileName = fs.readdirSync(imgDir)
        .find( f => path.parse(f).name === reqName );

    if (fileName){
        ret.src = '/img/'+ fileName;
        const filePath = path.join(imgDir,fileName);
        const maxWidth = sizeOf(filePath).width;
        ret.style = `max-width: ${maxWidth}px;`;
    }

    return ret;
};

module.exports = { read };


