const express = require('express');
const log = require('loglevel').getLogger('api');
// log.setLevel('DEBUG');

/** generate router exposing APIs to read and write 
 * customizable-ui-configurations from frontend */
module.exports = (db, readOnly) => {
    log.debug('readOnly is:',readOnly);
    const { docs } = db;
    const router = express.Router();
    // router.use(express.urlencoded());

    router.get('/api/mdlstr', (req,res) => {
        res.send(docs['mdlstr'].read());
    });

    const resources = ['mdl','c0','dashb','setup','runs','text'];
    // add GET routes to router
    resources.forEach( resource => {
        router.get('/api/'+resource,(req, res)=>{
            const data = docs[resource].read();
            res.json(data);
        });
    });
    // add PUT routes to router
    resources.forEach( resource => {
        router.put('/api/'+resource,(req, res)=>{
            log.debug('readOnly is:',readOnly);
            if (readOnly){
                res.status(403).json({message:`Update forbidden for resource: "${resource}"`});
            } else {
                docs[resource].write(req.body);
                res.status(200).json({message:`Updated server resource: "${resource}"`});
            }
        });
    });

    return router;
}

