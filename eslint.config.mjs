// @ts-check
import stylistic from '@stylistic/eslint-plugin-ts'
import eslint from '@eslint/js'
import tsEslint from 'typescript-eslint'

export default tsEslint.config(
  eslint.configs.recommended,
  ...tsEslint.configs.recommended,
  ...tsEslint.configs.stylistic,
  {
    plugins: {
      'stylistic': stylistic,
    },
    rules: {
      'semi': ['warn', 'never'],
      'quotes': ['error', 'single'],
      'stylistic/object-curly-spacing': ['error', 'always'],
      'no-unused-vars': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          'argsIgnorePattern': '^_',
          'varsIgnorePattern': '^_',
          'caughtErrorsIgnorePattern': '^_'
        }
      ]
    }
  }
)
