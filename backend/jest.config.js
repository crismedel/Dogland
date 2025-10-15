export default {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  verbose: true,
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
};