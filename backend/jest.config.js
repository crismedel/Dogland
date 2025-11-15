export default {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  verbose: true,
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  reporters: [
    'default',
    ['jest-html-reporter', {
      pageTitle: 'Reporte de Tests - Backend',
      outputPath: './test-reports/test-report.html',
      includeFailureMsg: true,
      includeConsoleLog: true,
      dateFormat: 'yyyy-mm-dd HH:MM:ss'
    }]
  ]
};