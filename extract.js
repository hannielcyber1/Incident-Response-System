const fs = require('fs')
const lines = fs.readFileSync('C:\\Users\\hanni\\.gemini\\antigravity\\brain\\9b8b5573-b4c9-4366-9a23-b5091618f7eb\\.system_generated\\logs\\transcript.jsonl', 'utf8').split('\n').filter(Boolean)
lines.forEach(l => {
  const row = JSON.parse(l)
  if (row.type === 'USER_INPUT') {
    console.log('USER:', row.content)
  }
})
