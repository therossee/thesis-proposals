require('jest');

const { getLoggedStudentThesis, createStudentThesis } = require('../../src/controllers/thesis');

const {
  sequelize,
  Thesis,
  ThesisSupervisorCoSupervisor,
  Teacher,
  Student,
  LoggedStudent,
  ThesisApplicationStatusHistory,
  Company,
} = require('../../src/models');

jest.mock('../../src/models', () => ({
  sequelize: { transaction: jest.fn() },
  Thesis: { findOne: jest.fn(), findByPk: jest.fn(), create: jest.fn() },
  ThesisSupervisorCoSupervisor: { findAll: jest.fn(), create: jest.fn() },
  Teacher: { findByPk: jest.fn() },
  Student: { findByPk: jest.fn() },
  LoggedStudent: { findOne: jest.fn() },
  ThesisApplicationStatusHistory: { findAll: jest.fn() },
  Company: { findByPk: jest.fn() },
}));

jest.mock('../../src/utils/snakeCase', () => jest.fn(x => x));
jest.mock('../../src/utils/selectTeacherAttributes', () => jest.fn(() => ['id', 'name']));

jest.mock('../../src/schemas/Thesis', () => ({
  parse: jest.fn(d => d),
}));

describe('Student Thesis Controllers', () => {
  let req;
  let res;
  let t;

  beforeEach(() => {
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    req = { body: {} };
    t = { commit: jest.fn(), rollback: jest.fn() };
    sequelize.transaction.mockResolvedValue(t);
    jest.clearAllMocks();

    // Mock che restituiscono oggetti con toJSON
    Teacher.findByPk.mockImplementation(id => ({
      id,
      name: id === 100 ? 'Prof. X' : 'Prof. Y',
      toJSON: function () {
        return { id: this.id, name: this.name };
      },
    }));

    Student.findByPk.mockResolvedValue({
      id: 1,
      name: 'Test Student',
      toJSON: function () {
        return { id: this.id, name: this.name };
      },
    });

    Company.findByPk.mockResolvedValue({
      id: 1,
      name: 'Test Company',
      toJSON: function () {
        return { id: this.id, name: this.name };
      },
    });
  });

  describe('getLoggedStudentThesis', () => {
    test('should return 401 if no logged student', async () => {
      LoggedStudent.findOne.mockResolvedValue(null);

      await getLoggedStudentThesis(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'No logged-in student found' });
    });

    test('should return 404 if thesis not found', async () => {
      LoggedStudent.findOne.mockResolvedValue({ student_id: 1 });
      Student.findByPk.mockResolvedValue({ id: 1 });
      Thesis.findOne.mockResolvedValue(null);

      await getLoggedStudentThesis(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Thesis not found for the logged-in student.' });
    });

    test('should return 200 with complete thesis data', async () => {
      const mockDate = new Date();
      const requestDate = new Date('2025-01-02T10:00:00.000Z');
      const confirmationDate = new Date('2025-01-05T12:00:00.000Z');

      LoggedStudent.findOne.mockResolvedValue({ student_id: 1 });
      Student.findByPk.mockResolvedValue({
        id: 1,
        toJSON: () => ({ id: 1, name: 'Test Student' }),
      });

      Thesis.findOne.mockResolvedValue({
        id: 10,
        student_id: 1,
        topic: 'AI Thesis',
        thesis_status: 'ongoing',
        thesis_start_date: mockDate,
        thesis_conclusion_request_date: requestDate,
        thesis_conclusion_confirmation_date: confirmationDate,
        thesis_application_id: 5,
        company_id: 1,
        toJSON() {
          return this;
        },
      });

      ThesisSupervisorCoSupervisor.findAll.mockResolvedValue([
        { teacher_id: 100, is_supervisor: true },
        { teacher_id: 101, is_supervisor: false },
      ]);

      Teacher.findByPk.mockImplementation(id => ({
        toJSON: () => ({ id, name: id === 100 ? 'Prof. X' : 'Prof. Y' }),
      }));

      Company.findByPk.mockResolvedValue({
        toJSON: () => ({ id: 1, name: 'Test Company' }),
      });

      ThesisApplicationStatusHistory.findAll.mockResolvedValue([]);

      await getLoggedStudentThesis(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const payload = res.json.mock.calls[0][0];
      expect(payload.student).toEqual({ id: 1, name: 'Test Student' });
      expect(payload.supervisor).toEqual({ id: 100, name: 'Prof. X' });
      expect(payload.co_supervisors).toEqual([{ id: 101, name: 'Prof. Y' }]);
      expect(payload.company).toEqual({ id: 1, name: 'Test Company' });
      expect(payload.thesis_conclusion_request_date).toBe(requestDate.toISOString());
      expect(payload.thesis_conclusion_confirmation_date).toBe(confirmationDate.toISOString());
    });

    test('should return 200 with null student/company and skip missing teachers', async () => {
      const mockDate = new Date();

      LoggedStudent.findOne.mockResolvedValue({ student_id: 1 });
      Student.findByPk.mockResolvedValueOnce({
        id: 1,
        toJSON: () => ({ id: 1, name: 'Test Student' }),
      });

      Thesis.findOne.mockResolvedValue({
        id: 11,
        student_id: 1,
        topic: 'AI Thesis',
        thesis_status: 'ongoing',
        thesis_start_date: mockDate,
        thesis_conclusion_request_date: null,
        thesis_conclusion_confirmation_date: null,
        thesis_application_id: 6,
        company_id: null,
        toJSON() {
          return this;
        },
      });

      ThesisSupervisorCoSupervisor.findAll.mockResolvedValue([
        { teacher_id: 100, is_supervisor: true },
        { teacher_id: 101, is_supervisor: false },
      ]);

      Teacher.findByPk
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ toJSON: () => ({ id: 101, name: 'Prof. Y' }) });
      Company.findByPk.mockResolvedValue(null);
      ThesisApplicationStatusHistory.findAll.mockResolvedValue([]);

      Student.findByPk.mockResolvedValueOnce(null);

      await getLoggedStudentThesis(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const payload = res.json.mock.calls[0][0];
      expect(payload.student).toBeNull();
      expect(payload.supervisor).toBeNull();
      expect(payload.co_supervisors).toEqual([{ id: 101, name: 'Prof. Y' }]);
      expect(payload.company).toBeNull();
    });

    test('should return 500 on unexpected error', async () => {
      const error = new Error('DB failure');
      LoggedStudent.findOne.mockRejectedValue(error);
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await getLoggedStudentThesis(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'An error occurred while fetching the thesis.' });
      consoleSpy.mockRestore();
    });
  });

  describe('createStudentThesis', () => {
    test('should return 401 if no logged student', async () => {
      LoggedStudent.findOne.mockResolvedValue(null);

      await createStudentThesis(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'No logged-in student found' });
    });

    test('should create thesis and return 201', async () => {
      const mockDate = new Date();

      LoggedStudent.findOne.mockResolvedValue({ student_id: 1 });
      Student.findByPk.mockResolvedValue({
        id: 1,
        toJSON: () => ({ id: 1, name: 'Test Student' }),
      });

      req.body = {
        topic: 'AI Thesis',
        thesis_application_id: 5,
        supervisor: { id: 100 },
        co_supervisors: [{ id: 101 }],
        company: { id: 1, toJSON: () => ({ id: 1, name: 'Test Company' }) },
      };

      Thesis.create.mockResolvedValue({
        id: 10,
        student_id: 1,
        topic: 'AI Thesis',
        thesis_start_date: mockDate,
        thesis_conclusion_request_date: null,
        thesis_conclusion_confirmation_date: null,
        toJSON() {
          return this;
        },
      });

      ThesisSupervisorCoSupervisor.create.mockResolvedValue({});
      ThesisSupervisorCoSupervisor.findAll.mockResolvedValue([
        { teacher_id: 100, is_supervisor: true },
        { teacher_id: 101, is_supervisor: false },
      ]);
      Thesis.findByPk.mockResolvedValue({
        id: 10,
        student_id: 1,
        topic: 'AI Thesis',
        thesis_start_date: mockDate,
        thesis_conclusion_request_date: null,
        thesis_conclusion_confirmation_date: null,
        toJSON() {
          return this;
        },
      });

      Teacher.findByPk.mockImplementation(id => ({
        toJSON: () => ({ id, name: id === 100 ? 'Prof. X' : 'Prof. Y' }),
      }));

      await createStudentThesis(req, res);

      expect(Thesis.create).toHaveBeenCalled();
      expect(ThesisSupervisorCoSupervisor.create).toHaveBeenCalledTimes(2);
      expect(res.status).toHaveBeenCalledWith(201);
      const payload = res.json.mock.calls[0][0];
      expect(payload.topic).toBe('AI Thesis');
      expect(payload.student).toEqual({ id: 1, name: 'Test Student' });
      expect(payload.supervisor).toEqual({ id: 100, name: 'Prof. X' });
      expect(payload.co_supervisors).toEqual([{ id: 101, name: 'Prof. Y' }]);
      expect(payload.company).toEqual({ id: 1, name: 'Test Company' });
    });

    test('should create thesis without co-supervisors and company', async () => {
      const mockDate = new Date();

      LoggedStudent.findOne.mockResolvedValue({ student_id: 1 });
      Student.findByPk.mockResolvedValue({
        id: 1,
        toJSON: () => ({ id: 1, name: 'Test Student' }),
      });

      req.body = {
        topic: 'Solo Supervisor',
        thesis_application_id: 7,
        supervisor: { id: 100 },
        co_supervisors: [],
      };

      Thesis.create.mockResolvedValue({
        id: 20,
        student_id: 1,
        topic: 'Solo Supervisor',
        thesis_start_date: mockDate,
        thesis_conclusion_request_date: null,
        thesis_conclusion_confirmation_date: null,
        toJSON() {
          return this;
        },
      });

      ThesisSupervisorCoSupervisor.create.mockResolvedValue({});
      Thesis.findByPk.mockResolvedValue({
        id: 20,
        student_id: 1,
        topic: 'Solo Supervisor',
        thesis_start_date: mockDate,
        thesis_conclusion_request_date: null,
        thesis_conclusion_confirmation_date: null,
        toJSON() {
          return this;
        },
      });

      ThesisSupervisorCoSupervisor.findAll.mockResolvedValue([{ teacher_id: 100, is_supervisor: true }]);
      Teacher.findByPk.mockResolvedValue(null);
      Student.findByPk
        .mockResolvedValueOnce({ id: 1, toJSON: () => ({ id: 1, name: 'Test Student' }) })
        .mockResolvedValueOnce(null);

      await createStudentThesis(req, res);

      expect(Thesis.create).toHaveBeenCalledWith(
        expect.objectContaining({ company_id: null, topic: 'Solo Supervisor', thesis_application_id: 7 }),
        { transaction: t },
      );
      expect(ThesisSupervisorCoSupervisor.create).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(201);
      const payload = res.json.mock.calls[0][0];
      expect(payload.student).toBeNull();
      expect(payload.supervisor).toBeNull();
      expect(payload.co_supervisors).toEqual([]);
      expect(payload.company).toBeNull();
    });

    test('should return 500 on unexpected error', async () => {
      const error = new Error('DB failure');
      LoggedStudent.findOne.mockRejectedValue(error);
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await createStudentThesis(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'An error occurred while creating the thesis.' });
      consoleSpy.mockRestore();
    });
  });
});
