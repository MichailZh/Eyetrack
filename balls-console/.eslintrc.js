const devOff = process.env.NODE_ENV === 'production' ? 'error' : 'off'

module.exports = {
  root: true,
  env: {
    node: true,
    commonjs: true,
    es6: true,
  },
  extends: ['plugin:vue/essential', '@vue/prettier'],
  rules: {
    'no-console': devOff,
    'no-debugger': devOff,
    'no-unused-vars': devOff,
    'comma-dangle': ['error', 'never'],
  },
  parserOptions: {
    parser: 'babel-eslint',
  },
}
