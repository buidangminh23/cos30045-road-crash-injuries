(() => {
    "use strict";

    const navy = "#12355b";
    const teal = "#0b7b7b";
    const ink = "#17293b";
    const muted = "#5b6675";
    const context = "#8593a3";
    const roadColours = new Map([
        ["Car occupant", "#3b8fd9"],
        ["Motorcyclist", "#e69f00"],
        ["Pedal cyclist", "#0e9f78"],
        ["Pedestrian", "#d55e00"],
        ["Other road users", "#8c96a3"]
    ]);
    const roadLabels = {
        "Car occupant": "Car occupants",
        Motorcyclist: "Motorcyclists",
        "Pedal cyclist": "Cyclists",
        Pedestrian: "Pedestrians",
        "Other road users": "Other road users"
    };
    const sexColours = new Map([["Female", "#CC79A7"], ["Male", "#0072B2"]]);
    const stateColours = ["#3b8fd9", navy, "#895fa6", teal, "#c37800", "#d55e00", "#47678b", "#627348"];
    const averageBedDays = 5.23;
    const smallSample = 1000;
    const formatCount = d3.format(",");
    const formatDays = d3.format(".2f");
    const formatCompact = d3.format("~s");
    const formatChange = d3.format("+.1%");
    const defaultDetail = "Hover over, tap or focus a mark to see its value.";
    const yearTicks = [2011, 2013, 2015, 2017, 2019, 2021];

    function frame(id, title, xLabel, yLabel) {
        const container = d3.select("#chart-" + id);
        container.selectAll("*").remove();

        const widthAvailable = container.node().clientWidth;
        const compact = widthAvailable < 480;
        const size = { width: Math.max(275, Math.min(widthAvailable, 620)), height: compact ? 268 : 346 };
        const margin = { top: 20, right: compact ? 16 : 25, bottom: 64, left: compact ? 57 : 78 };
        const width = size.width - margin.left - margin.right;
        const height = size.height - margin.top - margin.bottom;
        const svg = container.append("svg")
            .attr("viewBox", "0 0 " + size.width + " " + size.height)
            .attr("role", "group")
            .attr("aria-label", title)
            .attr("font-family", "inherit");
        const plot = svg.append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        const labels = plot.append("g")
            .attr("fill", ink)
            .attr("font-size", 15)
            .attr("text-anchor", "middle");
        labels.append("text").attr("x", width / 2).attr("y", height + 53).text(xLabel);
        labels.append("text")
            .attr("transform", "translate(" + (compact ? -43 : -53) + "," + height / 2 + ") rotate(-90)")
            .text(yLabel);

        const detail = container.append("p")
            .attr("class", "chart-detail")
            .attr("aria-live", "polite")
            .text(defaultDetail);

        svg.on("keydown", (event) => {
            if (event.key === "Escape") detail.text(defaultDetail);
        }).on("click", (event) => {
            if (!event.target.closest(".chart-mark")) detail.text(defaultDetail);
        });
        return { plot, width, height, detail, container };
    }

    function axes(chart, xAxis, yAxis) {
        chart.plot.append("g")
            .attr("class", "chart-axis")
            .attr("transform", "translate(0," + chart.height + ")")
            .call(xAxis)
            .attr("font-size", 14);
        chart.plot.append("g")
            .attr("class", "chart-axis")
            .call(yAxis)
            .attr("font-size", 14);
    }

    function marks(selection, describe, detail) {
        selection.attr("class", "chart-mark")
            .attr("tabindex", 0)
            .attr("role", "img")
            .attr("aria-label", describe)
            .on("pointerenter focus click", (_, row) => detail.text(describe(row)))
            .on("pointerleave", (event) => {
                if (document.activeElement !== event.currentTarget) detail.text(defaultDetail);
            })
            .on("blur", () => detail.text(defaultDetail))
            .append("title")
            .text(describe);
    }

    function key(chart, options) {
        const legend = chart.container.append("ul").attr("class", "chart-key").attr("aria-label", "Chart key");
        const items = legend.selectAll("li").data(options).join("li");
        items.append("span")
            .attr("class", "chart-swatch")
            .attr("aria-hidden", "true")
            .style("display", "inline-block")
            .style("width", "0.8em")
            .style("height", "0.8em")
            .style("background", (item) => item.colour);
        items.append("span").text((item) => " " + item.label);
    }

    function selectOptions(id, options) {
        const control = d3.select("#" + id);
        control.selectAll("option").data(options).join("option")
            .attr("value", (option) => option.value)
            .text((option) => option.label);
        return control;
    }

    function yearScale(width) {
        return d3.scaleLinear().domain([2011, 2021]).range([0, width]);
    }

    function valueScale(maximum, height) {
        return d3.scaleLinear().domain([0, maximum]).nice().range([height, 0]);
    }

    function calendarAxis(scale) {
        return d3.axisBottom(scale).tickValues(yearTicks).tickFormat(d3.format("d"));
    }

    function seriesLine(x, y) {
        return d3.line().x((row) => x(row.year)).y((row) => y(row.hospitalisations));
    }

    function national(rows) {
        const chart = frame("c1", "Australian road crash hospitalisations by year", "Year", "Hospitalisations");
        const x = yearScale(chart.width);
        const y = valueScale(d3.max(rows, (row) => row.hospitalisations), chart.height);
        axes(chart, calendarAxis(x), d3.axisLeft(y).ticks(4).tickFormat(formatCompact));
        chart.plot.append("path")
            .datum(rows)
            .attr("d", seriesLine(x, y))
            .attr("fill", "none").attr("stroke", navy).attr("stroke-width", 3);
        const points = chart.plot.selectAll("circle").data(rows).join("circle")
            .attr("cx", (row) => x(row.year))
            .attr("cy", (row) => y(row.hospitalisations))
            .attr("r", (row) => row.is_series_break ? 6 : 5)
            .attr("fill", (row) => row.is_series_break ? "white" : navy)
            .attr("stroke", navy).attr("stroke-width", 2);
        marks(points, (row) => row.year + ": " + formatCount(row.hospitalisations) +
            " hospitalisations." + (row.is_series_break ? " The source flags a series break." : ""), chart.detail);
        key(chart, [{ colour: navy, label: "Yearly count. Hollow points mark reporting changes." }]);
    }

    function monthly(rows) {
        const chart = frame("c1b", "Distribution of monthly road crash hospitalisations", "Hospitalisations per month", "Months");
        const values = rows.map((row) => row.hospitalisations);
        const lower = Math.floor(d3.min(values) / 100) * 100;
        const upper = Math.ceil((d3.max(values) + 1) / 100) * 100;
        const bins = d3.bin().domain([lower, upper]).thresholds(d3.range(lower + 100, upper, 100))(values);
        const x = d3.scaleLinear().domain([lower, upper]).range([0, chart.width]);
        const y = valueScale(d3.max(bins, (bin) => bin.length), chart.height);
        axes(chart, d3.axisBottom(x).ticks(4).tickFormat(formatCount), d3.axisLeft(y).ticks(5));
        const april = rows.find((row) => row.year === 2020 && row.month_num === 4);
        const hasApril = (bin) => april && april.hospitalisations >= bin.x0 && april.hospitalisations < bin.x1;
        const bars = chart.plot.selectAll("rect").data(bins.filter((bin) => bin.length)).join("rect")
            .attr("x", (bin) => x(bin.x0) + 1)
            .attr("y", (bin) => y(bin.length))
            .attr("width", (bin) => x(bin.x1) - x(bin.x0) - 2)
            .attr("height", (bin) => chart.height - y(bin.length))
            .attr("fill", (bin) => hasApril(bin) ? "#d55e00" : teal);
        marks(bars, (bin) => formatCount(bin.x0) + "–" + formatCount(bin.x1 - 1) + " hospitalisations: " +
            bin.length + (bin.length === 1 ? " month." : " months.") +
            (hasApril(bin) ? " Includes April 2020." : ""), chart.detail);
        key(chart, [{ colour: "#d55e00", label: "Bin containing April 2020" }]);
    }

    function roadUsers(rows) {
        const groups = [...roadColours.keys()];
        const control = selectOptions("road-user-filter", [{ value: "all", label: "All road users" },
            ...groups.map((group) => ({ value: group, label: roadLabels[group] }))]);
        const byYear = Array.from(d3.group(rows, (row) => row.year), ([year, entries]) => ({
            year, counts: new Map(entries.map((row) => [row.road_user_group, row]))
        }));

        function draw() {
            const selected = control.property("value");
            const shown = selected === "all" ? groups : [selected];
            const chart = frame("c2", "Hospitalisations by road user group and year", "Year", "Hospitalisations");
            const x = d3.scaleBand().domain(byYear.map((row) => row.year)).range([0, chart.width]).padding(0.19);
            const stacks = d3.stack().keys(shown).value((row, group) => row.counts.get(group).hospitalisations)(byYear);
            const y = valueScale(d3.max(stacks, (stack) => d3.max(stack, (entry) => entry[1])), chart.height);
            axes(chart, calendarAxis(x), d3.axisLeft(y).ticks(4).tickFormat(formatCompact));

            const bars = chart.plot.selectAll("g.road-layer").data(stacks).join("g")
                .attr("class", "road-layer").attr("fill", (layer) => roadColours.get(layer.key))
                .selectAll("rect")
                .data((layer) => layer.map((entry) => ({ entry, group: layer.key })))
                .join("rect")
                .attr("x", ({ entry }) => x(entry.data.year))
                .attr("y", ({ entry }) => y(entry[1]))
                .attr("width", x.bandwidth())
                .attr("height", ({ entry }) => y(entry[0]) - y(entry[1]));
            marks(bars, ({ entry, group }) => {
                const row = entry.data.counts.get(group);
                return row.year + ", " + roadLabels[group] + ": " + formatCount(row.hospitalisations) +
                    " hospitalisations, " + row.share_pct.toFixed(1) + "% of the annual total.";
            }, chart.detail);
            key(chart, shown.map((group) => ({ colour: roadColours.get(group), label: roadLabels[group] })));
        }

        control.on("change", draw);
        draw();
    }

    function severity(rows) {
        const chart = frame("c3", "Road user hospitalisations and length of stay", "Hospitalisations, 2016–2021", "Bed days per case");
        const x = d3.scaleLinear().domain([0, d3.max(rows, (row) => row.hospitalisations)])
            .nice().range([0, chart.width]);
        const y = valueScale(d3.max(rows, (row) => row.bed_days_per_case), chart.height);
        axes(chart, d3.axisBottom(x).ticks(4).tickFormat(formatCompact), d3.axisLeft(y).ticks(5));
        chart.plot.append("line")
            .attr("x2", chart.width).attr("y1", y(averageBedDays)).attr("y2", y(averageBedDays))
            .attr("stroke", muted).attr("stroke-dasharray", "5 5");
        chart.plot.append("text")
            .attr("x", chart.width - 2).attr("y", y(averageBedDays) - 8)
            .attr("text-anchor", "end").attr("fill", muted).attr("font-size", 14)
            .text("All traffic: 5.23");
        const points = chart.plot.selectAll("circle").data(rows).join("circle")
            .attr("cx", (row) => x(row.hospitalisations))
            .attr("cy", (row) => y(row.bed_days_per_case))
            .attr("r", 6)
            .attr("fill", (row) => row.cases < smallSample ? "white" : roadColours.get(row.road_user_group))
            .attr("stroke", (row) => roadColours.get(row.road_user_group))
            .attr("stroke-width", 2);
        marks(points, (row) => row.road_user + ": " + formatCount(row.hospitalisations) +
            " hospitalisations, " + formatDays(row.bed_days_per_case) + " bed days per case." +
            (row.cases < smallSample ? " Based on fewer than 1,000 cases." : ""), chart.detail);
        const pedestrian = rows.find((row) => row.road_user === "Pedestrian");
        chart.plot.append("text")
            .attr("x", x(pedestrian.hospitalisations) + 10)
            .attr("y", y(pedestrian.bed_days_per_case) + 5)
            .attr("fill", ink).attr("font-size", 14).text("Pedestrians");
        key(chart, [...roadColours].map(([group, colour]) => ({ colour, label: roadLabels[group] })));
    }

    function ageAndSex(rows) {
        const measure = selectOptions("measure-filter", [
            { value: "hospitalisations", label: "Hospitalisations" },
            { value: "bed-days", label: "Bed days per case" }
        ]);
        const sex = selectOptions("sex-filter", [
            { value: "all", label: "All recorded sexes" },
            { value: "Female", label: "Female" },
            { value: "Male", label: "Male" }
        ]);
        const ages = [...new Set(d3.sort(rows, (row) => row.age_order).map((row) => row.age_group))];

        function draw() {
            const useDays = measure.property("value") === "bed-days";
            const field = useDays ? "bed_days_per_case_2016_2021" : "hospitalisations_2011_2021";
            const unit = useDays ? "Bed days per case" : "Hospitalisations";
            const period = useDays ? "2016–2021" : "2011–2021";
            const selected = sex.property("value");
            const sexes = selected === "all" ? [...sexColours.keys()] : [selected];
            const chart = frame("c4", unit + " by age and recorded sex, " + period, "Age group", unit);
            const x = d3.scaleBand().domain(ages).range([0, chart.width]).padding(0.22);
            const barX = d3.scaleBand().domain(sexes).range([0, x.bandwidth()]).padding(0.1);
            const y = valueScale(d3.max(rows, (row) => row[field]), chart.height);
            axes(chart, d3.axisBottom(x), d3.axisLeft(y).ticks(4).tickFormat(useDays ? d3.format("d") : formatCompact));
            const bars = chart.plot.selectAll("rect").data(rows.filter((row) => sexes.includes(row.sex))).join("rect")
                .attr("x", (row) => x(row.age_group) + barX(row.sex))
                .attr("y", (row) => y(row[field]))
                .attr("width", barX.bandwidth())
                .attr("height", (row) => chart.height - y(row[field]))
                .attr("fill", (row) => sexColours.get(row.sex));
            marks(bars, (row) => row.age_group + ", " + row.sex + ": " +
                formatCount(row.hospitalisations_2011_2021) + " hospitalisations (2011–2021), " +
                formatDays(row.bed_days_per_case_2016_2021) + " bed days per case (2016–2021).", chart.detail);
            key(chart, sexes.map((label) => ({ colour: sexColours.get(label), label })));
        }

        measure.on("change", draw);
        sex.on("change", draw);
        draw();
    }

    function states(rows) {
        const series = Array.from(d3.group(rows, (row) => row.state), ([code, entries], index) => ({
            code, entries, label: entries[0].state_name, colour: stateColours[index],
            max: d3.max(entries, (row) => row.hospitalisations)
        }));
        const control = selectOptions("state-filter", [{ value: "all", label: "All states and territories" },
            ...series.map(({ code, label }) => ({ value: code, label }))]);

        function draw() {
            const selected = series.find((state) => state.code === control.property("value"));
            const active = selected ? [selected] : series;
            const maximum = selected ? selected.max : d3.max(series, (state) => state.max);
            const chart = frame("c5", "Road crash hospitalisations by state or territory of residence", "Year", "Hospitalisations");
            const x = yearScale(chart.width);
            const y = valueScale(maximum, chart.height);
            axes(chart, calendarAxis(x), d3.axisLeft(y).ticks(4).tickFormat(formatCompact));
            const breaks = [...new Set(rows.filter((row) => row.is_series_break).map((row) => row.year))];
            chart.plot.selectAll("line.series-break").data(breaks).join("line")
                .attr("class", "series-break")
                .attr("x1", (year) => x(year)).attr("x2", (year) => x(year))
                .attr("y2", chart.height).attr("stroke", context).attr("stroke-dasharray", "4 5");

            const shown = selected
                ? [...series.filter((state) => state !== selected && state.max <= y.domain()[1]), selected]
                : series;
            chart.plot.selectAll("path.state-line").data(shown).join("path")
                .attr("class", "state-line")
                .attr("d", (state) => seriesLine(x, y)(state.entries))
                .attr("fill", "none")
                .attr("stroke", (state) => !selected || state === selected ? state.colour : context)
                .attr("stroke-width", (state) => state === selected ? 3.5 : 1.8);
            const points = chart.plot.selectAll("g.state-points").data(active).join("g")
                .attr("class", "state-points").attr("fill", (state) => state.colour)
                .selectAll("circle")
                .data((state) => state.entries.map((row) => ({
                    ...row, change: row.hospitalisations / state.entries[0].hospitalisations - 1
                })))
                .join("circle")
                .attr("cx", (row) => x(row.year))
                .attr("cy", (row) => y(row.hospitalisations))
                .attr("r", selected ? 4 : 3.2);
            marks(points, (row) => row.state_name + ", " + row.year + ": " +
                formatCount(row.hospitalisations) + " hospitalisations, " + formatChange(row.change) +
                " from 2011." + (row.is_series_break ? " Reporting changed this year." : ""), chart.detail);
            key(chart, [...active.map(({ colour, label }) => ({ colour, label })),
                { colour: context, label: "Dashed markers: Victoria 2012 and NSW 2017 reporting changes" }]);
        }

        control.on("change", draw);
        draw();
    }

    const charts = [
        ["c1", "c1_national_by_year.csv", national],
        ["c1b", "c1b_national_by_month.csv", monthly],
        ["c2", "c2_road_user_group_by_year.csv", roadUsers],
        ["c3", "c3_road_user_severity_2016_2021.csv", severity],
        ["c4", "c4_age_sex.csv", ageAndSex],
        ["c5", "c5_state_by_year.csv", states]
    ];
    charts.forEach(async ([id, filename, draw]) => {
        try {
            const rows = await d3.csv("prototype/data/" + filename, d3.autoType);
            if (!rows.length) throw new Error("No data rows");
            draw(rows);
        } catch {
            d3.select("#chart-" + id).selectAll("*").remove();
            d3.select("#chart-" + id).append("p").attr("class", "chart-error")
                .attr("role", "status").text("This chart's data could not be loaded.");
        }
    });
})();
