// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  // Ignore build output and assets
  {
    ignores: ['dist/**', 'node_modules/**', 'assets/**', 'public/**'],
  },

  // Base JS recommended rules
  eslint.configs.recommended,

  // TypeScript recommended rules (type-checked)
  ...tseslint.configs.recommendedTypeChecked,

  // Parser options — point to tsconfig
  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // Project-specific rule overrides
  {
    rules: {
      // Allow `any` only in Spine/Phaser interop (they lack proper TS types)
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',

      // require() is used once to load the SpinePlugin IIFE bundle
      '@typescript-eslint/no-require-imports': 'warn',

      // Allow unused vars prefixed with _ (common convention)
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],

      // Phaser callbacks often return void; Promise<void> is fine
      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksVoidReturn: false },
      ],

      // Don't require readonly on class properties — IDE hint is noisy
      '@typescript-eslint/prefer-readonly': 'off',

      // Consistent code style
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      'no-var': 'error',
      'eqeqeq': ['error', 'always'],
    },
  },
);
