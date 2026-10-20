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
