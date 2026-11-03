// Generated with GenAI (Claude Opus 5.5), following the Week 6 load-data.js pattern with one d3.csv() call per data file

// Tell the reader on the page instead of leaving an empty chart area
const showLoadError = (containerId, error) => {
    console.error(`Error loading the data for #${containerId}:`, error);
    d3.select(`#${containerId}`)
        .append("p")
            .attr("class", "error-message")
            .text("The chart data could not be loaded. Please refresh the page or try again later.");
};

// Q1: national hospitalisations per year (C1)
d3.csv("data/c1_national_by_year.csv", d => ({
    year: +d.year,
    hospitalisations: +d.hospitalisations,
    isSeriesBreak: d.is_series_break === "true"   // KNIME writes the flag as the text true or false
}))
    .then(data => drawNationalTrend(data))
    .catch(error => showLoadError("national-trend", error));

// Q1: national hospitalisations per month (C1b)
d3.csv("data/c1b_national_by_month.csv", d => ({
    year: +d.year,
    month: d.month,
    hospitalisations: +d.hospitalisations
}))
    .then(data => drawMonthlyHistogram(data))
    .catch(error => showLoadError("monthly-histogram", error));

// Q2: hospitalisations per road user and year (week 6 line chart)
d3.csv("data/road-user-trend.csv", d => ({
    year: +d.year,                          // Convert year to a number
    roadUser: d.roadUser,
    hospitalisations: +d.hospitalisations   // Convert the count to a number
}))
    .then(data => {
        drawLineChart(data);
        populateFilters(data);
        createTooltip();
        handleMouseEvents();
    })
    .catch(error => showLoadError("line-chart", error));
