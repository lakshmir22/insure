#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color
BLUE='\033[0;34m'

# Base URL
BASE_URL="http://localhost:5000/api/v1"

echo -e "${BLUE}Testing ABDM Health Records API${NC}\n"

# Function to test API and format response
test_endpoint() {
    local description=$1
    local curl_cmd=$2
    
    echo -e "${BLUE}Testing: ${description}${NC}"
    echo "Command: $curl_cmd"
    echo -e "Response:\n"
    eval $curl_cmd | python -m json.tool
    echo -e "\n${GREEN}----------------------------------------${NC}\n"
}

# 1. Test with valid Aadhaar number
test_endpoint "Get Health Records with Aadhaar" \
"curl -s -X GET '${BASE_URL}/health-records?identifier=123456789012'"

# 2. Test with valid ABHA number
test_endpoint "Get Health Records with ABHA" \
"curl -s -X GET '${BASE_URL}/health-records?identifier=ABHA12345678901'"

# 3. Test with invalid identifier format
test_endpoint "Invalid Identifier Format" \
"curl -s -X GET '${BASE_URL}/health-records?identifier=123'"

# 4. Test with missing identifier
test_endpoint "Missing Identifier" \
"curl -s -X GET '${BASE_URL}/health-records'"

# Test multiple Aadhaar numbers
echo -e "${BLUE}Testing multiple Aadhaar numbers for consistency${NC}\n"
for aadhaar in "123456789012" "987654321098" "456789123456"; do
    test_endpoint "Aadhaar Number: $aadhaar" \
    "curl -s -X GET '${BASE_URL}/health-records?identifier=$aadhaar'"
done

# Test multiple ABHA numbers
echo -e "${BLUE}Testing multiple ABHA numbers for consistency${NC}\n"
for abha in "ABHA1234567890" "ABHA9876543210" "ABHA4567891234"; do
    test_endpoint "ABHA Number: $abha" \
    "curl -s -X GET '${BASE_URL}/health-records?identifier=$abha'"
done

echo -e "${GREEN}API Testing Complete!${NC}" 