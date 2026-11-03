// Generated with GenAI (Claude Opus 5.5), following the Week 5 and Week 6 shared-constants pattern

// Size of the story charts C1 to C5 (margin convention from Week 5)
const storyWidth = 700;
const storyHeight = 400;
const storyMargin = { top: 50, right: 30, bottom: 60, left: 100 };

// Charts with direct labels at the right end need a wider right margin
const labelledMargin = { top: 50, right: 140, bottom: 60, left: 100 };

// Colours from the Design Book palette (Figure 3.5)
const storyColor = "#222222";      // the mark that carries the story
const contextColor = "#9e9e9e";    // marks that give context
const bandColor = "#ececec";       // years affected by a recording change
const referenceColor = "#555555";  // dashed reference lines and their labels

// Road user groups in a fixed order, so each group keeps its place in the stack and its colour (C2 and C3)
const roadUserGroups = ["Car occupant", "Motorcyclist", "Pedal cyclist", "Pedestrian", "Other road users"];
const roadUserLabels = {
    "Car occupant": "Car occupants",
    "Motorcyclist": "Motorcyclists",
    "Pedal cyclist": "Cyclists",
    "Pedestrian": "Pedestrians",
    "Other road users": "Other road users"
};
const roadUserColor = d3.scaleOrdinal()
    .domain(roadUserGroups)
    .range(["#56B4E9", "#E69F00", "#009E73", "#D55E00", "#999999"]);

// Filter buttons for the road user stack (Week 6 filter pattern)
const filtersRoadUser = [
    { id: "All", label: "All road users", isActive: true },
    ...roadUserGroups.map(group => ({ id: group, label: roadUserLabels[group], isActive: false }))
];

// Shared formats and settings
const formatNumber = d3.format(",");
const yearTicks = [2011, 2013, 2015, 2017, 2019, 2021];
const transitionDuration = 500;
let tooltipFontSize = 14;
