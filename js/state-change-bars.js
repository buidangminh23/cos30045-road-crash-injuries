let CHANGE_WIDTH = 520;
const CHANGE_HEIGHT = 440;
const changeMargin = { top: 36, right: 64, bottom: 40, left: 64 };

const drawStateChangeBars = (data, compact) => {
    CHANGE_WIDTH = compact ? 420 : 520;
    const innerW = CHANGE_WIDTH - changeMargin.left - changeMargin.right;
    const innerH = CHANGE_HEIGHT - changeMargin.top - changeMargin.bottom;
    const states = [...new Set(data.map(d => d.state))];
    const rows = states.map(state => {
        const start = data.find(d => d.state === state && d.year === 2011);
        const end = data.find(d => d.state === state && d.year === 2021);
        return {
            state,
            name: start.stateName,
            start: start.hospitalisations,
            end: end.hospitalisations,
            change: (end.hospitalisations - start.hospitalisations) / start.hospitalisations
        };
    }).sort((a, b) => b.change - a.change);

    const maxAbs = d3.max(rows, d => Math.abs(d.change));
    const x = d3.scaleLinear().domain([-0.3, Math.max(0.7, maxAbs)]).range([0, innerW]).nice();
    const y = d3.scaleBand().domain(rows.map(d => d.state)).range([0, innerH]).padding(0.28);

    const svg = createVizSvg("state-change-bars", CHANGE_WIDTH, CHANGE_HEIGHT);
    describeChart(svg, "state-change-bars",
        "Diverging bar chart: change in road crash hospitalisations by state or territory of residence, 2011 to 2021",
        rows.map(d => `${d.name}: ${formatPercentChange(d.start, d.end)}.`).join(" "));

    const g = svg.append("g").attr("transform", `translate(${changeMargin.left}, ${changeMargin.top})`);

    g.append("g")
        .attr("class", "viz-grid")
        .attr("transform", `translate(0, ${innerH})`)
        .call(d3.axisBottom(x).ticks(5).tickSize(-innerH).tickFormat(d => d === 0 ? "0%" : d3.format("+.0%")(d)))
        .call(axis => axis.select(".domain").remove());

    g.append("line")
        .attr("x1", x(0)).attr("x2", x(0))
        .attr("y1", -8).attr("y2", innerH)
        .attr("stroke", inkColor)
        .attr("stroke-width", 1.5);

    const colorFor = d => d.change < 0 ? "#2f8f6a" : (d.state === "Qld" ? accentColor : "#f0a07f");

    const bars = g.selectAll(".chg-bar")
        .data(rows)
        .join("rect")
            .attr("class", "chg-bar viz-mark")
            .attr("y", d => y(d.state))
            .attr("height", y.bandwidth())
            .attr("rx", 4)
            .attr("fill", colorFor)
            .attr("x", x(0))
            .attr("width", 0);

    bars.transition()
        .duration(motionDuration(800))
        .delay((d, i) => motionDuration(i * 60))
        .attr("x", d => Math.min(x(0), x(d.change)))
        .attr("width", d => Math.abs(x(d.change) - x(0)));

    g.selectAll(".chg-state")
        .data(rows)
        .join("text")
            .attr("class", "viz-label viz-strong")
            .attr("x", d => d.change < 0 ? x(0) + 10 : x(0) - 10)
            .attr("y", d => y(d.state) + y.bandwidth() / 2)
            .attr("text-anchor", d => d.change < 0 ? "start" : "end")
            .attr("dominant-baseline", "middle")
            .text(d => d.state);

    g.selectAll(".chg-value")
        .data(rows)
        .join("text")
            .attr("class", "viz-label-sm viz-muted")
            .attr("x", d => d.change < 0 ? x(d.change) - 8 : x(d.change) + 8)
            .attr("y", d => y(d.state) + y.bandwidth() / 2)
            .attr("text-anchor", d => d.change < 0 ? "end" : "start")
            .attr("dominant-baseline", "middle")
            .text(d => formatPercentChange(d.start, d.end));

    bindVizTooltip(bars, d => ({
        title: d.name,
        rows: [
            ["2011", formatNumber(d.start)],
            ["2021", formatNumber(d.end)],
            ["Change", formatPercentChange(d.start, d.end)]
        ],
        swatch: colorFor(d)
    }));
};
