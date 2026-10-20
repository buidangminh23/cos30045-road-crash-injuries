// Generated with GenAI (Claude Opus 5.5), following the Week 6 load-data.js pattern

// Load the CSV file with a row conversion function
d3.csv("data/road-user-trend.csv", d => ({
    year: +d.year,                          // Convert year to a number
    roadUser: d.roadUser,
    hospitalisations: +d.hospitalisations   // Convert the count to a number
}))
    .then(data => {
        console.log(data);
        drawLineChart(data);
        populateFilters(data);
        createTooltip();
        handleMouseEvents();
    })
    .catch(error => {
        console.error("Error loading the CSV file:", error);

        // Tell the reader on the page instead of leaving an empty chart area
        d3.select("#line-chart")
            .append("p")
                .attr("class", "error-message")
                .text("The chart data could not be loaded. Please refresh the page or try again later.");
    });
