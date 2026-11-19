const COLOURS = {
    carOccupant: "#56B4E9",
    motorcyclist: "#E69F00",
    pedalCyclist: "#009E73",
    pedestrian: "#D55E00",
    otherRoadUsers: "#8C8C8C",
    female: "#CC79A7",
    male: "#0072B2",
    story: "#222222",
    context: "#858585",
    seriesBreakBand: "#ECECEC",
    note: "#555555",
    link: "#1F5F8B"
};

const ROAD_USER_GROUPS = [
    "Car occupant",
    "Motorcyclist",
    "Pedal cyclist",
    "Pedestrian",
    "Other road users"
];

const ROAD_USER_COLOURS = {
    "Car occupant": COLOURS.carOccupant,
    "Motorcyclist": COLOURS.motorcyclist,
    "Pedal cyclist": COLOURS.pedalCyclist,
    "Pedestrian": COLOURS.pedestrian,
    "Other road users": COLOURS.otherRoadUsers
};

const SEX_COLOURS = {
    Female: COLOURS.female,
    Male: COLOURS.male
};

const MIN_CASES = 1000;
const ALL_TRAFFIC_DAYS = 5.23;
const TRANSITION_MS = 500;

const SVG_WIDTH = 700;
const SVG_HEIGHT = 400;
const MARGIN = { top: 40, right: 120, bottom: 50, left: 70 };
const INNER_WIDTH = SVG_WIDTH - MARGIN.left - MARGIN.right;
const INNER_HEIGHT = SVG_HEIGHT - MARGIN.top - MARGIN.bottom;

const roadUserColour = d3.scaleOrdinal()
    .domain(ROAD_USER_GROUPS)
    .range(ROAD_USER_GROUPS.map(group => ROAD_USER_COLOURS[group]));

const sexColour = d3.scaleOrdinal()
    .domain(Object.keys(SEX_COLOURS))
    .range(Object.values(SEX_COLOURS));
