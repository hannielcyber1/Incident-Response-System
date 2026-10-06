const fs = require('fs')
const path = 'C:\\Users\\hanni\\.gemini\\antigravity\\brain\\9b8b5573-b4c9-4366-9a23-b5091618f7eb\\.system_generated\\logs\\transcript_full.jsonl'
const lines = fs.readFileSync(path, 'utf8').split('\n').filter(Boolean)

lines.forEach(l => {
  const row = JSON.parse(l)
  if (row.type === 'PLANNER_RESPONSE' && row.tool_calls) {
    const writes = row.tool_calls.filter(t => t.name === 'write_to_file' || t.name === 'replace_file_content')
    writes.forEach(w => {
      let args
      try {
        args = typeof w.arguments === 'string' ? JSON.parse(w.arguments) : w.arguments
      } catch(e) { return }
      if (!args) return
      console.log('\n=== FILE:', args.TargetFile || args.targetFile || '?')
      if (args.CodeContent) process.stdout.write(args.CodeContent + '\n---END---\n')
      if (args.ReplacementContent) process.stdout.write('[REPLACE]\n' + args.ReplacementContent + '\n---END---\n')
    })
  }
})
