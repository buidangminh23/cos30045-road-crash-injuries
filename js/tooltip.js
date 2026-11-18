// Generated with GenAI (Claude Opus 5.5), extending the Week 6 tooltip (Exercise 6.4) so one set of functions serves every chart and a tooltip can hold several lines

// Create a hidden tooltip group inside an inner chart and return it
const createChartTooltip = (chart) => {
    // Start far above the chart, like after mouseleave, so the hidden tooltip never covers a mark
    const tooltip = chart
        .append("g")
            .attr("class", "chart-tooltip")
            .attr("transform", "translate(0, -1000)")
            .style("opacity", 0)
            .style("pointer-events", "none");

    tooltip
        .append("rect")
            .attr("rx", 3)
            .attr("ry", 3)
            .attr("fill", storyColor)
            .attr("fill-opacity", 0.92);

    tooltip
        .append("text")
            .attr("fill", "white");

    return tooltip;
};

// Write the lines into the tooltip and place it above or below the point (x, y) of the inner chart
const showChartTooltip = (tooltip, lines, x, y, innerW, chartMargin = storyMargin) => {
    const padding = 8;
    const lineHeight = tooltipFontSize * 1.3;

    // One tspan per line, the first line in bold
    tooltip.select("text")
        .selectAll("tspan")
        .data(lines)
        .join("tspan")
            .attr("x", padding)
            .attr("y", (d, i) => padding + lineHeight * (i + 0.8))
            .style("font-size", `${tooltipFontSize}px`)
            .style("font-weight", (d, i) => i === 0 ? 700 : 400)
            .text(d => d);

    // Estimate the box size from the longest line (about 0.56 of the font size per character in Arial)
    const longest = d3.max(lines, d => d.length);
    const boxWidth = longest * tooltipFontSize * 0.56 + 2 * padding;
    const boxHeight = lines.length * lineHeight + 2 * padding;
    tooltip.select("rect")
        .attr("width", boxWidth)
        .attr("height", boxHeight);

    // Place the box above the point, or below it when the point is near the top of the chart
    const boxY = y - boxHeight - 12 < -chartMargin.top + 4 ? y + 12 : y - boxHeight - 12;

    // Centre the box on the point but keep it inside the SVG at both ends of the x axis
    const boxX = Math.min(Math.max(x - boxWidth / 2, -chartMargin.left + 4), innerW + chartMargin.right - boxWidth - 4);

    tooltip
        .attr("transform", `translate(${boxX}, ${boxY})`)
        .transition()
        .duration(200)
        .style("opacity", 1);

    // Accessibility: screen readers announce the same text (Week 8)
    announceToScreenReader(lines.join(". "));
};

// Hide the tooltip and move it out of the way
const hideChartTooltip = (tooltip) => {
    tooltip
        .interrupt()
        .style("opacity", 0)
        .attr("transform", "translate(0, -1000)");
};

// A transparent rectangle behind the marks: tapping it on a phone hides the tooltip
const addTooltipBackground = (chart, innerW, innerH, getTooltip) => {
    chart
        .append("rect")
            .attr("class", "tooltip-background")
            .attr("width", innerW)
            .attr("height", innerH)
            .attr("fill", "transparent")
            .on("click", () => hideChartTooltip(getTooltip()));
};
