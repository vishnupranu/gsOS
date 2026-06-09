import { createHighlighter } from 'shiki';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.join(__dirname, 'src');
const distDir = path.join(__dirname, 'dist');

async function build() {
  const isWatch = process.argv.includes('--watch');
  
  // Ensure dist directory exists
  fs.mkdirSync(distDir, { recursive: true });
  
  // Create highlighter
  const highlighter = await createHighlighter({
    themes: ['github-dark'],
    langs: ['typescript', 'javascript', 'json', 'yaml', 'markdown']
  });

  function processFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const ext = path.extname(filePath);
    const name = path.basename(filePath, ext);
    
    let htmlContent = '';
    
    if (ext === '.md') {
      // Process markdown file
      const lines = content.split('\n');
      for (const line of lines) {
        if (line.startsWith('```')) {
          const lang = line.slice(3).trim();
          htmlContent += `<pre><code class="language-${lang}">`;
        } else if (line === '```') {
          htmlContent += '</code></pre>';
        } else {
          htmlContent += `<p>${line}</p>`;
        }
      }
    } else if (ext === '.html') {
      htmlContent = content;
    }

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name}</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; }
    pre { background: #1e1e1e; padding: 1rem; border-radius: 8px; overflow-x: auto; }
    code { font-family: monospace; }
  </style>
</head>
<body>
${htmlContent}
</body>
</html>`;

    const outPath = path.join(distDir, `${name}.html`);
    fs.writeFileSync(outPath, html);
    console.log(`Built: ${outPath}`);
  }

  // Process all files in src
  const files = fs.readdirSync(srcDir);
  for (const file of files) {
    const filePath = path.join(srcDir, file);
    if (fs.statSync(filePath).isFile()) {
      processFile(filePath);
    }
  }

  console.log('Documentation build complete!');

  if (isWatch) {
    console.log('Watching for changes...');
    // Simple watch implementation
    fs.watch(srcDir, { recursive: true }, (eventType, filename) => {
      if (filename) {
        console.log(`Changed: ${filename}`);
        processFile(path.join(srcDir, filename));
      }
    });
  }
}

build().catch(console.error);