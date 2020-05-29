export const FEATURES = {
  accessible: {
    title: 'Accessible',
    description:
      'Has focused on features to make the interface less challenging for those with disabilities.',
  },
  copyPaste: {
    title: 'Copy and Paste',
    description: 'Supports copy and paste, preferably to the system clipboard.',
  },
  csvExport: {
    title: 'CSV Export',
    description:
      'The library lets you download a CSV of the table contents without third-party libraries.',
  },
  customEditors: {
    title: 'Custom Editors',
    description:
      'The library lets you create your own dynamic cell value editor widgets.',
  },
  customFormatters: {
    title: 'Custom Formatters',
    description: 'The library lets you create formatters ',
  },
  draggableRows: {
    title: 'Draggable Rows',
    description: 'Allows rows to be reordered by dragging them',
  },
  editable: {
    title: 'Editable Cells',
    description: 'Cell values can be changed to update data in memory.',
  },
  fillDown: {
    title: 'Fill Down',
    description:
      'A drag handle or keyboard shortcut can be used to copy a value or formula to cells below the selected cell.',
  },
  fillRight: {
    title: 'Fill Right',
    description:
      'A drag handle or keyboard shortcut can be used to copy a value or formula to cells to the right of the selected cell.',
  },
  filtering: {
    title: 'Filtering',
    description:
      'The library or interface has provisions for only showing rows that meet certain criteria.',
  },
  formulas: {
    title: 'Formula Support',
    description:
      'The library has built-in support for deriving cell values from other cells.',
  },
  freezableCols: {
    title: 'Freezable Columns',
    description:
      'The library lets you make columns persist on one or both sides of the grid.',
  },
  headless: {
    title: 'Headless',
    description:
      'There is no user interface provided by default -- this library is logic-only.',
  },
  pagination: {
    title: 'Pagination',
    description:
      'Supports a widget to navigate through pages of rows as opposed to scrolling.',
  },
  pivots: {
    title: 'Pivot Tables',
    description: 'Has support for pivot tables',
  },
  rangeSelection: {
    title: 'Range Selection',
    description: 'An arbitrary block of cells can be selected.',
  },
  resizableCols: {
    title: 'Resizable Columns',
    description: 'The user interface lets you resize columns by dragging.',
  },
  responsive: {
    title: 'Responsive',
    description: 'Works well on tablet and mobile devices.',
  },
  rowSelection: {
    title: 'Row Selection',
    description: 'Entire rows can be selected.',
  },
  serverSide: {
    title: 'Server-Side',
    description:
      'Has the ability to use external data sources to fetch, filter, and sort data.',
  },
  sorting: {
    title: 'Sorting',
    description:
      'The library or interface has provisions for ordering rows given certain criteria.',
  },
  trees: {
    title: 'Tree Data',
    description: 'Has support for hierarchical data',
  },
  xlsxExport: {
    title: 'XLSX Export',
    description:
      'The library lets you download an Excel workbook without third-party libraries.',
  },
  virtualization: {
    title: 'Virtualization',
    description:
      'Uses a technique to greatly reduce DOM elements and increase performance.',
  },
}

export type FeatureName = keyof typeof FEATURES
