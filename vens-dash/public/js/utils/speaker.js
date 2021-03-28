/** controller that makes cmz- text elemetns of the page customizable
 * return the textData object, wrapped in a proxy that update the output when the object is changed
 * when initialized starts listening to text input changes and toggling
 * @param {object} textData contains data to fill text in the page
*/
const Speaker = textData => {
    
    const cmz = key => 'cmz-'+key;
    const uitext = new Proxy(
        textData, 
        {
            /** proxy when updating the data object to refresh outputs */
            set: function(obj, prop, newval){
                obj[prop] = newval;
                $(`.${cmz(prop)} output`).html( newval );
                if (prop === 'title') {
                    $('title,.ui-data-title').text(newval);
                }
            }
        }
    );    
    const $cmzElems = $(`[class^="cmz-"],[class*=" cmz-"]`);
    $cmzElems.find('input,textarea,label').addClass('hidden');


    // explicitly defined bcs some field are not in the original schema
    // so the schema is defined on the page, not a problem as long as
    // text data is stored as JSON string (so no server validation on fields)
    const keys = ['title',
        'subtitle1','subtitle2',
        'intro','links',
        'about-lead','about-main',
        'links-lead'
    ];
    /** update data object when input change */
    keys.forEach( key => {
        uitext[key] = uitext[key];
        $(`.${cmz(key)} input,.${cmz(key)} textarea`)
            .val( uitext[key] )
            .on('change', event => {
                uitext[key] = event.target.value;
            });
    });

    /** text customizing inputs to be visible when designer mode in on */
    $('.designerCtrl button').on('click', () => {
        $cmzElems.find('input,textarea,label,output').toggleClass('hidden');
    });

    // const save = () => saveAndAlert( ctr.save, 'text' );

    return uitext;

};

const speaker = (
    async () => Speaker( await UiData('text') )
) ();