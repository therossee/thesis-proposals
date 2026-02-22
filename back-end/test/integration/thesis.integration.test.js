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

describe('GET /api/thesis', () => {
  afterAll(async () => {
    await request(server).put('/api/students/logged-student').send({ student_id: '320213' });
  });

  test('Should return the logged student thesis', async () => {
    const response = await request(server).get('/api/thesis');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id', 1);
    expect(response.body).toHaveProperty('topic');
    expect(response.body).toHaveProperty('student');
    expect(response.body).toHaveProperty('supervisor');
    expect(Array.isArray(response.body.coSupervisors)).toBe(true);
    expect(response.body).toHaveProperty('thesisStartDate');
    expect(response.body.thesisStartDate).toContain('2025-02-01');
  });

  test('Should return 404 when logged student has no thesis', async () => {
    await request(server).put('/api/students/logged-student').send({ student_id: '314796' });

    const response = await request(server).get('/api/thesis');
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message', 'Thesis not found for the logged-in student.');
  });
});
