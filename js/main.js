// Entry point: load the data, then build each chart.

// Load every CSV listed in DATA_FILES and return them keyed by name
const loadData = async () => {
    const entries = Object.entries(DATA_FILES);
    const tables = await Promise.all(entries.map(([, path]) => d3.csv(path, d3.autoType)));
    return Object.fromEntries(entries.map(([name], index) => [name, tables[index]]));
};

loadData()
    .then(data => {
        console.log("Data loaded", data);
    })
    .catch(error => {
        console.error("Could not load data", error);
    });
