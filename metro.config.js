const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// backend/, docker/, docs/ are co-located here for a single Git repo (see
// docker-compose.yml) but aren't part of the RN app — excluding them keeps
// Metro's file watcher from also crawling backend/node_modules.
config.resolver.blockList = [/^.*\/backend\/.*$/, /^.*\/docker\/.*$/, /^.*\/docs\/.*$/];

module.exports = config;
