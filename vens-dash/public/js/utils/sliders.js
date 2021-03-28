/** controller connecting sliders to charts
 * return void because it attaches listeners on non-dynamic elements of the page at first call
 * @param {object} o contains parameters
 * @param {object} sim generates sd-model scenarios
 * @param {object} uiData contains data about baseline scenario
 * @param {Charter} charter exposes a tell decorator to update charts
 */
const SliderMan = ({sim, uiData, charter}) => {
    const {c0} = uiData;

    /** reset the value of sliders in view to baseline (c0) */
    const reset = () => {
        $("input.io-slider-slide").each( (_,input) => {
            input.value = c0[input.name];
            inputChanged( input );
        }); 
    };

    /** update the value shown for all sliders of this var */
    const inputChanged = input => {
        const newVal = input.valueAsNumber;
        $(`.io-slider-box[name="${input.name}"]`).text(newVal);
        $(`.io-slider-slide[name="${input.name}"]`).val(newVal);
        sim.current.inputs[input.name] = newVal;
    };

    /** wrapped func to update charts of input changes */
    const tellChartsInputChanged = charter.tell(inputChanged);

    /** listen to sliders' reset and change */
    const listen = () => {
        $('.resetAll').on('click', charter.tell( reset ) );
        $(document).on('change', event => {
            $(event.target).hasClass('io-slider-slide')
                && tellChartsInputChanged( event.target );
            return true;
        });
    };

    return listen();

};