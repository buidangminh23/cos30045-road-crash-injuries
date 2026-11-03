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

// Q2: hospitalisations per road user group and year (C2)
d3.csv("data/c2_road_user_group_by_year.csv", d => ({
    year: +d.year,
    group: d.road_user_group,
    hospitalisations: +d.hospitalisations
}))
    .then(data => drawRoadUserStack(data))
    .catch(error => showLoadError("road-user-stack", error));

// Q3: hospitalisations and bed days per case for each road user, 2016-2021 (C3)
d3.csv("data/c3_road_user_severity_2016_2021.csv", d => ({
    roadUser: d.road_user,
    group: d.road_user_group,
    hospitalisations: +d.hospitalisations,
    cases: +d.cases,
    bedDaysPerCase: +d.bed_days_per_case
}))
    .then(data => drawSeverityScatter(data))
    .catch(error => showLoadError("severity-scatter", error));

// Q4: hospitalisations and bed days per case by age group and sex (C4)
d3.csv("data/c4_age_sex.csv", d => ({
    ageGroup: d.age_group,
    ageOrder: +d.age_order,
    sex: d.sex,
    hospitalisations: +d.hospitalisations_2011_2021,
    bedDaysPerCase: +d.bed_days_per_case_2016_2021
}))
    .then(data => drawAgeSexBars(data))
    .catch(error => showLoadError("age-sex-bars", error));
