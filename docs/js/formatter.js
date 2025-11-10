/**
 * Format 2D array as markdown tables with width constraints
 * Browser-compatible ES module version
 */

const MAX_TABLE_WIDTH = 100;
const MIN_COLUMN_WIDTH = 3;
const MAX_COLUMNS_BEFORE_SPLIT = 10;

/**
 * Calculate the maximum width needed for each column
 * @param {Array<Array<string>>} data - 2D array
 * @returns {Array<number>} - Array of column widths
 */
function calculateColumnWidths(data) {
  if (!data || data.length === 0) return [];

  const numCols = Math.max(...data.map(row => row.length));
  const widths = new Array(numCols).fill(0);

  for (let row of data) {
    for (let colIdx = 0; colIdx < row.length; colIdx++) {
      const cellValue = String(row[colIdx] || '');
      widths[colIdx] = Math.max(widths[colIdx], cellValue.length);
    }
  }

  return widths;
}

/**
 * Calculate total table width including markdown formatting
 * @param {Array<number>} colWidths - Column widths
 * @returns {number} - Total width
 */
function calculateTableWidth(colWidths) {
  // Format: | col1 | col2 | ... |
  // Each column: " value " (width + 2 spaces)
  // Plus pipes: numCols + 1
  return colWidths.reduce((sum, w) => sum + w, 0) + (colWidths.length * 3) + 1;
}

/**
 * Identify which columns have at least one non-empty value
 * @param {Array<Array<string>>} data - 2D array
 * @returns {Array<number>} - Array of column indices that are non-empty
 */
function identifyNonEmptyColumns(data) {
  if (!data || data.length === 0) return [];

  const numCols = Math.max(...data.map(row => row.length));
  const nonEmptyColumns = [];

  for (let colIdx = 0; colIdx < numCols; colIdx++) {
    let hasValue = false;

    for (let row of data) {
      const value = String(row[colIdx] || '').trim();
      if (value !== '') {
        hasValue = true;
        break;
      }
    }

    if (hasValue) {
      nonEmptyColumns.push(colIdx);
    }
  }

  return nonEmptyColumns;
}

/**
 * Check if first column has unique values (potential key column)
 * Ignores empty/whitespace values when checking uniqueness
 * @param {Array<Array<string>>} data - 2D array
 * @returns {boolean} - True if first column has unique non-empty values
 */
function hasUniqueFirstColumn(data) {
  if (!data || data.length === 0) return false;

  const firstColValues = new Set();
  for (let row of data) {
    const value = String(row[0] || '').trim();

    // Skip empty/whitespace values
    if (value === '') {
      continue;
    }

    // Check if we've seen this non-empty value before
    if (firstColValues.has(value)) {
      return false;
    }
    firstColValues.add(value);
  }

  return true;
}

/**
 * Format a single row with given column widths
 * @param {Array<string>} row - Row data
 * @param {Array<number>} colWidths - Column widths
 * @returns {string} - Formatted row
 */
function formatRow(row, colWidths) {
  const cells = row.map((cell, idx) => {
    const value = String(cell || '');
    const width = colWidths[idx];
    return ' ' + value.padEnd(width, ' ') + ' ';
  });

  return '|' + cells.join('|') + '|';
}

/**
 * Format a separator row
 * @param {Array<number>} colWidths - Column widths
 * @returns {string} - Separator row
 */
function formatSeparator(colWidths) {
  const cells = colWidths.map(width => {
    return '-'.repeat(width + 2);
  });

  return '|' + cells.join('|') + '|';
}

/**
 * Format data as a single markdown table
 * @param {Array<Array<string>>} data - 2D array (includes header row)
 * @param {Array<number>} colIndices - Which columns to include
 * @returns {string} - Formatted markdown table
 */
function formatSingleTable(data, colIndices) {
  if (!data || data.length === 0) return '';

  // Extract only the specified columns
  const tableData = data.map(row =>
    colIndices.map(idx => row[idx] || '')
  );

  // Calculate widths for this subset
  const colWidths = calculateColumnWidths(tableData);

  // Format header
  const lines = [];
  lines.push(formatRow(tableData[0], colWidths));
  lines.push(formatSeparator(colWidths));

  // Format data rows
  for (let i = 1; i < tableData.length; i++) {
    lines.push(formatRow(tableData[i], colWidths));
  }

  return lines.join('\n');
}

/**
 * Split columns into groups that fit within width constraint
 * @param {Array<number>} colWidths - All column widths
 * @param {number} maxWidth - Maximum table width
 * @param {boolean} repeatFirstCol - Whether to repeat first column
 * @returns {Array<Array<number>>} - Groups of column indices
 */
