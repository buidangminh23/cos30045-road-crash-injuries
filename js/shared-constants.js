const ROAD_USER_COLOURS = {
  "Car occupant": "#56B4E9", "Motorcyclist": "#E69F00",
  "Pedal cyclist": "#009E73", "Pedestrian": "#D55E00",
  "Other road users": "#8C8C8C"
};
const UI_COLOURS = {
  female: "#CC79A7", male: "#0072B2",
  story: "#222222", context: "#858585", seriesBreakBand: "#ECECEC"
};
const MIN_CASES = 1000, ALL_TRAFFIC_DAYS = 5.23, TRANSITION_MS = 500;
const roadUserColour = d3.scaleOrdinal()
  .domain(Object.keys(ROAD_USER_COLOURS))
  .range(Object.values(ROAD_USER_COLOURS));

const sexColour = d3.scaleOrdinal()
  .domain(["Female", "Male"])
  .range([UI_COLOURS.female, UI_COLOURS.male]);

const SVG_WIDTH = 700, SVG_HEIGHT = 400;
const MARGIN = { top: 40, right: 120, bottom: 50, left: 70 };
const INNER_WIDTH = SVG_WIDTH - MARGIN.left - MARGIN.right;
const INNER_HEIGHT = SVG_HEIGHT - MARGIN.top - MARGIN.bottom;
