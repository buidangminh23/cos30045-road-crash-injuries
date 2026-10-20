# Hospitalised Injuries from Road Crashes in Australia

COS30045 Data Visualisation team project (2026). An interactive D3 data story built on the BITRE Hospitalised Injury dataset (2011–2021).

## Team

| Name | Student ID | Role |
|---|---|---|
| Bui Dang Minh | 105716425 | Website displaying an interactive data visualisation and associated code |
| Nguyen Nhu Tuan Long | 106216078 | Design Book and KNIME workflow |

## Structure

| Path | Contents |
|---|---|
| `index.html` | Website entry point |
| `css/base.css` | Page layout, text and filter buttons |
| `css/visualisation.css` | Chart container, axes, annotations and tooltip |
| `js/shared-constants.js` | Chart size, margins, colours, scales, filters and tooltip size |
| `js/line-chart.js` | Road user trend line chart |
| `js/interactions.js` | Filter buttons and tooltip |
| `js/load-data.js` | Loads the CSV and calls the chart functions (loaded last) |
| `data/` | CSV files used by the website |
| `knime/` | KNIME workflow (`.knwf`) including its data |

## Data

Bureau of Infrastructure and Transport Research Economics (BITRE), Hospitalised Injury Data: https://www.bitre.gov.au/publications/ongoing/hospitalised-injury

All data processing and analysis is done in KNIME. The files in `data/` must match the KNIME workflow outputs.

| File | Columns | Source and steps |
|---|---|---|
| `data/road-user-trend.csv` | `year`, `roadUser`, `hospitalisations` | National workbook (`hospitalisation_injury_publication_sep2023.xlsx`), sheet `raw` |

KNIME steps for `road-user-trend.csv`:

1. Excel Reader: sheet `raw`.
2. Row Filter: `Cause of injury` = `Traffic`.
3. Missing Value: replace missing `Hospitalisations` with 0.
4. GroupBy: group by `Calendar year` and `Road user`, sum of `Hospitalisations`.
5. GroupBy: group by `Calendar year`, sum of `Hospitalisations`, then add a `Road user` column with the value `All road users`.
6. Concatenate the two tables and rename the columns to `year`, `roadUser`, `hospitalisations`.
7. CSV Writer: `data/road-user-trend.csv`.

The output has 143 rows (13 groups x 11 years). The `All road users` totals must equal Table 1 of the workbook (34,033 in 2011 and 39,505 in 2021). The current file was produced with a temporary script during development and will be replaced by the KNIME export.

`Hospitalisations` is used instead of `Count of cases` because it matches the published BITRE tables. Deaths within 30 days are only recorded until June 2020.

## Workflow

- One feature branch per task; never commit directly to `main`.
- Merge through pull requests reviewed by a teammate.
- Pull often and avoid editing the same files at the same time.

## Run locally

Open the folder with a local web server (for example VS Code Live Server), because D3 cannot load CSV files from `file://`.

## Hosting

The website is hosted on GitHub Pages and deployed from `main`: https://buidangminh23.github.io/cos30045-road-crash-injuries/

## Generative AI use

Claude Opus 5.5 (Anthropic) was used to write the week 6 version of the website: the file structure, the line chart, the filter buttons, the tooltip and the page text. Generated code is marked with a comment in each JavaScript file, and the commits that contain it say so. The team must be able to explain every part of the code in the face-to-face interviews.