function splitColumnsIntoGroups(colWidths, maxWidth, repeatFirstCol) {
  const groups = [];
  let currentGroup = [];

  for (let i = 0; i < colWidths.length; i++) {
    // First column always starts the first group
    if (i === 0) {
      currentGroup.push(0);
      continue;
    }

    // Calculate width if we add this column
    const testGroup = repeatFirstCol && currentGroup.length > 1
      ? [0, ...currentGroup.slice(1), i]  // Include first col if repeating
      : [...currentGroup, i];

    const testWidths = testGroup.map(idx => colWidths[idx]);
    const testWidth = calculateTableWidth(testWidths);

    if (testWidth <= maxWidth) {
      // Fits in current group
      currentGroup.push(i);
    } else {
      // Start new group
      if (currentGroup.length > 0) {
        groups.push([...currentGroup]);
      }

      // New group starts with first column (if repeating) plus current column
      currentGroup = repeatFirstCol ? [0, i] : [i];
    }
  }

  // Add last group
  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }

  return groups;
}

/**
 * Main format function
 * @param {Array<Array<string>>} data - 2D array (first row is header)
 * @param {number} maxWidth - Maximum table width (default: 100)
 * @returns {string} - Formatted markdown table(s)
 */
export function format(data, maxWidth = MAX_TABLE_WIDTH) {
  if (!data || data.length === 0) {
    return '';
  }

  // Ensure all rows have the same length
  const numCols = Math.max(...data.map(row => row.length));
  const normalizedData = data.map(row => {
    const newRow = [...row];
    while (newRow.length < numCols) {
      newRow.push('');
    }
    return newRow;
  });

  // Filter out empty columns
  const nonEmptyColIndices = identifyNonEmptyColumns(normalizedData);

  // If all columns are empty, return empty string
  if (nonEmptyColIndices.length === 0) {
    return '';
  }

  // Filter data to only include non-empty columns
  const filteredData = normalizedData.map(row =>
    nonEmptyColIndices.map(idx => row[idx])
  );

  // Calculate column widths
  const colWidths = calculateColumnWidths(filteredData);
  const totalWidth = calculateTableWidth(colWidths);

  // If everything fits, format as single table
  const filteredNumCols = filteredData[0].length;
  if (totalWidth <= maxWidth) {
    const colIndices = Array.from({ length: filteredNumCols }, (_, i) => i);
    return formatSingleTable(filteredData, colIndices);
  }

  // Check if we should use first column as key
  const hasKeyColumn = hasUniqueFirstColumn(filteredData);

  // Check if we should split or try to squeeze
  const avgColWidth = colWidths.reduce((a, b) => a + b, 0) / colWidths.length;
  const shouldSplit = filteredNumCols > MAX_COLUMNS_BEFORE_SPLIT ||
                       avgColWidth < MIN_COLUMN_WIDTH * 2;

  if (!shouldSplit) {
    // Try to squeeze into one table by reducing column widths proportionally
    const overhead = (filteredNumCols * 3) + 1; // Pipes and spaces
    const availableWidth = maxWidth - overhead;

    if (availableWidth > filteredNumCols * MIN_COLUMN_WIDTH) {
      // Scale down column widths proportionally
      const totalContentWidth = colWidths.reduce((a, b) => a + b, 0);
      const scale = availableWidth / totalContentWidth;

      const adjustedWidths = colWidths.map(w => {
        const scaled = Math.floor(w * scale);
        return Math.max(scaled, MIN_COLUMN_WIDTH);
      });

      // Adjust if we're still over (due to rounding and min width)
      const adjustedTotal = adjustedWidths.reduce((a, b) => a + b, 0);
      if (adjustedTotal > availableWidth) {
        // Trim from largest columns first
        let excess = adjustedTotal - availableWidth;
        const sorted = adjustedWidths
          .map((w, i) => ({ width: w, index: i }))
          .sort((a, b) => b.width - a.width);

        for (let item of sorted) {
          if (excess <= 0) break;
          const canRemove = Math.min(excess, item.width - MIN_COLUMN_WIDTH);
          adjustedWidths[item.index] -= canRemove;
          excess -= canRemove;
        }
      }

      // Truncate cell values to fit adjusted widths
      const truncatedData = filteredData.map(row =>
        row.map((cell, idx) => {
          const str = String(cell || '');
          if (str.length > adjustedWidths[idx]) {
            return str.substring(0, adjustedWidths[idx]);
          }
          return str;
        })
      );

      const colIndices = Array.from({ length: filteredNumCols }, (_, i) => i);
      return formatSingleTable(truncatedData, colIndices);
    }
  }

  // Split into multiple tables
  const groups = splitColumnsIntoGroups(colWidths, maxWidth, hasKeyColumn);

  const tables = groups.map(group => {
    return formatSingleTable(filteredData, group);
  });

  return tables.join('\n\n');
}

export {
  calculateColumnWidths,
  calculateTableWidth,
  identifyNonEmptyColumns,
  hasUniqueFirstColumn,
  formatRow,
  formatSeparator
};
