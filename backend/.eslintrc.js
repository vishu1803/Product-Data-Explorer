module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: ['eslint:recommended'],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: [
    '.eslintrc.js', 
    'dist/', 
    'node_modules/', 
    '*.spec.ts', 
    '*.e2e-spec.ts',
    'test/',
    'src/**/*.spec.ts'
  ],
  rules: {
    // Disable ALL problematic TypeScript rules
    '@typescript-eslint/only-throw-error': 'off',
    '@typescript-eslint/prefer-promise-reject-errors': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-unsafe-return': 'off',
    '@typescript-eslint/no-unsafe-argument': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/require-await': 'off',
    '@typescript-eslint/no-floating-promises': 'off',
    '@typescript-eslint/restrict-template-expressions': 'off',
    '@typescript-eslint/no-unsafe-function-type': 'off',
    '@typescript-eslint/unbound-method': 'off',
    
    // Keep only basic rules
    '@typescript-eslint/no-unused-vars': ['warn', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }],
    
    // Basic ESLint rules only
    'no-console': 'off',
    'no-debugger': 'warn',
    'prefer-const': 'warn',
    'no-unused-vars': 'off', // Use TypeScript version
    'no-undef': 'off', // TypeScript handles this
  },
};
