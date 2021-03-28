/** Vensim types */
const varTypes = {
    5: 'data',
    8 : 'level',
    15 :'time base',
    17 :'auxiliary',
    19 :'game variable',
    22 :'initial',
    23 :'constant',
    24 :'unchengable constant',
    26 :'lookup table',
    27 :'string variable'  
};
const specialFuncs = [
    'SMOOTH',
    'DELAY'
]

/** extracts variables info and baseline inputs from mdlstr (raw string of vensim model) */
const readMdl = async ({sim, mdlstr}) => {
    const mdl = await parseMdlStr({sim, mdlstr});
    const c0 = await getC0({sim, constKeys: mdl.constKeys });
    return {mdl,c0}
};    

/** generates baseline inputs given the array of constants */
const getC0 = async ({sim, constKeys}) => {
    await sim.ready;
    sim.run();
    const t0 = GetSeries('Time')[0];
    const c0 = {};
    constKeys.forEach((c)=>{
        c0[c] = GetValueAtTime(c, t0 );
    });
    return c0;
};

/** parses the mdlstr (vensim .mdl raw string) into object with variables info, like:
 * {
 *   [varkey]:
 *     {
 *      name: ...,
 *      type: ...,
 *      meta: {}
 *      ...
 *     }
 *   ...
 * }
 */
const parseMdlStr = async ({sim, mdlstr}) => {
    if(!mdlstr) return console.warn('Empty mdlString');
    await sim.ready;
    sim.run();
    // a chunk should roughly correspond to a variable (or group of subscripted ones)
    const chunks = mdlstr
        .replace(/\r\n/g,"\n")
        .split("|\n\n")
        .filter( chunk => !chunk.includes("**********************") );
    const { subscripts, getVarSubs } = readSubscripts(chunks);
    const variables = getWasmVars(getVarSubs);
    let varNames = [];
    Object.values(variables).forEach(
        v => !varNames.includes(v.name) &&
            varNames.push(v.name)
    );
    assignMetaToVariables( variables, varNames, chunks );
    let { constKeys, constNames } = getConstants(variables);

    // the names are used in ui dropdown menus (user-customizable)
    // for now filtered out not to mess up with d3 charts
    const controlVars = ['Time','INITIAL TIME','TIME STEP','FINAL TIME', 'SAVEPER'];
    varNames = varNames.filter( name => !controlVars.includes(name) );
    constNames = constNames.filter( name => !controlVars.includes(name) );

    return {
        subs: subscripts,
        vars: variables,
        varNames,
        constKeys,
        constNames
    };

}

