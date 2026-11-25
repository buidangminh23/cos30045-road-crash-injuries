const drawMonthlyAnomaly = (data, compact) => {
    const width = compact ? 420 : 760;
    const height = compact ? 420 : 400;
    const margin = { top: 40, right: 16, bottom: 56, left: compact ? 52 : 60 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;
    const anomalies = computeMonthlyAnomalies(data);
    const key = d => `${d.year}-${d.monthNum}`;

    const x = d3.scaleBand().domain(anomalies.map(key)).range([0, innerW]).paddingInner(0.18);
    const maxAbs = d3.max(anomalies, d => Math.abs(d.deviation));
    const y = d3.scaleLinear().domain([-maxAbs, maxAbs]).range([innerH, 0]).nice();

    const svg = createVizSvg("monthly-anomaly", width, height);
    describeChart(svg, "monthly-anomaly",
        `Column chart: monthly hospitalisations in 2020 and 2021 compared with the average of the same month in ${BASELINE_YEARS[0]} to ${BASELINE_YEARS[BASELINE_YEARS.length - 1]}`,
        anomalies.map(d => `${d.month} ${d.year}: ${formatSignedPercent(d.deviation)}.`).join(" "));

    const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

    g.append("g")
        .attr("class", "viz-grid")
        .call(d3.axisLeft(y).ticks(compact ? 4 : 6).tickSize(-innerW).tickFormat(d => d === 0 ? "0%" : d3.format("+.0f")(d) + "%"))
        .call(axis => axis.select(".domain").remove());

    ANOMALY_YEARS.forEach(year => {
        const months = anomalies.filter(d => d.year === year);
        const start = x(key(months[0]));
        const end = x(key(months[months.length - 1])) + x.bandwidth();
        g.append("text")
            .attr("class", "viz-label viz-strong")
            .attr("x", (start + end) / 2)
            .attr("y", innerH + 40)
            .attr("text-anchor", "middle")
            .text(year);
        g.append("line")
            .attr("x1", start).attr("x2", end)
            .attr("y1", innerH + 22).attr("y2", innerH + 22)
            .attr("stroke", "#cbd5e1");
    });

    const bars = g.selectAll(".anomaly-bar")
        .data(anomalies)
        .join("rect")
            .attr("class", "anomaly-bar viz-mark")
            .attr("x", d => x(key(d)))
            .attr("width", x.bandwidth())
            .attr("rx", 3)
            .attr("fill", d => d.deviation < 0 ? (d.deviation === d3.min(anomalies, a => a.deviation) ? accentColor : "#f0a07f") : "#3f74ad")
            .attr("y", y(0))
            .attr("height", 0);

    bars.transition()
        .duration(motionDuration(800))
        .delay((d, i) => motionDuration(i * 25))
        .attr("y", d => y(Math.max(0, d.deviation)))
        .attr("height", d => Math.abs(y(d.deviation) - y(0)));

    g.append("line")
        .attr("x1", 0).attr("x2", innerW)
        .attr("y1", y(0)).attr("y2", y(0))
        .attr("stroke", inkColor);

    g.selectAll(".anomaly-month")
        .data(anomalies.filter(d => !compact || d.monthNum % 3 === 1))
        .join("text")
            .attr("class", "viz-label-sm viz-muted")
            .attr("x", d => x(key(d)) + x.bandwidth() / 2)
            .attr("y", innerH + 14)
            .attr("text-anchor", "middle")
            .text(d => d.month[0]);

    const lowest = anomalies.reduce((a, b) => (b.deviation < a.deviation ? b : a));
    g.append("text")
        .attr("class", "viz-label viz-strong")
        .attr("x", x(key(lowest)) + x.bandwidth() + 8)
        .attr("y", y(lowest.deviation) + 4)
        .attr("fill", "#b23a16")
        .text(`${lowest.month} ${lowest.year}: ${formatSignedPercent(lowest.deviation)}`);

    g.append("text")
        .attr("class", "viz-label-sm viz-muted")
        .attr("x", 0)
        .attr("y", -18)
        .text(compact ? `vs ${BASELINE_YEARS[0]}–${BASELINE_YEARS[BASELINE_YEARS.length - 1]} same-month average` : `Change vs the ${BASELINE_YEARS[0]}–${BASELINE_YEARS[BASELINE_YEARS.length - 1]} average for the same month`);

    bindVizTooltip(bars, d => ({
        title: `${d.month} ${d.year}`,
        rows: [
            ["Hospitalisations", formatNumber(d.hospitalisations)],
            [`${BASELINE_YEARS[0]}–${BASELINE_YEARS[BASELINE_YEARS.length - 1]} average`, formatNumber(Math.round(d.baseline))],
            ["Difference", formatSignedPercent(d.deviation)]
        ],
        swatch: d.deviation < 0 ? "#f0a07f" : "#3f74ad"
    }));
};
