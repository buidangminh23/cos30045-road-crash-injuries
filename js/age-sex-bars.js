// Generated with GenAI (Claude Opus 5.5), following the Week 4 bar chart, the Week 5 scaleBand and the Week 6 filter and tooltip exercises

// Scales of the age and sex grouped bar chart (C4)
const xScaleAge = d3.scaleBand();      // one band per age group
const xScaleSex = d3.scaleBand();      // one bar per sex inside each age band
const yScaleAge = d3.scaleLinear();

const sexes = ["Female", "Male"];
const sexColor = d3.scaleOrdinal()
    .domain(sexes)
    .range(["#CC79A7", "#0072B2"]);

// The two measures the reader can switch between
const ageMeasures = {
    hospitalisations: { column: "hospitalisations", axisLabel: "Hospitalisations 2011-2021 (count)", format: formatNumber },
    bedDays: { column: "bedDaysPerCase", axisLabel: "Bed days per case, 2016-2021", format: d3.format(".2f") }
};

// Buttons for the measure and for the sex (Week 6 filter pattern)
const filtersAgeMeasure = [
    { id: "hospitalisations", label: "Hospitalisations", isActive: true },
    { id: "bedDays", label: "Bed days per case", isActive: false }
];
const filtersAgeSex = [
    { id: "Both", label: "Both", isActive: true },
    { id: "Female", label: "Female", isActive: false },
    { id: "Male", label: "Male", isActive: false }
];

