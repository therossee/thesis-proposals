require('jest');

const { app } = require('../../src/app');
const { sequelize } = require('../../src/models');

const request = require('supertest');

let server;

beforeAll(async () => {
  server = app.listen(0, () => {
    console.log(`Test server running on port ${server.address().port}`);
  });
});

afterAll(async () => {
  await server.close(() => {
    sequelize.close();
  });
});

describe('GET /thesis-applications/eligibility', () => {
  test('Should check student eligibility for thesis application', async () => {
    const response = await request(server).get('/api/thesis-applications/eligibility');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      studentId: expect.any(String),
      isEligible: expect.any(Boolean),
    });
  });
});
