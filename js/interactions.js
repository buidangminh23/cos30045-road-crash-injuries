// Generated with GenAI (Claude Opus 5.5), following the Week 6 filters exercise (Exercise 6.2)

// Create one button per road user group and update the line chart on click
const populateFilters = (data) => {

    d3.select("#filters_road_user")
        .selectAll(".filter")
        .data(filters_road_user)
        .join("button")
            .attr("class", d => `filter ${d.isActive ? "active" : ""}`)
            .text(d => d.label)
            .on("click", (e, d) => {
                // Only update when the clicked button is not already active
                if (!d.isActive) {
                    // Make the clicked filter the only active one
                    filters_road_user.forEach(filter => {
                        filter.isActive = d.id === filter.id ? true : false;
                    });

                    // Update the button styles
                    d3.selectAll("#filters_road_user .filter")
                        .classed("active", filter => filter.id === d.id ? true : false);

                    updateLineChart(d.id, data);
                }
            });

    // Redraw the line, the circles and the y axis for the selected group
    const updateLineChart = (filterId, data) => {

        // Every group has one row per year, so the number of circles stays the same
        const updatedData = data.filter(d => d.roadUser === filterId);

        // Rescale the y axis to the selected group (extension idea from Exercise 6.2)
        yScale.domain([0, d3.max(updatedData, d => d.hospitalisations)]).nice();
        d3.select("#line-chart .axis-y")
            .transition()
            .duration(500)
            .call(d3.axisLeft(yScale));

        // Move the line to the new values
        d3.select("#line-chart .trend-line")
            .transition()
            .duration(500)
            .ease(d3.easeCubicInOut)
            .attr("d", lineGenerator(updatedData));

        // Move each circle to its new value
        d3.selectAll("#line-chart circle")
            .data(updatedData)
            .transition()
            .duration(500)
            .ease(d3.easeCubicInOut)
            .attr("cy", d => yScale(d.hospitalisations));
    };
};

// Generated with GenAI (Claude Opus 5.5), following the Week 6 tooltip exercise (Exercise 6.4)

// Create the tooltip as an SVG group inside the inner chart, hidden at the start
const createTooltip = () => {
    // Start below the chart, like after mouseleave, so the hidden tooltip never covers a circle
    const tooltip = innerChart
        .append("g")
            .attr("class", "tooltip")
            .attr("transform", `translate(0, 500)`)
            .style("opacity", 0);

    tooltip
        .append("rect")
            .attr("width", tooltipWidth)
            .attr("height", tooltipHeight)
            .attr("rx", 3)
            .attr("ry", 3)
            .attr("fill", lineColor)
            .attr("fill-opacity", 0.9);

    tooltip
        .append("text")
            .text("NA")
            .attr("x", tooltipWidth / 2)
            .attr("y", tooltipHeight / 2 + 2)
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "middle")
            .attr("fill", "white")
            .style("font-weight", 700);
};

// Show the year and the count when the mouse enters a circle
const handleMouseEvents = () => {
    innerChart.selectAll("circle")
        .on("mouseenter", (e, d) => {
            d3.select(".tooltip text")
                .text(`${d.year}: ${d3.format(",")(d.hospitalisations)}`);

            // Read the position of the circle that was entered
            const cx = +e.target.getAttribute("cx");
            const cy = +e.target.getAttribute("cy");

            // Place the tooltip above the circle, or below it when the circle is near the top
            const tooltipY = cy < 2 * tooltipHeight ? cy + 0.5 * tooltipHeight : cy - 1.5 * tooltipHeight;

            // Centre the tooltip on the circle but keep it inside the SVG at both ends of the x axis
            const tooltipX = Math.min(Math.max(cx - 0.5 * tooltipWidth, -margin.left), innerWidth + margin.right - tooltipWidth);

            d3.select(".tooltip")
                .attr("transform", `translate(${tooltipX}, ${tooltipY})`)
                .transition()
                .duration(200)
                .style("opacity", 1);
        })
        .on("mouseleave", (e, d) => {
            d3.select(".tooltip")
                .style("opacity", 0)
                .attr("transform", `translate(0, 500)`);
        });
};
