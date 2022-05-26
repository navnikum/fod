module.exports = {
  customizeConfig: (karmaConfig) => {
    karmaConfig.client.mocha.timeout = 60000;
    return karmaConfig;
  },
}
