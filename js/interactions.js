// Generated with GenAI (Claude Opus 5.5), following the Week 6 filters exercise (Exercise 6.2)

// Create one button per filter; only one filter is active at a time and onChange redraws the chart
const createFilterButtons = (containerId, filters, onChange) => {
    d3.select(`#${containerId}`)
        .selectAll(".filter")
        .data(filters)
        .join("button")
            .attr("class", d => `filter ${d.isActive ? "active" : ""}`)
            .text(d => d.label)
            .on("click", (e, d) => {
                // Only update when the clicked button is not already active
                if (!d.isActive) {
                    filters.forEach(filter => {
                        filter.isActive = d.id === filter.id;
                    });
                    d3.selectAll(`#${containerId} .filter`)
                        .classed("active", filter => filter.isActive);
                    onChange(d.id);
                }
            });
};
