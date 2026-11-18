let PYRAMID_WIDTH = 760;
const PYRAMID_HEIGHT = 440;
const pyramidMargin = { top: 52, right: 16, bottom: 44, left: 16 };
let PYRAMID_CENTRE_GAP = 72;
const femaleColor = "#c2549d";
const maleColor = "#1f6fb2";

const drawAgePyramid = (data, compact) => {
    PYRAMID_WIDTH = compact ? 420 : 760;
    PYRAMID_CENTRE_GAP = compact ? 60 : 72;
    const innerW = PYRAMID_WIDTH - pyramidMargin.left - pyramidMargin.right;
    const innerH = PYRAMID_HEIGHT - pyramidMargin.top - pyramidMargin.bottom;
    const halfW = (innerW - PYRAMID_CENTRE_GAP) / 2;
    const ages = [...new Set(data.slice().sort((a, b) => b.ageOrder - a.ageOrder).map(d => d.ageGroup))];
    const total = d3.sum(data, d => d.hospitalisations);

    const x = d3.scaleLinear().domain([0, d3.max(data, d => d.hospitalisations)]).range([0, halfW]).nice();
    const y = d3.scaleBand().domain(ages).range([0, innerH]).padding(0.22);

    const svg = createVizSvg("age-pyramid", PYRAMID_WIDTH, PYRAMID_HEIGHT);
    describeChart(svg, "age-pyramid",
        "Population pyramid: road crash hospitalisations by age group, females on the left and males on the right, 2011 to 2021",
        ages.map(age => {
            const f = data.find(d => d.ageGroup === age && d.sex === "Female");
            const m = data.find(d => d.ageGroup === age && d.sex === "Male");
            return `${age}: ${formatNumber(f.hospitalisations)} females, ${formatNumber(m.hospitalisations)} males.`;
        }).join(" "));

    const g = svg.append("g").attr("transform", `translate(${pyramidMargin.left}, ${pyramidMargin.top})`);
    const leftX = v => halfW - x(v);
    const rightStart = halfW + PYRAMID_CENTRE_GAP;

    const ticks = x.ticks(compact ? 2 : 4).filter(t => t > 0);
    ticks.forEach(t => {
        [leftX(t), rightStart + x(t)].forEach(pos => {
            g.append("line").attr("x1", pos).attr("x2", pos).attr("y1", 0).attr("y2", innerH).attr("stroke", gridColor);
            g.append("text").attr("class", "viz-label-sm viz-muted").attr("x", pos).attr("y", innerH + 22).attr("text-anchor", "middle").text(d3.format(".0s")(t));
        });
    });

    [["Female", halfW, "end", femaleColor], ["Male", rightStart, "start", maleColor]].forEach(([label, pos, anchor, color]) => {
        const share = d3.sum(data.filter(d => d.sex === label), d => d.hospitalisations) / total;
        g.append("text")
            .attr("class", "viz-label viz-strong")
            .attr("x", pos)
            .attr("y", -22)
            .attr("text-anchor", anchor)
            .attr("fill", color)
            .text(`${label === "Female" ? "Females" : "Males"} · ${(share * 100).toFixed(0)}%`);
    });

    g.selectAll(".pyr-age")
        .data(ages)
        .join("text")
            .attr("class", "viz-label viz-strong")
            .attr("x", halfW + PYRAMID_CENTRE_GAP / 2)
            .attr("y", d => y(d) + y.bandwidth() / 2)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle")
            .text(d => d);

    const bars = g.selectAll(".pyr-bar")
        .data(data)
        .join("rect")
            .attr("class", "pyr-bar viz-mark")
            .attr("y", d => y(d.ageGroup))
            .attr("height", y.bandwidth())
            .attr("rx", 4)
            .attr("fill", d => d.sex === "Female" ? femaleColor : maleColor)
            .attr("x", d => d.sex === "Female" ? halfW : rightStart)
            .attr("width", 0);

    bars.transition()
        .duration(motionDuration(800))
        .delay(d => motionDuration(d.ageOrder * 60))
        .attr("x", d => d.sex === "Female" ? leftX(d.hospitalisations) : rightStart)
        .attr("width", d => x(d.hospitalisations));

    bindVizTooltip(bars, d => {
        const other = data.find(o => o.ageGroup === d.ageGroup && o.sex !== d.sex);
        return {
            title: `${d.sex === "Female" ? "Females" : "Males"} aged ${d.ageGroup}`,
            rows: [
                ["Hospitalisations 2011–2021", formatNumber(d.hospitalisations)],
                [`Ratio to ${other.sex.toLowerCase()}s`, `${(d.hospitalisations / other.hospitalisations).toFixed(2)}×`],
                ["Bed days per case", d.bedDaysPerCase.toFixed(2)]
            ],
            swatch: d.sex === "Female" ? femaleColor : maleColor
        };
    });
};
