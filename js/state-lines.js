// Generated with GenAI (Claude Opus 5.5), following the Week 5 line chart and the Week 6 filter and tooltip exercises

// Scales of the state and territory line chart (C5)
const xScaleState = d3.scaleLinear();
const yScaleState = d3.scaleLinear();

// Recording changes that affect one state each, drawn as labelled dashed lines
const stateBreaks = [
    { year: 2012, state: "Vic", label: "Vic change" },
    { year: 2017, state: "NSW", label: "NSW change" }
];

// One highlighted state over grey context; Queensland, the fastest-growing large state, is selected first (Q5)
const drawStateLines = (data) => {
    const innerW = storyWidth - labelledMargin.left - labelledMargin.right;
    const innerH = storyHeight - labelledMargin.top - labelledMargin.bottom;

    // One series per state with its 11 yearly values
    const states = [...new Set(data.map(d => d.state))];
    const series = states.map(state => {
        const values = data.filter(d => d.state === state);
        return {
            state: state,
            name: values[0].stateName,
            values: values,
            max: d3.max(values, d => d.hospitalisations)
        };
    });

    // Buttons: All plus one per state, alphabetical as in the data
    const filtersState = [{ id: "All", label: "All", isActive: false }]
        .concat(states.map(state => ({ id: state, label: state, isActive: state === "Qld" })));

    const svg = d3.select("#state-lines")
        .append("svg")
            .attr("viewBox", `0 0 ${storyWidth} ${storyHeight}`);

    // Accessibility: first and last value of every state (Week 8)
    describeChart(svg, "state-lines",
        "Line chart: road crash hospitalisations by state or territory of residence, 2011 to 2021",
        "Queensland grew fastest of the large states. "
        + series.map(s => `${s.name}: ${formatNumber(s.values[0].hospitalisations)} in 2011, ${formatNumber(s.values[s.values.length - 1].hospitalisations)} in 2021.`).join(" "));

    const innerChart = svg
        .append("g")
            .attr("transform", `translate(${labelledMargin.left}, ${labelledMargin.top})`);

    xScaleState
        .domain([d3.min(data, d => d.year), d3.max(data, d => d.year)])
        .range([0, innerW]);
    yScaleState
        .range([innerH, 0]);

    addTooltipBackground(innerChart, innerW, innerH, () => stateTooltip);

    // Dashed lines for the Victorian and NSW recording changes
    innerChart
        .selectAll(".break-line")
        .data(stateBreaks)
        .join("line")
            .attr("class", "break-line")
            .attr("x1", d => xScaleState(d.year))
            .attr("x2", d => xScaleState(d.year))
            .attr("y1", 0)
            .attr("y2", innerH)
            .attr("stroke", referenceColor)
            .attr("stroke-dasharray", "4 4");
    innerChart
        .selectAll(".break-label")
        .data(stateBreaks)
        .join("text")
            .attr("class", "annotation-label break-label")
            .text(d => d.label)
            .attr("x", d => xScaleState(d.year))
            .attr("y", -10)
            .attr("text-anchor", "middle")
            .attr("fill", referenceColor);

    innerChart
        .append("g")
            .attr("class", "axis-x")
            .attr("transform", `translate(0, ${innerH})`)
            .call(d3.axisBottom(xScaleState).tickValues(yearTicks).tickFormat(d3.format("d")).tickSizeOuter(0));
    const yAxisGroup = innerChart
        .append("g")
            .attr("class", "axis-y");

    svg
        .append("text")
            .attr("class", "axis-label axis-label-left")
            .text("Hospitalisations by state of residence (count)")
            .attr("x", 0)
            .attr("y", 20);
    svg
        .append("text")
            .attr("class", "axis-label axis-label-bottom")
            .text("Year")
            .attr("x", labelledMargin.left + innerW)
            .attr("y", storyHeight - 8)
            .attr("text-anchor", "end");

    const lineGeneratorState = d3.line()
        .x(d => xScaleState(d.year))
        .y(d => yScaleState(d.hospitalisations));

    // Groups keep the drawing order: grey lines, the selected line, its points, then the labels
    const linesGroup = innerChart.append("g").attr("class", "state-line-group");
    const pointsGroup = innerChart.append("g").attr("class", "state-point-group");
    const labelsGroup = innerChart.append("g").attr("class", "state-label-group");

    const statePaths = linesGroup
        .selectAll(".state-line")
        .data(series, d => d.state)
        .join("path")
            .attr("class", "state-line")
            .attr("fill", "none");

    const stateTooltip = createChartTooltip(innerChart);

    const updateStateLines = (selectedId, animate) => {
        const duration = animate ? transitionDuration : 0;

        // All: one common scale for every state. One state: rescale from zero to that state's maximum,
        // so the trend of a small state such as Tasmania can be read
        const selected = series.find(s => s.state === selectedId);
        const yMax = selected ? selected.max : d3.max(series, s => s.max);
        yScaleState
            .domain([0, yMax])
            .nice();
        const yTop = yScaleState.domain()[1];

        // States that would leave the new scale are hidden
        const isVisible = s => s.max <= yTop;

        yAxisGroup
            .transition()
            .duration(duration)
            .call(d3.axisLeft(yScaleState).ticks(5).tickFormat(formatNumber));

        // Draw the selected line last so it sits on top of the grey ones
        statePaths
            .sort((a, b) => (a.state === selectedId) - (b.state === selectedId))
            .transition()
            .duration(duration)
            .ease(d3.easeCubicInOut)
                .attr("d", d => lineGeneratorState(d.values))
                .attr("stroke", d => d.state === selectedId ? storyColor : contextColor)
                .attr("stroke-width", d => d.state === selectedId ? 3 : 1.5)
                .style("opacity", d => isVisible(d) ? 1 : 0);

        // Points only on the selected line, so its values can be read in the tooltip
        pointsGroup
            .selectAll(".state-point")
            .data(selected ? selected.values : [], d => d.year)
            .join("circle")
                .attr("class", "state-point")
                .attr("r", 5)
                .attr("fill", storyColor)
                .attr("cx", d => xScaleState(d.year))
            .transition()
            .duration(duration)
            .ease(d3.easeCubicInOut)
                .attr("cy", d => yScaleState(d.hospitalisations));

        // Direct labels at the 2021 end of every visible line, moved apart so they do not overlap
        const labels = series
            .filter(isVisible)
            .map(s => ({ state: s.state, y: yScaleState(s.values[s.values.length - 1].hospitalisations) }));
        spreadLabels(labels, 16, 0, innerH);
        labelsGroup
            .selectAll(".direct-label")
            .data(labels, d => d.state)
            .join("text")
                .attr("class", "direct-label")
                .attr("x", innerW + 8)
                .attr("dominant-baseline", "middle")
                .text(d => d.state)
                .attr("fill", d => d.state === selectedId ? storyColor : referenceColor)
                .style("font-weight", d => d.state === selectedId ? 700 : 400)
            .transition()
            .duration(duration)
                .attr("y", d => d.labelY);

        // Tooltip on the points of the selected state, for mouse, touch and keyboard (Week 8)
        const changeSince2011 = d => {
            const first = selected.values[0].hospitalisations;
            const change = ((d.hospitalisations - first) / first) * 100;
            return `${change >= 0 ? "+" : ""}${change.toFixed(0)}% since 2011`;
        };
        const showStateTooltip = (e, d) => {
            const lines = [
                `${selected.name}, ${d.year}`,
                `${formatNumber(d.hospitalisations)} hospitalisations`,
                changeSince2011(d)
            ];
            if (d.state === "NSW" && d.year >= 2017) {
                lines.push("NSW emergency-only cases not counted");
            }
            if (d.state === "Vic" && d.year === 2011) {
                lines.push("Still counts Vic emergency-only cases");
            }
            if (d.state === "Vic" && d.year === 2012) {
                lines.push("Vic emergency-only cases dropped from July");
            }
            showChartTooltip(stateTooltip, lines, xScaleState(d.year), yScaleState(d.hospitalisations), innerW, labelledMargin);
        };
        makeMarksAccessible(
            pointsGroup.selectAll(".state-point"),
            d => `${selected.name}, ${d.year}: ${formatNumber(d.hospitalisations)} hospitalisations, ${changeSince2011(d)}`,
            showStateTooltip,
            () => hideChartTooltip(stateTooltip)
        );
        hideChartTooltip(stateTooltip);
    };

    updateStateLines("Qld", false);
    createFilterButtons("filters-state", filtersState, "Choose a state or territory", selectedId => updateStateLines(selectedId, true));
};
