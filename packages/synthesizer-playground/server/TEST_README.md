# Test Server for SynthesizerAdapter

A test server that reads and processes data from JSON files instead of fetching from external APIs.

## 🚀 Server Execution

### Start Test Server

```bash
# Start test server (port 3003)
npm run test-server

# Or run directly
node test-index.js
```

### Start Original Server

```bash
# Start original server (port 3002)
npm start

# Or run directly
node index.js
```

## 📁 Test Data Preparation

### 1. Create test-data Directory

```bash
mkdir test-data
```

### 2. JSON File Structure

Create `test-data/{txId}.json` files with the following structure:

```json
{
  "from": "0x1234567890123456789012345678901234567890",
  "to": "0x0987654321098765432109876543210987654321",
  "placements": {
    "0": { "inPts": [...], "outPts": [...] },
    "1": { "inPts": [...], "outPts": [...] },
    "3": { "inPts": [...], "outPts": [...] }
  },
  "permutation": [...],
  "placementInstance": [...],
  "placementIndices": {
    "storageIn": 0,
    "return": 3,
    "storageOut": 1
  }
}
```

### 3. Required Fields

- **placements**: Object containing placement data by index
- **permutation**: Permutation data array
- **placementInstance**: Placement instance data array
- **placementIndices**: Indices for storage and logs processing
- **from/to**: (Optional) Transaction addresses

## 🔍 API Endpoints

### POST /api/parseTransaction

Processes transaction data.

**Request:**

```json
{
  "txId": "test",
  "testDataFile": "/path/to/custom/file.json" // Optional
}
```

**Response:**

```json
{
  "ok": true,
  "data": {
    "from": "0x...",
    "to": "0x...",
    "logs": [
      {
        "topics": ["topic0", "topic1", "topic2"],
        "valueDec": "14519000000000000000000",
        "valueHex": "0x00000000000003131399e70a887c0000"
      }
    ],
    "storageLoad": [...],
    "storageStore": [...],
    "permutation": [...],
    "placementInstance": [...]
  }
}
```

### GET /health

Check server status

### GET /api/test-data

List available test files

## 🧪 Testing & Comparison

### 1. Test Server API Call

```bash
# Test with JSON file data
curl -X POST http://localhost:3003/api/parseTransaction \
  -H "Content-Type: application/json" \
  -d '{"txId": "test"}' | jq . > test_response.json
```

### 2. Original Server API Call

```bash
# Test with real transaction hash
curl -X POST http://localhost:3002/api/parseTransaction \
  -H "Content-Type: application/json" \
  -d '{"txId": "0x6c7903e420c5efb27639f5186a7474ef2137f12c786a90b4efdcb5d88dfdb002"}' | jq . > original_response.json
```

### 3. Compare Response Structures

```bash
# Compare data structure keys
diff <(jq '.data | keys' test_response.json) <(jq '.data | keys' original_response.json)

# Compare logs structure
echo "=== Test Server Logs ==="
jq '.data.logs[0]' test_response.json

echo "=== Original Server Logs ==="
jq '.data.logs[0]' original_response.json

# Compare data counts
echo "=== Test Server Counts ==="
jq '.data | {logsCount: (.logs | length), storageLoadCount: (.storageLoad | length), storageStoreCount: (.storageStore | length)}' test_response.json

echo "=== Original Server Counts ==="
jq '.data | {logsCount: (.logs | length), storageLoadCount: (.storageLoad | length), storageStoreCount: (.storageStore | length)}' original_response.json
```

### 4. Validate JSON Responses

```bash
# Check if responses are valid JSON
jq empty test_response.json && echo "✅ Test response is valid JSON" || echo "❌ Test response is invalid JSON"
jq empty original_response.json && echo "✅ Original response is valid JSON" || echo "❌ Original response is invalid JSON"

# Check required fields exist
jq '.data | has("logs") and has("storageLoad") and has("storageStore")' test_response.json
jq '.data | has("logs") and has("storageLoad") and has("storageStore")' original_response.json
```

## 📝 Usage Examples

### 1. Generate Test Data

```bash
# Copy generated data from original server to test-data folder
cp synthesizer_data_2025-08-06T02-04-35-161Z.json test-data/test.json

# Verify the copied file has required fields
jq 'has("placements") and has("permutation") and has("placementInstance")' test-data/test.json
```

### 2. Frontend Integration

```javascript
// Test with test server
const testResponse = await fetch('http://localhost:3003/api/parseTransaction', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ txId: 'test' })
});

// Test with original server
const originalResponse = await fetch('http://localhost:3002/api/parseTransaction', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ txId: '0x6c7903e420c5efb27639f5186a7474ef2137f12c786a90b4efdcb5d88dfdb002' })
});

// Compare results
const testResult = await testResponse.json();
const originalResult = await originalResponse.json();

console.log('Data structure match:',
  JSON.stringify(Object.keys(testResult.data).sort()) ===
  JSON.stringify(Object.keys(originalResult.data).sort())
);
```

### 3. Batch Testing

```bash
# Test multiple files
for file in test-data/*.json; do
  txId=$(basename "$file" .json)
  echo "Testing $txId..."
  curl -s -X POST http://localhost:3003/api/parseTransaction \
    -H "Content-Type: application/json" \
    -d "{\"txId\": \"$txId\"}" | jq '.ok'
done
```

## 🔧 Key Differences

### Original Server (index.ts)

- **Port**: 3002
- **Data Source**: Etherscan API + SynthesizerAdapter real-time parsing
- **Processing**: Full transaction parsing pipeline
- **Use Case**: Production data processing

### Test Server (test-index.ts)

- **Port**: 3003
- **Data Source**: Pre-processed JSON files
- **Processing**: Data transformation only
- **Use Case**: Development, testing, and debugging

## 🐛 Troubleshooting

### "Test data file not found" Error

```bash
# Check if test-data directory exists
ls -la test-data/

# Check if JSON file exists
ls -la test-data/test.json

# Verify file permissions
chmod 644 test-data/*.json
```

### "Test data must contain..." Error

```bash
# Check required fields in JSON file
jq 'keys' test-data/test.json | grep -E "(placements|permutation|placementInstance|placementIndices)"

# Validate JSON syntax
jq empty test-data/test.json && echo "Valid JSON" || echo "Invalid JSON syntax"

# Check specific fields
jq 'has("placements")' test-data/test.json
jq 'has("permutation")' test-data/test.json
jq 'has("placementInstance")' test-data/test.json
jq 'has("placementIndices")' test-data/test.json
```

### Empty Results (logs: [], storageLoad: [], storageStore: [])

```bash
# Check placement indices
jq '.placementIndices' test-data/test.json

# Check placements structure
jq '.placements | keys' test-data/test.json

# Verify placement data exists for the indices
jq '.placements["0"] | has("inPts")' test-data/test.json  # storageIn
jq '.placements["1"] | has("outPts")' test-data/test.json # storageOut
jq '.placements["3"] | has("outPts")' test-data/test.json # return (logs)
```

### Server Debugging

```bash
# Check server logs
tail -f server.log

# Test server health
curl http://localhost:3003/health
curl http://localhost:3002/health

# Check available test files
curl http://localhost:3003/api/test-data

# Monitor server ports
lsof -i :3002
lsof -i :3003
```
