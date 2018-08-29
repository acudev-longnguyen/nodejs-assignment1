/*
* Create and export configuration variables
*
*/


var environments = {};

// Staging (default) environment
environments.staging = {
  'httpPort' : 3000,
  'httpsPort' : 3001,
	'envName' : 'staging'
};

// Production environent
environments.production = {
	'httpPort' : 8081,
  'httpsPort' : 8181,
	'envName' : 'production'
};


// Determine running environment
var currentEnv = typeof (process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// Check if the default env is one of the environment, If not, default to staging
var environmentToExport = typeof(environments[currentEnv]) == 'object' ? environments[currentEnv] : environments.staging;

// Export the module
module.exports = environmentToExport;