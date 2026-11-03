// Generated with GenAI (Claude Opus 5.5), following the Week 6 scatterplot exercise (Exercise 6.3) and the Week 6 tooltip exercise

// Scales of the severity scatter plot (C3)
const xScaleSeverity = d3.scaleLinear();
const yScaleSeverity = d3.scaleLinear();

// Road users with fewer cases than this are drawn as hollow points: their averages are less certain
const fewCasesLimit = 1000;

// Road users that get a direct label; the rest are named in their tooltip
const labelledRoadUsers = {
    "Pedestrian": { text: "Pedestrians", dx: 12, dy: 0, anchor: "start" },
    "Pedal cyclist": { text: "Cyclists", dx: 0, dy: 26, anchor: "middle" },
    "Car driver": { text: "Car drivers", dx: -4, dy: 26, anchor: "end" },
    "Motorcyclist": { text: "Motorcyclists", dx: 0, dy: -18, anchor: "middle" },
    "Car passenger": { text: "Car passengers", dx: 0, dy: 26, anchor: "middle" }
};

// Draw each road user by number of hospitalisations (x) and average stay (y) (Q3)
const drawSeverityScatter = (data) => {
    const innerW = storyWidth - storyMargin.left - storyMargin.right;
    const innerH = storyHeight - storyMargin.top - storyMargin.bottom;

    const svg = d3.select("#severity-scatter")
        .append("svg")
            .attr("viewBox", `0 0 ${storyWidth} ${storyHeight}`);

    const innerChart = svg
        .append("g")
            .attr("transform", `translate(${storyMargin.left}, ${storyMargin.top})`);

    // Both axes start at zero
    xScaleSeverity
        .domain([0, d3.max(data, d => d.hospitalisations)])
        .range([0, innerW])
        .nice();
    yScaleSeverity
        .domain([0, d3.max(data, d => d.bedDaysPerCase)])
        .range([innerH, 0])
        .nice();

    addTooltipBackground(innerChart, innerW, innerH, () => severityTooltip);

    // Dashed reference line at the all-traffic average
    innerChart
        .append("line")
            .attr("class", "reference-line")
            .attr("x1", 0)
            .attr("x2", innerW)
            .attr("y1", yScaleSeverity(allTrafficBedDays))
            .attr("y2", yScaleSeverity(allTrafficBedDays))
            .attr("stroke", referenceColor)
            .attr("stroke-dasharray", "6 4");
    innerChart
        .append("text")
            .attr("class", "annotation-label")
            .text(`All traffic: ${allTrafficBedDays} days`)
            .attr("x", xScaleSeverity(8000))
            .attr("y", yScaleSeverity(allTrafficBedDays) - 8)
            .attr("fill", referenceColor);

    // The y axis sits 6 px left of x = 0 so points with few hospitalisations are not hidden behind it
    innerChart
        .append("g")
            .attr("class", "axis-x")
            .attr("transform", `translate(0, ${innerH})`)
            .call(d3.axisBottom(xScaleSeverity).ticks(5).tickFormat(formatNumber).tickSizeOuter(0));
    innerChart
        .append("g")
            .attr("class", "axis-y")
            .attr("transform", "translate(-6, 0)")
            .call(d3.axisLeft(yScaleSeverity).ticks(6));

    svg
        .append("text")
            .attr("class", "axis-label axis-label-left")
            .text("Bed days per case (average stay)")
            .attr("x", 0)
            .attr("y", 20);
    svg
        .append("text")
            .attr("class", "axis-label axis-label-bottom")
            .text("Hospitalisations 2016-2021 (count)")
            .attr("x", storyWidth - storyMargin.right)
            .attr("y", storyHeight - 8)
            .attr("text-anchor", "end");

    // One point per road user, coloured by group; hollow when based on few cases
    innerChart
        .selectAll(".severity-point")
        .data(data)
        .join("circle")
            .attr("class", "severity-point")
            .attr("cx", d => xScaleSeverity(d.hospitalisations))
            .attr("cy", d => yScaleSeverity(d.bedDaysPerCase))
            .attr("r", 7)
            .attr("fill", d => d.cases < fewCasesLimit ? "white" : roadUserColor(d.group))
            .attr("stroke", d => roadUserColor(d.group))
            .attr("stroke-width", 2);

    // Direct labels for the five largest road users
    innerChart
        .selectAll(".direct-label")
        .data(data.filter(d => labelledRoadUsers[d.roadUser]))
        .join("text")
            .attr("class", "direct-label")
            .text(d => labelledRoadUsers[d.roadUser].text)
            .attr("x", d => xScaleSeverity(d.hospitalisations) + labelledRoadUsers[d.roadUser].dx)
            .attr("y", d => yScaleSeverity(d.bedDaysPerCase) + labelledRoadUsers[d.roadUser].dy)
            .attr("text-anchor", d => labelledRoadUsers[d.roadUser].anchor)
            .attr("dominant-baseline", "middle")
            .attr("fill", storyColor);

    // Annotation for the story point: pedestrians stay twice as long as average
    const pedestrian = data.find(d => d.roadUser === "Pedestrian");
    const pedestrianLabel = innerChart
        .append("text")
            .attr("class", "annotation-label")
            .attr("x", xScaleSeverity(pedestrian.hospitalisations) + 12)
            .attr("y", yScaleSeverity(pedestrian.bedDaysPerCase) + 24)
            .attr("fill", storyColor);
    pedestrianLabel.append("tspan").text(`${pedestrian.bedDaysPerCase} days per case,`);
    pedestrianLabel.append("tspan").text("twice the average").attr("x", xScaleSeverity(pedestrian.hospitalisations) + 12).attr("dy", "1.2em");

    // Key for the colours and the hollow points, placed in the empty top right corner
    const keyItems = roadUserGroups
        .map(group => ({ label: roadUserLabels[group], color: roadUserColor(group), hollow: false }))
        .concat([{ label: "Fewer than 1,000 cases", color: referenceColor, hollow: true }]);
    const key = innerChart
        .append("g")
            .attr("class", "chart-key")
            .attr("transform", `translate(${innerW - 190}, 0)`);
    const keyRows = key
        .selectAll(".key-row")
        .data(keyItems)
        .join("g")
            .attr("class", "key-row")
            .attr("transform", (d, i) => `translate(0, ${i * 20})`);
    keyRows
        .append("circle")
            .attr("cx", 6)
            .attr("cy", 0)
            .attr("r", 6)
            .attr("fill", d => d.hollow ? "white" : d.color)
            .attr("stroke", d => d.color)
            .attr("stroke-width", 2);
    keyRows
        .append("text")
            .attr("class", "key-label")
            .text(d => d.label)
            .attr("x", 18)
            .attr("dominant-baseline", "middle");

    const severityTooltip = createChartTooltip(innerChart);

    innerChart.selectAll(".severity-point")
        .on("mouseenter", (e, d) => {
            const lines = [
                d.roadUser,
                `${formatNumber(d.hospitalisations)} hospitalisations`,
                `${d.bedDaysPerCase} bed days per case`
            ];
            if (d.cases < fewCasesLimit) {
                lines.push(`Based on few cases (${formatNumber(d.cases)})`);
            }
            showChartTooltip(severityTooltip, lines, xScaleSeverity(d.hospitalisations), yScaleSeverity(d.bedDaysPerCase), innerW);
        })
        .on("mouseleave", () => hideChartTooltip(severityTooltip));
};
