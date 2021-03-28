
/** combines the objects needed to put on the dashboard view
 * first fetches the data about the model (mdl,c0), UI elements (setup)
 * with fetched data, it then instantiates the tabber manage-render tabs content
*/
(async () => {
    const uiData = await connectUiData(
        ['setup','mdl','c0'],
        'setup'
    );
    $('.setBaseline').on('click', uiData.c0.save );
    const ioDeck = IoDeck(uiData);
    const nav = TabsNav( uiData['setup'].tabs );
    const paner = Paner({...uiData, ioDeck});
    const tabber = Tabber(nav, paner);
    tabber.listen();
    tabber.render();
})();

