// Generated with GenAI (Claude Opus 5.5), following the Week 5 stacked bar chart (d3.stack) and the Week 6 filter and tooltip exercises

// Scales of the road user stack (C2)
const xScaleStack = d3.scaleBand();
const yScaleStack = d3.scaleLinear();

// Draw hospitalisations per year as bars stacked by road user group (Q2)
const drawRoadUserStack = (data) => {
    const innerW = storyWidth - labelledMargin.left - labelledMargin.right;
    const innerH = storyHeight - labelledMargin.top - labelledMargin.bottom;

    // d3.stack() needs one row per year with one column per group
    const years = [...new Set(data.map(d => d.year))];
    const wideData = years.map(year => {
        const row = { year: year, total: 0 };
        data.filter(d => d.year === year).forEach(d => {
            row[d.group] = d.hospitalisations;
            row.total += d.hospitalisations;
        });
        return row;
    });

    const svg = d3.select("#road-user-stack")
        .append("svg")
            .attr("viewBox", `0 0 ${storyWidth} ${storyHeight}`);

    // Accessibility: summary of each group in the first and last year (Week 8)
    const first = wideData[0];
    const last = wideData[wideData.length - 1];
    describeChart(svg, "road-user-stack",
        "Stacked bar chart: road crash hospitalisations per year by road user group, 2011 to 2021",
        "Car occupants are the largest group and cyclists grew fastest. "
        + roadUserGroups.map(group => `${roadUserLabels[group]}: ${formatNumber(first[group])} in ${first.year}, ${formatNumber(last[group])} in ${last.year}.`).join(" "));

    const innerChart = svg
        .append("g")
            .attr("transform", `translate(${labelledMargin.left}, ${labelledMargin.top})`);

    xScaleStack
        .domain(years)
        .range([0, innerW])
        .paddingInner(0.2)
        .paddingOuter(0.1);
    yScaleStack
        .range([innerH, 0]);

    addTooltipBackground(innerChart, innerW, innerH, () => stackTooltip);

    // Groups for the bars and the labels, so the axes and tooltip can be drawn on top
    const barsGroup = innerChart.append("g").attr("class", "stack-bars");
    const labelsGroup = innerChart.append("g").attr("class", "stack-labels");

    innerChart
        .append("g")
            .attr("class", "axis-x")
            .attr("transform", `translate(0, ${innerH})`)
            .call(d3.axisBottom(xScaleStack).tickValues(yearTicks).tickSizeOuter(0));
    const yAxisGroup = innerChart
        .append("g")
            .attr("class", "axis-y");

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
            .attr("x", labelledMargin.left + innerW)
            .attr("y", storyHeight - 8)
            .attr("text-anchor", "end");

    const stackTooltip = createChartTooltip(innerChart);

    // Draw the stack for the selected group, or for all groups; animate after the first drawing
    const updateStack = (selectedId, animate) => {
        const keys = selectedId === "All" ? roadUserGroups : [selectedId];

        // Car occupants, the largest group, sit at the bottom where they share the baseline
        const stackGenerator = d3.stack()
            .keys(keys)
            .order(d3.stackOrderNone);
        const series = stackGenerator(wideData);

        // A single group is redrawn from zero with its own y axis, so its growth over time is easy to read
        yScaleStack
            .domain([0, d3.max(series[series.length - 1], d => d[1])])
            .nice();

        const duration = animate ? transitionDuration : 0;
        yAxisGroup
            .transition()
            .duration(duration)
            .call(d3.axisLeft(yScaleStack).ticks(5).tickFormat(formatNumber));

        // One group of rects per road user group, joined by the group name
        const layers = barsGroup
            .selectAll(".layer")
            .data(series, d => d.key)
            .join(
                enter => enter.append("g").attr("class", "layer"),
                update => update,
                exit => exit.transition().duration(duration).style("opacity", 0).remove()
            )
                .attr("fill", d => roadUserColor(d.key));

        // One rect per year; each keeps its group, year and the share of that year
        layers
            .selectAll("rect")
            .data(layer => layer.map(segment => ({
                group: layer.key,
                year: segment.data.year,
                y0: segment[0],
                y1: segment[1],
                share: (segment.data[layer.key] / segment.data.total) * 100
            })), d => d.year)
            .join(
                enter => enter.append("rect")
                    .attr("class", "stack-bar")
                    .attr("x", d => xScaleStack(d.year))
                    .attr("width", xScaleStack.bandwidth())
                    .attr("y", innerH)
                    .attr("height", 0)
            )
            .transition()
            .duration(duration)
            .ease(d3.easeCubicInOut)
                .attr("y", d => yScaleStack(d.y1))
                .attr("height", d => yScaleStack(d.y0) - yScaleStack(d.y1));

        // Direct labels at the right end of the 2021 bar replace a legend
        const lastYear = years[years.length - 1];
        const labels = series.map(layer => {
            const segment = layer.find(s => s.data.year === lastYear);
            return { key: layer.key, y: yScaleStack((segment[0] + segment[1]) / 2) };
        });
        spreadLabels(labels, 18, 8, innerH - 4);
        labelsGroup
            .selectAll(".direct-label")
            .data(labels, d => d.key)
            .join("text")
                .attr("class", "direct-label")
                .attr("x", xScaleStack(lastYear) + xScaleStack.bandwidth() + 8)
                .attr("dominant-baseline", "middle")
                .attr("fill", storyColor)
                .text(d => roadUserLabels[d.key])
            .transition()
            .duration(duration)
                .attr("y", d => d.labelY);

        // Tooltips for the bars of the selected groups, for mouse, touch and keyboard (Week 8)
        const showStackTooltip = (e, d) => {
            const lines = [
                `${d.year}: ${roadUserLabels[d.group]}`,
                `${formatNumber(d.y1 - d.y0)} hospitalisations`,
                `${d.share.toFixed(1)}% of all road users that year`
            ];
            showChartTooltip(stackTooltip, lines, xScaleStack(d.year) + xScaleStack.bandwidth() / 2, yScaleStack(d.y1), innerW, labelledMargin);
        };
        makeMarksAccessible(
            barsGroup.selectAll(".stack-bar"),
            d => `${d.year}, ${roadUserLabels[d.group]}: ${formatNumber(d.y1 - d.y0)} hospitalisations`,
            showStackTooltip,
            () => hideChartTooltip(stackTooltip)
        );
        hideChartTooltip(stackTooltip);
    };

    updateStack("All", false);
    createFilterButtons("filters-road-user", filtersRoadUser, "Show one road user group", selectedId => updateStack(selectedId, true));
};
