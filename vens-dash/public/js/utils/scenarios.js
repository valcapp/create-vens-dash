/** manages scenarios, needs to be connected to data
 * attaches listeners to elms on page to create, switch, delete, modify scenarios
 * @param {object} o contain rest of params
 * @param {object} o.sim run the sd-model to gnerate scenarios
 * @param {object} o.uiData data-model with scenarios info
 * @param {Charter} o.charter manages charts
 */
const ScenarioMan = ({sim, uiData, charter}) => {
    const {runs: uiruns} = uiData;

    const actions = ['Create','Switch','Manage'];
    actions.map( action => {
        $(`.showRunner${action}`).on("click",() => {
            update();
            $( () => {
                actions.map( a => $(`.runner${a}`).addClass('hidden') );
                $(`.runner${action}`).removeClass('hidden');
            });
        });
    });

    /** switch the current run of sim
     * current run is the scenario controlled by users throuch sliders
     */
    const switchRun = (name) => {
        Object.assign( sim.current,
            uiruns.find( run => run.name === name )
        );
    };
    $('.switchRunButton').on('click', () => {
        const runToSwitchTo = $('.runSelect').val();
        charter.tell(switchRun)( runToSwitchTo );
    });

    /** to create a new scenario with a name and descrition */
    const createRun = (name, description) => {
        const newRun = {
            name,
            description,
            show: true,
            inputs: sim.current.inputs
        };
        uiruns.push( newRun );
        switchRun(name);
        charter.update();
    };
    $('.createRunButton').on('click', charter.tell(
        () => {
            const name = $('.newRunName').val();
            const description = $('.newRunDescription').val();
            createRun( name, description );
            $('.newRunName').val('Current');
            $('.newRunDescription').val('');
        })
    );

    /** to make the scenario visible or not */
    const toggleRun = input => {
        const run = uiruns.find( run => run.name === input.name );
        run.show = $(input).is(':checked');
    };
    $('.runnerManage').on('change', async event => {
        const input = event.target;
        const isToggle = $(input).hasClass('runToggle');
        const isCurrent = input.name === sim.current.name;
        if( isToggle ){
            if( isCurrent ){
                $(input).prop('checked',true);
                return alert('Cannot toggle off currently simulated run.');
            }
            charter.tell(toggleRun)(event.target);
        }
    });
    const deleteRun = name => {
        const runIdx = uiruns.findIndex(  run => run.name === name );
        (runIdx >= 0) && uiruns.splice( runIdx, 1 );
    };
    $('.runnerManage').on('click', event => {
        let deleter = event.target;
        for(let i=0; i<3; i++){
            if( $(deleter).hasClass('runDelete') ){
                const name = $(deleter).attr('name');
                if( name === sim.current.name ){
                    return alert('Cannot delete currently simulated run.');
                }
                charter.tell(deleteRun)( name );
                $(`.runToManage[name="${name}"]`).remove();
                break;
            }
            deleter = deleter.parentElement;
        }
    });

    // to save current scenarios
    $('.saveRunsButton').on("click",
        () => saveAndAlert(uiruns.save, 'runs')
    );

    /** update the view of the controller view of scenarios */
    const update = () => {
        // const runsManager = $('.runsManager');
        const runsManager = $('.runsManager').empty();
        const runSelect = $('.runSelect').empty();
        uiruns.forEach((run, runIdx) => {
            const isCurrent = run.name === sim.current.name;
            runSelect.append(`
                <option value="${run.name}"
                    ${sim.current.name === run.name? "selected": ""}>
                    ${run.name}
                </option>
            `);
            runsManager.append(`
                <div class="runToManage" name="${run.name}">
                    <div class="custom-control custom-switch">
                        <input type="checkbox" ${run.show?'checked':''}
                            class="custom-control-input runToggle"
                            id="run-${runIdx}" name="${run.name}"
                        >
                    <label class="custom-control-label"
                        for="run-${runIdx}">
                        ${run.name}
                    </label>
                    ${isCurrent?"":`
                        <div class="runDelete trasherButton" name="${run.name}">
                            <img src="/img/icons/trash.svg" alt="del">
                        </div>
                    `}
                    </div>
                </div>
            `);
        });
    };

    return { update }

};


