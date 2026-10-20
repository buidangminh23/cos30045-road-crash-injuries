// Generated with GenAI (Claude Opus 5.5), following the Week 5 line chart and Week 6 histogram patterns

// Draw the line chart of hospitalisations per year, starting with all road users
const drawLineChart = (data) => {

    // Keep only the rows for the default group
    const startData = data.filter(d => d.roadUser === "All road users");

    // Create the SVG container and the inner chart
    const svg = d3.select("#line-chart")
        .append("svg")
            .attr("viewBox", `0 0 ${width} ${height}`);

    innerChart = svg
        .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Set the scales
    xScale
        .domain(d3.extent(startData, d => d.year))
        .range([0, innerWidth]);
    yScale
        .domain([0, d3.max(startData, d => d.hospitalisations)])
        .range([innerHeight, 0])
        .nice();

    // Draw the axes
    const bottomAxis = d3.axisBottom(xScale)
        .tickFormat(d3.format("d"))
        .tickSizeOuter(0);
    innerChart
        .append("g")
            .attr("class", "axis-x")
            .attr("transform", `translate(0, ${innerHeight})`)
            .call(bottomAxis);

    const leftAxis = d3.axisLeft(yScale);
    innerChart
        .append("g")
            .attr("class", "axis-y")
            .call(leftAxis);

    // Add the axis labels
    svg
        .append("text")
            .text("Hospitalised injuries (count)")
            .attr("x", 0)
            .attr("y", 20)
            .attr("text-anchor", "start")
            .attr("class", "axis-label");
    svg
        .append("text")
            .text("Year")
            .attr("x", width)
            .attr("y", height - 5)
            .attr("text-anchor", "end")
            .attr("class", "axis-label");

    // Draw the line
    innerChart
        .append("path")
            .attr("class", "trend-line")
            .attr("d", lineGenerator(startData))
            .attr("fill", "none")
            .attr("stroke", lineColor)
            .attr("stroke-width", 3);

    // Draw one circle per year so each value can be read
    innerChart
        .selectAll("circle")
        .data(startData)
        .join("circle")
            .attr("cx", d => xScale(d.year))
            .attr("cy", d => yScale(d.hospitalisations))
            .attr("r", 6)
            .attr("fill", lineColor);
};
