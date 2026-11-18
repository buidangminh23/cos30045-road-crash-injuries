const BASELINE_YEARS = [2017, 2018, 2019];
const ANOMALY_YEARS = [2020, 2021];
const formatSignedPercent = (value, digits = 1) => `${value >= 0 ? "+" : "−"}${Math.abs(value).toFixed(digits)}%`;
const formatShare = (value, digits = 1) => `${value.toFixed(digits)}%`;

const setStat = (key, text) => {
    document.querySelectorAll(`[data-stat="${key}"]`).forEach(el => {
        el.textContent = text;
    });
};

const averageAnnualGrowth = (start, end, years) => (Math.pow(end / start, 1 / years) - 1) * 100;

const computeMonthlyAnomalies = (months) => {
    const baseline = d3.rollup(
        months.filter(d => BASELINE_YEARS.includes(d.year)),
        rows => d3.mean(rows, d => d.hospitalisations),
        d => d.monthNum
    );
    return months
        .filter(d => ANOMALY_YEARS.includes(d.year))
        .map(d => ({
            ...d,
            baseline: baseline.get(d.monthNum),
            deviation: (d.hospitalisations - baseline.get(d.monthNum)) / baseline.get(d.monthNum) * 100
        }));
};

const computeSeasonalIndex = (months) => {
    const overall = d3.mean(months, d => d.hospitalisations);
    return d3.range(1, 13).map(monthNum => {
        const rows = months.filter(d => d.monthNum === monthNum);
        return { monthNum, month: rows[0].month, index: d3.mean(rows, d => d.hospitalisations) / overall * 100 };
    });
};

const fillNationalGrowthStat = (years) => {
    const first = years[0];
    const last = years[years.length - 1];
    setStat("national-growth-rate", formatSignedPercent(averageAnnualGrowth(first.hospitalisations, last.hospitalisations, last.year - first.year)));
};

const fillMonthlyStats = (months) => {
    const anomalies = computeMonthlyAnomalies(months);
    const lowest = anomalies.reduce((a, b) => (b.deviation < a.deviation ? b : a));
    setStat("lowest-anomaly", formatSignedPercent(lowest.deviation));
    setStat("lowest-anomaly-month", `${lowest.month} ${lowest.year}`);
    const seasonal = computeSeasonalIndex(months);
    const peak = seasonal.reduce((a, b) => (b.index > a.index ? b : a));
    const trough = seasonal.reduce((a, b) => (b.index < a.index ? b : a));
    setStat("season-peak", formatSignedPercent(peak.index - 100));
    setStat("season-peak-month", peak.month);
    setStat("season-trough", formatSignedPercent(trough.index - 100));
    setStat("season-trough-month", trough.month);
};

const computeGroupChanges = (rows) => {
    const years = d3.extent(rows, d => d.year);
    const valueOf = (group, year) => rows.find(d => d.group === group && d.year === year).hospitalisations;
    const changes = roadUserGroups.map(group => {
        const start = valueOf(group, years[0]);
        const end = valueOf(group, years[1]);
        return { group, start, end, change: end - start, growthRate: averageAnnualGrowth(start, end, years[1] - years[0]) };
    });
    const netChange = d3.sum(changes, d => d.change);
    changes.forEach(d => { d.shareOfNet = d.change / netChange * 100; });
    return { changes, netChange, years };
};

const fillRoadUserStats = (rows) => {
    const { changes, netChange, years } = computeGroupChanges(rows);
    const cyclists = changes.find(d => d.group === "Pedal cyclist");
    const pedestrians = changes.find(d => d.group === "Pedestrian");
    const total = (year) => d3.sum(rows.filter(d => d.year === year), d => d.hospitalisations);
    setStat("cyclist-share-of-rise", formatShare(cyclists.shareOfNet));
    setStat("cyclist-rise", `+${formatNumber(cyclists.change)}`);
    setStat("national-rise", `+${formatNumber(netChange)}`);
    setStat("cyclist-growth-rate", formatSignedPercent(cyclists.growthRate));
    setStat("national-growth-rate-2", formatSignedPercent(averageAnnualGrowth(total(years[0]), total(years[1]), years[1] - years[0])));
    setStat("cyclist-index", Math.round(cyclists.end / cyclists.start * 100).toString());
    setStat("pedestrian-index", Math.round(pedestrians.end / pedestrians.start * 100).toString());
};

