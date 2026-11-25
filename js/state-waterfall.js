const waterfallUp = "#e4572e";
const waterfallDown = "#2f8f6a";
const waterfallTotal = "#12355b";

const buildWaterfallSteps = (data) => {
    const { changes, startTotal, endTotal, years } = computeStateContributions(data);
    let running = startTotal;
    const steps = [{ key: String(years[0]), label: String(years[0]), from: 0, to: startTotal, kind: "total", value: startTotal }];
    changes.forEach(d => {
        steps.push({ key: d.state, label: d.state, name: d.name, from: running, to: running + d.change, kind: d.change >= 0 ? "up" : "down", value: d.change, shareOfNet: d.shareOfNet });
        running += d.change;
    });
    steps.push({ key: String(years[1]), label: String(years[1]), from: 0, to: endTotal, kind: "total", value: endTotal });
    return { steps, changes, startTotal, endTotal, years };
};

const waterfallColor = d => d.kind === "total" ? waterfallTotal : (d.kind === "up" ? waterfallUp : waterfallDown);
const waterfallValueText = d => d.kind === "total" ? formatNumber(d.value) : `${d.value >= 0 ? "+" : "−"}${formatNumber(Math.abs(d.value))}`;

const drawStateWaterfall = (data, compact) => {
    const width = compact ? 420 : 760;
    const height = compact ? 520 : 400;
    const margin = compact ? { top: 24, right: 72, bottom: 48, left: 48 } : { top: 32, right: 16, bottom: 56, left: 64 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;
    const { steps, changes, startTotal, endTotal, years } = buildWaterfallSteps(data);

    const lowest = d3.min(steps.filter(d => d.kind !== "total"), d => Math.min(d.from, d.to));
    const valueScale = d3.scaleLinear()
        .domain([Math.floor(lowest * 0.92 / 1000) * 1000, d3.max(steps, d => Math.max(d.from, d.to))])
        .nice();
    const domainStart = valueScale.domain()[0];
    const clamp = v => Math.max(v, domainStart);
    const band = d3.scaleBand().domain(steps.map(d => d.key)).padding(0.22);

    const svg = createVizSvg("state-waterfall", width, height);
    describeChart(svg, "state-waterfall",
        `Waterfall chart: how each state and territory added to or subtracted from the combined change in hospitalisations, ${years[0]} to ${years[1]}`,
        `The states together went from ${formatNumber(startTotal)} to ${formatNumber(endTotal)}. `
        + changes.map(d => `${d.name}: ${d.change >= 0 ? "+" : "−"}${formatNumber(Math.abs(d.change))}.`).join(" ")
        + ` The value axis starts at ${formatNumber(domainStart)}, not zero, so the total bars are cut off.`);

    const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

    if (compact) {
        valueScale.range([0, innerW]);
        band.range([0, innerH]);
    } else {
        valueScale.range([innerH, 0]);
        band.range([0, innerW]);
    }

    const valueAxis = compact
        ? d3.axisBottom(valueScale).ticks(4).tickSize(-innerH).tickFormat(d3.format(".2s"))
        : d3.axisLeft(valueScale).ticks(5).tickSize(-innerW).tickFormat(d3.format(".2s"));
    g.append("g")
        .attr("class", "viz-grid")
        .attr("transform", compact ? `translate(0, ${innerH})` : null)
        .call(valueAxis)
        .call(axis => axis.select(".domain").remove());

    const low = d => clamp(Math.min(d.from, d.to));
    const high = d => clamp(Math.max(d.from, d.to));

    const bars = g.selectAll(".wf-bar")
        .data(steps)
        .join("rect")
            .attr("class", "wf-bar viz-mark")
            .attr("rx", 3)
            .attr("fill", waterfallColor);

    if (compact) {
        bars.attr("y", d => band(d.key))
            .attr("height", band.bandwidth())
            .attr("x", d => valueScale(low(d)))
            .attr("width", 0)
            .transition().duration(motionDuration(700)).delay((d, i) => motionDuration(i * 90))
            .attr("width", d => Math.max(1, valueScale(high(d)) - valueScale(low(d))));
    } else {
        bars.attr("x", d => band(d.key))
            .attr("width", band.bandwidth())
            .attr("y", d => valueScale(high(d)))
            .attr("height", 0)
            .transition().duration(motionDuration(700)).delay((d, i) => motionDuration(i * 90))
            .attr("height", d => Math.max(1, valueScale(low(d)) - valueScale(high(d))));
    }

    g.selectAll(".wf-connector")
        .data(steps.slice(0, -1))
        .join("line")
            .attr("stroke", "#94a3b8")
            .attr("stroke-dasharray", "3 3")
            .each(function (d, i) {
                const next = steps[i + 1];
                const line = d3.select(this);
                if (compact) {
                    line.attr("x1", valueScale(d.to)).attr("x2", valueScale(d.to))
                        .attr("y1", band(d.key) + band.bandwidth()).attr("y2", band(next.key));
                } else {
                    line.attr("x1", band(d.key) + band.bandwidth()).attr("x2", band(next.key))
                        .attr("y1", valueScale(d.to)).attr("y2", valueScale(d.to));
                }
            });

    g.selectAll(".wf-label")
        .data(steps)
        .join("text")
            .attr("class", "viz-label-sm viz-strong")
            .attr("x", d => compact ? valueScale(high(d)) + 6 : band(d.key) + band.bandwidth() / 2)
            .attr("y", d => compact ? band(d.key) + band.bandwidth() / 2 : valueScale(high(d)) - 8)
            .attr("text-anchor", compact ? "start" : "middle")
            .attr("dominant-baseline", compact ? "middle" : "auto")
            .text(waterfallValueText);

    g.selectAll(".wf-axis")
        .data(steps)
        .join("text")
            .attr("class", d => `viz-label-sm ${d.kind === "total" ? "viz-strong" : "viz-muted"}`)
            .attr("x", d => compact ? -8 : band(d.key) + band.bandwidth() / 2)
            .attr("y", d => compact ? band(d.key) + band.bandwidth() / 2 : innerH + 20)
            .attr("text-anchor", compact ? "end" : "middle")
            .attr("dominant-baseline", compact ? "middle" : "auto")
            .text(d => d.label);

    g.append("text")
        .attr("class", "viz-label-sm viz-muted")
        .attr("x", 0)
        .attr("y", innerH + (compact ? 40 : 44))
        .text(`Value axis starts at ${formatNumber(domainStart)}`);

    bindVizTooltip(bars, d => d.kind === "total"
        ? { title: `All states, ${d.label}`, rows: [["Hospitalisations", formatNumber(d.value)]], swatch: waterfallTotal }
        : {
            title: d.name,
            rows: [
                [`Change ${years[0]}–${years[1]}`, waterfallValueText(d)],
                ["Share of combined change", formatSignedPercent(d.shareOfNet)]
            ],
            swatch: waterfallColor(d)
        });
};
