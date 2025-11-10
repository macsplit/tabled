# Tabled

Parse and format tabular data as beautifully aligned markdown tables.

## Features

- **Multiple input formats**: Automatically detects and parses CSV, TSV, Markdown tables, and SQL dump output
- **Smart width management**: Fits tables within 100 characters (configurable)
- **Intelligent table splitting**: Splits wide tables across multiple tables when needed
- **Key column detection**: Repeats first column in split tables when it contains unique values
- **Beautiful formatting**: Pipes align vertically for easy reading in plain text
- **Dual interface**: Command-line (stdio) and REST API interfaces
- **Rate limiting**: Built-in API rate limiting for production use
- **Empty column filtering**: Automatically removes columns with only empty/whitespace values
- **Browser version**: Interactive web interface for formatting tables online

## Online Demo

Try it online: **[https://macsplit.github.io/tabled/docs/](https://macsplit.github.io/tabled/docs/)**

The browser version runs 100% client-side - no data is sent to any server. Perfect for formatting tables quickly without installing anything!

## Installation

```bash
npm install
```

## Usage

### Command Line Interface

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

### REST API

Start the HTTP server:

```bash
npm run server
```

The server listens on port 3000 by default (configurable via `PORT` environment variable):

```bash
PORT=8080 npm run server
```

#### API Endpoints

**POST /format** - Format tabular data as markdown table

Request formats:

1. Plain text body:
```bash
curl -X POST http://localhost:3000/format \
  -H "Content-Type: text/plain" \
  -d "Name,Age,City
John,25,NYC
Jane,30,LA"
```

2. JSON body with `data` field:
```bash
curl -X POST http://localhost:3000/format \
  -H "Content-Type: application/json" \
  -d '{"data": "Product\tPrice\nLaptop\t999.99\nMouse\t29.99"}'
```

3. JSON body with `text` field:
```bash
curl -X POST http://localhost:3000/format \
  -H "Content-Type: application/json" \
  -d '{"text": "ID,Name\n1,Alice\n2,Bob"}'
```

4. File input:
```bash
curl -X POST http://localhost:3000/format \
  -H "Content-Type: text/plain" \
  --data-binary @data.csv
```

Query parameters:
- `maxWidth` (optional): Maximum table width in characters (default: 100, minimum: 20)

```bash
curl -X POST "http://localhost:3000/format?maxWidth=80" \
  -H "Content-Type: text/plain" \
  --data-binary @data.csv
```

**GET /health** - Health check endpoint

```bash
curl http://localhost:3000/health
# Response: {"status":"ok","service":"tabled"}
```

#### Rate Limiting

The API implements rate limiting to prevent abuse:
- **Limit**: 100 requests per 15 minutes per IP address
- Rate limit information is returned in response headers
- Exceeding the limit returns HTTP 429 with error message

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

### CLI
The maximum table width is hardcoded to 100 characters in the CLI. Future versions will support command-line arguments for configuration.

### API
The REST API supports the `maxWidth` query parameter to configure table width per request (default: 100, minimum: 20).

### Environment Variables
- `PORT`: HTTP server port (default: 3000)

## Browser Version

The browser version provides a simple web interface for formatting tables without any installation. It uses the same parsing and formatting logic as the CLI and API versions.

### Features
- Paste any tabular data (CSV, TSV, Markdown, SQL dump)
- Click "Format Table" to convert to markdown
- Copy formatted output to clipboard
- 100% client-side - no data leaves your browser
- Responsive design works on mobile and desktop

### Running Locally
```bash
# Serve the docs folder with any static file server
cd docs
python3 -m http.server 8080
# Visit http://localhost:8080
```

## Project Structure

```
tabled/
├── src/
│   ├── index.js       # CLI entry point (stdio interface)
│   ├── server.js      # REST API server
│   ├── parsers.js     # Input format detection and parsing
│   └── formatter.js   # Markdown table formatting
├── docs/              # GitHub Pages / Browser version
│   ├── index.html     # Web interface
│   └── js/
│       ├── parsers.js # Browser-compatible parser (ES modules)
│       └── formatter.js # Browser-compatible formatter (ES modules)
├── test/
│   └── sample-*.txt   # Test data files
├── package.json
├── CLAUDE.md          # Development documentation
└── README.md
```

## License

MIT
