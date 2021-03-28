
const fs = require('fs');
const path = require('path');
const express = require('express');
const multer = require('multer');

/** generate router exposing APIs to read info of
 * user-uploaded images from frontend */
module.exports = ({docs}) => {
    const router = express.Router();
    router.use(express.urlencoded({ extended: true}));

    const imgDir = path.resolve(__dirname,'../db/img');

    const multerStorage = multer.diskStorage({
        destination: (req, file, callback) => {
            const reqName = req.params.name;
            const prevDiagram = fs.readdirSync(imgDir)
                .find( f => path.parse(f).name === reqName );
            prevDiagram &&
                fs.unlinkSync(path.join( imgDir, prevDiagram ) );
            callback(null, 'db/img');
        },
        filename: (req, file, callback) => {
            const reqName = req.params.name;
            callback(null, reqName + path.extname(file.originalname) );
        }
    });
    const diagramUpload = multer({storage: multerStorage});



    router.put('/diagram/:name',
        diagramUpload.single('diagram'),
        (req, res) => {
            if(req.file) {
                console.log(`\n${new Date()}\nWritten: ${req.params.name}`)
                res.status(200).json({ msg: `Uploaded ${req.params.name}`});
            } else {
                res.status(500).json({
                    error: new Error('Error uploading img upload-diagram')
                });
            }
        }
    );

    router.get('/diagram/:name', (req, res) => {
        const reqName = req.params.name;
        const data = docs['diagram'].read(reqName);
        res.json(data);
    });

    return router;

};