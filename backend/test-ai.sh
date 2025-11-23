#!/bin/bash

BASE_URL="http://localhost:8000"
EMAIL="testuser@example.com"
PASSWORD="testpassword"

# 1. Login to get token
echo "Logging in..."
LOGIN_RES=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$EMAIL\", \"password\": \"$PASSWORD\"}")
ACCESS_TOKEN=$(echo $LOGIN_RES | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$ACCESS_TOKEN" ]; then
  echo "Login failed. Attempting registration..."
  REGISTER_RES=$(curl -s -X POST "$BASE_URL/auth/register" \
    -H "Content-Type: application/json" \
    -d "{\"email\": \"$EMAIL\", \"password\": \"$PASSWORD\"}")
  echo "Registration response: $REGISTER_RES"
  
  echo "Logging in again..."
  LOGIN_RES=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\": \"$EMAIL\", \"password\": \"$PASSWORD\"}")
  ACCESS_TOKEN=$(echo $LOGIN_RES | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
fi

if [ -z "$ACCESS_TOKEN" ]; then
  echo "Login failed after registration."
  exit 1
fi
echo "Token received."

# 2. Call AI Analyze
GOAL="I want to run a marathon."
echo "\nAnalyzing Goal: '$GOAL'..."
AI_RES=$(curl -s -X POST "$BASE_URL/ai/analyze" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d "{\"goal\": \"$GOAL\"}")

echo "Response: $AI_RES"
