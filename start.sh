#!/bin/bash

echo "============================================"
echo "  🌍 AI Climate Pattern Forecaster"
echo "  Professional Climate Intelligence Platform"
echo "============================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Kill processes on ports 4000 and 3000
echo -e "${YELLOW}Cleaning up ports...${NC}"
for PORT in 4000 3000; do
  PID=$(lsof -ti :$PORT 2>/dev/null)
  if [ -n "$PID" ]; then
    echo -e "  Killing process on port $PORT (PID: $PID)"
    kill -9 $PID 2>/dev/null
    sleep 1
  fi
done
echo -e "${GREEN}Ports cleaned.${NC}"
echo ""

# Check PostgreSQL
echo -e "${BLUE}Checking PostgreSQL...${NC}"
if ! pg_isready -q 2>/dev/null; then
  echo -e "${YELLOW}Starting PostgreSQL via Homebrew...${NC}"
  brew services start postgresql@14 2>/dev/null || brew services start postgresql 2>/dev/null
  sleep 3
fi

if pg_isready -q 2>/dev/null; then
  echo -e "${GREEN}PostgreSQL is running.${NC}"
else
  echo -e "${RED}PostgreSQL is not running! Please start it manually.${NC}"
  exit 1
fi
echo ""

# Install dependencies
echo -e "${BLUE}Installing server dependencies...${NC}"
npm install --silent 2>&1 | tail -1
echo -e "${GREEN}Server dependencies installed.${NC}"

echo -e "${BLUE}Installing client dependencies...${NC}"
cd client && npm install --silent 2>&1 | tail -1 && cd ..
echo -e "${GREEN}Client dependencies installed.${NC}"
echo ""

# Setup database
echo -e "${BLUE}Setting up database...${NC}"
node server/setupDb.js
echo ""

# Seed data
echo -e "${BLUE}Seeding database with climate data...${NC}"
node server/seed.js
echo ""

echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}  Starting application with hot-reload...${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo -e "  Backend API:  ${BLUE}http://localhost:4000${NC}"
echo -e "  Frontend App: ${BLUE}http://localhost:3000${NC}"
echo ""
echo -e "  Login:  ${YELLOW}admin@climate.com / password123${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services.${NC}"
echo ""

# Start both with hot-reload (nodemon + vite HMR)
npm run dev
