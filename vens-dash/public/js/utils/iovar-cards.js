
/** provides cards to add sd-model variables to an ioType list
 * @param {object} o contains parameters
 * @param {objext} o.mdl contains data about sd-model variables
*/
const IoDeck = ({mdl}) => {

    /**
     * Return the jquery object of an input Card, that allows the user to select a constant or variable, which is eventually passed to the addFunc function
     * @param {string} ioType - the type of input/output we want add as variable, if either 'input' or 'slider' are selected the options available would be only the constants
     * @param {function object} addFunc - the function to be executed when the Add button
     * @param {boolean} inputQuestion - true if we want to attach a text question input before the select var input
     */
    const getCard = (ioType, addFunc, inputQuestion=false)=>{
        const inputAdderDiv = $('<div>')
            .addClass(`
                card container
                ${ioType}AdderDiv adderDivHidden
                ${editModeClass()}
            `);
        const cardBody = $('<div>')
            .addClass('card-body')
            .appendTo(inputAdderDiv);
        const cardTitle = $('<h5>')
            .addClass('card-title').html(`Add ${ioType}`)
            .appendTo(cardBody);

        if (inputQuestion){
            const questionGroup = $('<div>')
                .addClass('form-group')
                .appendTo(cardBody);
            const questionLabel = $('<label>')
                .html('Question')
                .appendTo(questionGroup);
            const questionInput = $('<input type=["text"] placeholder="Enter question">')
                .addClass('form-control inputQuestion')
                .appendTo(questionGroup);
            const questionSmall = $('<small>')
                .addClass('form-text text-muted')
                .text('The question to the user represented by the input')
                .appendTo(questionGroup);
        }

        const varLabel = $('<label>')
            .html("Variable")
            .appendTo(cardBody);
        const varNameGroup = $('<div>')
            .addClass('input-group')
            .appendTo(cardBody);
        const varNamePrep = $('<div>')
            .addClass('input-group-prepend')
            .appendTo(varNameGroup);
        const nameLabel = $('<label>')
            .addClass('input-group-text')
            .html('Name')
            .appendTo(varNamePrep);
        const nameSelect = $('<select>')
            .addClass(`custom-select ${ioType}NameSelector`)
            .appendTo(varNameGroup);
        const nameSmall = $('<small>')
            .addClass('form-text text-muted')
            .text(`The model variable the new ${ioType} will refer to.`)
            .appendTo(cardBody);
        const subsGroup = $('<div>')
            .addClass('subsGroup')
            .appendTo(cardBody);
        const br = $('<br>').appendTo(cardBody);
        // const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1);
        // const cardOpenerTag = ".add-" + capitalize(ioType);
        const buttonsGroup = $('<div>')
            .addClass('buttonsGroup')
            .appendTo(cardBody)
            .on('click',
                ev => toggle(ev, `.add-${ioType}`, `.${ioType}AdderDiv`)
            );
        const backButton = $(`<button type="button">`)
            .addClass(`btn btn-outline-secondary`)
            .html('Back')
            .appendTo(buttonsGroup);
        const addButton = $(`<button type="button" aria-expanded="false">`)
            .addClass(`btn btn-primary ${ioType}Submit`)
            .html('Add')
            .on('click', ev => {
                const iTab = $(ev.target).closest(".tab-pane")
                    .attr('id').replace("pane","");
                addVar(iTab, ioType, addFunc);
            })
            .appendTo(buttonsGroup);
        return inputAdderDiv;
    };

    const toggleWithinPane = (ev, targetTag, hiddenType) => {
        const hiddenClass = hiddenType.charAt(0)==="." ? hiddenType.slice(1) : hiddenType;
        const $pane = $(ev.target).closest(".tab-pane");
        const $target = $pane.find(targetTag);
        $target.toggleClass(hiddenClass);
    };

    /**
     * toggles the inputCard, so that either the opener or the card are displayed (so they are never displayed together)
     * @param {event object} ev - the user's click, used to idaentify which tab-pane the user refers to
     * @param {string} openerTag - querySelector that opens the input card when clicked (inside the tab-pane where the event happened)
     * @param {string} targetCard - querySelector to identify the inputCard (inside the tab-pane where the event happened)
     */
    const toggle = (ev, openerTag, targetCard) => {
        toggleWithinPane(ev,openerTag,"adderDivHidden");
        toggleWithinPane(ev,targetCard,"adderDivHidden");
    };

    const listen = iTab => {
        const ioTypes = ['input','slider','chart'];
        ioTypes
            .filter(
                iot => $(`#pane${iTab} .${iot}NameSelector`).length
            )
            .map(
                iot => selectNameToAdd('pane'+iTab, iot)
            )
    };

    /**
     * populates the options for the name select input of the inputCard, and checks the subscript options for each name (on change)
     * @param {string} tabId - the id of the tab-pane containing the input-card
     * @param {string} ioType - the type of input or output to add, it can be input for the setup or slider and chart for the dashboard
     */
    const selectNameToAdd = (tabId,ioType) => {
        let select = $(`#${tabId} .${ioType}NameSelector`)
            .on('change',()=>
                selectSubscript(tabId,ioType)
            );
        const names = (ioType==="input"||ioType==="slider")?
            mdl.constNames
            :mdl.varNames;
        names.forEach((name)=>{
            const option = $('<option>')
                .attr("value",name)
                .html(name);
            select.append(option);
        });
        selectSubscript(tabId, ioType);
    }

    /**
     * Depending on the variable name currently selected, it populates the options for the subscript select-input
     * @param {string} tabId - the id of the tab-pane containing the input-card
     * @param {string} ioType - the type of input or output to add, it can be input for the setup or slider and chart for the dashboard
     */
    const selectSubscript = (tabId,ioType) => {
        let selectedName = $(`#${tabId} .${ioType}NameSelector`).children("option:selected").attr('value'),
            selectedVars = Object.keys(mdl.vars).filter(v => mdl.vars[v].name===selectedName),
            subsRanges = mdl.vars[selectedVars[0]].subs,
            adderGroup = $(`#${tabId} .${ioType}AdderDiv div.card-body`),
            subsGroup = adderGroup.find('.subsGroup').empty();
        if(subsRanges){
            subsRanges.forEach((range,i)=>{
                const label = $('<label>').addClass('input-group-text').html(range),
                    select = $('<select>').addClass("custom-select subSelector");
                    mdl.subs[range].elements.forEach((elmt)=>{
                    const option = $('<option>').attr("value",elmt).html(elmt);
                    select.append(option);
                });
                const labelDiv = $('<div>').addClass("input-group-prepend").append(label),
                    inputGroup = $('<div>').addClass("input-group mb-3").append(labelDiv).append(select);
                subsGroup.append(inputGroup);
            });
        }
    }

    /**
     * reconstruct the variable (from name and suscripts) in form of string recognizable by the model
     * @param {string} iTab - the index of the tab addFunc is referring to
     * @param {string} ioType - the type of input/output element the var addition is referring to
     * @param {function object} addFunc - the addFunc to be performed with the selected var
     */
    const addVar = (iTab, ioType, addFunc) => {
        // if (!currentActiveTabs['tab'+iTab]) {return;}
        // if (currentActiveTab !== '#tab'+iTab ) {return;}
        const selectedName = $(`#pane${iTab} .${ioType}NameSelector`).children("option:selected").attr('value'),
            selectedVars = Object.keys(mdl.vars).filter(v => mdl.vars[v].name===selectedName),
            subsGroup = $(`#pane${iTab} .${ioType}AdderDiv .subsGroup`),
            selectedSubs = [];
        subsGroup.find('.subSelector').each(function(){
            selectedSubs.push($(this).children("option:selected").attr("value"));
        });
        let toAddVar = !selectedSubs.length ? selectedVars:
            selectedVars.filter( v => {
                const vSubs = v.split("[").slice(-1)[0].replace("]","").split(",");
                return selectedSubs.every(s=>vSubs.indexOf(s)>=0);
            });
        toAddVar.length>1?console.log("Error: the slider to add is not uniquely identified"):{};
        toAddVar = toAddVar[0];
        // console.log('Adding '+toAddVar);
        if (toAddVar){
            addFunc(iTab,ioType,toAddVar);
        }
    }

return { getCard, addVar, listen, toggle }

}

