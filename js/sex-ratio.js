const drawSexRatio = (data, compact) => {
    const width = compact ? 420 : 760;
    const height = compact ? 400 : 380;
    const margin = { top: 40, right: 24, bottom: compact ? 72 : 52, left: 56 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;
    const ratios = computeSexRatios(data);

    const x = d3.scalePoint().domain(ratios.map(d => d.ageGroup)).range([0, innerW]).padding(0.5);
    const y = d3.scaleLinear().domain([0, d3.max(ratios, d => d.ratio)]).range([innerH, 0]).nice();

    const svg = createVizSvg("sex-ratio", width, height);
    describeChart(svg, "sex-ratio",
        "Line chart: males hospitalised per female hospitalised, by age group, 2011 to 2021",
        ratios.map(d => `${d.ageGroup}: ${d.ratio.toFixed(2)} males per female.`).join(" "));

    const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);
    g.append("g")
        .attr("class", "viz-grid")
        .call(d3.axisLeft(y).ticks(5).tickSize(-innerW).tickFormat(d => d.toFixed(1)))
        .call(axis => axis.select(".domain").remove());
    g.append("g")
        .attr("class", "viz-axis")
        .attr("transform", `translate(0, ${innerH})`)
        .call(d3.axisBottom(x).tickSizeOuter(0))
        .call(axis => {
            if (compact) {
                axis.selectAll("text").attr("transform", "rotate(-40)").attr("text-anchor", "end").attr("dx", "-0.4em").attr("dy", "0.6em");
            }
        });

    g.append("line")
        .attr("x1", 0).attr("x2", innerW)
        .attr("y1", y(1)).attr("y2", y(1))
        .attr("stroke", inkColor)
        .attr("stroke-dasharray", "5 4");
    g.append("text")
        .attr("class", "viz-label-sm viz-muted")
        .attr("x", innerW)
        .attr("y", y(1) + 18)
        .attr("text-anchor", "end")
        .text("1.0 = as many males as females");
    g.append("text")
        .attr("class", "viz-label-sm viz-muted")
        .attr("x", 0)
        .attr("y", -18)
        .text("Males hospitalised per female");

    const area = d3.area().x(d => x(d.ageGroup)).y0(y(1)).y1(d => y(d.ratio)).curve(d3.curveLinear);
    g.append("path").attr("d", area(ratios)).attr("fill", maleColor).attr("fill-opacity", 0.1);
    const line = d3.line().x(d => x(d.ageGroup)).y(d => y(d.ratio));
    g.append("path").attr("d", line(ratios)).attr("fill", "none").attr("stroke", maleColor).attr("stroke-width", 3);

    const highest = ratios.reduce((a, b) => (b.ratio > a.ratio ? b : a));
    const points = g.selectAll(".ratio-point")
        .data(ratios)
        .join("circle")
            .attr("class", "ratio-point viz-mark")
            .attr("cx", d => x(d.ageGroup))
            .attr("cy", d => y(d.ratio))
            .attr("r", d => d === highest ? 9 : 7)
            .attr("fill", d => d === highest ? accentColor : "#fff")
            .attr("stroke", d => d === highest ? accentColor : maleColor)
            .attr("stroke-width", 3);

    g.selectAll(".ratio-value")
        .data(ratios)
        .join("text")
            .attr("class", d => `viz-label-sm ${d === highest ? "viz-strong" : "viz-muted"}`)
            .attr("x", d => x(d.ageGroup))
            .attr("y", d => y(d.ratio) - 16)
            .attr("text-anchor", "middle")
            .text(d => d.ratio.toFixed(2));

    bindVizTooltip(points, d => ({
        title: `Aged ${d.ageGroup}`,
        rows: [
            ["Males per female", d.ratio.toFixed(2)],
            ["Males", formatNumber(d.male)],
            ["Females", formatNumber(d.female)],
            ["Difference", formatNumber(d.gap)]
        ],
        swatch: maleColor
    }));
};
