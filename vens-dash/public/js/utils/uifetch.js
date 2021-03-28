/** get fetch resource /api/:name and return json */
const getResource = (name) => fetch('/api/'+name)
    .then( res => {
        if (res.ok) {
            console.log('Fetched ui data for: '+name)
            return res.json();
        }
    })
    .catch( err => {
        console.warn('Failed to fetch ui data for: '+name);
        console.error(err);
    });
    
    /** put fetch some json content to /api/:name resource  */
const saveResource = (name, content) => fetch('/api/'+name, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content)
    })
    .then( res => {
        if (res.ok ) {
            console.log('Saved ui data for: '+name)
            return res.json();
        }
    })
    .catch( err => {
        console.warn('Failed to save ui data for: '+name);
        console.error(err);
    });

/** saves a number of resources in one go and promises all the responses */
const saveResources = resources => Promise.all(
    Object.keys(resources).map(
        name => saveResource(name, resources[name])
    )
);

/** fetches and parse vensim .mdl string (mdlstr) to read sd-model variables
 * it's called when there is no mdl.json data on the server
 * so the the data are created on the spot by parsing the mdlstr
*/
const fillTheGap = async () => {
    await sim.ready;
    const mdlstr = await getResource('mdlstr');
    const { mdl, c0 } = await readMdl({ sim, mdlstr });

    return { mdl, c0 };
};
/** caches the resources that might be called more than once at page load */
const uiCache = (async () => {
    let cache = {};
    for(let rsc of ['mdl','c0']){
        const data = cache[rsc] = await getResource(rsc);
        const isMissing = ( !data || !Object.keys(data).length );
        if ( isMissing ){
            cache = await fillTheGap();
            // side effect, next time there will be no gap to fill
            saveResources(cache);
            break;
        }
    };
    await Promise.all( Object.values(cache) );
    return cache;
})();

/** Returns object with fetched data with an extra prototype-method to save itself on the server */
const UiData = async name => {
    const cache = await uiCache;
    const data = cache[name] || await getResource(name);
    // we define the save method ont the prototype to use it without passing this
    Object.defineProperty(data, 'save', {
        enumerable: false,
        value: () => saveResource(name, data)
    });
    return data;
};

/** call the saveFunc and alert the user about the response */
const saveAndAlert = (saveFunc, label) => {
    saveFunc().then(() => {
        alert(`UI ${label} resource was saved successfully!`)
    }).catch( err => {
        alert(`Sorry, an error occurred, UI changes to ${label} were not saved.`,err)
        console.error(err);
    });
};
/** fetches array of resources and add listener to .saveUI button to save updateTarget */
const connectUiData = async ( resources, updateTarget ) => {
    const uiData = {};
    await Promise.all(
        resources.map( async rsc => {
            uiData[rsc] = await UiData(rsc);
            return uiData[rsc];
        })
    );
    $('.saveUI').on('click',
        () => saveAndAlert(
            uiData[updateTarget].save,
            updateTarget
        )
    );
    return uiData;
};

// /** Returns the fetched data with an extra prototype method to save it back */
// const UiData = async name => {
//     const cache = await uiCache;
//     const data = cache[name] || await getResource(name);
//     // we might receive different types of objects
//     const proto = Object.getPrototypeOf(data);
//     // we define the save method ont the prototype to use it without passing this
//     !proto.hasOwnProperty('save') && Object.defineProperty(proto, 'save', {
//         enumerable: false,
//         value: function () {
//             return saveResource(name, this);
//         }
//     });
//     // we create a new object with tweaked prototype and assigned the data
//     const result = Object.create(proto);
//     Object.assign(result, data);
//     return result;
// };

    // const missingData = await readMdl( <%-mdlstr%> );
    // saveResources( missingData );
    // Object.assign( ui, missingData );    

// const UiData = async name => {
//     const data = await getResource(name);
//     const save = () => saveResource(name, data);
//     return { data, save };
// };



// const UiRender = ( initState = {}, initReactions = {} ) => {
//     const state = initState;
//     const reactions = initReactions;

//     const getUpdate = newState => (newState instanceof Function)?
//         newState(state)
//         : newState

//     const set = newState => {
//         updatedState = getUpdate();
//         Object.keys(state).map( k => delete state[k]);
//         Object.assign( state, updatedState );
//         render(updatedState);
//     };
    
//     const update = newState => {
//         updatedState = getUpdate();
//         Object.assign( state, updatedState );
//         render(updatedState);
//     };

//     const render = objUpdate => {
//         Object.keys(objUpdate).map(
//             prop => (prop in reactions) && reactions[prop].map(
//                 reaction => reaction( objUpdate[prop] )
//             )
//         );
//     };

//     return { state, reactions, set, update }

// };