module.exports = {
    presets: ['babel-preset-expo'],
    plugins: [
      ['module:react-native-dotenv', {
        moduleName: '@env',
        path: '.env', // Path to your .env file
      }],
    ],
  };