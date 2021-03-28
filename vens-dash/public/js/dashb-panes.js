/** Defines classes to populate the content of dashboard view tab-panes */

/** class to add and remove tab from tabs-data-model object */
const IoMan = (tabsData) => {

    /** adds a variable of ioType (e.g. slider, chart)
     * to tab at index tabIdx to the tabs-data-model*/
    const add = (tabIdx, ioType, toAddVar) => {
        const tab = tabsData[tabIdx];
        const ioArr = tab[ioType] = tab[ioType] || [];
        ioArr.push(toAddVar);
    };
    /** removes a variable of ioType (e.g. slider, chart)
     * to tab at index tabIdx to the tabs-data-model*/
    const remove = (tabIdx, ioType, toRemoveVar) => {
        const ioArr = tabsData[tabIdx][ioType];
        ioArr.splice(
            ioArr.indexOf(toRemoveVar),
            1
        );
    };

    return { add, remove };
};

/** class to generate interface of sliders control and view */
const SlidersView = ({ mdl, c0, ioDeck, ioMan }) => {

    /** handler for when the user adds a slider */
    const onAddClick = (iTab, ioType, toAddVar) => {
        ioMan.add(iTab, 'sliders', toAddVar);
        addOne(iTab, toAddVar);
    };

    /** generates view of the div containing sliders */
    const newDiv = () => {
        const slidersDiv = $('<div class="slidersDiv container"><hr><div>');
        const row = $('<div class="row row-cols-1 row-cols-sm-2 row-cols-md-4 row-cols-lg-6 d-flex justify-content-around">').appendTo(slidersDiv);
        createLastSlider().appendTo(row);
        ioDeck.getCard('slider', onAddClick).appendTo(slidersDiv);
        return slidersDiv;
    };

    /** generates the last slider enabling iovar-card to add sliers */
    const createLastSlider = () => {
        const lastSlider = $(`
        <div class="col last-slider
        d-flex align-items-stretch
        ${editModeClass()}">
        `);
        const sliderGroup = $(`
        <div class="sliderGroup d-flex align-items-center
        flex-column justify-content-center
        add-slider"
        type="button"
        aria-expanded="false">
        `).appendTo(lastSlider);
        /* label */
        $('<label class="mx-auto">')
            .html('<strong>Add Slider</strong>')
            .appendTo(sliderGroup);
        /* image */
        $('<img src="/img/icons/add.svg" alt="" class="addButton mx-auto">')
            .on('click', ev => {
                ioDeck.toggle(ev, ".add-slider", ".sliderAdderDiv")
            })
            .appendTo(sliderGroup);
        return lastSlider;
    };

    /** adds a slider to the sliders-div view */
    const addOne = (tabIdx, param) => {
        const meta = mdl.vars[param].meta;
        const col = $("<div>").addClass("col d-flex align-items-stretch");
        const sliderGroup = $("<div>").addClass("sliderGroup d-flex align-items-start flex-column justify-content-center");
        const label = $("<label>").attr('for', param)
            .html("<strong>" + param + "</strong>")
            .addClass("mb-auto mx-auto");
        const slider = $('<input type="range">').addClass("io-slider-slide mx-auto")
            .attr("name", param).attr("value", c0[param])
            .attr("min", meta.min).attr("max", meta.max)
            .attr("step", meta.step); // here?
        const output = $("<div>").addClass("mx-auto")
            .html(`&nbsp&nbsp<span class="unit">${meta.unit}</span>`)
            .prepend($('<span>').addClass("io-slider-box mx-auto")
                .attr("name", param).html(slider.attr('value')));
        const info = $('<img type="button" data-container="body" data-toggle="popover" data-placement="bottom">')
            .attr('data-content', meta.comment)
            .attr("src", "img/icons/info.svg")
            .addClass("info mx-auto");
        const deleter = $(`<img>`).addClass(`deleter ${editModeClass()}`)
            .attr("src", "/img/icons/add.svg")
            .on('click', () => {
                ioMan.remove(tabIdx, 'sliders', param);
                col.remove();
            });
        sliderGroup
            .append(label)
            .append(output)
            .append(slider)
            .append(info)
            .append(deleter);
        col.append(sliderGroup);
        $(`#pane${tabIdx} .last-slider`).before(col);
        return col;
    };

    return { newDiv, addOne }
};


