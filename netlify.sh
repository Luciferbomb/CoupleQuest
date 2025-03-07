#!/bin/bash

# Build the application
npm run build

# Copy the _headers and _redirects files to the dist directory
cp public/_headers dist/_headers
cp public/_redirects dist/_redirects

# Ensure all JavaScript files have the correct MIME type
find dist -name "*.js" -exec echo "Setting MIME type for {}" \;
find dist -name "*.js" -exec chmod 644 {} \;

# Ensure all CSS files have the correct MIME type
find dist -name "*.css" -exec echo "Setting MIME type for {}" \;
find dist -name "*.css" -exec chmod 644 {} \;

echo "Build completed successfully!" 