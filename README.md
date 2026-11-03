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
The code is split by role: data loading, one file per chart, interaction and accessibility helpers, and presentation (CSS).

| Path | Role | Contents |
|---|---|---|
| `index.html` | Presentation | One scrolling page: introduction, Q1 to Q5, conclusion, about the data |
| `css/base.css` | Presentation | Page layout, text, key numbers, buttons, focus outlines, sticky header |
| `css/visualisation.css` | Presentation | Chart containers, axes, labels, focus styles, phone colour key |
| `js/shared-constants.js` | Shared | Chart size and margins, palette, road user colours, formats, text size scale |
| `js/load-data.js` | Data | One `d3.csv()` call per file with a row conversion; shows a message if a file cannot be loaded (loaded last) |
| `js/national-trend.js` | Visualisation | C1 line chart (Q1) |
| `js/monthly-histogram.js` | Visualisation | C1b histogram (Q1) |
| `js/road-user-stack.js` | Visualisation | C2 stacked bar chart with group filter (Q2) |
| `js/severity-scatter.js` | Visualisation | C3 scatter plot (Q3) |
| `js/age-sex-bars.js` | Visualisation | C4 grouped bar chart with measure and sex buttons (Q4) |
| `js/state-lines.js` | Visualisation | C5 state and territory line chart (Q5) |
| `js/interactions.js` | Interaction | Reusable filter buttons (Week 6 pattern, with ARIA from Week 8) |
| `js/tooltip.js` | Interaction | Shared multi-line SVG tooltip |
| `js/direct-labels.js` | Visualisation | Moves direct labels apart; HTML colour key for phones |
| `js/accessibility.js` | Accessibility | SVG title and description, keyboard access to marks, screen reader announcements |
| `js/resize.js` | Accessibility | Resizes chart text with the window width |
| `data/` | Data | CSV files used by the website |
| `knime/` | Data | KNIME workflow `Group5_RoadCrashInjuries_DataProcessing.knwf` with the three BITRE workbooks and its CSV outputs |

## Accessibility features

Following the Week 8 Chart Accessibility lecture (Dufour & Meeks, 2024):

- Semantic page structure (`header`, `nav`, `main`, `section`, `footer`, one `h1`).
- Every SVG has `role="img"`, a `<title>` and a `<desc>` built from the data.
- Button sets are `role="group"` with an `aria-label`; buttons use `type="button"` and `aria-pressed`.
- Every data mark can be reached with Tab, the arrow keys move between marks, and focus shows the same tooltip as hover; a live region announces the tooltip text.
- Colour is never the only cue: direct labels, keys, annotations and hollow points.
- Page text is at least 16px and chart text at least 12px at a 360px window (measured 12.2px).
- Interaction cues in the introduction; visible focus outlines.

## Data

Bureau of Infrastructure and Transport Research Economics (BITRE), Hospitalised Injury Data: https://www.bitre.gov.au/publications/ongoing/hospitalised-injury

All data processing is done in the KNIME workflow `knime/Group5_RoadCrashInjuries_DataProcessing.knwf` (KNIME Analytics Platform 5.12, 88 nodes). The workbooks sit in the workflow data folder and are read relative to the workflow data area, so the workflow runs on any computer after import. The CSV Writers write to the workflow's `data/website/` folder, and those files are copied unchanged into `data/`. Never edit the files in `data/` by hand: change the workflow, execute it and copy the files again.

| File | Rows | Columns | Used by |
|---|---|---|---|
| `data/road-user-trend.csv` | 143 | `year`, `roadUser`, `hospitalisations` | Week 6 road user line chart (replaced by C2; kept as a KNIME output) |
| `data/c1_national_by_year.csv` | 11 | `year`, `hospitalisations`, `is_series_break` | C1 national trend |
| `data/c1b_national_by_month.csv` | 132 | `year`, `month_num`, `month`, `hospitalisations`, `date` | C1b monthly histogram |
| `data/c2_road_user_group_by_year.csv` | 55 | `year`, `road_user_group`, `group_order`, `hospitalisations`, `national_total`, `share_pct` | C2 stacked bar |
| `data/c3_road_user_severity_2016_2021.csv` | 12 | `road_user`, `road_user_group`, `group_order`, `hospitalisations`, `bed_days`, `cases`, `bed_days_per_case` | C3 scatter plot |
| `data/c4_age_sex.csv` | 14 | `age_group`, `sex`, `hospitalisations_2011_2021`, `bed_days_2016_2021`, `cases_2016_2021`, `bed_days_per_case_2016_2021`, `age_order` | C4 grouped bar |
| `data/c5_state_by_year.csv` | 88 | `year`, `state`, `hospitalisations`, `bed_days`, `is_series_break`, `state_name` | C5 state trend |
| `data/c5b_first_nations_by_year.csv` | 11 | `year`, `first_nations`, `non_indigenous`, `national_total`, `status_not_stated`, `first_nations_share_pct` | Q5 text |

