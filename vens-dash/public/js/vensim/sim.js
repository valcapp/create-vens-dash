/** Vens-dash wrapp */

let vensimLoaded = 0;
/** mdl.js (compiled by empscripten) will call when it is ready to run */
const OnVensimLoaded = () => {
    vensimLoaded = _IsVensimLoaded();
};

/** wrapper class around Vensim APIs
 * @return {Object} object to simulate sd-model scenariosholding current run and
 * exposing methods to run model and get TimeSeriesData from it.
 * */
const Sim = () => {
    /** promise resolved once OnVensimLoaded is called */
    const ready = new Promise( (resolve, reject) => {
        try {
            const vensimChecker = setInterval( () => {
                if(vensimLoaded) {
                    clearInterval(vensimChecker);
                    resolve();
                }
            },100);
        } catch (err) {
            console.error( err );
            reject();
        }
    });

    /** run simulated if no params are passed */
    const current = {
        name: 'Current',
        show: true,
        inputs: {}
    };

    /** runs sd-model with specified params and return outputs */
    const withParams = (params, outputs) => {
        if(!vensimLoaded) { return; }
        InitializeModel();
        for (let [key, val] of Object.entries(params)){
            SetConstant(key, parseFloat(val));
        }
        RunSim();
        return outputs? getTimeSeries(outputs) : null;
    };

    /** run the sd-model with params if specified and return and return outputs if specified */
    const run = (params, outputs) => {
        // d3.selectAll("input.io-slider-slide").each(function() {
        //     //console.log("Setting " + this.name + " to " + this.valueAsNumber);
        //     current.inputs[this.name] = this.valueAsNumber;
        // });
        return withParams( params || current.inputs, outputs );
    };

    /** return one series as {time: [...], vals: [...]} */
    const getOneSeries = varname => {
        const varIdx = GetVariableIndex(varname);
        const varKey = GetVariableName(varIdx);
        return {
            time: GetSeries("Time"),
            vals: GetSeries(varKey)
        }
    };
    /** get multiple series at once */
    const getManySeries = varnames => (
        varnames.reduce( (res, name) => (
            { ...res, [name]: getOneSeries(name) }
        ),{})
    );
    /** get time series for either one or more sd-model variable */
    const getTimeSeries = varnames => (
        Array.isArray(varnames)
            ? getManySeries(varnames)
            : getOneSeries(varnames)
    );

    return { ready, current, run, getTimeSeries }
}
// instantiate Sim
const sim = Sim();


