// Compiles src/content/ink/*.ink → *.json with the compiler bundled in inkjs.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { Compiler } from 'inkjs/full'

const dir = new URL('../src/content/ink/', import.meta.url)
let failed = false
for (const file of readdirSync(dir).filter((f) => f.endsWith('.ink'))) {
  const compiler = new Compiler(readFileSync(new URL(file, dir), 'utf8'))
  try {
    const story = compiler.Compile()
    writeFileSync(new URL(file.replace(/\.ink$/, '.json'), dir), story.ToJson())
    console.log(`ok   ${file}`)
  } catch (e) {
    failed = true
    console.error(`FAIL ${file}\n  ${compiler.errors.join('\n  ') || e}`)
  }
}
process.exit(failed ? 1 : 0)
