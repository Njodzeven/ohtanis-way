#!/bin/bash

BASE_URL="http://localhost:8000"
EMAIL="testuser2@example.com"
PASSWORD="password123"

# 0. Register (Ignore error if exists)
echo "Registering..."
curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$EMAIL\", \"password\": \"$PASSWORD\"}"

# 1. Login to get JWT
echo "\nLogging in..."
LOGIN_RES=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$EMAIL\", \"password\": \"$PASSWORD\"}")

ACCESS_TOKEN=$(echo $LOGIN_RES | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$ACCESS_TOKEN" ]; then
  echo "Login failed. Response: $LOGIN_RES"
  exit 1
fi

echo "Token received."

# 2. Get Goal (Should be empty/default initially)
echo "\nGetting Goal..."
GET_RES=$(curl -s -X GET "$BASE_URL/goals" \
  -H "Authorization: Bearer $ACCESS_TOKEN")
echo "Response: $GET_RES"

# 3. Update Goal
echo "\nUpdating Goal..."
UPDATE_RES=$(curl -s -X PUT "$BASE_URL/goals" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{"center": {"id": "center", "content": "Updated Goal"}, "pillars": []}')
echo "Response: $UPDATE_RES"

# 4. Get Goal Again (Should show update)
echo "\nGetting Goal Again..."
GET_RES_2=$(curl -s -X GET "$BASE_URL/goals" \
  -H "Authorization: Bearer $ACCESS_TOKEN")
echo "Response: $GET_RES_2"
