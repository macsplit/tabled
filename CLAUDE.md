# Tabled - Development Documentation

## Project Overview

Tabled is a Node.js application that parses various tabular text formats and outputs beautifully formatted markdown tables that look great in both plain text and rendered form. It provides both a command-line interface (stdio) and a REST API for integration into web services.

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

#### 3. `src/index.js` - CLI Application

Command-line entry point that orchestrates the pipeline:
1. Read from stdin
2. Parse input using detected format
3. Format as markdown table(s)
4. Output to stdout

#### 4. `src/server.js` - REST API Server

HTTP server providing REST API access to the same parsing and formatting logic:

- **Framework**: Express.js for HTTP handling
- **Rate Limiting**: express-rate-limit middleware (100 requests per 15 minutes per IP)
- **Endpoints**:
  - `POST /format`: Main formatting endpoint
    - Accepts plain text or JSON (`data` or `text` fields)
    - Supports `maxWidth` query parameter
    - Returns formatted markdown table as plain text
  - `GET /health`: Health check endpoint
- **Configuration**: Port via `PORT` environment variable (default: 3000)
- **Shared Logic**: Uses same `parsers.js` and `formatter.js` modules as CLI

### Design Decisions

#### Separation of Concerns

The application is architected with clear separation between interface and logic:

- **Interface Layer**: `src/index.js` (CLI) and `src/server.js` (REST API)
  - Handle input/output for their respective interfaces
  - No duplication of business logic
- **Logic Layer**: `src/parsers.js` and `src/formatter.js`
  - Pure functions handling parsing and formatting
  - Interface-agnostic - work with both CLI and API
  - Easy to test in isolation

This architecture allows adding new interfaces (GraphQL, gRPC, etc.) without duplicating parsing/formatting logic.

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

**Important**: When checking uniqueness, empty and whitespace-only values are ignored. Only actual values are compared. This allows sparse first columns to still be treated as keys if their non-empty values are unique.

#### Empty Column Filtering

Columns that contain only empty or whitespace values across all rows are automatically filtered out before formatting. This produces cleaner output when dealing with sparse data or CSV files with trailing delimiters.

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
- Empty column filtering
- Key column detection with sparse data

### CLI Testing

Run tests manually:
```bash
node src/index.js < test/sample-csv.txt
node src/index.js < test/sample-wide.txt
node src/index.js < test/sample-empty-cols.txt
```

### API Testing

Start the server:
```bash
npm run server
```

Test endpoints:
```bash
# Health check
curl http://localhost:3000/health

# Format CSV data
curl -X POST http://localhost:3000/format \
  -H "Content-Type: text/plain" \
  --data-binary @test/sample-csv.txt

# Format with custom width
curl -X POST "http://localhost:3000/format?maxWidth=80" \
  -H "Content-Type: text/plain" \
  --data-binary @test/sample-wide.txt
```

## Implemented Features

1. ✅ **REST API**: HTTP server with rate limiting
2. ✅ **Configurable width (API)**: maxWidth parameter for API requests
3. ✅ **Empty column filtering**: Automatic removal of empty/whitespace columns

## Future Enhancements

Potential improvements:

1. **Configurable width (CLI)**: Make max table width a command-line parameter for CLI
2. **Advanced CSV parsing**: Handle quoted commas and escaped characters properly
3. **More format support**: Excel, JSON, etc.
4. **Output format options**: Support other formats beyond markdown (HTML, ASCII, etc.)
5. **Column selection**: Allow users to choose which columns to display
6. **Sorting and filtering**: Add data manipulation capabilities
7. **Authentication**: Add API key authentication for production deployments
8. **Batch processing**: Support multiple tables in a single API request

## Development Guidelines

- Commit after every significant iteration
- Keep commits granular for easy rollback
- Test with multiple input formats before committing
- Document any new heuristics or algorithms

## Deploying Browser Updates to GitHub Pages

The browser version is hosted at https://macsplit.github.io/tabled/docs/ via a git submodule in the macsplit.github.io repository.

**Important**: After pushing changes to the tabled repository, you must update the submodule reference in macsplit.github.io:

```bash
# Navigate to the parent GitHub Pages repository
cd ../macsplit.github.io

# Update the submodule to point to the latest commit
git submodule update --remote tabled

# Commit and push the submodule update
git add tabled
git commit -m "Update tabled submodule to latest version"
git push origin main
```

Without this step, the GitHub Pages site will continue to show the old version even though the tabled repository has been updated. The submodule acts as a pointer to a specific commit, so it must be manually advanced after each update.

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
