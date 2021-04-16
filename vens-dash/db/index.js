/** exports a db object whose docs can be read and written to the database */

const Model = require('./model');

/** templates for the custom elements of the web page */
const templates = {
    text: {
        title: process.env.TITLE || 'sd',
        intro : 'Welcome to the system dynamics dashboard!',
        about : 'Run an example model to test the app.',
        links : [
            {
                "label": "Vensim",
                "url": "http://vensim.com"
            }
        ]
    },
    setup: {
        tabs: [{
            name: 'main',
            inputs: [
                // {
                //     question: 'How many whales are your stock at the moment?',
                //     variable: 'Whales Stock'
                // }
            ]
        }]
    },
    dashb: {
        tabs:[{
            name: 'main',
            sliders: [],
            charts: []
        }]
    },
    mdl: {},
    c0: {},
    runs: []
};

module.exports = () => {
    const docs = {};
    for (let [name, template] of Object.entries(templates)){
        docs[name] = Model( name, template );
    }
    docs['diagram'] = require('./diagram-model');
    docs['mdlstr'] = require('./mdlstr-model');
    
    // for(const [name,doc] of Object.entries(docs)){
    //     console.log(name);
    //     console.log(doc.read());
    // };

    return { docs };

};



