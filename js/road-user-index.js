const drawRoadUserIndex = (data, compact) => {
    const width = compact ? 420 : 760;
    const height = compact ? 440 : 420;
    const margin = { top: 32, right: compact ? 110 : 150, bottom: 44, left: 52 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;
    const years = [...new Set(data.map(d => d.year))].sort((a, b) => a - b);

    const series = roadUserGroups.map(group => {
        const rows = data.filter(d => d.group === group).sort((a, b) => a.year - b.year);
        const base = rows[0].hospitalisations;
        return { group, values: rows.map(d => ({ group, year: d.year, value: d.hospitalisations, index: d.hospitalisations / base * 100 })) };
    });

    const x = d3.scaleLinear().domain(d3.extent(years)).range([0, innerW]);
    const allIndex = series.flatMap(s => s.values.map(v => v.index));
    const y = d3.scaleLinear().domain([Math.min(70, d3.min(allIndex)), d3.max(allIndex)]).range([innerH, 0]).nice();

    const svg = createVizSvg("road-user-index", width, height);
    describeChart(svg, "road-user-index",
        `Line chart: hospitalisations per road user group indexed to ${years[0]} = 100`,
        series.map(s => `${roadUserLabels[s.group]}: ${Math.round(s.values[s.values.length - 1].index)} in ${years[years.length - 1]}.`).join(" "));

    const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);
    g.append("g")
        .attr("class", "viz-grid")
        .call(d3.axisLeft(y).ticks(6).tickSize(-innerW))
        .call(axis => axis.select(".domain").remove());
    g.append("g")
        .attr("class", "viz-axis")
        .attr("transform", `translate(0, ${innerH})`)
        .call(d3.axisBottom(x).tickValues(compact ? [2011, 2016, 2021] : yearTicks).tickFormat(d3.format("d")).tickSizeOuter(0));

    g.append("line")
        .attr("x1", 0).attr("x2", innerW)
        .attr("y1", y(100)).attr("y2", y(100))
        .attr("stroke", inkColor)
        .attr("stroke-dasharray", "5 4");
    g.append("text")
        .attr("class", "viz-label-sm viz-muted")
        .attr("x", 0)
        .attr("y", -14)
        .text(`Dashed line: ${years[0]} = 100`);

    const line = d3.line().x(d => x(d.year)).y(d => y(d.index));
    const paths = g.selectAll(".index-line")
        .data(series)
        .join("path")
            .attr("class", "index-line")
            .attr("fill", "none")
            .attr("stroke", d => roadUserColor(d.group))
            .attr("stroke-width", d => d.group === "Pedal cyclist" ? 4 : 2.5)
            .attr("d", d => line(d.values));
    paths.each(function () {
        const length = this.getTotalLength();
        d3.select(this)
            .attr("stroke-dasharray", `${length} ${length}`)
            .attr("stroke-dashoffset", prefersReducedMotion ? 0 : length)
            .transition().duration(motionDuration(1200)).attr("stroke-dashoffset", 0);
    });

    const labels = series.map(s => {
        const last = s.values[s.values.length - 1];
        return { group: s.group, index: last.index, y: y(last.index) };
    });
    spreadLabels(labels, 22, 0, innerH);
    g.selectAll(".index-label")
        .data(labels)
        .join("text")
            .attr("class", "viz-label-sm viz-strong")
            .attr("x", innerW + 10)
            .attr("y", d => d.labelY)
            .attr("dominant-baseline", "middle")
            .attr("fill", d => roadUserColor(d.group))
            .text(d => `${compact ? "" : roadUserLabels[d.group] + " "}${Math.round(d.index)}`);

    const points = g.selectAll(".index-point")
        .data(series.flatMap(s => s.values))
        .join("circle")
            .attr("class", "index-point viz-mark")
            .attr("cx", d => x(d.year))
            .attr("cy", d => y(d.index))
            .attr("r", 4)
            .attr("fill", d => roadUserColor(d.group));

    bindVizTooltip(points, d => ({
        title: `${roadUserLabels[d.group]}, ${d.year}`,
        rows: [
            [`Index (${years[0]} = 100)`, d.index.toFixed(1)],
            ["Hospitalisations", formatNumber(d.value)]
        ],
        swatch: roadUserColor(d.group)
    }));

    if (compact) {
        createHtmlKey("road-user-index", roadUserGroups.map(group => ({ label: roadUserLabels[group], color: roadUserColor(group) })));
        d3.select("#road-user-index .html-key").classed("html-key-always", true);
    }
};
