// Libraries
import request from 'supertest';
import faker from 'faker';

// Dependencies
import { getApp } from '../utils/app';

let app: request.SuperTest<request.Test>;

beforeAll(async done => {
  app = await getApp();
  done();
});

afterAll(async done => {
  done();
});

describe('POST /email/subscribe', () => {
  it('responds with email', async function() {
    const fakeEmail = faker.internet.email();
    const response = await app
      .post('/email/subscribe')
      .send({ email: fakeEmail });
    expect(response.status).toEqual(200);
    expect(response.body).toBe(fakeEmail);
  });
});
