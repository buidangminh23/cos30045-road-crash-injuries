let HEATMAP_WIDTH = 760;
let HEATMAP_HEIGHT = 430;
let heatmapMargin = { top: 36, right: 12, bottom: 64, left: 56 };
const monthAbbreviations = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const heatmapColor = d3.scaleSequential()
    .interpolator(d3.interpolateRgbBasis(["#f4f7fb", "#a9c4e2", "#3f74ad", "#12355b"]));

const drawMonthHeatmap = (data, compact) => {
    HEATMAP_WIDTH = compact ? 400 : 760;
    HEATMAP_HEIGHT = compact ? 560 : 430;
    heatmapMargin = compact ? { top: 32, right: 8, bottom: 72, left: 54 } : { top: 36, right: 12, bottom: 64, left: 56 };
    const innerW = HEATMAP_WIDTH - heatmapMargin.left - heatmapMargin.right;
    const innerH = HEATMAP_HEIGHT - heatmapMargin.top - heatmapMargin.bottom;
    const years = [...new Set(data.map(d => d.year))];
    const extent = d3.extent(data, d => d.hospitalisations);
    heatmapColor.domain(extent);

    const x = d3.scaleBand().domain(d3.range(1, 13)).range([0, innerW]).paddingInner(0.08);
    const y = d3.scaleBand().domain(years).range([0, innerH]).paddingInner(0.12);

    const svg = createVizSvg("month-heatmap", HEATMAP_WIDTH, HEATMAP_HEIGHT);
    const lowest = data.reduce((a, b) => (b.hospitalisations < a.hospitalisations ? b : a));
    describeChart(svg, "month-heatmap",
        "Heatmap: road crash hospitalisations by month and year, 2011 to 2021",
        `Darker cells mean more hospitalisations. The lightest cell is ${lowest.month} ${lowest.year} with ${formatNumber(lowest.hospitalisations)}. Summer months (December to March) and later years are darker.`);

    const g = svg.append("g").attr("transform", `translate(${heatmapMargin.left}, ${heatmapMargin.top})`);

    g.selectAll(".hm-month")
        .data(monthAbbreviations)
        .join("text")
            .attr("class", "viz-label viz-muted hm-month")
            .attr("x", (d, i) => x(i + 1) + x.bandwidth() / 2)
            .attr("y", -12)
            .attr("text-anchor", "middle")
            .text(d => compact ? d[0] : d);

    g.selectAll(".hm-year")
        .data(years)
        .join("text")
            .attr("class", "viz-label viz-muted hm-year")
            .attr("x", -10)
            .attr("y", d => y(d) + y.bandwidth() / 2)
            .attr("dominant-baseline", "middle")
            .attr("text-anchor", "end")
            .text(d => d);

    const cells = g.selectAll(".hm-cell")
        .data(data.map(d => ({ ...d, monthNum: monthAbbreviations.indexOf(d.month.slice(0, 3)) + 1 })))
        .join("rect")
            .attr("class", "hm-cell viz-mark")
            .attr("x", d => x(d.monthNum))
            .attr("y", d => y(d.year))
            .attr("width", x.bandwidth())
            .attr("height", y.bandwidth())
            .attr("rx", 4)
            .attr("fill", "#f4f7fb");

    cells.transition()
        .duration(motionDuration(700))
        .delay((d, i) => motionDuration(i * 4))
        .attr("fill", d => heatmapColor(d.hospitalisations));

    g.append("rect")
        .attr("class", "hm-highlight")
        .attr("x", x(monthAbbreviations.indexOf(lowest.month.slice(0, 3)) + 1) - 3)
        .attr("y", y(lowest.year) - 3)
        .attr("width", x.bandwidth() + 6)
        .attr("height", y.bandwidth() + 6)
        .attr("rx", 6)
        .attr("fill", "none")
        .attr("stroke", accentColor)
        .attr("stroke-width", 3);

    bindVizTooltip(cells, d => ({
        title: `${d.month} ${d.year}`,
        rows: [
            ["Hospitalisations", formatNumber(d.hospitalisations)],
            ["Vs 2011–2021 monthly average", formatPercentChange(d3.mean(data, m => m.hospitalisations), d.hospitalisations)]
        ],
        swatch: heatmapColor(d.hospitalisations)
    }));

    drawHeatmapLegend(svg, extent, innerW, compact);
};

const drawHeatmapLegend = (svg, extent, innerW, compact) => {
    const legendW = compact ? innerW : Math.min(320, innerW);
    const legendX = heatmapMargin.left;
    const legendY = HEATMAP_HEIGHT - 34;
    const gradientId = "hm-gradient";
    const gradient = svg.append("defs").append("linearGradient").attr("id", gradientId);
    d3.range(0, 1.01, 0.1).forEach(t => {
        gradient.append("stop")
            .attr("offset", `${t * 100}%`)
            .attr("stop-color", heatmapColor(extent[0] + t * (extent[1] - extent[0])));
    });
    const legend = svg.append("g").attr("transform", `translate(${legendX}, ${legendY})`);
    legend.append("rect").attr("width", legendW).attr("height", 10).attr("rx", 5).attr("fill", `url(#${gradientId})`);
    legend.append("text").attr("class", "viz-label viz-muted").attr("y", 28).text(formatNumber(extent[0]));
    legend.append("text").attr("class", "viz-label viz-muted").attr("x", legendW).attr("y", 28).attr("text-anchor", "end").text(formatNumber(extent[1]));
    legend.append("text").attr("class", "viz-label viz-muted").attr("x", legendW / 2).attr("y", 28).attr("text-anchor", "middle").text("Hospitalisations per month");
    const keyX = compact ? 0 : Math.min(legendW + 32, innerW - 160);
    const key = svg.append("g").attr("transform", `translate(${legendX + keyX}, ${compact ? legendY - 30 : legendY - 2})`);
    key.append("rect").attr("width", 14).attr("height", 14).attr("rx", 3).attr("fill", "none").attr("stroke", accentColor).attr("stroke-width", 3);
    key.append("text").attr("class", "viz-label").attr("x", 22).attr("y", 11).text("Lowest month");
};
