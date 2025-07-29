module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: [
    'react',
    'react-hooks',
  ],
  rules: {
    'react/prop-types': 'off',
    'no-unused-vars': ['warn', { 
      'argsIgnorePattern': '^_',
      'varsIgnorePattern': '^_',
      'ignoreRestSiblings': true 
    }],
    // Permitir console em desenvolvimento - apenas error em produção
    'no-console': 'off', // Temporariamente desabilitado para debug
    // Relaxar regras de dependências do useEffect para desenvolvimento
    'react-hooks/exhaustive-deps': 'off',
    'react/react-in-jsx-scope': 'off', // React 17+ não precisa importar React
    // Outras regras úteis para desenvolvimento
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'no-undef': 'error',
    'react/jsx-uses-react': 'off',
    'react/jsx-uses-vars': 'error',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
}; 