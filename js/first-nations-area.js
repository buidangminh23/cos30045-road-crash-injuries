let AREA_WIDTH = 520;
const AREA_HEIGHT = 440;
const areaMargin = { top: 56, right: 28, bottom: 44, left: 64 };
const firstNationsColor = "#b4581d";

const drawFirstNationsArea = (data, compact) => {
    AREA_WIDTH = compact ? 420 : 520;
    const innerW = AREA_WIDTH - areaMargin.left - areaMargin.right;
    const innerH = AREA_HEIGHT - areaMargin.top - areaMargin.bottom;

    const x = d3.scaleLinear().domain(d3.extent(data, d => d.year)).range([0, innerW]);
    const y = d3.scaleLinear().domain([0, d3.max(data, d => d.firstNations)]).range([innerH, 0]).nice();

    const svg = createVizSvg("first-nations-area", AREA_WIDTH, AREA_HEIGHT);
    describeChart(svg, "first-nations-area",
        "Area chart: road crash hospitalisations of First Nations people, with records where Indigenous status was not stated, 2011 to 2021",
        data.map(d => `${d.year}: ${formatNumber(d.firstNations)} First Nations, ${formatNumber(d.notStated)} not stated.`).join(" "));

    const defs = svg.append("defs");
    const gradient = defs.append("linearGradient").attr("id", "fn-gradient").attr("x1", 0).attr("x2", 0).attr("y1", 0).attr("y2", 1);
    gradient.append("stop").attr("offset", "0%").attr("stop-color", firstNationsColor).attr("stop-opacity", 0.45);
    gradient.append("stop").attr("offset", "100%").attr("stop-color", firstNationsColor).attr("stop-opacity", 0.04);

    const g = svg.append("g").attr("transform", `translate(${areaMargin.left}, ${areaMargin.top})`);

    g.append("g")
        .attr("class", "viz-grid")
        .call(d3.axisLeft(y).ticks(5).tickSize(-innerW).tickFormat(formatNumber))
        .call(axis => axis.select(".domain").remove());
    g.append("g")
        .attr("class", "viz-axis")
        .attr("transform", `translate(0, ${innerH})`)
        .call(d3.axisBottom(x).tickValues(compact ? [2011, 2016, 2021] : yearTicks).tickFormat(d3.format("d")).tickSizeOuter(0));

    const area = d3.area().x(d => x(d.year)).y0(innerH).y1(d => y(d.firstNations));
    const line = d3.line().x(d => x(d.year)).y(d => y(d.firstNations));
    const notStatedLine = d3.line().x(d => x(d.year)).y(d => y(d.notStated));

    const clip = defs.append("clipPath").attr("id", "fn-clip").append("rect").attr("width", 0).attr("height", innerH + 10).attr("y", -10);
    const plot = g.append("g").attr("clip-path", "url(#fn-clip)");
    plot.append("path").attr("d", area(data)).attr("fill", "url(#fn-gradient)");
    plot.append("path").attr("d", line(data)).attr("fill", "none").attr("stroke", firstNationsColor).attr("stroke-width", 3.5);
    plot.append("path").attr("d", notStatedLine(data)).attr("fill", "none").attr("stroke", mutedInk).attr("stroke-width", 2.5).attr("stroke-dasharray", "6 5");
    clip.transition().duration(motionDuration(1200)).attr("width", innerW + 10);

    const last = data[data.length - 1];
    const legend = g.append("g").attr("transform", "translate(0, -34)");
    [["First Nations people", firstNationsColor, ""], ["Indigenous status not stated", mutedInk, "6 5"]].forEach(([label, color, dash], i) => {
        const item = legend.append("g").attr("transform", `translate(${compact ? 0 : i * 190}, ${compact ? i * 20 - 14 : 0})`);
        item.append("line").attr("x1", 0).attr("x2", 22).attr("stroke", color).attr("stroke-width", 3).attr("stroke-dasharray", dash);
        item.append("text").attr("class", "viz-label-sm").attr("x", 28).attr("dominant-baseline", "middle").text(label);
    });

    g.append("text")
        .attr("class", "viz-label viz-strong")
        .attr("x", x(last.year) - 4)
        .attr("y", y(last.firstNations * 0.62))
        .attr("text-anchor", "end")
        .attr("fill", firstNationsColor)
        .text(`${formatNumber(last.firstNations)} in 2021`);

    const points = g.selectAll(".fn-point")
        .data(data)
        .join("circle")
            .attr("class", "fn-point viz-mark")
            .attr("cx", d => x(d.year))
            .attr("cy", d => y(d.firstNations))
            .attr("r", 6)
            .attr("fill", "#fff")
            .attr("stroke", firstNationsColor)
            .attr("stroke-width", 3);

    bindVizTooltip(points, d => ({
        title: `${d.year}`,
        rows: [
            ["First Nations hospitalisations", formatNumber(d.firstNations)],
            ["Share of national total", `${d.share.toFixed(1)}%`],
            ["Indigenous status not stated", formatNumber(d.notStated)]
        ],
        swatch: firstNationsColor
    }));
};