// Draw hospitalisations or length of stay by age group, with one bar per sex (Q4)
const drawAgeSexBars = (data) => {
    const innerW = storyWidth - storyMargin.left - storyMargin.right;
    const innerH = storyHeight - storyMargin.top - storyMargin.bottom;

    // Age groups in their natural order, not in alphabetical order
    const ageGroups = data
        .slice()
        .sort((a, b) => a.ageOrder - b.ageOrder)
        .map(d => d.ageGroup)
        .filter((group, i, groups) => groups.indexOf(group) === i);

    let selectedMeasure = "hospitalisations";
    let selectedSex = "Both";

    const svg = d3.select("#age-sex-bars")
        .append("svg")
            .attr("viewBox", `0 0 ${storyWidth} ${storyHeight}`);

    // Accessibility: both measures for every bar, so the description fits either view (Week 8)
    describeChart(svg, "age-sex-bars",
        "Grouped bar chart: road crash hospitalisations and bed days per case by age group and sex",
        "Males are 65% of hospitalisations. At 75 and over, females and males are almost equal, and this age group stays longest. "
        + data.map(d => `${d.sex}, ${d.ageGroup}: ${formatNumber(d.hospitalisations)} hospitalisations, ${d.bedDaysPerCase.toFixed(2)} bed days per case.`).join(" "));

    const innerChart = svg
        .append("g")
            .attr("transform", `translate(${storyMargin.left}, ${storyMargin.top})`);

    xScaleAge
        .domain(ageGroups)
        .range([0, innerW])
        .paddingInner(0.25)
        .paddingOuter(0.1);
    xScaleSex
        .domain(sexes)
        .range([0, xScaleAge.bandwidth()])
        .padding(0.05);
    yScaleAge
        .range([innerH, 0]);

    addTooltipBackground(innerChart, innerW, innerH, () => ageTooltip);

    // Dashed reference line, shown only in the bed days view
    const referenceLine = innerChart
        .append("line")
            .attr("class", "reference-line")
            .attr("x1", 0)
            .attr("x2", innerW)
            .attr("stroke", referenceColor)
            .attr("stroke-dasharray", "6 4");
    const referenceLabel = innerChart
        .append("text")
            .attr("class", "annotation-label")
            .attr("x", 6)
            .attr("fill", referenceColor)
            .text("All traffic: 5.23 days");

    // One bar per age group and sex
    const bars = innerChart
        .selectAll(".age-bar")
        .data(data)
        .join("rect")
            .attr("class", "age-bar")
            .attr("x", d => xScaleAge(d.ageGroup) + xScaleSex(d.sex))
            .attr("width", xScaleSex.bandwidth())
            .attr("y", innerH)
            .attr("height", 0)
            .attr("fill", d => sexColor(d.sex));

    innerChart
        .append("g")
            .attr("class", "axis-x")
            .attr("transform", `translate(0, ${innerH})`)
            .call(d3.axisBottom(xScaleAge).tickSizeOuter(0));
    const yAxisGroup = innerChart
        .append("g")
            .attr("class", "axis-y");

    const yAxisLabel = svg
        .append("text")
            .attr("class", "axis-label axis-label-left")
            .attr("x", 0)
            .attr("y", 20);
    svg
        .append("text")
            .attr("class", "axis-label axis-label-bottom")
            .text("Age group (years)")
            .attr("x", storyWidth - storyMargin.right)
            .attr("y", storyHeight - 8)
            .attr("text-anchor", "end");

    // Key for the two colours, in the top margin where it never covers a bar
    const key = innerChart
        .append("g")
            .attr("class", "chart-key")
            .attr("transform", `translate(${innerW - 150}, -30)`);
    const keyRows = key
        .selectAll(".key-row")
        .data(sexes)
        .join("g")
            .attr("class", "key-row");
    keyRows
        .append("rect")
            .attr("y", -7)
            .attr("width", 14)
            .attr("height", 14)
            .attr("fill", d => sexColor(d));
    keyRows
        .append("text")
            .attr("class", "key-label")
            .text(d => d)
            .attr("x", 20)
            .attr("dominant-baseline", "middle");

    // Annotation on the 75+ pair; its text depends on the measure.
    // On a phone it would cover the 40-64 bars, so CSS hides it there and the text above the chart says the same
    const annotation = innerChart
        .append("text")
            .attr("class", "annotation-label wide-screen-only")
            .attr("text-anchor", "end")
            .attr("fill", storyColor);

    const ageTooltip = createChartTooltip(innerChart);

    // Redraw the bars, axis and annotation for the selected measure and sex
    const updateAgeBars = (animate) => {
        const measure = ageMeasures[selectedMeasure];
        const duration = animate ? transitionDuration : 0;

        // The y domain depends only on the measure, so heights stay comparable when one sex is shown
        yScaleAge
            .domain([0, d3.max(data, d => d[measure.column])])
            .nice();
        yAxisGroup
            .transition()
            .duration(duration)
            .call(d3.axisLeft(yScaleAge).ticks(5).tickFormat(selectedMeasure === "hospitalisations" ? formatNumber : d3.format("d")));
        yAxisLabel.text(measure.axisLabel);

        // Bars of the sex that is not selected shrink to zero height and cannot be reached with the Tab key
        bars
            .attr("tabindex", d => selectedSex === "Both" || d.sex === selectedSex ? 0 : -1)
            .transition()
            .duration(duration)
            .ease(d3.easeCubicInOut)
                .attr("y", d => selectedSex === "Both" || d.sex === selectedSex ? yScaleAge(d[measure.column]) : innerH)
                .attr("height", d => selectedSex === "Both" || d.sex === selectedSex ? innerH - yScaleAge(d[measure.column]) : 0);

        // Reference line only for the bed days view
        const showReference = selectedMeasure === "bedDays";
        referenceLine
            .attr("y1", yScaleAge(allTrafficBedDays))
            .attr("y2", yScaleAge(allTrafficBedDays))
            .style("opacity", showReference ? 1 : 0);
        referenceLabel
            .attr("y", yScaleAge(allTrafficBedDays) - 8)
            .style("opacity", showReference ? 1 : 0);

        // Annotation next to the 75+ pair
        const oldest = data.filter(d => d.ageGroup === "75+");
        const top = d3.max(oldest, d => d[measure.column]);
        annotation.selectAll("tspan").remove();
        if (showReference) {
            // Left of the tall 75+ bars
            const labelX = xScaleAge("75+") - 8;
            annotation.attr("x", labelX).attr("y", yScaleAge(top) - 4);
            annotation.append("tspan").text("75+ stay longest:").style("font-weight", 700);
            annotation.append("tspan").text("11.2 days (female), 10.8 (male)").attr("x", labelX).attr("dy", "1.2em");
        } else {
            // Above the short 75+ bars, in short lines so it does not reach the tall 40-64 bars
            const labelX = xScaleAge("75+") + xScaleAge.bandwidth();
            annotation.attr("x", labelX).attr("y", yScaleAge(top) - 64);
            annotation.append("tspan").text("75+: as many").style("font-weight", 700);
            annotation.append("tspan").text("women as men").style("font-weight", 700).attr("x", labelX).attr("dy", "1.2em");
            annotation.append("tspan").text("12,634 and 12,571").attr("x", labelX).attr("dy", "1.2em");
        }

        hideChartTooltip(ageTooltip);
    };

    const showAgeTooltip = (e, d) => {
        // Hidden bars of the other sex do not show a tooltip
        if (selectedSex !== "Both" && d.sex !== selectedSex) {
            return;
        }
        const lines = [
            `${d.sex}, aged ${d.ageGroup}`,
            `${formatNumber(d.hospitalisations)} hospitalisations (2011-2021)`,
            `${d.bedDaysPerCase.toFixed(2)} bed days per case (2016-2021)`
        ];
        const measure = ageMeasures[selectedMeasure];
        showChartTooltip(ageTooltip, lines, xScaleAge(d.ageGroup) + xScaleSex(d.sex) + xScaleSex.bandwidth() / 2, yScaleAge(d[measure.column]), innerW);
    };
    makeMarksAccessible(
        bars,
        d => `${d.sex}, aged ${d.ageGroup}: ${formatNumber(d.hospitalisations)} hospitalisations, ${d.bedDaysPerCase.toFixed(2)} bed days per case`,
        showAgeTooltip,
        () => hideChartTooltip(ageTooltip)
    );

    updateAgeBars(false);
    createFilterButtons("filters-age-measure", filtersAgeMeasure, "Choose the measure", id => {
        selectedMeasure = id;
        updateAgeBars(true);
    });
    createFilterButtons("filters-age-sex", filtersAgeSex, "Choose the sex", id => {
        selectedSex = id;
        updateAgeBars(true);
    });

    // Key under the chart for narrow screens
    createHtmlKey("age-sex-bars", sexes.map(sex => ({ label: sex, color: sexColor(sex) })));

    // The two key items are spaced by the text size
    chartResizeHandlers.push(() => {
        keyRows.attr("transform", (d, i) => `translate(${i * chartFontSize * 6}, 0)`);
        key.attr("transform", `translate(${innerW - chartFontSize * 11}, -30)`);
    });
    resizeCharts();
};
