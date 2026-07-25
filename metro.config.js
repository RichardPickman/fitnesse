const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Resolve @/ -> src/ based on tsconfig paths
config.resolver.alias = {
  '@': __dirname + '/src',
};

module.exports = config;
