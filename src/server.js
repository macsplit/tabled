#!/usr/bin/env node

/**
 * Tabled REST API Server
 *
 * Provides an HTTP interface for the tabled formatter
 * Uses the same parsing and formatting logic as the CLI
 */

const express = require('express');
const rateLimit = require('express-rate-limit');
const { parse } = require('./parsers');
const { format } = require('./formatter');

const app = express();
const PORT = process.env.PORT || 3000;

// Configure rate limiting
// Limit: 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    error: 'Too many requests',
    message: 'You have exceeded the rate limit. Please try again later.'
  }
});

// Apply rate limiting to all requests
app.use(limiter);

// Parse JSON and text bodies
app.use(express.json());
app.use(express.text({ type: 'text/*' }));
app.use(express.raw({ type: 'text/*' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'tabled' });
});

// Main formatting endpoint
app.post('/format', (req, res) => {
  try {
    // Get input from request body
    let input;

    if (typeof req.body === 'string') {
      // Plain text body
      input = req.body;
    } else if (req.body && typeof req.body.data === 'string') {
      // JSON body with 'data' field
      input = req.body.data;
    } else if (req.body && typeof req.body.text === 'string') {
      // JSON body with 'text' field
      input = req.body.text;
    } else {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Request body must be plain text or JSON with "data" or "text" field'
      });
    }

    if (!input || !input.trim()) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Input data cannot be empty'
      });
    }

    // Parse input to 2D array
    const data = parse(input);

    if (!data || data.length === 0) {
      return res.status(400).json({
        error: 'Parse error',
        message: 'Could not parse input data as a table'
      });
    }

    // Get optional maxWidth parameter
    const maxWidth = req.query.maxWidth ? parseInt(req.query.maxWidth, 10) : undefined;

    if (maxWidth !== undefined && (isNaN(maxWidth) || maxWidth < 20)) {
      return res.status(400).json({
        error: 'Invalid parameter',
        message: 'maxWidth must be a number >= 20'
      });
    }

    // Format as markdown table(s)
    const output = format(data, maxWidth);

    // Return formatted table
    res.set('Content-Type', 'text/plain');
    res.send(output);

  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Endpoint ${req.method} ${req.path} not found`,
    availableEndpoints: {
      'GET /health': 'Health check',
      'POST /format': 'Format tabular data as markdown table'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Tabled API server listening on port ${PORT}`);
  console.log(`Available endpoints:`);
  console.log(`  GET  http://localhost:${PORT}/health`);
  console.log(`  POST http://localhost:${PORT}/format`);
  console.log(`\nRate limit: 100 requests per 15 minutes per IP`);
});

module.exports = app;
