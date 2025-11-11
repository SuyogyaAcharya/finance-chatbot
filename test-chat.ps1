# Test script for AI chat service (PowerShell)
$CHAT_URL = "http://localhost:3001"

Write-Host "🧪 Starting comprehensive chat service tests..."
Write-Host ""

# Helper function to POST message and parse JSON
function Send-ChatMessage($message) {
    $body = @{ message = $message } | ConvertTo-Json
    $response = Invoke-RestMethod -Uri "$CHAT_URL/chat" -Method POST -Body $body -ContentType "application/json"
    return $response.response
}

# Test 1: Health check
Write-Host "Test 1: Health Check"
$health = Invoke-RestMethod -Uri "$CHAT_URL/health" -Method GET
$health | Format-List
Write-Host ""

# Test 2: Add expenses with natural language
Write-Host "Test 2: Adding expenses with natural language"
Write-Host (Send-ChatMessage "I spent `$12.50 on coffee this morning")
Write-Host (Send-ChatMessage "Paid 65 dollars for gas")
Write-Host (Send-ChatMessage "Bought groceries for `$120")
Write-Host ""

# Test 3: List expenses
Write-Host "Test 3: Listing expenses"
Write-Host (Send-ChatMessage "Show me my expenses")
Write-Host ""

# Test 4: Get summary
Write-Host "Test 4: Getting summary"
Write-Host (Send-ChatMessage "What is my total spending?")
Write-Host ""

# Test 5: Get stats
Write-Host "Test 5: Category breakdown"
Write-Host (Send-ChatMessage "Show breakdown by category")
Write-Host ""

# Test 6: AI conversation
Write-Host "Test 6: AI financial advice"
Write-Host (Send-ChatMessage "Give me 3 tips to save money on groceries")
Write-Host ""

# Test 7: Ambiguous categorization
Write-Host "Test 7: AI categorization of ambiguous expense"
Write-Host (Send-ChatMessage "Spent `$50 at Amazon")
Write-Host ""

Write-Host "✅ All tests completed!"
