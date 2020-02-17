// Absolute Paths
import 'module-alias/register';
import 'reflect-metadata';

// Setting up our configuration
import { setupConfig } from '../config';

setupConfig(setupConfig.ENodeEnvConfig.TEST);

export default async (): Promise<void> => {
  console.log('Starting tests, and setting up module aliases.');
};
