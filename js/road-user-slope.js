let SLOPE_WIDTH = 520;
const SLOPE_HEIGHT = 440;
let slopeMargin = { top: 48, right: 190, bottom: 28, left: 70 };

const drawRoadUserSlope = (data, compact) => {
    SLOPE_WIDTH = compact ? 400 : 520;
    slopeMargin = compact ? { top: 48, right: 150, bottom: 28, left: 76 } : { top: 48, right: 190, bottom: 28, left: 70 };
    const innerW = SLOPE_WIDTH - slopeMargin.left - slopeMargin.right;
    const innerH = SLOPE_HEIGHT - slopeMargin.top - slopeMargin.bottom;
    const series = roadUserGroups.map(group => {
        const rows = data.filter(d => d.group === group);
        const start = rows.find(d => d.year === 2011).hospitalisations;
        const end = rows.find(d => d.year === 2021).hospitalisations;
        return { group, start, end, change: (end - start) / start };
    });

    const y = d3.scaleLinear()
        .domain([0, d3.max(series, d => Math.max(d.start, d.end))])
        .range([innerH, 0])
        .nice();

    const svg = createVizSvg("road-user-slope", SLOPE_WIDTH, SLOPE_HEIGHT);
    describeChart(svg, "road-user-slope",
        "Slope chart: hospitalisations per road user group, 2011 compared with 2021",
        series.map(d => `${roadUserLabels[d.group]}: ${formatNumber(d.start)} to ${formatNumber(d.end)}, ${formatPercentChange(d.start, d.end)}.`).join(" "));

    const g = svg.append("g").attr("transform", `translate(${slopeMargin.left}, ${slopeMargin.top})`);

    [0, innerW].forEach((xPos, i) => {
        g.append("line")
            .attr("x1", xPos).attr("x2", xPos)
            .attr("y1", 0).attr("y2", innerH)
            .attr("stroke", gridColor)
            .attr("stroke-width", 2);
        g.append("text")
            .attr("class", "viz-label viz-strong")
            .attr("x", xPos)
            .attr("y", -20)
            .attr("text-anchor", "middle")
            .text(i === 0 ? "2011" : "2021");
    });

    const lines = g.selectAll(".slope-line")
        .data(series)
        .join("line")
            .attr("class", "slope-line")
            .attr("x1", 0)
            .attr("x2", 0)
            .attr("y1", d => y(d.start))
            .attr("y2", d => y(d.start))
            .attr("stroke", d => roadUserColor(d.group))
            .attr("stroke-width", d => d.group === "Pedal cyclist" ? 5 : 3)
            .attr("stroke-linecap", "round");

    lines.transition()
        .duration(motionDuration(900))
        .delay((d, i) => motionDuration(i * 80))
        .attr("x2", innerW)
        .attr("y2", d => y(d.end));

    const startLabels = series.map(d => ({ ...d, y: y(d.start) }));
    spreadLabels(startLabels, 22, 0, innerH);
    g.selectAll(".slope-start-label")
        .data(startLabels)
        .join("text")
            .attr("class", "viz-label viz-muted")
            .attr("x", -14)
            .attr("y", d => d.labelY)
            .attr("dominant-baseline", "middle")
            .attr("text-anchor", "end")
            .text(d => formatNumber(d.start));

    const endLabels = series.map(d => ({ ...d, y: y(d.end) }));
    spreadLabels(endLabels, 40, 6, innerH);
    const endGroup = g.selectAll(".slope-end-label")
        .data(endLabels)
        .join("g")
            .attr("class", "slope-end-label")
            .attr("transform", d => `translate(${innerW + 14}, ${d.labelY})`);
    endGroup.append("text")
        .attr("class", "viz-label viz-strong")
        .attr("dominant-baseline", "middle")
        .text(d => roadUserLabels[d.group]);
    endGroup.append("text")
        .attr("class", "viz-label-sm")
        .attr("y", 15)
        .attr("dominant-baseline", "middle")
        .attr("fill", d => d.change >= 0 ? "#b23a16" : "#1f6f50")
        .text(d => `${formatNumber(d.end)} · ${formatPercentChange(d.start, d.end)}`);

    const points = g.selectAll(".slope-point")
        .data(series.flatMap(d => [{ ...d, year: 2011, value: d.start }, { ...d, year: 2021, value: d.end }]))
        .join("circle")
            .attr("class", "slope-point viz-mark")
            .attr("cx", d => d.year === 2011 ? 0 : innerW)
            .attr("cy", d => y(d.value))
            .attr("r", 7)
            .attr("fill", "#fff")
            .attr("stroke", d => roadUserColor(d.group))
            .attr("stroke-width", 3);

    bindVizTooltip(points, d => ({
        title: `${roadUserLabels[d.group]}, ${d.year}`,
        rows: [
            ["Hospitalisations", formatNumber(d.value)],
            ["Change 2011–2021", formatPercentChange(d.start, d.end)]
        ],
        swatch: roadUserColor(d.group)
    }));
};
