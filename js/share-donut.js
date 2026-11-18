const DONUT_SIZE = 440;

const drawShareDonut = (data) => {
    const radius = DONUT_SIZE / 2 - 24;
    const svg = createVizSvg("share-donut", DONUT_SIZE, DONUT_SIZE);
    const shareOf = year => roadUserGroups.map(group => {
        const row = data.find(d => d.year === year && d.group === group);
        const total = d3.sum(data.filter(d => d.year === year), d => d.hospitalisations);
        return { group, year, value: row.hospitalisations, share: row.hospitalisations / total, total };
    });

    describeChart(svg, "share-donut",
        "Donut chart: share of road crash hospitalisations by road user group",
        [2011, 2021].map(year => `${year}: ` + shareOf(year).map(d => `${roadUserLabels[d.group]} ${(d.share * 100).toFixed(1)}%`).join(", ")).join(". "));

    const g = svg.append("g").attr("transform", `translate(${DONUT_SIZE / 2}, ${DONUT_SIZE / 2})`);
    const pie = d3.pie().sort(null).value(d => d.value).padAngle(0.012);
    const arc = d3.arc().innerRadius(radius * 0.62).outerRadius(radius).cornerRadius(6);
    const arcHot = d3.arc().innerRadius(radius * 0.62).outerRadius(radius + 10).cornerRadius(6);

    const centerValue = g.append("text").attr("class", "viz-label-xl").attr("text-anchor", "middle").attr("y", -4);
    const centerLabel = g.append("text").attr("class", "viz-label viz-muted").attr("text-anchor", "middle").attr("y", 26);

    let current = shareOf(2021);
    const paths = g.selectAll(".donut-slice")
        .data(pie(current), d => d.data.group)
        .join("path")
            .attr("class", "donut-slice viz-mark")
            .attr("fill", d => roadUserColor(d.data.group))
            .attr("stroke", "#fff")
            .attr("stroke-width", 2)
            .each(function (d) { this._current = { startAngle: 0, endAngle: 0 }; });

    const setCenter = (title, value) => {
        centerValue.text(value);
        centerLabel.text(title);
    };

    const render = (year) => {
        current = shareOf(year);
        const arcs = pie(current);
        paths.data(arcs, d => d.data.group)
            .transition()
            .duration(motionDuration(750))
            .attrTween("d", function (d) {
                const interpolate = d3.interpolate(this._current, d);
                this._current = interpolate(1);
                return t => arc(interpolate(t));
            });
        const cyclist = current.find(d => d.group === "Pedal cyclist");
        setCenter(`Cyclists' share in ${year}`, `${(cyclist.share * 100).toFixed(1)}%`);
    };

    bindVizTooltip(paths, d => ({
        title: `${roadUserLabels[d.data.group]}, ${d.data.year}`,
        rows: [
            ["Share of all road users", `${(d.data.share * 100).toFixed(1)}%`],
            ["Hospitalisations", formatNumber(d.data.value)]
        ],
        swatch: roadUserColor(d.data.group)
    }));
    paths
        .on("mouseenter.grow focus.grow", function (event, d) { d3.select(this).attr("d", arcHot(d)); })
        .on("mouseleave.grow blur.grow", function (event, d) { d3.select(this).attr("d", arc(d)); });

    render(2021);
    createFilterButtons("filters-donut-year", [
        { id: 2011, label: "2011", isActive: false },
        { id: 2021, label: "2021", isActive: true }
    ], "Choose the year of the donut chart", year => render(year));

    createHtmlKey("share-donut", roadUserGroups.map(group => ({ label: roadUserLabels[group], color: roadUserColor(group) })));
    d3.select("#share-donut .html-key").classed("html-key-always", true);
};
