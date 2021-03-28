
/** class to create header for a tab-pane, with title and control to delete tab
 * mixin needs to complete with render() method to render rest of pane content
 */
const TabHeader = tabsData => {

    /** given the tabIdx generates a header
     * displays tab title and control to delete the tab
     */
    function createHeader (tabIdx, title) {
        const $title = $('<h4 class="container">').text(title);
        deleteTabButton(tabIdx).appendTo($title)
        .on('click', () => onTabDelete(this,tabIdx));
        return $title;
    }

    /** handler for tab deletion */
    const onTabDelete = async (tabber, tabIdx) => {
        removeDataTab(tabIdx);
        emptyNav();
        await emptyPanes();
        await tabber.render();
        activatePrevious(tabIdx);
    };

    /** remove tab from tabs-data-model */
    const removeDataTab = (tabIdx) => {
        tabsData.splice(tabIdx,1);
    };
    /** view for deleter button */
    const deleteTabButton = tabIdx => {
        return $(`<button
            class="btn btn-sm btn-outline-danger
            d-inline ml-4 tab-deleter
            ${editModeClass()}">
                Delete Tab
        </button>`)
    };
    /** clear links from nav-tabs view*/
    const emptyNav = () => {
        $('.nav-tabs').children().each( (_,child) => {
            !$(child).hasClass('lastTab') && $(child).remove();
        });
    };
    /** clear panes from tab-content view */
    const emptyPanes = async () => {
        $('.tab-content').empty();
        await $ready();
    };
    /** switch to tab indexed tabIdx */
    const switchTab = tabIdx => {
        $(`#tab-${tabIdx}`).find('a').trigger('click'); 
    };
    /** when tabIdx is deleted we want to shift to the left (tabIdx-1) */
    const activatePrevious= tabIdx => {
        const prevIdx = Math.max(0,tabIdx-1);
        const isTabActive = $(`#tab-${prevIdx} a.nav-link`).hasClass('active')
        !isTabActive && switchTab(prevIdx);
    };

    return { switchTab, createHeader };
}

/** Enable user to change name of the tab */
const TabNamer = tabsData => {

    /** updates tab tabIdx of tabs-data-model with a newName */
    const updateTabName = (tabIdx, newName) => {
        tabsData[tabIdx] = tabsData[tabIdx] || {};
        tabsData[tabIdx].name = newName;
        console.log(`Name change\ntabs[${tabIdx}] = `, newName);
    };

    /** focuses the namer (input[type="text"]) to change tab name
     * and listen to when to when to deactivate
     */
    const activate = (tabId)=>{
        const $tab = $('#'+tabId);
        const tabIdx = Number(tabId.replace('tab-',""));
        const $link = $tab.find('a').addClass('hidden');
        // const tab = $title.parents('li');
        const $namer = $tab.find('input')
            .removeClass('hidden')
            .trigger('focus')
            .trigger('select');

        /** listen whether the user clicks outside the namer to deactivate it*/
        const outTabListener = ev => {               
            const clickedOutsideTab = !$(ev.target).closest($tab).length;
            clickedOutsideTab && deactivate();
        };
        /** removes focus from namer */
        const deactivate = () => {
            $(document).off('click', outTabListener);
            $link.removeClass('hidden');
            $namer.addClass('hidden');
        };

        // listen to event inside namer
        $namer.on('keyup',(ev)=>{
            const keyCode = ev.which;
            // const keyCode = ev.key;
            // if Esc, deactivate
            if (keyCode === 27){ // press esc
                deactivate();
            // if Enter, assign name to tab
            } else if (keyCode === 13){
                const newName = $namer.val().trim();
                changeTabName($tab, newName);
                deactivate();
            }
        });
        // listen to events outside namer
        $(document).on('click', outTabListener);
    };

    /** handler to change tab name */
    const changeTabName = ($tab,newName)=> {
        const tabIdx = $tab.attr('id').replace("tab-","");
        $tab.find('a').text(newName);
        $('#pane'+tabIdx).find('h4').text(newName);
        updateTabName(tabIdx, newName);
    };

    return { activate };
};


/**
 * mixin class to manage tabs-nav-links (rename, add, remove ),
 * has to be completed with an object that has an addPane method
 * which specifies the content of the tab-pane
 * @param {*} tabsData array of tabs (model)
 */
const TabsNav = (tabsData) => {
    const current = { active: '' };

    // to renamer tab
    const namer = TabNamer(tabsData);

    /** adds a Tab to the view */
    async function addTab (tabIdx,tabName){
        const $tab = createTabLink(tabIdx,tabName).insertBefore('.tabsBar .lastTab');
        await this.addPane(tabIdx,tabName);
        const $link = $tab.find('a');
        $link.on('click',(ev)=>{
            ev.preventDefault();
            const tabId = $tab.attr('id');
            current.active === tabId
                && editMode
                && namer.activate(tabId);
            current.active = tabId;
            $link.tab('show');
            $('li.lastTab .nav-link').removeClass('active');
        });
    };

    /** create a link to be added to the nav */
    const createTabLink = (tabIdx,tabName)=>{
        const $tab = $('<li>').attr('id',`tab-${tabIdx}`).addClass('nav-item');
        const $link = $(`<a data-toggle="tab" role="tab">`)
                .addClass('nav-link'+(tabIdx===1? ' active' : ''))
                .attr('href',`#pane${tabIdx}`)
                .text(tabName).appendTo($tab);
        const $namer = $(`<input type="text" value="${tabName}">`)
                .addClass('hidden nav-link').appendTo($tab);  
        return $tab;
    };

    /** listens to the last tab link to add new tabs */
    function listen() { // declared as function bcs uses this.
        $('li.lastTab').on('click', async () => {
            $('.tab-pane.active').removeClass('active');
            const newTabIdx = $('.tabsBar li').length - 1;
            const unnamedTabsLen = $.map( $('.tabsBar a.nav-link'), el => $(el).text() )
                    .filter(x=>x.indexOf('New Tab ')>=0).length + 1;
            this.addTab(newTabIdx,'New Tab '+unnamedTabsLen);
            await $ready();
            const $link = $(`#tab-${newTabIdx}`).find('a'); 
            $link.tab('show');
            $link.trigger('click');
            $link.trigger('click');
        });
    }

    // to move between tabs and delete them
    const { switchTab, createHeader } = TabHeader(tabsData);

    return { addTab, switchTab, createHeader, listen }

};

/** Combines mixin objects into one
 * able to render and manipulate tabs-data-model
 * @param {TabsNav} nav implements addition and deletion of tabs (page-independent)
 * @param {Paner} paner implements the rendering of tabs (page-dependent)
 */
const Tabber = (nav, paner) => {
    const tabber = new Object();
    Object.assign( tabber, nav );
    Object.assign( tabber, paner );
    return tabber;
}; 
