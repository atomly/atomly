/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
const { parse } = require('dotenv');
const { existsSync, readFileSync } = require('fs');
const { resolve } = require('path');
const { SSM, Config, SharedIniFileCredentials } = require('aws-sdk');

/**
 * AWS SMS Parameter Store
 * Parameter names.
 */
const paramNames = [
  'MAILCHIMP_LIST_ID',
  'MAILCHIMP_API_KEY',
  'DB_CONNECTION_STRING',
  'DB_NAME',
];

function awsSsmParamName(stage, name) {
  return `/beast/newsletter/${stage}/variables/${name}`;
}

async function slsParams(stage, provider) {
  const { region, profile } = provider;
  const ssm = new SSM(new Config({
    region,
    credentials: new SharedIniFileCredentials({
      profile,
    }),
  }));
  try {
    const [
      MAILCHIMP_LIST_ID,
      MAILCHIMP_API_KEY,
      DB_CONNECTION_STRING,
      DB_NAME,
    ] = await Promise.all(paramNames.map(name => {
      const Name = awsSsmParamName(stage, name);
      return ssm.getParameter({
        Name,
        WithDecryption: true,
      }).promise();
    }));
    return {
      MAILCHIMP_LIST_ID: MAILCHIMP_LIST_ID.Parameter.Value,
      MAILCHIMP_API_KEY: MAILCHIMP_API_KEY.Parameter.Value,
      DB_CONNECTION_STRING: DB_CONNECTION_STRING.Parameter.Value,
      DB_NAME: DB_NAME.Parameter.Value,
    };
  } catch (error) {
    console.error('error: ', error);
    throw new Error(`Something went wrong while fetching parameters from AWS SSM with stage [${stage}]: [${error.message}]`);
  }
}

async function localParams() {
  // .env
  // packages
  //  ↑
  //  api
  //    ↑
  const envPath = resolve(__dirname, 'newsletter.config.env');
  if (existsSync(envPath)) {
    const file = readFileSync(envPath).toString('utf-8');
    const env = parse(file);
    return env;
  }
  throw new Error(`Path [${envPath}] is invalid, .env file not found.`);
}

// serverless.env.js
module.exports.params = async args => {
  const stage = args.processedInput.options.stage;
  const { provider } = args.service;
  switch (stage) {
    case 'prod':
    case 'dev':
    case 'sandbox': {
      const params = await slsParams(stage, provider);
      console.info(`Stage: [${stage}] params: `, params);
      return params;
    }
    case 'local': {
      const params = await localParams();
      console.info(`Stage: [${stage}] params: `, params);
      return params;
    }
    default:
      throw new Error(`Stage: [${stage}] is invalid.`);
  }
};
