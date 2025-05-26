//
// All library features are defined here. "important" means we should highlight
// when a library _doesn't_ have this feature.
//

export const Features = {
  accessible: {
    title: "Accessible",
    abbreviation: "A11y",
    description:
      "Uses semantic markup or ARIA attributes to make the interface less challenging to use.",
    important: false,
  },
  copyPaste: {
    title: "Copy and Paste",
    abbreviation: "C&P",
    description: "Supports copy and paste, preferably to the system clipboard.",
    important: false,
  },
  csvExport: {
    title: "CSV Export",
    abbreviation: "CSV",
    description:
      "The library has built-in functionality which lets you download a CSV file.",
    important: false,
  },
  customEditors: {
    title: "Custom Editors",
    abbreviation: "Edit",
    description:
      "The library lets you create your own dynamic cell value editor widgets.",
    important: false,
  },
  customFormatters: {
    title: "Custom Formatters",
    abbreviation: "Fmt",
    description:
      "The library lets you customize how data is shown in each grid cell.",
    important: false,
  },
  draggableRows: {
    title: "Draggable Rows",
    abbreviation: "Drag",
    description: "Allows rows to be reordered by dragging.",
    important: false,
  },
  editable: {
    title: "Editable Cells",
    abbreviation: "Edit",
    description: "Cell values can be changed to update data in memory.",
    important: false,
  },
  fillDown: {
    title: "Fill Down",
    abbreviation: "FD",
    description:
      "A drag handle or keyboard shortcut can be used to copy a value or formula to cells below the selected cell.",
    important: false,
  },
  fillRight: {
    title: "Fill Right",
    abbreviation: "FR",
    description:
      "A drag handle or keyboard shortcut can be used to copy a value or formula to cells to the right of the selected cell.",
    important: false,
  },
  filtering: {
    title: "Filtering",
    abbreviation: "Filt",
    description:
      "The library or interface has provisions for only showing rows that meet certain criteria. (Different from searching.)",
    important: false,
  },
  formulas: {
    title: "Formula Support",
    abbreviation: "Form",
    description:
      "The library has built-in support for deriving cell values from other cells.",
    important: false,
  },
  freezableCols: {
    title: "Freezable Columns",
    abbreviation: "FC",
    description:
      "The library lets you make columns persist on one or both sides of the grid.",
    important: false,
  },
  headless: {
    title: "Headless",
    abbreviation: "HL",
    description:
      "There is no user interface provided by default; this library is logic-only.",
    important: false,
  },
  i18n: {
    title: "i18n",
    abbreviation: "i18n",
    description: "Has features for internationalization and localization.",
    important: false,
  },
  maintained: {
    title: "Maintained",
    abbreviation: "Mnt",
    description:
      "Whether this library is under active development, or has recently-fixed bugs, or is so wonderfully stable that it doesn't need maintenance.",
    important: true,
  },
  mergeCells: {
    title: "Merge Cells",
    abbreviation: "Merge",
    description: "Supports merging cells.",
    important: false,
  },
  openSource: {
    title: "Open-source",
    abbreviation: "OSS",
    description:
      "Whether the source for this library is hosting in an online version control system.",
    important: true,
  },
  pagination: {
    title: "Pagination",
    abbreviation: "Page",
    description:
      "Supports a widget to navigate through pages of rows as opposed to scrolling.",
    important: false,
  },
  pdfExport: {
    title: "PDF Export",
    abbreviation: "PDF",
    description:
      "The library has built-in functionality which lets you download a PDF.",
    important: false,
  },
  pivots: {
    title: "Pivot Tables",
    abbreviation: "Pvt",
    description: "Has support for pivot tables.",
    important: false,
  },
  rangeSelection: {
    title: "Range Selection",
    abbreviation: "Rng",
    description: "An arbitrary block of cells can be selected.",
    important: false,
  },
  resizableCols: {
    title: "Resizable Columns",
    abbreviation: "Rsz",
    description: "The user interface lets you resize columns by dragging.",
    important: false,
  },
  responsive: {
    title: "Responsive",
    abbreviation: "Resp",
    description: "Works well on tablet and mobile devices.",
    important: false,
  },
  rowGrouping: {
    title: "Row Grouping",
    abbreviation: "Grp",
    description:
      "Whether rows be grouped and preferably collapsed and expanded.",
    important: false,
  },
  rowSelection: {
    title: "Row Selection",
    abbreviation: "Sel",
    description: "Entire rows can be selected.",
    important: false,
  },
  search: {
    title: "Search",
    abbreviation: "Srch",
    description:
      "Lets users search cells and jump to their location, and maybe replace values, too. (Different from filtering.)",
    important: false,
  },
  serverSide: {
    title: "Server-Side",
    abbreviation: "SS",
    description:
      "Has the ability to use external data sources to fetch, filter, and sort data.",
    important: false,
  },
  sorting: {
    title: "Sorting",
    abbreviation: "Sort",
    description:
      "The library or interface has provisions for ordering rows given certain criteria.",
    important: false,
  },
  trees: {
    title: "Tree Data",
    abbreviation: "Tree",
    description: "Has support for hierarchical data.",
    important: false,
  },
  typescript: {
    title: "TypeScript",
    abbreviation: "TS",
    description:
      "The library provides TypeScript type definitions or is written in TypeScript.",
    important: true,
  },
  xlsxExport: {
    title: "XLSX Export",
    abbreviation: "XLSX",
    description:
      "The library has built-in functionality which lets you download an Excel workbook.",
    important: false,
  },
  virtualization: {
    title: "Virtualization",
    abbreviation: "Virt",
    description:
      "Uses a technique to greatly reduce DOM elements and increase performance.",
    important: false,
  },
} as const;

export type FeatureName = keyof typeof Features;

export const FeatureNames = Object.keys(Features) as FeatureName[];
FeatureNames.sort();
