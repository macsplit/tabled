#!/usr/bin/env node

/**
 * Tabled - Parse and format tabular data as beautifully aligned markdown tables
 */

const { parse } = require('./parsers');
const { format } = require('./formatter');

/**
 * Read all data from stdin
 * @returns {Promise<string>} - Input text
 */
function readStdin() {
  return new Promise((resolve, reject) => {
    let data = '';

    process.stdin.setEncoding('utf8');

    process.stdin.on('data', chunk => {
      data += chunk;
    });

    process.stdin.on('end', () => {
      resolve(data);
    });

    process.stdin.on('error', err => {
      reject(err);
    });

    // Handle case where stdin is empty
    process.stdin.resume();
  });
}

/**
 * Main function
 */
async function main() {
  try {
    // Read input from stdin
    const input = await readStdin();

    if (!input.trim()) {
      console.error('Error: No input provided');
      process.exit(1);
    }

    // Parse input to 2D array
    const data = parse(input);

    if (!data || data.length === 0) {
      console.error('Error: Could not parse input data');
      process.exit(1);
    }

    // Format as markdown table(s)
    const output = format(data);

    // Output result
    console.log(output);

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { main };
