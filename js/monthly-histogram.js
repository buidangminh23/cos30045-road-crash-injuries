// Generated with GenAI (Claude Opus 5.5), following the Week 6 histogram exercise (Exercise 6.1)

// Scales of the monthly histogram (C1b)
const xScaleMonths = d3.scaleLinear();
const yScaleMonths = d3.scaleLinear();

// Draw a histogram of the 132 monthly counts, so the unusual months stand out (Q1)
const drawMonthlyHistogram = (data) => {
    const innerW = storyWidth - storyMargin.left - storyMargin.right;
    const innerH = storyHeight - storyMargin.top - storyMargin.bottom;

    // Fixed bins of 100 hospitalisations: a bin count alone is only a suggestion to d3.bin()
    const binGenerator = d3.bin()
        .value(d => d.hospitalisations)
        .domain([2300, 3900])
        .thresholds(d3.range(2300, 3900, 100));
    const bins = binGenerator(data);

    const svg = d3.select("#monthly-histogram")
        .append("svg")
            .attr("viewBox", `0 0 ${storyWidth} ${storyHeight}`);

    const innerChart = svg
        .append("g")
            .attr("transform", `translate(${storyMargin.left}, ${storyMargin.top})`);

    xScaleMonths
        .domain([2300, 3900])
        .range([0, innerW]);
    yScaleMonths
        .domain([0, d3.max(bins, d => d.length)])
        .range([innerH, 0])
        .nice();

    addTooltipBackground(innerChart, innerW, innerH, () => monthsTooltip);

    // One bar per bin; the bin that holds April 2020 is drawn in the story colour
    innerChart
        .selectAll(".month-bar")
        .data(bins)
        .join("rect")
            .attr("class", "month-bar")
            .attr("x", d => xScaleMonths(d.x0) + 1)
            .attr("y", d => yScaleMonths(d.length))
            .attr("width", d => xScaleMonths(d.x1) - xScaleMonths(d.x0) - 2)
            .attr("height", d => innerH - yScaleMonths(d.length))
            .attr("fill", d => d.x0 === 2300 ? storyColor : contextColor);

    innerChart
        .append("g")
            .attr("class", "axis-x")
            .attr("transform", `translate(0, ${innerH})`)
            .call(d3.axisBottom(xScaleMonths).ticks(5).tickFormat(formatNumber).tickSizeOuter(0));
    innerChart
        .append("g")
            .attr("class", "axis-y")
            .call(d3.axisLeft(yScaleMonths).ticks(5));

    svg
        .append("text")
            .attr("class", "axis-label axis-label-left")
            .text("Number of months")
            .attr("x", 0)
            .attr("y", 20);
    svg
        .append("text")
            .attr("class", "axis-label axis-label-bottom")
            .text("Hospitalisations in one month (count)")
            .attr("x", storyWidth - storyMargin.right)
            .attr("y", storyHeight - 8)
            .attr("text-anchor", "end");

    // Annotation above the lowest bin
    const aprilBin = bins[0];
    const labelX = xScaleMonths(aprilBin.x0) + 8;
    const aprilLabel = innerChart
        .append("text")
            .attr("class", "annotation-label")
            .attr("x", labelX)
            .attr("y", yScaleMonths(aprilBin.length) - 60)
            .attr("fill", storyColor);
    aprilLabel.append("tspan").text("April 2020: 2,357").style("font-weight", 700);
    aprilLabel.append("tspan").text("the only month below 2,500").attr("x", labelX).attr("dy", "1.2em");

    // A short line from the label down to the bar
    innerChart
        .append("line")
            .attr("x1", labelX)
            .attr("x2", labelX)
            .attr("y1", yScaleMonths(aprilBin.length) - 28)
            .attr("y2", yScaleMonths(aprilBin.length) - 4)
            .attr("stroke", storyColor);

    const monthsTooltip = createChartTooltip(innerChart);

    innerChart.selectAll(".month-bar")
        .on("mouseenter", (e, d) => {
            const lines = [`${formatNumber(d.x0)} to ${formatNumber(d.x1 - 1)} a month`, `${d.length} ${d.length === 1 ? "month" : "months"}`];
            // Name the months when there are only a few of them
            if (d.length > 0 && d.length <= 3) {
                lines.push(d.map(m => `${m.month} ${m.year}`).join(", "));
            }
            showChartTooltip(monthsTooltip, lines, (xScaleMonths(d.x0) + xScaleMonths(d.x1)) / 2, yScaleMonths(d.length), innerW);
        })
        .on("mouseleave", () => hideChartTooltip(monthsTooltip));
};
