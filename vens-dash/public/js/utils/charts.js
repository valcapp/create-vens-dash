/** view object for charts
 * @param {object} o contain parameters
 * @param {object} o.sim object to generate sd-model runs
 * @param {object} o.uiData object specifying which runs are loaded
 */
const Charter = ({sim, uiData}) => {
    const {runs: uiruns} = uiData;
    const margin = {left: 70, right: 30, top: 30, bottom: 50};
    const data = {};
    const activeRuns = [];
    const colorList = "1f77b4ff7f0e2ca02cd627289467bd8c564be377c27f7f7fbcbd2217becf"
        .match(/.{6}/g).map(s=>'#'+s);
    const textColor = (
            (typeof bkGround !== 'undefined') &&
            bkGround.isDark
        )?'white':'black';

    /** get internal object */
    const chartData = varname => {
        !data[varname] && Object.assign(data, {[varname]:{}} );
        return data[varname];
    };

    /** get windows objects */
    const getCharts = () => d3.selectAll(".io-chart")
        .nodes().map( domDiv => {
            const div = d3.select(domDiv);
            const varname = div.attr("varname");
            return { varname, div }
        });


    /** update the data object to make sure that each chart
     * has the run runName, if the run to update is not the sim.currName
     * re-run the model taking the params from ui.runs
     */
    const updateData = (runToUpdate) => {
        const run = runToUpdate || sim.current;
        // this to make sure last simulated run is the specified one (if specified)
        sim.run( run.inputs );
        // update the data object
        getCharts().forEach( ({varname}) => {
            chartData(varname)[run.name] = sim.getTimeSeries(varname);
        });
    };

    /** Connect ui.runs to .data[varname].runs */
    const update = () => {
        // update with current run as default
        updateData();
        const currentIsIncluded = uiruns.map( run => run.name ).includes(sim.current.name);
        const runs = currentIsIncluded?
            uiruns
            :[ ...uiruns, sim.current ];
        const charts = getCharts();
        activeRuns.length = 0;
        runs.forEach( run => {
            run.show && !activeRuns.includes(run.name) && activeRuns.push(run.name);
            charts.forEach(({varname})=>{
                !chartData(varname)[run.name] && updateData( run );
            });
        });
        updateView();
    };

    /** update ui of data */
    const updateView = () => getCharts().forEach( ({varname, div}) => {
        const frame = getFrame(div);
        const runs = chartData( varname );
        const axes = setAxes(frame, runs );
        drawLines( frame, runs, axes );
        setLegend( frame, Object.keys(runs) );
    });

    /** ui lements and properties */
    const getFrame = div => {
        // const width = parseInt(div.style("width"), 10);
        // const height = parseInt(div.style("height"), 10);
        const width = parseInt(div.style("width"), 10) || 300;
        const height = parseInt(div.style("height"), 10) || 300;
        const viewBox = ["0", "0", width, height];
        div.select("svg").remove();
        div.selectAll("svg").data([0])
            .join("svg").attr("viewBox", viewBox.join(","));
        const svg = div.select("svg");
        const color = d3.scaleOrdinal()
            .domain(activeRuns).range(
                colorList.slice(0, activeRuns.length)
            );
        return { div, svg, width, height, color };
    };

    /** given a find the min and max across runs */
    const getRunsMinMax = (runs, axis) => {
        const dimension = (axis==='x')?'time':'vals';
        return ['min','max'].map(
            (extrType, i) => Object.values(runs).reduce(
                (extreme, run) => Math[extrType](
                    extreme,
                    d3[extrType](run[dimension])
                ),
                ((-1)**i) * Number[`${extrType.toUpperCase()}_VALUE`]
            )
        )
    };

    /** update axes of the svg */
    const setAxes = (frame, runs) => {
        const { div, svg, width, height } = frame;
        // TITLE
        svg.selectAll("text.title")
            .data([0])
            .join("text").attr("class", "title")
            .attr("x", (width - margin.left - margin.right)/2 + margin.left)
            .attr("y", (margin.top))
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .text(div.attr("name"))
            .style("fill",textColor);
        // X AXIS
        const xscale = d3.scaleLinear()
            .domain( getRunsMinMax(runs,'x') )
            .range([margin.left, width - margin.right]);
        svg.selectAll("g.xaxis")
            .data([0])
            .join("g").attr("class", "xaxis")
            .attr("transform", "translate(0, " + (height - margin.bottom) + ")")
            .call(d3.axisBottom(xscale).ticks(width / 80).tickSizeOuter(0));
        svg.selectAll("text.xunits")
            .data([0])
            .join("text").attr("class", "xunits")
            .attr("x", (width - margin.left - margin.right)/2 + margin.left)
            .attr("y", height - 14)
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .style('fill',textColor)
            .text(div.attr("xaxisname"));
        const yMinMax = getRunsMinMax( runs );
        const yscale = d3.scaleLinear()
            .domain(yMinMax)
            .range([margin.top, height - margin.bottom]);
        const yscale_inv = d3.scaleLinear()
            .domain(yMinMax)
            .range([height - margin.bottom, margin.top]);
        svg.selectAll("g.yaxis")
            .data([0])
            .join("g").attr("class", "yaxis")
            .attr("transform", "translate(" + margin.left + ", 0)")
            .call(d3.axisLeft(yscale_inv));
        svg.selectAll("text.yunits")
            .data([0])
            .join("text").attr("class", "yunits")
            .attr("transform", "rotate(-90)")
            .attr("y", 16)
            .attr("x", -(height - margin.top - margin.bottom)/2 - margin.top)
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .style('fill',textColor)
            .text(div.attr("yaxisname"));
        
        return { xscale, yscale };
    };

    /** draw the paths on svg */
    const drawLines = (frame, runs, axes ) => {
        // filter based if runs are active
        const { svg, height, color } = frame;
        const { xscale, yscale } = axes;
        Object.keys(runs).filter( key => activeRuns.includes(key) )
        .forEach((key, runIdx)=> {
            const isCurrent = key === sim.current.name;
            svg.selectAll("path.data" + runIdx)
            .data([runs[key].vals])
            .join("path")
            .attr("class", "data" + runIdx)
            .attr("d", (d, i) => d3.line()
                    .x((d, i) => xscale(runs[key].time[i]))
                    .y((d) => height - margin.bottom - yscale(d) + margin.top)(d)
            )
            .attr("stroke", color(key))
            .attr("fill", "none")
            .attr('stroke-width', isCurrent? '2.5':'1');
        });
    };

    /** load legend on svg */
    const setLegend = (frame) => {
        const { svg, color, width, height } = frame;
        svg.select('.legendGroup').remove();
        const legendGroup = svg.append('g')
            .attr("class","legendGroup")
            .attr('transform',`translate(${0.75*width},${0.18*height})`);
        const legend = d3.legendColor()
            .shape('circle')
            .shapeRadius(4)
            .scale(color)
            .shapePadding(0);
        legendGroup.call(legend);
        legendGroup.selectAll('text')
            .attr('font-size', '10px')
            .style('fill',textColor);
    };

    // wrapper around any action that needs to update charts after executions
    function tell(action){
        return function () {
            action(...arguments);
            update();
        }
    };

    // listen to tab switches and ensure charts are sized correctly
    $('.tabsBar').on('click', () => {
        // dirty but otherwise when tabs are switched, the charts are not visualized correctly
        // because in the last update they were not displayed
        // couldn't be bothered to find out exactly how bootstrap switches tabs
        setTimeout(updateView, 300);
    });

    /** listen for changes in window size */
    window.addEventListener('resize', () => {
        $('.div.io-chart').each( div => {
            div.height = div.width*0.85;
        });
        updateView();
    });

    return { update, tell }

};