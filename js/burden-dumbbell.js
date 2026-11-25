const caseShareColor = "#8593a3";

const drawBurdenDumbbell = (data, compact) => {
    const width = compact ? 420 : 760;
    const height = compact ? 400 : 340;
    const margin = { top: 56, right: compact ? 64 : 40, bottom: 44, left: compact ? 16 : 160 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;
    const burden = computeGroupBurden(data).sort((a, b) => (b.bedDayShare - b.caseShare) - (a.bedDayShare - a.caseShare));

    const x = d3.scaleLinear().domain([0, d3.max(burden, d => Math.max(d.caseShare, d.bedDayShare))]).range([0, innerW]).nice();
    const y = d3.scaleBand().domain(burden.map(d => d.group)).range([0, innerH]).padding(compact ? 0.15 : 0.4);

    const svg = createVizSvg("burden-dumbbell", width, height);
    describeChart(svg, "burden-dumbbell",
        "Dumbbell chart: each road user group's share of hospital cases compared with its share of bed days, 2016 to 2021",
        burden.map(d => `${roadUserLabels[d.group]}: ${formatShare(d.caseShare)} of cases, ${formatShare(d.bedDayShare)} of bed days.`).join(" "));

    const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);
    g.append("g")
        .attr("class", "viz-grid")
        .attr("transform", `translate(0, ${innerH})`)
        .call(d3.axisBottom(x).ticks(5).tickSize(-innerH).tickFormat(d => `${d}%`))
        .call(axis => axis.select(".domain").remove());

    const legend = g.append("g").attr("transform", "translate(0, -36)");
    [["Share of cases", caseShareColor], ["Share of bed days", accentColor]].forEach(([label, color], i) => {
        const item = legend.append("g").attr("transform", `translate(${i * (compact ? 150 : 170)}, 0)`);
        item.append("circle").attr("r", 7).attr("cx", 7).attr("fill", color);
        item.append("text").attr("class", "viz-label-sm").attr("x", 20).attr("dominant-baseline", "middle").text(label);
    });

    const rows = g.selectAll(".db-row")
        .data(burden)
        .join("g")
            .attr("class", "db-row")
            .attr("transform", d => `translate(0, ${y(d.group) + y.bandwidth() / 2})`);

    rows.append("text")
        .attr("class", "viz-label viz-strong")
        .attr("x", compact ? 0 : -14)
        .attr("y", compact ? -16 : 0)
        .attr("text-anchor", compact ? "start" : "end")
        .attr("dominant-baseline", "middle")
        .text(d => roadUserLabels[d.group]);

    rows.append("line")
        .attr("x1", d => x(d.caseShare))
        .attr("x2", d => x(d.caseShare))
        .attr("stroke", d => d.bedDayShare > d.caseShare ? "#f3b49c" : "#cbd5e1")
        .attr("stroke-width", 6)
        .attr("stroke-linecap", "round")
        .transition()
        .duration(motionDuration(900))
        .attr("x2", d => x(d.bedDayShare));

    const marks = rows.selectAll("circle")
        .data(d => [
            { ...d, kind: "cases", value: d.caseShare },
            { ...d, kind: "bedDays", value: d.bedDayShare }
        ])
        .join("circle")
            .attr("class", "db-dot viz-mark")
            .attr("r", 9)
            .attr("cx", d => x(d.caseShare))
            .attr("fill", d => d.kind === "cases" ? caseShareColor : accentColor)
            .attr("stroke", "#fff")
            .attr("stroke-width", 2);
    marks.transition().duration(motionDuration(900)).attr("cx", d => x(d.value));

    rows.append("text")
        .attr("class", "viz-label-sm viz-muted")
        .attr("x", d => x(Math.max(d.caseShare, d.bedDayShare)) + 16)
        .attr("dominant-baseline", "middle")
        .text(d => `${(d.bedDayShare / d.caseShare).toFixed(2)}×`);

    bindVizTooltip(marks, d => ({
        title: roadUserLabels[d.group],
        rows: [
            ["Share of cases", formatShare(d.caseShare)],
            ["Share of bed days", formatShare(d.bedDayShare)],
            ["Bed days per case", d.bedDaysPerCase.toFixed(2)]
        ],
        swatch: d.kind === "cases" ? caseShareColor : accentColor
    }));
};
