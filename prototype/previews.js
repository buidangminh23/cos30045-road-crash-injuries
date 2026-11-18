(() => {
    "use strict";

    const navy = "#12355b";
    const blue = "#3b8fd9";
    const teal = "#0b7b7b";
    const orange = "#e4572e";
    const muted = "#53677d";
    const roadColors = {
        "Car occupant": blue,
        Motorcyclist: "#e69f00",
        "Pedal cyclist": "#0e9f78",
        Pedestrian: "#d55e00",
        "Other road users": "#8c96a3"
    };
    const female = "#c2549d";
    const male = "#1f6fb2";
    const count = d3.format(",d");
    const percent = d3.format(".0%");
    const signedPercent = d3.format("+.0%");
    const yearTick = d3.format("d");
    const years = d3.range(2011, 2022, 2);

    function frame(id, label, options = {}) {
        const { left = 64, right = 24, bottom = 60, height = 300 } = options;
        const width = 700;
        const top = 20;
        const host = d3.select("#chart-" + id);
        host.selectAll("*").remove();
        const svg = host.append("svg")
            .attr("viewBox", [0, 0, width, height])
            .attr("class", "preview-chart")
            .attr("width", "100%")
            .attr("height", "auto")
            .attr("font-family", "inherit")
            .attr("font-size", 16)
            .attr("role", "group")
            .attr("aria-label", label);
        const plot = svg.append("g").attr("transform", "translate(" + left + "," + top + ")");
        host.append("p").attr("class", "chart-detail").attr("aria-live", "polite");
        return { plot, w: width - left - right, h: height - top - bottom };
    }

    function axes(chart, horizontal, vertical, units) {
        const { plot, w, h } = chart;
        plot.append("g").attr("class", "chart-axis")
            .attr("transform", "translate(0," + h + ")").call(horizontal)
            .call(group => group.selectAll("text").attr("font-size", 15));
        if (vertical) {
            plot.append("g").attr("class", "chart-axis").call(vertical)
                .call(group => group.selectAll("text").attr("font-size", 15));
        }
        if (units) {
            plot.append("text").attr("x", w / 2).attr("y", h + 45)
                .attr("text-anchor", "middle").attr("fill", muted).text(units);
        }
    }

    function identify(marks, describe) {
        function readout(mark, text) {
            mark.ownerSVGElement.parentElement.querySelector(".chart-detail").textContent = text;
        }

        marks.classed("preview-mark", true)
            .attr("tabindex", 0).attr("role", "img").attr("aria-label", describe)
            .on("focus pointerenter click", function (_, data) {
                readout(this, describe(data));
            })
            .on("blur", function () {
                readout(this, "");
            })
            .on("pointerleave", function () {
                if (document.activeElement !== this) {
                    readout(this, "");
                }
            })
            .on("keydown", function (event) {
                if (event.key === "Escape") {
                    readout(this, "");
                }
            });
        marks.append("title").text(describe);
    }

    function points(plot, rows, x, y, color, describe, radius = 5) {
        identify(plot.append("g").selectAll("circle").data(rows).join("circle")
            .attr("cx", x).attr("cy", y).attr("r", radius)
            .attr("fill", color).attr("stroke", "white").attr("stroke-width", 1.4), describe);
    }

    function line(plot, rows, x, y, color, dashed = false) {
        plot.append("path").datum(rows).attr("d", d3.line().x(x).y(y))
            .attr("fill", "none").attr("stroke", color).attr("stroke-width", 3)
            .attr("stroke-dasharray", dashed ? "6 5" : null);
    }

    function reference(plot, x1, x2, y1, y2) {
        plot.append("line").attr("x1", x1).attr("x2", x2).attr("y1", y1).attr("y2", y2)
            .attr("stroke", muted).attr("stroke-dasharray", "5 4");
    }

    function key(chart, entries) {
        const labels = chart.plot.append("g").attr("transform", "translate(0," + (chart.h + 30) + ")")
            .selectAll("g").data(entries).join("g")
            .attr("transform", (_, index) => "translate(" + index * chart.w / entries.length + ",0)");
        labels.append("rect").attr("width", 12).attr("height", 12).attr("y", -10)
            .attr("rx", 2).attr("fill", entry => entry.color);
        labels.append("text").attr("x", 17).attr("fill", muted).attr("font-size", 14)
            .text(entry => entry.label);
    }

    function yearsScale(w) {
        return d3.scaleLinear([2011, 2021], [0, w]);
    }

    function valuesScale(h, maximum) {
        return d3.scaleLinear([0, maximum], [h, 0]).nice();
    }

    function heatmap(rows) {
        const chart = frame("heatmap", "Monthly hospitalisations heatmap", { left: 56 });
        const { plot, w, h } = chart;
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const x = d3.scaleBand(d3.range(1, 13), [0, w]).padding(0.07);
        const y = d3.scaleBand(d3.range(2011, 2022), [0, h]).padding(0.1);
        const color = d3.scaleSequential(d3.extent(rows, row => row.hospitalisations), d3.interpolateBlues);
        const minimum = d3.least(rows, row => row.hospitalisations);
        axes(chart, d3.axisBottom(x).tickFormat(month => monthNames[month - 1]), d3.axisLeft(y).tickFormat(yearTick));
        identify(plot.append("g").selectAll("rect").data(rows).join("rect")
            .attr("x", row => x(row.month_num)).attr("y", row => y(row.year))
            .attr("width", x.bandwidth()).attr("height", y.bandwidth())
            .attr("rx", 2).attr("fill", row => color(row.hospitalisations))
            .attr("stroke", row => row === minimum ? orange : "#dceaf6")
            .attr("stroke-width", row => row === minimum ? 4 : 1),
            row => row.month + " " + row.year + ": " + count(row.hospitalisations));
        key(chart, [
            { label: "Lower monthly count", color: color(color.domain()[0]) },
            { label: "Higher monthly count", color: color(color.domain()[1]) },
            { label: "April 2020 minimum", color: orange }
        ]);
    }

    function anomaly(rows) {
        const normal = d3.rollup(rows.filter(row => row.year >= 2017 && row.year <= 2019),
            month => d3.mean(month, row => row.hospitalisations), row => row.month_num);
        const deviations = rows.filter(row => row.year >= 2020).map(row => ({
            ...row,
            difference: row.hospitalisations / normal.get(row.month_num) - 1,
            key: row.year + "-" + row.month_num
        }));
        const chart = frame("anomaly", "Monthly change from the same month's 2017–2019 average");
        const { plot, w, h } = chart;
        const x = d3.scaleBand(deviations.map(row => row.key), [0, w]).padding(0.22);
        const limit = d3.max(deviations, row => Math.abs(row.difference));
        const y = d3.scaleLinear([-limit, limit], [h, 0]).nice();
        axes(chart, d3.axisBottom(x).tickValues(["2020-1", "2020-7", "2021-1", "2021-7"])
            .tickFormat(key => (key.endsWith("-1") ? "Jan " : "Jul ") + key.slice(0, 4)),
            d3.axisLeft(y).ticks(5, ".0%"), "Difference from the 2017–2019 average");
        reference(plot, 0, w, y(0), y(0));
        identify(plot.append("g").selectAll("rect").data(deviations).join("rect")
            .attr("x", row => x(row.key)).attr("y", row => Math.min(y(0), y(row.difference)))
            .attr("width", x.bandwidth()).attr("height", row => Math.abs(y(row.difference) - y(0)))
            .attr("fill", row => row.difference < 0 ? orange : blue),
            row => row.month + " " + row.year + ": " + signedPercent(row.difference));
    }

    function roadSeries(rows) {
        return Array.from(d3.group(rows, row => row.road_user_group), ([name, values]) => ({
            name,
            color: roadColors[name],
            values: values.slice().sort((a, b) => a.year - b.year)
        }));
    }

    function compareRoadUsers(rows, indexed) {
        const series = roadSeries(rows).map(group => ({
            ...group,
            values: (indexed ? group.values : [group.values[0], group.values.at(-1)])
                .map(row => ({ ...row, value: indexed ? row.hospitalisations / group.values[0].hospitalisations * 100 : row.hospitalisations }))
        }));
        const chart = frame(indexed ? "index" : "slope", indexed ? "Road user growth indexed to 2011" : "Road user hospitalisations in 2011 and 2021");
        const { plot, w, h } = chart;
        const x = yearsScale(w);
        const y = valuesScale(h, d3.max(series.flatMap(group => group.values), row => row.value));
        axes(chart, d3.axisBottom(x).tickValues(indexed ? years : [2011, 2021]).tickFormat(yearTick),
            d3.axisLeft(y).ticks(5, "~s"));
        if (indexed) {
            reference(plot, 0, w, y(100), y(100));
        }
        for (const group of series) {
            const year = row => x(row.year);
            const value = row => y(row.value);
            line(plot, group.values, year, value, group.color);
            points(plot, group.values, year, value, group.color,
                row => group.name + ", " + row.year + ": " + (indexed ? row.value.toFixed(1) + " index" : count(row.value)));
        }
        key(chart, series.map(group => ({ color: group.color, label: group.name === "Pedal cyclist" ? "Cyclist" : group.name === "Other road users" ? "Other" : group.name })));
    }

    function donut(rows) {
        const control = document.getElementById("donut-year");
        function draw() {
            const year = Number(control.value);
            const values = rows.filter(row => row.year === year);
            const chart = frame("donut", "Road user shares in " + year, { left: 25, bottom: 28 });
            const { plot, w, h } = chart;
            const total = d3.sum(values, row => row.hospitalisations);
            const radius = Math.min(105, h / 2 - 6);
            const ring = plot.append("g").attr("transform", "translate(150," + h / 2 + ")");
            const arcs = d3.pie().sort(null).value(row => row.hospitalisations)(values);
            const path = d3.arc().innerRadius(radius * 0.64).outerRadius(radius);
            identify(ring.selectAll("path").data(arcs).join("path").attr("d", path)
                .attr("fill", item => roadColors[item.data.road_user_group]).attr("stroke", "white").attr("stroke-width", 2),
                item => item.data.road_user_group + ": " + count(item.data.hospitalisations) + " (" + percent(item.data.hospitalisations / total) + ")");
            ring.append("text").attr("text-anchor", "middle").attr("y", 8)
                .attr("font-weight", 700).attr("font-size", 28).attr("fill", navy).text(year);
            const legend = plot.append("g").attr("transform", "translate(300,35)")
                .selectAll("g").data(values).join("g")
                .attr("transform", (_, index) => "translate(0," + index * 40 + ")");
            legend.append("rect").attr("width", 16).attr("height", 16).attr("rx", 4)
                .attr("y", -13).attr("fill", row => roadColors[row.road_user_group]);
            legend.append("text").attr("x", 26).attr("fill", navy).attr("font-size", 18)
                .text(row => row.road_user_group);
            legend.append("text").attr("x", w - 310).attr("text-anchor", "end").attr("fill", navy)
                .attr("font-size", 18).text(row => percent(row.hospitalisations / total));
        }
        control.addEventListener("change", draw);
        draw();
    }

    function lollipop(rows) {
        const chart = frame("lollipop", "Ranked bed days per case by road user", { left: 228, height: 362 });
        const { plot, w, h } = chart;
        const sorted = d3.sort(rows, row => -row.bed_days_per_case);
        const x = d3.scaleLinear([0, d3.max(sorted, row => row.bed_days_per_case)], [0, w]).nice();
        const y = d3.scaleBand(sorted.map(row => row.road_user), [0, h]).padding(0.45);
        const centre = row => y(row.road_user) + y.bandwidth() / 2;
        axes(chart, d3.axisBottom(x).ticks(5), d3.axisLeft(y), "Bed days per case");
        plot.append("g").selectAll("line").data(sorted).join("line").attr("x1", x(0))
            .attr("x2", row => x(row.bed_days_per_case)).attr("y1", centre).attr("y2", centre)
            .attr("stroke", row => roadColors[row.road_user_group]).attr("stroke-width", 2);
        points(plot, sorted, row => x(row.bed_days_per_case), centre, row => roadColors[row.road_user_group],
            row => row.road_user + ": " + row.bed_days_per_case.toFixed(2) + " days", 6);
    }

    function burden(rows) {
        const totalCases = d3.sum(rows, row => row.cases);
        const totalDays = d3.sum(rows, row => row.bed_days);
        const shares = Array.from(d3.group(rows, row => row.road_user_group), ([group, types]) => ({
            group,
            cases: d3.sum(types, row => row.cases) / totalCases,
            days: d3.sum(types, row => row.bed_days) / totalDays
        })).sort((a, b) => (b.days - b.cases) - (a.days - a.cases));
        const chart = frame("burden", "Share of hospital cases and bed days", { left: 140 });
        const { plot, w, h } = chart;
        const x = d3.scaleLinear([0, d3.max(shares, row => Math.max(row.cases, row.days))], [0, w]).nice();
        const y = d3.scaleBand(shares.map(row => row.group), [0, h]).padding(0.25);
        const centre = row => y(row.group) + y.bandwidth() / 2;
        axes(chart, d3.axisBottom(x).ticks(5, ".0%"), d3.axisLeft(y));
        plot.append("g").selectAll("line").data(shares).join("line")
            .attr("x1", row => x(row.cases)).attr("x2", row => x(row.days))
            .attr("y1", centre).attr("y2", centre).attr("stroke", "#a0abb9").attr("stroke-width", 3);
        points(plot, shares, row => x(row.cases), centre, navy, row => row.group + ": " + percent(row.cases) + " of cases", 7);
        points(plot, shares, row => x(row.days), centre, orange, row => row.group + ": " + percent(row.days) + " of bed days", 7);
        key(chart, [{ label: "Share of cases", color: navy }, { label: "Share of bed days", color: orange }]);
    }

    function agePyramid(rows) {
        const chart = frame("pyramid", "Hospitalisations by age and sex", { left: 75 });
        const { plot, w, h } = chart;
        const maximum = d3.max(rows, row => row.hospitalisations_2011_2021);
        const x = d3.scaleLinear([-maximum, maximum], [0, w]).nice();
        const ageGroups = d3.sort(rows, row => -row.age_order).map(row => row.age_group);
        const y = d3.scaleBand(ageGroups, [0, h]).padding(0.24);
        const value = row => row.hospitalisations_2011_2021 * (row.sex === "Female" ? -1 : 1);
        axes(chart, d3.axisBottom(x).ticks(7).tickFormat(number => count(Math.abs(number))), d3.axisLeft(y));
        identify(plot.append("g").selectAll("rect").data(rows).join("rect")
            .attr("x", row => x(Math.min(0, value(row)))).attr("y", row => y(row.age_group))
            .attr("width", row => Math.abs(x(value(row)) - x(0))).attr("height", y.bandwidth())
            .attr("fill", row => row.sex === "Female" ? female : male),
            row => row.age_group + ", " + row.sex + ": " + count(Math.abs(value(row))));
        key(chart, [{ label: "Female", color: female }, { label: "Male", color: male }]);
    }

    function sexRatio(rows) {
        const series = Array.from(d3.group(d3.sort(rows, row => row.age_order), row => row.age_group), ([age, sex]) => ({
            age,
            ratio: sex.find(row => row.sex === "Male").hospitalisations_2011_2021 /
                sex.find(row => row.sex === "Female").hospitalisations_2011_2021
        }));
        const chart = frame("ratio", "Male hospitalisations per female hospitalisation");
        const { plot, w, h } = chart;
        const x = d3.scalePoint(series.map(row => row.age), [0, w]).padding(0.25);
        const y = valuesScale(h, d3.max(series, row => row.ratio));
        axes(chart, d3.axisBottom(x), d3.axisLeft(y).ticks(5), "Age group");
        reference(plot, 0, w, y(1), y(1));
        line(plot, series, row => x(row.age), row => y(row.ratio), male);
        points(plot, series, row => x(row.age), row => y(row.ratio), male,
            row => row.age + ": " + row.ratio.toFixed(2) + " males per female");
    }

    function stateChanges(rows) {
        return Array.from(d3.group(rows, row => row.state), ([state, values]) => {
            const start = values.find(row => row.year === 2011).hospitalisations;
            const end = values.find(row => row.year === 2021).hospitalisations;
            return { state, start, end, change: end - start, rate: end / start - 1 };
        });
    }

    function stateChangeBars(rows) {
        const changes = d3.sort(stateChanges(rows), row => -row.rate);
        const chart = frame("state-change", "Change in hospitalisations by state, 2011 to 2021", { left: 75 });
        const { plot, w, h } = chart;
        const x = d3.scaleLinear([Math.min(0, d3.min(changes, row => row.rate)), d3.max(changes, row => row.rate)], [0, w]).nice();
        const y = d3.scaleBand(changes.map(row => row.state), [0, h]).padding(0.25);
        axes(chart, d3.axisBottom(x).ticks(5, ".0%"), d3.axisLeft(y), "Change between 2011 and 2021");
        reference(plot, x(0), x(0), 0, h);
        identify(plot.append("g").selectAll("rect").data(changes).join("rect")
            .attr("x", row => x(Math.min(0, row.rate))).attr("y", row => y(row.state))
            .attr("width", row => Math.abs(x(row.rate) - x(0))).attr("height", y.bandwidth())
            .attr("fill", row => row.rate < 0 ? orange : teal),
            row => row.state + ": " + signedPercent(row.rate));
    }

    function firstNations(rows) {
        const chart = frame("first-nations", "First Nations hospitalisations and records with status not stated");
        const { plot, w, h } = chart;
        const x = yearsScale(w);
        const y = valuesScale(h, d3.max(rows, row => Math.max(row.first_nations, row.status_not_stated)));
        axes(chart, d3.axisBottom(x).tickValues(years).tickFormat(yearTick), d3.axisLeft(y).ticks(5, "~s"));
        const year = row => x(row.year);
        const first = row => y(row.first_nations);
        const notStated = row => y(row.status_not_stated);
        plot.append("path").datum(rows).attr("d", d3.area().x(year).y0(h).y1(first))
            .attr("fill", "#bee8e0");
        line(plot, rows, year, first, teal);
        line(plot, rows, year, notStated, orange, true);
        points(plot, rows, year, first, teal, row => row.year + ": " + count(row.first_nations) + " First Nations hospitalisations");
        points(plot, rows, year, notStated, orange, row => row.year + ": " + count(row.status_not_stated) + " records with status not stated");
        key(chart, [{ label: "First Nations hospitalisations", color: teal }, { label: "Status not stated", color: orange }]);
    }

    function stateWaterfall(rows) {
        const changes = d3.sort(stateChanges(rows), row => -row.change);
        const start = d3.sum(changes, row => row.start);
        let running = start;
        const bars = changes.map(row => {
            const from = running;
            running += row.change;
            return { name: row.state, from, to: running, value: row.change, color: row.change < 0 ? "#2f8f6a" : orange };
        });
        bars.unshift({ name: "2011", from: 0, to: start, value: start, color: navy });
        bars.push({ name: "2021", from: 0, to: running, value: running, color: navy });
        const chart = frame("waterfall", "State contributions to combined hospitalisation change");
        const { plot, w, h } = chart;
        const floor = Math.floor(start * 0.9 / 1000) * 1000;
        const y = d3.scaleLinear([floor, d3.max(bars, bar => Math.max(bar.from, bar.to))], [h, 0]).nice();
        const x = d3.scaleBand(bars.map(bar => bar.name), [0, w]).padding(0.25);
        const low = y.domain()[0];
        axes(chart, d3.axisBottom(x), d3.axisLeft(y).ticks(5, "~s"), "Combined hospitalisations, truncated scale");
        plot.append("g").selectAll("line").data(bars.slice(0, -1)).join("line")
            .attr("x1", bar => x(bar.name) + x.bandwidth()).attr("x2", (_, index) => x(bars[index + 1].name))
            .attr("y1", bar => y(bar.to)).attr("y2", bar => y(bar.to))
            .attr("stroke", muted).attr("stroke-dasharray", "3 3");
        identify(plot.append("g").selectAll("rect").data(bars).join("rect")
            .attr("x", bar => x(bar.name)).attr("y", bar => y(Math.max(bar.from, bar.to)))
            .attr("width", x.bandwidth()).attr("height", bar => y(Math.max(low, Math.min(bar.from, bar.to))) - y(Math.max(bar.from, bar.to)))
            .attr("fill", bar => bar.color),
            bar => bar.name + ": " + (bar.color === navy ? count(bar.value) : d3.format("+,d")(bar.value)));
    }

    const datasets = [
        ["c1b_national_by_month.csv", [["heatmap", heatmap], ["anomaly", anomaly]]],
        ["c2_road_user_group_by_year.csv", [["slope", rows => compareRoadUsers(rows, false)], ["donut", donut], ["index", rows => compareRoadUsers(rows, true)]]],
        ["c3_road_user_severity_2016_2021.csv", [["lollipop", lollipop], ["burden", burden]]],
        ["c4_age_sex.csv", [["pyramid", agePyramid], ["ratio", sexRatio]]],
        ["c5_state_by_year.csv", [["state-change", stateChangeBars], ["waterfall", stateWaterfall]]],
        ["c5b_first_nations_by_year.csv", [["first-nations", firstNations]]]
    ];

    function showError(id) {
        const host = d3.select("#chart-" + id);
        host.selectAll("*").remove();
        host.append("p").attr("class", "chart-error").text("Chart data could not be loaded.");
    }

    for (const [file, charts] of datasets) {
        const rows = d3.csv("prototype/data/" + file, d3.autoType);
        for (const [id, draw] of charts) {
            rows.then(draw).catch(() => showError(id));
        }
    }
})();
