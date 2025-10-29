module.exports = {
  root: true,
  extends: ['next/core-web-vitals'],
  parserOptions: {
    project: ['./tsconfig.json'],
  },
  rules: {
    'import/order': [
      'warn',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        'newlines-between': 'always',
        alphabetize: { order: 'asc', caseInsensitive: true },
      },
    ],
  },
};
