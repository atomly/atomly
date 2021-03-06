// Dependencies
import Hubful from '../../../src';
import { setupHubfulInstance } from '../setupHubfulInstance';

export async function getHubfulInstance(): Promise<typeof Hubful> {
  await setupHubfulInstance();
  return Hubful;
}
