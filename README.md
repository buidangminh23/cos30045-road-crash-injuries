# Hospitalised Injuries from Road Crashes in Australia

COS30045 Data Visualisation team project (2026). An interactive D3 data story built on the BITRE Hospitalised Injury dataset (2011–2021).

## Team

| Name | Student ID | Role |
|---|---|---|
| Bui Dang Minh | 105716425 | |
| | | |

## Structure

| Path | Contents |
|---|---|
| `index.html` | Website entry point |
| `css/` | Stylesheets |
| `js/constants.js` | Shared constants (dimensions, colours, file paths) |
| `js/main.js` | Data loading and chart setup |
| `data/` | CSV files exported from KNIME and used by the website |
| `knime/` | KNIME workflow (`.knwf`) including its data |

## Data

Bureau of Infrastructure and Transport Research Economics (BITRE), Hospitalised Injury Data: https://www.bitre.gov.au/publications/ongoing/hospitalised-injury

All data processing and analysis is done in KNIME. The files in `data/` must match the KNIME workflow outputs.

## Workflow

- One feature branch per task; never commit directly to `main`.
- Merge through pull requests reviewed by a teammate.
- Pull often and avoid editing the same files at the same time.

## Run locally

Open the folder with a local web server (for example VS Code Live Server), because D3 cannot load CSV files from `file://`.

## Hosting

Swinburne Mercury server.
