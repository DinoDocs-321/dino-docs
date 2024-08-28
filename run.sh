#!/bin/bash

# Start Docker Compose
sudo docker compose up &

# Wait for the frontend to be available
sleep 5

# Open the frontend in the default browser
xdg-open http://localhost:3000

# Optionally, you can open the backend too
# xdg-open http://localhost:8000
