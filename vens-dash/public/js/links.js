/**
 * Controller for the links page
 * @param {Array} linksData data for the links page
 */
const Linker = (linksData) => {
    const $list = $('#linksList');
    const links = new Proxy( linksData.links, {
        set: function(target, idx, value) {
            console.log('setting "' + idx + '" of [' + target + '] with value ' + value);
            render(idx,value);
            target[idx] = value;
            // you have to return true to accept the changes
            return true;
        }
    });
    /** render one link: appends if not existing, updates it if existing */
    const render = (idx, link) => {
        $list.find(`li[name="link-${idx}"]`).length
            ?updateView(idx, link)
            :addToView(idx, link);
    };
    /** append link to the page */
    const addToView = (idx, link) => {
        $list.append(`
            <li name="link-${idx}">
                
                    <a href="${link.url}" class="editMode">
                        ${link.label}
                    </a>
                
                <div class="row linkInputs ${editModeClass()}">
                    <div class="col">
                        <label>Link label:</label>
                        <input
                            class="form-control col link-label"
                            type="text"
                            value="${link.label}"
                        >
                    </div>
                    <div class="col">
                        <label>Link url:</label>
                        <input
                            class="form-control col link-url"
                            type="text"
                            value="${link.url}"
                        >
                    </div>
                    <div class="trasherButton">
                        <img src="/img/icons/trash.svg" alt="del">
                    </div>
                </div>
            </li>
        `)
    };
    /** updates view of link */
    const updateView = (idx, link) => {
        $list.find(`li[name="link-${idx}"] a`)
            .text(link.label).attr("href",link.url);
    };
    /** render all links */
    const renderAll = () => {
        $list.empty();
        links.length?
            links.forEach( (link,i) => render(i,link) )
            :console.log('No links to display.');
    };

    /** remove link from data-model */
    const remove = idx => {
        links.splice(idx,1);
        renderAll();
    };
    /** update link */
    const update = idx => {
        const $link = $list.find(`li[name="link-${idx}"]`)
        const label = $link.find('input.link-label').val();
        const url = $link.find('input.link-url').val();
        links[idx] = {label, url};
    };
    /** extract link index from event */
    const getTargetIdx = event => {
        const $target = $(event.target);
        const $link = $target.closest('li[name^="link-"]')
        return Number( $link.attr('name').replace("link-","") );
    };

    // load existing
    renderAll();
    // listen to adding of new links
    $('#addLinkButton').on('click',() => {
        links[links.length]= {label:"new link",url:"/links"};
    });
    // listen to updates of current and future links
    $list.on('change',
        ev => update( getTargetIdx(ev) )
    );
    // listen to deletions of links
    $list.on('click',
        ev => {
            $(ev.target).closest('div').hasClass('trasherButton') &&
                remove( getTargetIdx(ev) );
        }
    );
    // listen to backend saving of links (when ready)
    $('.saveUI').on('click',
        () => saveAndAlert( linksData.save, 'links' )
    );
}

( async () => {
    const spk = await speaker;
    Linker( spk );
})();