require('jest');

const { app } = require('../../src/app');
const { sequelize } = require('../../src/models');

const request = require('supertest');

let server;

beforeAll(async () => {
  server = app.listen(0);
});

afterAll(async () => {
  await server.close(() => {
    sequelize.close();
  });
});

describe('PUT /api/test/thesis-application', () => {
  test('Should return 404 when thesis application does not exist', async () => {
    const response = await request(server).put('/api/test/thesis-application').send({
      id: 99999,
      new_status: 'pending',
    });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error', 'Thesis application not found');
  });

  test('Should return 400 when new status matches current', async () => {
    const response = await request(server).put('/api/test/thesis-application').send({
      id: 1,
      new_status: 'pending',
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'New status must be different from the current status');
  });

  test('Should return 400 when application is closed', async () => {
    const response = await request(server).put('/api/test/thesis-application').send({
      id: 2,
      new_status: 'pending',
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Cannot update a closed application');
  });
});