/** scan the chunks of mdlstr to identify subscripts */
const readSubscripts = chunks => {
    const subscripts = {};

    for (let i =0; i<chunks.length; i++){
        var lines = chunks[i].split('\n').filter((line)=>line.length>0);
        lines = lines[0].length<1? lines.slice(1):lines;
        // subscripts are defined with column, like countries: UK, France, Spain, Italy
        if (lines[0].trim().slice(-1)===":"){
            let subsName = lines[0].trim().slice(0,-1);
            subscripts[subsName]={
                name: subsName,
                elements: lines[1].replace(/\t/g,"").split(",").map(el=>el.trim()),
                meta: getMeta(lines)
            };
            chunks.splice(i,1);
            i--;
        }
    }

    /** identifies name and subscripts for given variable */
    const getVarSubs = (varKey) => { //returns the name of the variable without subscripts, and its 
        let name = varKey,
            subs = false;
        if (varKey.slice(-1)==="]"){ //it might be a subscripted variable if last char is "]"
            let subsString = varKey.slice(1+varKey.lastIndexOf("["),varKey.lastIndexOf("]"));
            if (subsString){ //if it doesn't find the opening bracket subs would be undefined
                let varSubs = [],
                elmts = subsString.split(",");
                elmts.forEach((varEl)=>{ //for each element of the variable we check if match any element of the subscript
                    for(let subscript in subscripts){
                        if (varEl===subscript){
                            varSubs.push(subscript);
                        } else {
                            subscripts[subscript].elements.forEach((subEl)=>{
                                if (varEl===subEl){
                                    varSubs.push(subscript);                            
                                }                            
                            });
                        }
                    }
                });
                if(varSubs){ //if this is not empty the variable was indeed a subscripted variable
                    name = varKey.slice(0, varKey.lastIndexOf(subsString)-1 );
                    subs = varSubs;
                } //if there was no match between var elements and subscipts elements the name and subs are the default ones
            }
        }
        name = name.replace(/"/g,"");
        name = name.replace(/^#+|#+$/g,''); // trim #
        specialFuncs.forEach( specialFunc => {
            name = name.replace(`>${specialFunc}`,"");
        })
        return { name, subs };
    };

    return { subscripts, getVarSubs };
};

/** return object containing info about index, type, name and subscript of all variables */
const getWasmVars = getVarNameAndSubs => {
    const variables = {};
    const varsLength = GetNumVariables();
    for(let i=0; i< varsLength ;i++){
        const varKey = GetVariableName(i);
        const varIndex = GetVariableIndex(varKey);
        (i!=varIndex) && console.warn(`
            Index not matching for variable: ${varKey}
            ${i} != ${varIndex}
        `)
        variables[varKey]={
            index: i,
            type: varTypes[GetVariableType(i)],
            // meta: getMeta(), // empty object at this stage, but at least all variables have one
            ...getVarNameAndSubs(varKey)
        };
    }
    return variables;
};

/** Given the array of lines for the chunk, extract metadata info for the variable
 * @return {object} { unit, min, max, step, comment } */
const getMeta = (allLines) => {
    const lines = allLines || [];
    const metaLines = lines.filter(
        line => line.includes("~") && !line.includes("~~")
    ); //check if \t~ works as well
    let [unit,min,max,step,comment] = new Array(5).fill(undefined);
    if(metaLines[0]){
        let meta = metaLines[0].replace(/\s+/g, " "); // replace space,tabs, new-lines with space
        meta = meta.split('~')[1].trim();
        // meta = meta.slice(0,indx(meta,"]"));
        meta = meta.split("[");
        unit = meta[0].trim() || undefined;
        if(meta[1]){
            [min,max,step] = meta[1].replace("]","").split(",")
                .map(m => m.trim())
                .map(m => (m != "?")? m : undefined );
        }
    }
    if (metaLines[1]){
        comment = metaLines[1].split('~')[1].trim();
    }
    return {
        unit,
        min,
        max,
        step,
        comment
    };
};

/** loops across chunks to extract metadata and assign them to the right variables */
const assignMetaToVariables = (variables, varNames, chunks) => {
    const namesToMatch = [
        //desc bcs we want to loop from most specific to the least
        // otherwise a less specific can match a more specific before it
        ...varNames.sort( (a,b)=> b.length - a.length )
    ].filter(name => name != 'Time' ); 
    const unexpectedMeta = [];
    const unmatchedChunks = [];

    chunks.forEach( chunk => {
        let lines = chunk.split("\n").filter( line => line.length );
        const meta = getMeta(lines);
        // let's associate the chunk varName
        // if ( lines[0].includes("growth rate") ) debugger
        const varNameIdx = namesToMatch.findIndex( name => lines[0].includes(name) );
        // const varName = namesToMatch.find( name => lines[0].includes(name) );
        // bcs of subscripts, each chunk may correspondes to many vars (keys), but should have one varName only
        // one meta per chunk, so one meta per name
        if( varNameIdx < 0 ){
            // if there is no varName, the chunk is without match
            unmatchedChunks.push(lines[0]);
        } else {
            const varName = namesToMatch[varNameIdx]
            // once we associate a meta to a name,
            // we extend the same meta to the other variables with same name
            Object.keys(variables)
            .filter( k => variables[k].name === varName )
            .map( k => {
                const existingMeta = variables[k].meta;
                existingMeta &&
                    unexpectedMeta.push({var: k, ...existingMeta});
                variables[k].meta = meta;
            });
            // once a variable got metadata assigned to it,
            // we don't need to loop over it for the next chunks
            namesToMatch.splice(
                // namesToMatch.indexOf(varName)
                varNameIdx
                ,1
            ); 
        }
    });
    const leftWithoutMeta = Object.keys(variables)
        .filter( k => !variables[k].meta )
        .map( k => {
            variables[k].meta = getMeta(); // to have at least empty object
            return k
        })
        .filter( k => k !== 'Time' ) // .mdl files show no metadata info for 'Time'

    // checks
    const reports = [
        [
            namesToMatch,
            'The following variable-names might be without metadata: '
        ],[
            leftWithoutMeta,
            'The following variables-keys might be with undefined metadata: '
        ],[
            unexpectedMeta,
            'The following metadata might have been wrongly assigned: '
        ],[
            unmatchedChunks,
            'The following .mdl chunks were not associated to any variable: '
        ]
    ]
    reports.forEach( report => {
        const [items, msg] = report;
        items.length && console.warn(msg, items);
    });
    
}

/** from the variables object it return the key of variables that are constants */
const getConstants = variables => {
    // assign an initial default value to constants
    const constNames = [];
    const t0 = GetSeries('Time')[0];
    const constKeys = Object.keys(variables)
        .filter( k => variables[k].type === 'constant')
        .map( k => {
            const c = variables[k];
            !constNames.includes(c.name)
                && constNames.push(c.name);
            c.value = GetValueAtTime(k,t0);
            return k;
        });

    return { constKeys, constNames}

};


