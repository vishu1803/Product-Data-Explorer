#!/bin/bash
echo "🔧 Fixing linting issues..."

cd frontend

# Fix quotes in JSX
echo "📝 Fixing unescaped quotes..."
find src -name "*.tsx" -type f -exec sed -i "s/'/\&apos;/g" {} \;
find src -name "*.tsx" -type f -exec sed -i 's/"/\&quot;/g' {} \;

# Run auto-fix
echo "🔍 Running auto-fix..."
npm run lint -- --fix

# Check remaining issues
echo "✅ Checking remaining issues..."
npm run lint

echo "🎉 Done! Check the output above for any remaining issues."
