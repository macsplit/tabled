# Tabled

Parse and format tabular data as beautifully aligned markdown tables.

## Features

- **Multiple input formats**: Automatically detects and parses CSV, TSV, Markdown tables, and SQL dump output
- **Smart width management**: Fits tables within 100 characters (configurable)
- **Intelligent table splitting**: Splits wide tables across multiple tables when needed
- **Key column detection**: Repeats first column in split tables when it contains unique values
- **Beautiful formatting**: Pipes align vertically for easy reading in plain text

## Installation

```bash
npm install
```

## Usage

### Command Line

Pipe any tabular data into tabled:

```bash
# CSV input
cat data.csv | node src/index.js

# TSV input
cat data.tsv | node src/index.js

# Markdown table
cat table.md | node src/index.js

# SQL dump output
mysql -e "SELECT * FROM users" | node src/index.js
```

Or use input redirection:

```bash
node src/index.js < data.csv
```

### Making it globally available

```bash
npm link
tabled < data.csv
```

## Examples

### CSV Input

```csv
Name,Age,City,Country
John Smith,32,New York,USA
Jane Doe,28,London,UK
```

### Output

```
| Name       | Age | City     | Country |
|------------|-----|----------|---------|
| John Smith | 32  | New York | USA     |
| Jane Doe   | 28  | London   | UK      |
```

### Wide Tables

When tables exceed 100 characters, they're automatically split:

```
| ID | Name       | Email            | Phone    |
|----|------------|------------------|----------|
| 1  | John Smith | john@example.com | 555-0101 |
| 2  | Jane Doe   | jane@example.com | 555-0102 |

| ID | City     | State | Country |
|----|----------|-------|---------|
| 1  | New York | NY    | USA     |
| 2  | Boston   | MA    | USA     |
```

Note: The ID column is repeated because it contains unique values (detected as a key column).

## Format Detection

Tabled automatically detects the input format using heuristics:

- **Markdown**: Lines starting and ending with `|`
- **SQL dump**: Lines with `+---+` borders or `|` delimiters
- **TSV**: Lines containing tab characters
- **CSV**: Default fallback, comma-separated values

## Configuration

Currently, the maximum table width is hardcoded to 100 characters. Future versions will support configurable width and other formatting options.

## Project Structure

```
tabled/
├── src/
│   ├── index.js       # Main entry point
│   ├── parsers.js     # Input format detection and parsing
│   └── formatter.js   # Markdown table formatting
├── test/
│   └── sample-*.txt   # Test data files
├── package.json
└── README.md
```

## License

MIT
