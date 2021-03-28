/** combines the objects needed to put on the dashboard view
 * first fetches the data about the model (mdl,c0), UI elements (dashb) and scenarios(runs)
 * with fetched data, it then instantiates objects providing for sliders, charts and scenarios
 * with fetched data and these compoenents, it then instantiates the tabber manage-render tabs content
 */

// let view //an object to see the components state when debugging
(async() => {
    const uiData = await connectUiData(
        ['dashb', 'mdl', 'c0', 'runs'],
        'dashb'
    );
    await sim.ready;
    const charter = Charter({ sim, uiData });
    const sliderMan = SliderMan({ sim, uiData, charter });
    const scenarioMan = ScenarioMan({ sim, uiData, charter });

    const ioDeck = IoDeck(uiData);
    const diagrams = Diagrams('dashb');
    const nav = TabsNav(uiData['dashb'].tabs);
    const paner = Paner({...uiData, ioDeck, charter, diagrams });
    const tabber = Tabber(nav, paner);
    tabber.listen();
    tabber.render();

    // console.log(uiData.mdl);
    // view = { uiData, tabber, sliderMan, charter, scenarioMan};
})();