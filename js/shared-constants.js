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

// Tooltip size (Week 6 tooltip exercise)
const tooltipWidth = 130;
const tooltipHeight = 32;

// Years where a vertical line explains a change in the trend
const annotations = [
    { year: 2017, label: "NSW counting change" },
    { year: 2020, label: "COVID-19 restrictions" }
];

// Filter buttons for the road user groups (Week 6 filter pattern)
const filters_road_user = [
    { id: "All road users", label: "All road users", isActive: true },
    { id: "Car driver", label: "Car drivers", isActive: false },
    { id: "Motorcyclist", label: "Motorcyclists", isActive: false },
    { id: "Pedal cyclist", label: "Cyclists", isActive: false },
    { id: "Car passenger", label: "Car passengers", isActive: false },
    { id: "Pedestrian", label: "Pedestrians", isActive: false }
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

// Size of the story charts C1 to C5 (margin convention from Week 5)
const storyWidth = 700;
const storyHeight = 400;
const storyMargin = { top: 50, right: 30, bottom: 60, left: 100 };

// Colours from the Design Book palette (Figure 3.5)
const storyColor = "#222222";      // the mark that carries the story
const contextColor = "#9e9e9e";    // marks that give context
const bandColor = "#ececec";       // years affected by a recording change
const referenceColor = "#555555";  // dashed reference lines and their labels

// Shared formats and settings
const formatNumber = d3.format(",");
const yearTicks = [2011, 2013, 2015, 2017, 2019, 2021];
const transitionDuration = 500;
let tooltipFontSize = 14;