const computeGroupBurden = (rows) => {
    const totalCases = d3.sum(rows, d => d.cases);
    const totalBedDays = d3.sum(rows, d => d.bedDays);
    return roadUserGroups.map(group => {
        const groupRows = rows.filter(d => d.group === group);
        const cases = d3.sum(groupRows, d => d.cases);
        const bedDays = d3.sum(groupRows, d => d.bedDays);
        return {
            group,
            cases,
            bedDays,
            caseShare: cases / totalCases * 100,
            bedDayShare: bedDays / totalBedDays * 100,
            bedDaysPerCase: bedDays / cases
        };
    });
};

const fillSeverityStats = (rows) => {
    const burden = computeGroupBurden(rows);
    const pedestrians = burden.find(d => d.group === "Pedestrian");
    const cyclists = burden.find(d => d.group === "Pedal cyclist");
    setStat("pedestrian-case-share", formatShare(pedestrians.caseShare));
    setStat("pedestrian-bed-share", formatShare(pedestrians.bedDayShare));
    setStat("cyclist-case-share", formatShare(cyclists.caseShare));
    setStat("cyclist-bed-share", formatShare(cyclists.bedDayShare));
    setStat("total-bed-days", formatNumber(d3.sum(rows, d => d.bedDays)));
};

const computeSexRatios = (rows) => {
    const ages = [...new Set(rows.slice().sort((a, b) => a.ageOrder - b.ageOrder).map(d => d.ageGroup))];
    return ages.map(ageGroup => {
        const female = rows.find(d => d.ageGroup === ageGroup && d.sex === "Female");
        const male = rows.find(d => d.ageGroup === ageGroup && d.sex === "Male");
        return {
            ageGroup,
            female: female.hospitalisations,
            male: male.hospitalisations,
            ratio: male.hospitalisations / female.hospitalisations,
            gap: male.hospitalisations - female.hospitalisations
        };
    });
};

const fillAgeStats = (rows) => {
    const ratios = computeSexRatios(rows);
    const highest = ratios.reduce((a, b) => (b.ratio > a.ratio ? b : a));
    const widestGap = ratios.reduce((a, b) => (b.gap > a.gap ? b : a));
    setStat("highest-sex-ratio", highest.ratio.toFixed(2));
    setStat("highest-sex-ratio-age", highest.ageGroup);
    setStat("widest-gap", formatNumber(widestGap.gap));
    setStat("widest-gap-age", widestGap.ageGroup);
    const older = rows.filter(d => d.ageOrder >= 6);
    setStat("older-case-share", formatShare(d3.sum(older, d => d.cases) / d3.sum(rows, d => d.cases) * 100));
    setStat("older-bed-share", formatShare(d3.sum(older, d => d.bedDays) / d3.sum(rows, d => d.bedDays) * 100));
};

const computeStateContributions = (rows) => {
    const years = d3.extent(rows, d => d.year);
    const states = [...new Set(rows.map(d => d.state))];
    const valueOf = (state, year) => rows.find(d => d.state === state && d.year === year).hospitalisations;
    const changes = states.map(state => ({
        state,
        name: rows.find(d => d.state === state).stateName,
        change: valueOf(state, years[1]) - valueOf(state, years[0])
    }));
    const startTotal = d3.sum(states, state => valueOf(state, years[0]));
    const endTotal = d3.sum(states, state => valueOf(state, years[1]));
    changes.forEach(d => { d.shareOfNet = d.change / (endTotal - startTotal) * 100; });
    return { changes: changes.sort((a, b) => b.change - a.change), startTotal, endTotal, years };
};

const computeStateStay = (rows, fromYear) => {
    const states = [...new Set(rows.map(d => d.state))];
    return states.map(state => {
        const stateRows = rows.filter(d => d.state === state && d.year >= fromYear);
        return { state, stay: d3.sum(stateRows, d => d.bedDays) / d3.sum(stateRows, d => d.hospitalisations) };
    });
};

const fillStateStats = (rows) => {
    const { changes, startTotal, endTotal } = computeStateContributions(rows);
    const qld = changes.find(d => d.state === "Qld");
    const nsw = changes.find(d => d.state === "NSW");
    setStat("qld-share-of-rise", formatShare(qld.shareOfNet, 0));
    setStat("qld-rise", `+${formatNumber(qld.change)}`);
    setStat("states-rise", `+${formatNumber(endTotal - startTotal)}`);
    setStat("nsw-change", `−${formatNumber(Math.abs(nsw.change))}`);
    const stays = computeStateStay(rows, 2016);
    setStat("nsw-stay", stays.find(d => d.state === "NSW").stay.toFixed(1));
    setStat("qld-stay", stays.find(d => d.state === "Qld").stay.toFixed(1));
};
