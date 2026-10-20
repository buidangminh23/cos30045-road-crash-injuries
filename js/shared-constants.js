// Generated with GenAI (Claude Opus 5.5), following the Week 5 and Week 6 shared-constants pattern

// Chart size and margins (margin convention from Week 5)
const margin = { top: 40, right: 30, bottom: 50, left: 70 };
const width = 800;
const height = 400;
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;

// Colours
const lineColor = "#1f5f8b";
const annotationColor = "#777777";

// Years where a vertical line explains a change in the trend
const annotations = [
    { year: 2017, label: "NSW counting change" },
    { year: 2020, label: "COVID-19 restrictions" }
];

// Inner chart group, assigned in line-chart.js and reused in interactions.js
let innerChart;

// Scales are declared here and their domain and range are set in line-chart.js
const xScale = d3.scaleLinear();
const yScale = d3.scaleLinear();

// Line generator for the trend line (Week 5)
const lineGenerator = d3.line()
    .x(d => xScale(d.year))
    .y(d => yScale(d.hospitalisations));
