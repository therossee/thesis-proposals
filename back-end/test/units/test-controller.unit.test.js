require('jest');

const { updateThesisApplicationStatus } = require('../../src/controllers/test-controller');
const {
  ThesisApplication,
  ThesisApplicationStatusHistory,
  ThesisApplicationSupervisorCoSupervisor,
  Thesis,
  ThesisSupervisorCoSupervisor,
  sequelize,
} = require('../../src/models');

jest.mock('../../src/models', () => ({
  ThesisApplication: { findByPk: jest.fn() },
  ThesisApplicationStatusHistory: { create: jest.fn() },
  ThesisApplicationSupervisorCoSupervisor: { findAll: jest.fn() },
  Thesis: { create: jest.fn() },
  ThesisSupervisorCoSupervisor: { create: jest.fn() },
  sequelize: { transaction: jest.fn() },
}));

describe('updateThesisApplicationStatus', () => {
  let req;
  let res;
  let t;

  beforeEach(() => {
    // Res mock
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    t = { commit: jest.fn(), rollback: jest.fn() };
    sequelize.transaction.mockResolvedValue(t);

    req = { body: {} };

    jest.clearAllMocks();
  });

  describe('Error cases', () => {
    test('should return 404 if application not found', async () => {
      ThesisApplication.findByPk.mockResolvedValue(null);
      req.body = { id: 1, new_status: 'pending' };

      await updateThesisApplicationStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Thesis application not found' });
    });

    test('should return 400 if new status is same as current', async () => {
      ThesisApplication.findByPk.mockResolvedValue({ id: 1, status: 'pending' });
      req.body = { id: 1, new_status: 'pending' };

      await updateThesisApplicationStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'New status must be different from the current status' });
    });

    test('should return 400 if application is closed', async () => {
      ThesisApplication.findByPk.mockResolvedValue({ id: 1, status: 'cancelled' });
      req.body = { id: 1, new_status: 'pending' };

      await updateThesisApplicationStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Cannot update a closed application' });
    });
  });

  describe('Success cases', () => {
    test('should update status and create Thesis if new status is approved', async () => {
      const application = { id: 1, status: 'pending', student_id: 10, company_id: 20, topic: 'AI', save: jest.fn() };
      ThesisApplication.findByPk.mockResolvedValue(application);
      req.body = { id: 1, new_status: 'approved' };

      ThesisApplicationSupervisorCoSupervisor.findAll.mockResolvedValue([
        { is_supervisor: true, teacher_id: 1 },
        { is_supervisor: false, teacher_id: 2 },
      ]);

      const newThesis = { id: 100 };
      Thesis.create.mockResolvedValue(newThesis);

      await updateThesisApplicationStatus(req, res);

      expect(ThesisApplicationStatusHistory.create).toHaveBeenCalledWith(
        { thesis_application_id: 1, old_status: 'pending', new_status: 'approved' },
        { transaction: t },
      );
      expect(application.save).toHaveBeenCalledWith({ transaction: t });
      expect(Thesis.create).toHaveBeenCalled();
      expect(ThesisSupervisorCoSupervisor.create).toHaveBeenCalledTimes(2);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(newThesis);
      expect(t.commit).toHaveBeenCalled();
    });

    test('should update status and return application if new status is not approved', async () => {
      const application = { id: 1, status: 'pending', save: jest.fn() };
      ThesisApplication.findByPk.mockResolvedValue(application);
      req.body = { id: 1, new_status: 'rejected' };

      await updateThesisApplicationStatus(req, res);

      expect(application.save).toHaveBeenCalledWith({ transaction: t });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(application);
      expect(t.commit).toHaveBeenCalled();
    });
  });

  describe('Unexpected errors', () => {
    test('should return 500 on database error', async () => {
      ThesisApplication.findByPk.mockRejectedValue(new Error('DB Error'));
      req.body = { id: 1, new_status: 'rejected' };

      await updateThesisApplicationStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });
});
