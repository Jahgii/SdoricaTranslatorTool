const { env } = require('process');

const target = env.ASPNETCORE_HTTPS_PORT ? `https://localhost:${env.ASPNETCORE_HTTPS_PORT}` :
  env.ASPNETCORE_URLS ? env.ASPNETCORE_URLS.split(';')[0] : 'http://localhost:2511';

const PROXY_CONFIG = [
  {
    context: [
      "/dialogassets",
      "/maingroups",
      "/groups",
      "/languages",
      "/localizationcategories",
      "/localizationkeys",
      "/gamedatacategories",
      "/gamedatavalues",
      "/commonwords",
      "/auth"
    ],
    proxyTimeout: 30000,
    target: target,
    secure: false,
    headers: {
      Connection: 'Keep-Alive'
    }
  }
]

module.exports = PROXY_CONFIG;
