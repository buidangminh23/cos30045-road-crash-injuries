let LOLLIPOP_WIDTH = 760;
let LOLLIPOP_HEIGHT = 470;
let lollipopMargin = { top: 40, right: 64, bottom: 44, left: 250 };

const readableRoadUser = (name) => ({
    "Pedestrian": "Pedestrians",
    "Pedal cyclist": "Cyclists",
    "Motorcyclist": "Motorcyclists"
}[name] || name);

const drawBedDayLollipop = (data, compact) => {
    LOLLIPOP_WIDTH = compact ? 420 : 760;
    LOLLIPOP_HEIGHT = compact ? 680 : 470;
    lollipopMargin = compact ? { top: 60, right: 48, bottom: 44, left: 12 } : { top: 40, right: 64, bottom: 44, left: 250 };
    const innerW = LOLLIPOP_WIDTH - lollipopMargin.left - lollipopMargin.right;
    const innerH = LOLLIPOP_HEIGHT - lollipopMargin.top - lollipopMargin.bottom;
    const sorted = data.slice().sort((a, b) => b.bedDaysPerCase - a.bedDaysPerCase);

    const x = d3.scaleLinear().domain([0, d3.max(sorted, d => d.bedDaysPerCase)]).range([0, innerW]).nice();
    const y = d3.scaleBand().domain(sorted.map(d => d.roadUser)).range([0, innerH]).padding(compact ? 0.1 : 0.45);

    const svg = createVizSvg("bed-day-lollipop", LOLLIPOP_WIDTH, LOLLIPOP_HEIGHT);
    describeChart(svg, "bed-day-lollipop",
        "Lollipop chart: average bed days per case for each road user type, 2016 to 2021, ranked",
        sorted.map(d => `${readableRoadUser(d.roadUser)}: ${d.bedDaysPerCase} days.`).join(" "));

    const g = svg.append("g").attr("transform", `translate(${lollipopMargin.left}, ${lollipopMargin.top})`);

    g.append("g")
        .attr("class", "viz-grid")
        .attr("transform", `translate(0, ${innerH})`)
        .call(d3.axisBottom(x).tickSize(-innerH).ticks(compact ? 4 : 6).tickFormat(d => `${d} d`))
        .call(axis => axis.select(".domain").remove());

    g.append("line")
        .attr("x1", x(allTrafficBedDays)).attr("x2", x(allTrafficBedDays))
        .attr("y1", -14).attr("y2", innerH)
        .attr("stroke", mutedInk)
        .attr("stroke-dasharray", "5 4");
    g.append("text")
        .attr("class", "viz-label-sm viz-muted")
        .attr("x", x(allTrafficBedDays) + 6)
        .attr("y", -18)
        .text(`All road traffic: ${allTrafficBedDays} days`);

    const rows = g.selectAll(".lp-row")
        .data(sorted)
        .join("g")
            .attr("class", "lp-row")
            .attr("transform", d => `translate(0, ${y(d.roadUser) + y.bandwidth() / 2})`);

    rows.append("text")
        .attr("class", d => `viz-label ${d.roadUser === "Pedestrian" ? "viz-strong" : ""}`)
        .attr("x", compact ? 0 : -14)
        .attr("y", compact ? -18 : 0)
        .attr("text-anchor", compact ? "start" : "end")
        .attr("dominant-baseline", "middle")
        .text(d => readableRoadUser(d.roadUser));

    const isStory = d => d.roadUser === "Pedestrian";
    rows.append("line")
        .attr("class", "lp-stem")
        .attr("x1", 0).attr("x2", 0)
        .attr("stroke", d => isStory(d) ? accentColor : "#c3ccd8")
        .attr("stroke-width", d => isStory(d) ? 4 : 3)
        .attr("stroke-linecap", "round")
        .transition()
        .duration(motionDuration(800))
        .delay((d, i) => motionDuration(i * 50))
        .attr("x2", d => x(d.bedDaysPerCase));

    const dots = rows.append("circle")
        .attr("class", "lp-dot viz-mark")
        .attr("cx", 0)
        .attr("r", d => isStory(d) ? 10 : 8)
        .attr("fill", d => d.cases < fewCasesLimit ? "#fff" : (isStory(d) ? accentColor : roadUserColor(d.group)))
        .attr("stroke", d => isStory(d) ? accentColor : roadUserColor(d.group))
        .attr("stroke-width", 3);
    dots.transition()
        .duration(motionDuration(800))
        .delay((d, i) => motionDuration(i * 50))
        .attr("cx", d => x(d.bedDaysPerCase));

    rows.append("text")
        .attr("class", d => `viz-label-sm ${isStory(d) ? "viz-strong" : "viz-muted"}`)
        .attr("x", d => x(d.bedDaysPerCase) + 16)
        .attr("dominant-baseline", "middle")
        .text(d => d.bedDaysPerCase.toFixed(1));

    bindVizTooltip(dots, d => ({
        title: readableRoadUser(d.roadUser),
        rows: [
            ["Bed days per case", d.bedDaysPerCase.toFixed(2)],
            ["Vs all road traffic", `${(d.bedDaysPerCase / allTrafficBedDays).toFixed(1)}×`],
            ["Cases 2016–2021", formatNumber(d.cases)]
        ],
        swatch: roadUserColor(d.group)
    }));
};
