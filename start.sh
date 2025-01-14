#!/bin/bash

# Start the backend server
echo "Starting backend server..."
cd backend
npm install
node server.js &

# Start the React frontend
echo "Starting React frontend..."
cd ..
npm install
npm run dev

# Wait for all background processes to finish
wait