/** class to generate interface of charts control and view */
const ChartsView = ({ mdl, charter, ioDeck, ioMan }) => {

    /** handler for when the user adds a chart */
    const onAddClick = (iTab, ioType, toAddVar) => {
        ioMan.add(iTab, 'charts', toAddVar);
        addOne(iTab, toAddVar);
        charter.update();
    };

    /** generates view of the div containing charts */
    const newDiv = () => {
        const chartsDiv = $('<div class="chartsDiv container"><hr><div>');
        const row = $('<div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 d-flex justify-content-around">').appendTo(chartsDiv);
        createLastChart().appendTo(row);
        ioDeck.getCard('chart', onAddClick).appendTo(chartsDiv);
        return chartsDiv;
    };

    /** generates the last slider enabling iovar-card to add charts */
    const createLastChart = () => {
        const lastChart = $(`<div class="col last-chart ${editModeClass()}">`);
        const chartGroup = $(`
            <div class="d-flex align-items-center flex-column
                justify-content-center
                add-chart"
                type="button">`)
            .appendTo(lastChart);
        /* label */
        $('<label class="mx-auto">')
            .html('<strong>Add Chart</strong>')
            .appendTo(chartGroup),
            /* image */
            $('<img src="/img/icons/add.svg" alt="" class="addButton mx-auto">')
            .on('click', ev => {
                ioDeck.toggle(ev, ".add-chart", ".chartAdderDiv");
            })
            .appendTo(chartGroup);
        return lastChart;
    };

    /** adds a slider to the charts-div view */
    const addOne = (tabIdx, name) => {
        const chart = $('<div>').addClass("io-chart io-chart-style")
            .attr("name", name).attr("varname", name)
            .attr("xaxisname", mdl.vars['INITIAL TIME'].meta.unit)
            .attr("yaxisname", mdl.vars[name].meta.unit);
        const info = $('<img type="button" data-container="body" data-toggle="popover" data-placement="top">')
            .attr('data-content', mdl.vars[name].meta.comment)
            .attr("src", "img/icons/info.svg")
            .addClass("info");
        const deleter = $("<img>").addClass(`deleter ${editModeClass()}`)
            .attr("src", "/img/icons/add.svg")
            .on('click', () => {
                ioMan.remove(tabIdx, 'charts', name);
                col.remove();
            });
        const col = $("<div>").addClass("col")
            .append(chart.append(info))
            .append(deleter);
        $(`#pane${tabIdx} .last-chart`).before(col);
    };

    return { newDiv, addOne }
}

/**
 * Mxin class return object to combine with a NavTab
 * gives functionalities to render all panes and adding a new one
 * @param {Object} o contains all the params
 * @param {Object} o.dashb contain data about tabs, sliders and charts
 * @param {Object} o.mdl contain data about sd-model variables (name, unit etc.)
 * @param {Object} o.c0 data to initialize the sd-model  
 * @param {Charter} o.charter controls and renders charts
 * @param {IoDeck} o.ioDeck controls and renders cards to add sliders and charts
 * @param {Diagrams} o.diagrams controller and view for diagrams
 */
const Paner = ({ dashb, mdl, c0, charter, ioDeck, diagrams }) => {

    const tabsData = dashb.tabs;
    const ioMan = IoMan(tabsData);
    const ioViews = {
        'sliders': SlidersView({ mdl, c0, ioDeck, ioMan }),
        'charts': ChartsView({ mdl, charter, ioDeck, ioMan }),
    }

    /** render all panes of dashboard view and */
    async function render() {
        await renderContent(this);
        charter.update();
    }
    renderContent = async(tabber) => {
        tabsData.filter(tab => tab).map(
            async(tab, tabIdx) => {
                tabber.addTab(tabIdx, tab.name || ('Tab ' + tabIdx));
                await $ready();
                // ['sliders','charts'].forEach( ioType => {
                for (const [ioType, view] of Object.entries(ioViews)) {
                    const ioArray = tab[ioType];
                    if (tab[ioType]) {
                        // the for loop checks if the vars in the tabs control are still in the model
                        // in case it has changed since the last time
                        for (let ioIdx = 0; ioIdx < ioArray.length; ioIdx++) {
                            const param = ioArray[ioIdx];
                            mdl.vars[param] ?
                                // renderIo(tabIdx, ioType.slice(0,-1), param)
                                view.addOne(tabIdx, param) :
                                ioArray.splice(ioIdx--, 1);
                        }
                    }
                };
                // await $ready();
                // ioDeck.listen(tabIdx);
            }
        );
        await $ready();
        tabber.switchTab(0);
        $('[data-toggle="popover"]').popover();
    }

    /** add tab to dashb-tabs-data-model */
    const addDataTab = (tabIdx, title) => {
        if (!tabsData[tabIdx]) {
            tabsData[tabIdx] = {
                name: title,
                sliders: [],
                charts: []
            };
        } else {
            const tab = tabsData[tabIdx];
            tab.name = title;
            tab.sliders = tab.sliders || [];
            tab.charts = tab.charts || [];
        }
        // console.log(`Updating tabsData[${tabIdx}]:\n`, JSON.stringify(tabsData[tabIdx]));
    };

    /** ad tab-pane view and listeners */
    async function addPane(tabIdx, title) {
        addDataTab(tabIdx, title);
        const pane = $(`
            <div class="tab-pane fade show"
                id="pane${tabIdx}"
                role="tabpanel"
            >`)
            .appendTo('#tab-content');

        const $title = this.createHeader(tabIdx, title).appendTo(pane);

        // async bcs it fetches info to load image
        diagrams && diagrams.create(tabIdx).then($diagram => {
            $diagram.insertAfter($title);
        });

        Object.values(ioViews).forEach(view => {
            view.newDiv().appendTo(pane);
        });

        await $ready();
        ioDeck.listen(tabIdx);
    };

    return { render, addPane };

};