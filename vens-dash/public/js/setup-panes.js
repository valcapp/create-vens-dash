/** Defines classes to populate the content of setup view tab-panes */

/** Controller for content of setup tab-panes */
const Paner = ({setup, mdl, c0, ioDeck}) => {
    
    /** renders the input data to tab[indexTab] */
    const loadInput = (indexTab, data) => {
        const pane = $(`#pane${indexTab}`);
        const inputGroup = $('<div>').addClass('form-group inputGroup').on({
                mouseenter: () => editMode && inputGroup.addClass('highlighted'),
                mouseleave: () => editMode && inputGroup.removeClass('highlighted')
            }).insertBefore(pane.find('button.add-input'));
        if ( data.question ){
            const question = $('<p>').addClass('question')
                .html(`<strong>${data.question}</strong>`)
                .appendTo(inputGroup);
        }
        const varInfo = mdl.vars[data.variable];
        if (!varInfo){
            return console.error(`
                Variable "${data.variable}" not in the model.
                Try to check the spelling.
            `);
        }
        const inputSubGroup = $('<div>').addClass('row justify-content-start align-items-center')
            .appendTo(inputGroup);
        const label = $('<label>').addClass('col-12 col-sm-6 col-lg-4')
                .html(data.variable.replace('"',''))
                .appendTo(inputSubGroup);
        const input = $(`<input type="number" name="var${varInfo.index}">`)
                .val(c0[data.variable])
                .addClass('col-6 col-sm-3 col-lg-2 form-control setupInput')
                .appendTo(inputSubGroup)
                .on('change',ev => {
                    c0[data.variable] = ev.target.valueAsNumber
                });
        const deleter = $("<img>").attr("src","/img/icons/add.svg")
            .addClass(`deleter ${editModeClass()}`)
            .appendTo(inputGroup)
            .on('click',() => {
                const inputs = setup.tabs[indexTab].inputs;
                inputs.splice( inputs.findIndex(
                    input => (
                        input.variable === data.variable &&
                        input.question === data.question
                    )
                ),1);
                inputGroup.remove();
            });
        if (varInfo.meta){
            const meta = varInfo.meta;
            const unit = $('<span>')
                .addClass('unit col-2 col-sm-1')
                .text(meta.unit)
                .insertBefore(input);
            input.attr('min',meta.min)
                .attr('max',meta.max)
                .attr('step',meta.step);
        }
        // console.log(question,variable);
    };

    /** updates data-model by adding input(ioType) to tab[iTab] */
    const addInput = (iTab,ioType,toAddVar) => {
        //ioType is not used in this case, but since this func is passed as argument to another function, this last passes the 3 args by default
        const inputToAdd = {},
            questionToAdd = $(`#pane${iTab} .inputQuestion`).val();
        if (questionToAdd){
            inputToAdd.question = questionToAdd;
        }
        inputToAdd.variable = toAddVar;
        if(!setup.tabs[iTab].inputs){
            setup.tabs[iTab].inputs = [];
        };
        setup.tabs[iTab].inputs.push(inputToAdd);
        loadInput(iTab,inputToAdd);
    };

    /** updates data-model of setup-tabs
     * (misleading name)
     */
    const updateCtrl = (tabIdx,title)=> { 
        if(!setup.tabs[tabIdx]){
            setup.tabs[tabIdx] = {
                name: title,
                inputs: []
            };
        } else {
            const tab = setup.tabs[tabIdx];
            tab.name = title;
            tab.inputs = tab.inputs || [];
            console.log(`adding setup.tabs[${tabIdx}]:\n`,JSON.stringify(setup.tabs[tabIdx]));
        }
    };
    
    /** adds a pane to both data and view */
    async function addPane(tabIdx,title) { 
        updateCtrl(tabIdx,title);
        const pane = $(`
            <div class="tab-pane fade show"
                id="pane${tabIdx}"
                role="tabpanel"
            >`)
            .appendTo('#tab-content');

        this.createHeader(tabIdx, title).appendTo(pane);

        const newInputButton = $('<button type="button">')
            .appendTo(pane)
            .addClass(`btn btn-block
                btn-outline-primary
                add-input ${editModeClass()}`)
            .html('New Input')
            .on('click',
                ev => ioDeck.toggle(ev,'.add-input',".inputAdderDiv")
            );
        ioDeck.getCard('input', addInput, true).appendTo(pane);
        await $ready();
        ioDeck.listen(tabIdx);
    };

    /** render all the setup panes based on the setup-tebs data object panes */
    async function render () {
        setup.tabs.filter(tab=>tab).map(
            (tab,tabIdx) => {
                this.addTab(tabIdx, tab.name || 'Tab '+tabIdx );
                tab.inputs.map(
                    inp => loadInput( tabIdx, inp )
                );
            }
        );
        await $ready(); 
        const $firstTab = $('#tab-0').find('a');
        !$firstTab.hasClass('active') && $firstTab.trigger('click');
        await $ready(); 
    }

    return { render, addPane };
}