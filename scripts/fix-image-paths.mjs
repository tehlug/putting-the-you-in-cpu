import { readFileSync, writeFileSync } from 'fs'
import { glob } from 'glob'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')

// Find all .astro and .mdx files
const files = await glob('src/**/*.{astro,mdx}', { cwd: projectRoot })

console.log(`Found ${files.length} files to process...`)

for (const file of files) {
  const filePath = join(projectRoot, file)
  let content = readFileSync(filePath, 'utf-8')
  let modified = false

  // Pattern to match img tags with absolute paths starting with /
  // Handles: src="/path", src='/path', and JSX expressions src={"/path"} or src={'/path'}
  const imgPattern = /(<img[^>]*\s+src=)(['"`]|{\s*['"`]?)(\/)([^'"`}>\s]+)(['"`]?}?|['"`])/g

  content = content.replace(imgPattern, (match, before, quote1, slash, path, quote2) => {
    modified = true
    console.log(`  Replacing: src=${quote1}${slash}${path}${quote2}`)
    
    // Convert to JSX expression with template literal
    return `${before}{\`\${import.meta.env.BASE_URL}/${path}\`}`
  })

  // Also handle standalone image references in MDX content (not in img tags)
  // This catches things like <img src='/images/file.png' /> in MDX
  const standalonePattern = /src=(['"`])\/([^'"`]+)\1(?![^<]*>)/g
  content = content.replace(standalonePattern, (match, quote, path) => {
    modified = true
    console.log(`  Replacing standalone: src=${quote}/${path}${quote}`)
    return `src={\`\${import.meta.env.BASE_URL}/${path}\`}`
  })

  if (modified) {
    writeFileSync(filePath, content, 'utf-8')
    console.log(`✓ Fixed image paths in ${file}`)
  } else {
    console.log(`- No changes needed in ${file}`)
  }
}

console.log('Done! All image paths have been updated.')
