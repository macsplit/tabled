/**
 * Parse various tabular text formats into a 2D array
 * Browser-compatible ES module version
 */

/**
 * Detect the format of the input text
 * @param {string} text - Input text
 * @returns {string} - Format type: 'markdown', 'csv', 'tsv', 'sql', 'unknown'
 */
function detectFormat(text) {
  const lines = text.trim().split('\n').filter(line => line.trim());
  if (lines.length === 0) return 'unknown';

  // Check for markdown table (pipes at start/end of lines)
  const markdownPattern = /^\s*\|.*\|\s*$/;
  const markdownLines = lines.filter(line => markdownPattern.test(line));
  if (markdownLines.length > lines.length * 0.5) {
    return 'markdown';
  }

  // Check for SQL dump table borders (ASCII art tables)
  const sqlBorderPattern = /^\+[-+]+\+$/;
  const sqlDataPattern = /^\|.*\|$/;
  const hasSqlBorders = lines.some(line => sqlBorderPattern.test(line));
  const hasSqlData = lines.some(line => sqlDataPattern.test(line));
  if (hasSqlBorders || (hasSqlData && text.includes('|'))) {
    return 'sql';
  }

  // Check for TSV (tabs in most lines)
  const tsvLines = lines.filter(line => line.includes('\t'));
  if (tsvLines.length > lines.length * 0.7) {
    return 'tsv';
  }

  // Default to CSV
  return 'csv';
}

/**
 * Parse markdown table
 * @param {string} text - Markdown table text
 * @returns {Array<Array<string>>} - 2D array
 */
function parseMarkdown(text) {
  const lines = text.trim().split('\n')
    .map(line => line.trim())
    .filter(line => line.startsWith('|') && line.endsWith('|'));

  if (lines.length === 0) return [];

  const result = [];
  for (let line of lines) {
    // Skip separator lines (|---|---|)
    if (/^\|[\s-|]+\|$/.test(line) && line.includes('-')) {
      continue;
    }

    // Split by | and clean up
    const cells = line
      .split('|')
      .slice(1, -1) // Remove first and last empty elements
      .map(cell => cell.trim());

    if (cells.length > 0) {
      result.push(cells);
    }
  }

  return result;
}

/**
 * Parse CSV text
 * @param {string} text - CSV text
 * @returns {Array<Array<string>>} - 2D array
 */
function parseCSV(text) {
  const lines = text.trim().split('\n').filter(line => line.trim());
  if (lines.length === 0) return [];

  const result = [];
  for (let line of lines) {
    // Simple CSV parser (doesn't handle quoted commas)
    const cells = line.split(',').map(cell => cell.trim().replace(/^["']|["']$/g, ''));
    result.push(cells);
  }

  return result;
}

/**
 * Parse TSV (Tab-separated values)
 * @param {string} text - TSV text
 * @returns {Array<Array<string>>} - 2D array
 */
function parseTSV(text) {
  const lines = text.trim().split('\n').filter(line => line.trim());
  if (lines.length === 0) return [];

  const result = [];
  for (let line of lines) {
    const cells = line.split('\t').map(cell => cell.trim());
    result.push(cells);
  }

  return result;
}

/**
 * Parse SQL dump table output (ASCII art tables)
 * @param {string} text - SQL table text
 * @returns {Array<Array<string>>} - 2D array
 */
function parseSQL(text) {
  const lines = text.trim().split('\n');
  if (lines.length === 0) return [];

  const result = [];
  const borderPattern = /^\+[-+]+\+$/;

  for (let line of lines) {
    line = line.trim();

    // Skip border lines
    if (borderPattern.test(line)) {
      continue;
    }

    // Parse data lines
    if (line.startsWith('|') && line.endsWith('|')) {
      const cells = line
        .split('|')
        .slice(1, -1) // Remove first and last empty elements
        .map(cell => cell.trim());

      if (cells.length > 0) {
        result.push(cells);
      }
    }
  }

  return result;
}

/**
 * Main parse function that detects format and parses accordingly
 * @param {string} text - Input text
 * @returns {Array<Array<string>>} - 2D array
 */
export function parse(text) {
  if (!text || !text.trim()) {
    return [];
  }

  const format = detectFormat(text);

  switch (format) {
    case 'markdown':
      return parseMarkdown(text);
    case 'csv':
      return parseCSV(text);
    case 'tsv':
      return parseTSV(text);
    case 'sql':
      return parseSQL(text);
    default:
      // Try CSV as fallback
      return parseCSV(text);
  }
}

export { detectFormat, parseMarkdown, parseCSV, parseTSV, parseSQL };
