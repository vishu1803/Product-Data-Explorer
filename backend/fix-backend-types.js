const fs = require('fs');
const path = require('path');

function fixCommonIssues(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Fix unused variables in catch blocks
  if (content.includes('catch (error)') && !content.includes('error.')) {
    content = content.replace(/catch \(error\)/g, 'catch (_error)');
    changed = true;
  }

  if (content.includes('catch (e)') && !content.includes('e.')) {
    content = content.replace(/catch \(e\)/g, 'catch (_e)');
    changed = true;
  }

  // Fix unused variables in function parameters
  content = content.replace(/\(request\)/g, '(_request)');
  content = content.replace(/\(error\)/g, '(_error)');

  // Fix unsafe any DOM access patterns (common in scraping)
  content = content.replace(
    /const (\w+): any = (.+)\.textContent/g,
    'const $1 = $2?.textContent || null',
  );

  content = content.replace(
    /const (\w+): any = (.+)\.getAttribute/g,
    'const $1 = $2?.getAttribute',
  );

  // Fix simple any assignments
  content = content.replace(/: any\[\]/g, ': unknown[]');

  // Add error interface if missing
  if (
    content.includes('error.message') &&
    !content.includes('interface ErrorWithMessage')
  ) {
    const interfaceDefinition = `
interface ErrorWithMessage {
  message: string;
  stack?: string;
}

`;
    content = interfaceDefinition + content;
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log(`Fixed: ${filePath}`);
  }
}

// Process all TypeScript files in src
function processDirectory(dir) {
  if (!fs.existsSync(dir)) return;

  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory() && !file.includes('node_modules')) {
      processDirectory(filePath);
    } else if (
      file.endsWith('.ts') &&
      !file.includes('.spec.') &&
      !file.includes('.d.ts')
    ) {
      fixCommonIssues(filePath);
    }
  }
}

console.log('🔧 Starting backend TypeScript fixes...');
processDirectory('./src');
console.log(
  '✅ Basic fixes applied. Run npm run lint to check remaining issues.',
);
