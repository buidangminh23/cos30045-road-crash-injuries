// Generated with GenAI (Claude Opus 5.5), following the Week 5 line chart and the Week 6 tooltip exercises

// Scales of the national trend chart (C1)
const xScaleTrend = d3.scaleLinear();
const yScaleTrend = d3.scaleLinear();

// Notes shown in the tooltip for the years affected by a recording change or by COVID-19
const trendNotes = {
    2011: "Still counts Vic emergency-only cases",
    2012: "Vic emergency-only cases dropped from July",
    2017: "NSW emergency-only cases not counted",
    2018: "NSW emergency-only cases not counted",
    2019: "NSW emergency-only cases not counted",
    2020: "COVID-19 restrictions reduced travel",
    2021: "NSW emergency-only cases not counted"
};

// Draw the national trend as a line chart with one point per year (Q1)
const drawNationalTrend = (data) => {
    const innerW = storyWidth - storyMargin.left - storyMargin.right;
    const innerH = storyHeight - storyMargin.top - storyMargin.bottom;

    const svg = d3.select("#national-trend")
        .append("svg")
            .attr("viewBox", `0 0 ${storyWidth} ${storyHeight}`);

    // Accessibility: a title and a description that lists every year for screen readers (Week 8)
    describeChart(svg, "national-trend",
        "Line chart: road crash hospitalisations in Australia per year, 2011 to 2021",
        "Hospitalisations rose from 34,033 in 2011 to 39,505 in 2021, an increase of 16%. They fell only in 2020, during COVID-19 restrictions. "
        + data.map(d => `${d.year}: ${formatNumber(d.hospitalisations)}.`).join(" ")
        + " Years 2011 and 2017 to 2021 are shaded grey because of recording changes.");

    const innerChart = svg
        .append("g")
            .attr("transform", `translate(${storyMargin.left}, ${storyMargin.top})`);

    // The y axis starts at zero so the rise is shown at its true size (lie factor 1.0)
    xScaleTrend
        .domain([d3.min(data, d => d.year), d3.max(data, d => d.year)])
        .range([0, innerW]);
    yScaleTrend
        .domain([0, d3.max(data, d => d.hospitalisations)])
        .range([innerH, 0])
        .nice();

    // Tapping the background hides the tooltip on phones
    addTooltipBackground(innerChart, innerW, innerH, () => trendTooltip);

    // Join the years that BITRE marks as affected by a recording change into runs of
    // consecutive years (2011 and 2017-2021), so each run is one grey band without seams
    const breakRuns = [];
    data.filter(d => d.isSeriesBreak).forEach(d => {
        const lastRun = breakRuns[breakRuns.length - 1];
        if (lastRun && lastRun.end === d.year - 1) {
            lastRun.end = d.year;
        } else {
            breakRuns.push({ start: d.year, end: d.year });
        }
    });

    // Each band covers half a year either side of its years and stays inside the chart
    const halfYear = (xScaleTrend(2012) - xScaleTrend(2011)) / 2;
    innerChart
        .selectAll(".break-band")
        .data(breakRuns)
        .join("rect")
            .attr("class", "break-band")
            .attr("x", d => Math.max(0, xScaleTrend(d.start) - halfYear))
            .attr("y", 0)
            .attr("width", d => Math.min(innerW, xScaleTrend(d.end) + halfYear) - Math.max(0, xScaleTrend(d.start) - halfYear))
            .attr("height", innerH)
            .attr("fill", bandColor);
    innerChart
        .append("text")
            .attr("class", "annotation-label")
            .text("Grey: recording changes")
            .attr("x", xScaleTrend(2016.5) + 6)
            .attr("y", innerH - 12)
            .attr("fill", referenceColor);

    // Axes with whole years and thousands separators
    innerChart
        .append("g")
            .attr("class", "axis-x")
            .attr("transform", `translate(0, ${innerH})`)
            .call(d3.axisBottom(xScaleTrend).tickValues(yearTicks).tickFormat(d3.format("d")).tickSizeOuter(0));
    innerChart
        .append("g")
            .attr("class", "axis-y")
            .call(d3.axisLeft(yScaleTrend).ticks(5).tickFormat(formatNumber));

    svg
        .append("text")
            .attr("class", "axis-label axis-label-left")
            .text("Hospitalisations (count)")
            .attr("x", 0)
            .attr("y", 20);
    svg
        .append("text")
            .attr("class", "axis-label axis-label-bottom")
            .text("Year")
            .attr("x", storyWidth - storyMargin.right)
            .attr("y", storyHeight - 8)
            .attr("text-anchor", "end");

    // The line, then one point per year on top of it
    const lineGeneratorTrend = d3.line()
        .x(d => xScaleTrend(d.year))
        .y(d => yScaleTrend(d.hospitalisations));
    innerChart
        .append("path")
            .attr("d", lineGeneratorTrend(data))
            .attr("fill", "none")
            .attr("stroke", storyColor)
            .attr("stroke-width", 3);

    innerChart
        .selectAll(".trend-point")
        .data(data)
        .join("circle")
            .attr("class", "trend-point")
            .attr("cx", d => xScaleTrend(d.year))
            .attr("cy", d => yScaleTrend(d.hospitalisations))
            .attr("r", 6)
            .attr("fill", storyColor);

    // Annotation for the only clear fall, in 2020
    const covid = data.find(d => d.year === 2020);
    const covidLabel = innerChart
        .append("text")
            .attr("class", "annotation-label")
            .attr("x", xScaleTrend(2020))
            .attr("y", yScaleTrend(covid.hospitalisations) + 40)
            .attr("text-anchor", "end")
            .attr("fill", storyColor);
    covidLabel.append("tspan").text(`2020: ${formatNumber(covid.hospitalisations)}`).style("font-weight", 700);
    covidLabel.append("tspan").text("COVID-19 restrictions").attr("x", xScaleTrend(2020)).attr("dy", "1.2em");

    // The tooltip is created last so it is drawn above the marks
    const trendTooltip = createChartTooltip(innerChart);

    // The same tooltip for mouse, touch and keyboard (Week 8)
    const showTrendTooltip = (e, d) => {
        const lines = [`${d.year}: ${formatNumber(d.hospitalisations)} hospitalisations`];
        if (trendNotes[d.year]) {
            lines.push(trendNotes[d.year]);
        }
        showChartTooltip(trendTooltip, lines, xScaleTrend(d.year), yScaleTrend(d.hospitalisations), innerW);
    };
    makeMarksAccessible(
        innerChart.selectAll(".trend-point"),
        d => `${d.year}: ${formatNumber(d.hospitalisations)} hospitalisations`,
        showTrendTooltip,
        () => hideChartTooltip(trendTooltip)
    );

    // Set the text size for the current window width (Week 8 resize.js)
    resizeCharts();
};