The page reads the C1 to C5 files; the First Nations file is used for the numbers in the Q5 text. `is_series_break` holds the text `true` or `false`.

KNIME nodes for `road-user-trend.csv` (all branches start from the cleaned national trunk, nodes 1 to 23):

1. #1 Excel Reader: national workbook, sheet `raw`, columns A to M (117,919 rows).
2. #80 Duplicate Row Filter (0 rows removed), #7 Column Filter, #8 Missing Value (empty `Died_cases` = 0), #9 Column Renamer (lower-case names).
3. #17 Row Filter: `cause` = `Traffic` (86,140 rows, 410,884 hospitalisations), then #18 to #23 derive the columns the other charts need.
4. #81 Rule Engine: replace `road_user` with `All road users`; #82 GroupBy `year`, `road_user`, sum of `hospitalisations` (11 rows).
5. #83 GroupBy `year`, `road_user`, sum of `hospitalisations` (132 rows); #84 Sorter by `road_user`, then `year`.
6. #85 Concatenate (#82 on top), #86 Column Renamer `road_user` -> `roadUser`, #87 CSV Writer `website/road-user-trend.csv`.
7. #88 GroupBy control total: 821,768 (2 x 410,884).

The output has 143 rows (13 groups x 11 years), and the `All road users` totals equal Table 1 of the workbook (34,033 in 2011 and 39,505 in 2021). The national, state and First Nations totals are also joined back to their published T1 tables in the workflow, and every difference is 0.

`Hospitalisations` is used instead of `Count of cases` because it matches the published BITRE tables. Deaths within 30 days are only recorded until June 2020.

## Workflow

- One feature branch per task; never commit directly to `main`.
- Merge through pull requests reviewed by a teammate.
- Pull often and avoid editing the same files at the same time.

## Run locally

Open the folder with a local web server (for example VS Code Live Server, or `npx http-server`), because D3 cannot load CSV files from `file://`.

## Hosting

The website is hosted on GitHub Pages and deployed from `main`: https://buidangminh23.github.io/cos30045-road-crash-injuries/

## Generative AI use

Claude Opus 5.5 (Anthropic) was used to write the week 6 version of the website: the file structure, the line chart, the filter buttons, the tooltip and the page text. Generated code is marked with a comment in each JavaScript file, and the commits that contain it say so. The KNIME workflow in `knime/` was also built and executed with Claude Opus 5.5 (Anthropic) from the team's node-by-node build guide, and its node results and CSV files were checked against an independent Python version of the same steps. The team must be able to explain every part of the code in the face-to-face interviews.

On 3 November 2026 Claude Opus 5.5 also wrote the final version of the website (pull requests #5 to #12): the six charts C1 to C5, the shared tooltip, the filter buttons, the Week 8 accessibility features, the responsive text, and the page text of Q1 to Q5, the conclusion and About the data. It followed the chart designs in the team's Design Book (Tables 3.1 to 3.6) and was told to use only techniques taught in the unit. Every new file starts with a "Generated with GenAI" comment that names the unit exercise or lecture it follows, and every commit body says "Largely generated with GenAI (Claude Opus 5.5)". The numbers in the page text were checked against the CSV files before they were written.

### Summary of prompts

Prompts were written in Vietnamese; English translations:

1. Week 6 (20 October 2026): build one feature for this week only, using only knowledge from weeks 1 to 6: a road user trend line chart with filter buttons and a tooltip.
2. KNIME (27 October 2026): build the complete KNIME workflow from the team's build guide, so the data can be used on the website.
3. Final website (3 November 2026): "Complete the Project Design Book and Website in full, using only the unit's knowledge and nothing more advanced." The team then chose to build every chart now, with one pull request per chart.
