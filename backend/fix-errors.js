const fs = require('fs');
const path = require('path');

function fixErrorReferences(filePath) {
  if (!fs.existsSync(filePath)) return false;

  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Pattern 1: Fix catch (_error) blocks where error is still referenced
  // Look for catch (_error) followed by error usage
  const catchPattern = /catch \(_error\)\s*{[^}]*}/g;
  let matches = content.match(catchPattern);

  if (matches) {
    matches.forEach((match) => {
      // Replace error with _error inside these blocks
      let fixedMatch = match.replace(/\berror\./g, '_error.');
      fixedMatch = fixedMatch.replace(/\berror\[/g, '_error[');
      fixedMatch = fixedMatch.replace(/throw error;/g, 'throw _error;');
      fixedMatch = fixedMatch.replace(/\berror\.message/g, '_error.message');
      fixedMatch = fixedMatch.replace(/\berror\.stack/g, '_error.stack');

      if (fixedMatch !== match) {
        content = content.replace(match, fixedMatch);
        changed = true;
      }
    });
  }

  // Pattern 2: Fix any remaining standalone error references in catch blocks
  content = content.replace(/catch \([^)]+\)\s*{[^}]*\berror\./g, (match) => {
    return match.replace(/\berror\./g, '_error.');
  });

  // Pattern 3: Fix specific patterns we see in the errors
  const fixes = [
    // In catch blocks with _error parameter, fix error references
    [
      /catch \(_error\)[^}]*\`[^`]*\$\{error\.message\}/g,
      (match) => match.replace('error.message', '_error.message'),
    ],
    [
      /catch \(_error\)[^}]*error\.stack/g,
      (match) => match.replace('error.stack', '_error.stack'),
    ],
    [
      /catch \(_error\)[^}]*throw error;/g,
      (match) => match.replace('throw error;', 'throw _error;'),
    ],

    // Fix standalone error in catch blocks that don't have _error parameter
    [/} catch \(error\)/g, '} catch (_error)'],
    [/\} catch\(error\)/g, '} catch(_error)'],

    // Fix error references that should be _error
    [/\$\{error\.message\}/g, '${_error.message}'],
    [/error\.stack/g, '_error.stack'],
    [/throw error;$/gm, 'throw _error;'],
  ];

  fixes.forEach(([pattern, replacement]) => {
    const newContent = content.replace(pattern, replacement);
    if (newContent !== content) {
      content = newContent;
      changed = true;
    }
  });

  if (changed) {
    fs.writeFileSync(filePath, content);
    return true;
  }
  return false;
}

function fixFile(filePath) {
  try {
    const fixed = fixErrorReferences(filePath);
    if (fixed) {
      console.log(`✅ Fixed: ${path.relative(process.cwd(), filePath)}`);
    }
    return fixed;
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
    return false;
  }
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  let totalFixed = 0;

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (
      stat.isDirectory() &&
      !['node_modules', 'dist', '.git'].includes(file)
    ) {
      totalFixed += processDirectory(filePath);
    } else if (
      file.endsWith('.ts') &&
      !file.includes('.spec.') &&
      !file.includes('.d.ts')
    ) {
      if (fixFile(filePath)) totalFixed++;
    }
  }
  return totalFixed;
}

console.log('🔧 Fixing backend TypeScript error references...');
const fixed = processDirectory('./src');
console.log(`✅ Fixed ${fixed} files`);

// Test build
const { execSync } = require('child_process');
try {
  console.log('🔨 Testing build...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('🎉 Build successful!');
} catch (error) {
  console.log('⚠️ Build still has issues. Manual fixes needed.');
}
