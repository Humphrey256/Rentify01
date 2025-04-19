module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.jsx?$': 'babel-jest', // Use Babel to transform JavaScript files
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(axios)/)', // Transform ES modules in axios
  ],
  moduleFileExtensions: ['js', 'jsx'],
  moduleNameMapper: {
    '^react-toastify/dist/ReactToastify.css$': '<rootDir>/__mocks__/styleMock.js',
    // Add other CSS/asset mocks if needed
  }
};