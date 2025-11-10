# Tabled - Development Documentation

## Project Overview

Tabled is a Node.js command-line application that parses various tabular text formats and outputs beautifully formatted markdown tables that look great in both plain text and rendered form.

## Architecture

### Core Modules

#### 1. `src/parsers.js` - Input Format Detection & Parsing

Handles automatic detection and parsing of multiple tabular formats:

- **Format Detection**: Uses heuristics to identify the input format
  - Markdown: Lines with pipes at start/end (`| ... |`)
  - SQL Dump: ASCII art tables with `+--+` borders
  - TSV: Lines containing tab characters
  - CSV: Default fallback for comma-separated values

- **Parsing Functions**: Each format has a dedicated parser that converts text to a 2D array

#### 2. `src/formatter.js` - Markdown Table Formatting

Handles the complex logic of formatting tables with width constraints:

- **Column Width Calculation**: Determines optimal width for each column based on content
- **Width Management**: Ensures tables fit within 100 character limit
- **Table Splitting**: Intelligently splits wide tables across multiple tables
- **Key Column Detection**: Identifies if first column contains unique values and repeats it in split tables
- **Alignment**: Pads cells with spaces so pipes align vertically in plain text

#### 3. `src/index.js` - Main Application

Entry point that orchestrates the pipeline:
1. Read from stdin
2. Parse input using detected format
3. Format as markdown table(s)
4. Output to stdout

### Design Decisions

#### Width Management

When a table exceeds 100 characters, the formatter:

1. **First attempt**: Try to fit by proportionally reducing column widths
   - Respects minimum column width of 3 characters
   - Only attempts if the table doesn't have too many columns (≤10)

2. **Split strategy**: If squeezing won't work:
   - Splits columns into groups that fit within the width limit
   - Repeats the first column if it contains unique values (key column)
   - Creates multiple tables separated by blank lines

#### Key Column Heuristic

If the first column has unique values across all rows, it's treated as a key column and repeated in each split table. This provides context when viewing split tables.

#### Formatting Rules

- No colons for alignment (standard markdown alignment syntax)
- Pipes and hyphens only (`|`, `-`)
- Spaces for padding to ensure vertical alignment
- Format: `| value | value |` with spaces around content
- Separator: `|-------|-------|` with hyphens matching column width + 2

## Testing

Test files in `test/` directory cover:
- CSV parsing
- TSV parsing
- Markdown table parsing
- SQL dump parsing
- Wide table splitting

Run tests manually:
```bash
node src/index.js < test/sample-csv.txt
node src/index.js < test/sample-wide.txt
```

## Future Enhancements

Potential improvements mentioned in the spec:

1. **Configurable width**: Make max table width a command-line parameter
2. **REST API**: Extend beyond stdio to accept HTTP requests
3. **Advanced CSV parsing**: Handle quoted commas and escaped characters
4. **More format support**: Excel, JSON, etc.
5. **Output format options**: Support other formats beyond markdown
6. **Column selection**: Allow users to choose which columns to display
7. **Sorting and filtering**: Add data manipulation capabilities

## Development Guidelines

- Commit after every significant iteration
- Keep commits granular for easy rollback
- Test with multiple input formats before committing
- Document any new heuristics or algorithms

## Code Style

- Use clear, descriptive function names
- Add JSDoc comments for all exported functions
- Keep functions focused and single-purpose
- Use meaningful variable names
- Prefer readability over cleverness

## Constants

- `MAX_TABLE_WIDTH`: 100 characters (hardcoded, will be configurable)
- `MIN_COLUMN_WIDTH`: 3 characters (minimum before splitting)
- `MAX_COLUMNS_BEFORE_SPLIT`: 10 columns (threshold for splitting)
