module.exports = {
  default: [
    '--require-module ts-node/register',
    '--require src/bdd/**/*.ts',
    '--format progress',
    '--format html:reports/cucumber/cucumber-report.html',
    '--format json:reports/cucumber/cucumber-report.json',
    'src/bdd/features/**/*.feature'
  ].join(' ')
};
