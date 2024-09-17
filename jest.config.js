module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@src/(.*)$': '<rootDir>/src/$1',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json', 'node'],
};
