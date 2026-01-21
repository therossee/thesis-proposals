require('jest');

const {
  checkStudentEligibility,
  getAllThesisApplications,
  getStatusHistoryApplication,
  cancelThesisApplication,
} = require('../../src/controllers/thesis-applications');

const {
  sequelize,
  ThesisApplication,
  Student,
  Teacher,
  ThesisApplicationSupervisorCoSupervisor,
  ThesisApplicationStatusHistory,
} = require('../../src/models');

jest.mock('../../src/models', () => ({
  sequelize: {
    query: jest.fn(),
  },
  ThesisApplication: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
  },
  Student: {
    findAll: jest.fn(),
  },
  Teacher: {
    findByPk: jest.fn(),
  },
  ThesisProposal: {
    findByPk: jest.fn(),
  },
  ThesisApplicationSupervisorCoSupervisor: {
    findAll: jest.fn(),
  },
  ThesisApplicationStatusHistory: {
    findAll: jest.fn(),
    create: jest.fn(),
  },
}));

afterEach(() => {
  jest.restoreAllMocks();
  jest.clearAllMocks();
});

describe('checkStudentEligibility', () => {
  test('should return eligible true when student has no active applications', async () => {
    const mockStudent = [{ id: '320213', first_name: 'Luca', last_name: 'Rossi' }];
    sequelize.query.mockResolvedValueOnce(mockStudent);
    ThesisApplication.findAll.mockResolvedValueOnce([]);

    const req = {};
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    await checkStudentEligibility(req, res);

    expect(res.json).toHaveBeenCalledWith({
      studentId: '320213',
      eligible: true,
    });
  });

  test('should return eligible false when student has pending application', async () => {
    const mockStudent = [{ id: '320213', first_name: 'Luca', last_name: 'Rossi' }];
    const mockApplications = [{ id: 1, student_id: '320213', status: 'pending' }];
    const mockActiveApplications = [{ id: 1, student_id: '320213', status: 'pending' }];

    sequelize.query.mockResolvedValueOnce(mockStudent);
    ThesisApplication.findAll.mockResolvedValueOnce(mockApplications).mockResolvedValueOnce(mockActiveApplications);

    const req = {};
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    await checkStudentEligibility(req, res);

    expect(res.json).toHaveBeenCalledWith({
      studentId: '320213',
      eligible: false,
    });
  });

  test('should return eligible false when student has approved application', async () => {
    const mockStudent = [{ id: '320213', first_name: 'Luca', last_name: 'Rossi' }];
    const mockApplications = [{ id: 1, student_id: '320213', status: 'approved' }];
    const mockActiveApplications = [{ id: 1, student_id: '320213', status: 'approved' }];

    sequelize.query.mockResolvedValueOnce(mockStudent);
    ThesisApplication.findAll.mockResolvedValueOnce(mockApplications).mockResolvedValueOnce(mockActiveApplications);

    const req = {};
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    await checkStudentEligibility(req, res);

    expect(res.json).toHaveBeenCalledWith({
      studentId: '320213',
      eligible: false,
    });
  });

  test('should return eligible true when student has only rejected applications', async () => {
    const mockStudent = [{ id: '320213', first_name: 'Luca', last_name: 'Rossi' }];
    const mockApplications = [{ id: 1, student_id: '320213', status: 'rejected' }];

    sequelize.query.mockResolvedValueOnce(mockStudent);
    ThesisApplication.findAll.mockResolvedValueOnce(mockApplications).mockResolvedValueOnce([]);

    const req = {};
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    await checkStudentEligibility(req, res);

    expect(res.json).toHaveBeenCalledWith({
      studentId: '320213',
      eligible: true,
    });
  });

  test('should handle error and return 500', async () => {
    sequelize.query.mockRejectedValueOnce(new Error('Database error'));

    const req = {};
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    await checkStudentEligibility(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Database error' });
  });
});

describe('getAllThesisApplications', () => {
  test('should return all thesis applications', async () => {
    const mockStudents = [
      {
        id: '320213',
        first_name: 'Luca',
        last_name: 'Rossi',
        profile_picture_url: 'https://example.com/pic.jpg',
        degree_id: 'L-08',
      },
      {
        id: '314796',
        first_name: 'Mario',
        last_name: 'Bianchi',
        profile_picture_url: 'https://example.com/pic2.jpg',
        degree_id: 'L-08',
      },
    ];

    const mockApplications = [
      {
        id: 1,
        topic: 'AI Research',
        student_id: '320213',
        thesis_proposal_id: null,
        submission_date: new Date('2024-01-15'),
        status: 'pending',
        toJSON: () => ({
          id: 1,
          topic: 'AI Research',
          student_id: '320213',
          thesis_proposal_id: null,
          submission_date: '2024-01-15T00:00:00.000Z',
          status: 'pending',
        }),
      },
    ];

    const mockTeacher = {
      id: 1,
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@polito.it',
      role: 'Professor',
      profile_url: 'https://example.com/profile',
      profile_picture_url: 'https://example.com/teacher.jpg',
      facility_short_name: 'DAUIN',
    };

    Student.findAll.mockResolvedValueOnce(mockStudents);
    ThesisApplication.findAll.mockResolvedValueOnce(mockApplications);
    ThesisApplicationSupervisorCoSupervisor.findAll.mockResolvedValueOnce([
      { thesis_application_id: 1, teacher_id: 1, is_supervisor: true },
    ]);
    Teacher.findByPk.mockResolvedValueOnce(mockTeacher);

    const req = {};
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    await getAllThesisApplications(req, res);

    expect(Student.findAll).toHaveBeenCalled();
    expect(ThesisApplication.findAll).toHaveBeenCalledWith({
      order: [['submission_date', 'DESC']],
    });
    expect(res.json).toHaveBeenCalled();
    expect(res.json.mock.calls[0][0]).toBeInstanceOf(Array);
  });

  test('should return empty array when no applications exist', async () => {
    Student.findAll.mockResolvedValueOnce([]);
    ThesisApplication.findAll.mockResolvedValueOnce([]);

    const req = {};
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    await getAllThesisApplications(req, res);

    expect(res.json).toHaveBeenCalledWith([]);
  });

  test('should handle error and return 500', async () => {
    Student.findAll.mockRejectedValueOnce(new Error('Database error'));

    const req = {};
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    await getAllThesisApplications(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Database error' });
  });
});

describe('getStatusHistoryApplication', () => {
  test('should return status history for a given application', async () => {
    const mockHistory = [
      {
        id: 1,
        thesis_application_id: 1,
        old_status: 'pending',
        new_status: 'approved',
        change_date: new Date('2024-01-20'),
        note: null,
        toJSON: () => ({
          id: 1,
          thesis_application_id: 1,
          old_status: 'pending',
          new_status: 'approved',
          change_date: '2024-01-20T00:00:00.000Z',
          note: null,
        }),
      },
    ];

    ThesisApplicationStatusHistory.findAll.mockResolvedValueOnce(mockHistory);

    const req = { query: { applicationId: '1' } };
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    await getStatusHistoryApplication(req, res);

    expect(ThesisApplicationStatusHistory.findAll).toHaveBeenCalledWith({
      where: { thesis_application_id: '1' },
      order: [['change_date', 'ASC']],
    });
    expect(res.json).toHaveBeenCalled();
  });

  test('should return 400 if applicationId is missing', async () => {
    const req = { query: {} };
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    await getStatusHistoryApplication(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing applicationId parameter' });
  });

  test('should handle error and return 500', async () => {
    ThesisApplicationStatusHistory.findAll.mockRejectedValueOnce(new Error('Database error'));

    const req = { query: { applicationId: '1' } };
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    await getStatusHistoryApplication(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Database error' });
  });
});

describe('cancelThesisApplication', () => {
  test('should cancel an application and update status', async () => {
    const mockApplication = {
      id: 1,
      status: 'pending',
      save: jest.fn().mockResolvedValue(true),
    };

    const updatedApplication = {
      id: 1,
      status: 'canceled',
      topic: 'AI Research',
    };

    ThesisApplication.findByPk.mockResolvedValueOnce(mockApplication).mockResolvedValueOnce(updatedApplication);
    ThesisApplicationStatusHistory.create.mockResolvedValueOnce({ id: 1 });

    const req = { body: { id: 1, note: 'Student request' } };
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    await cancelThesisApplication(req, res);

    expect(ThesisApplication.findByPk).toHaveBeenCalledWith(1);
    expect(ThesisApplicationStatusHistory.create).toHaveBeenCalledWith({
      thesis_application_id: 1,
      old_status: 'pending',
      new_status: 'canceled',
      note: 'Student request',
    });
    expect(mockApplication.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(updatedApplication);
  });

  test('should return 404 if application not found', async () => {
    ThesisApplication.findByPk.mockResolvedValueOnce(null);

    const req = { body: { id: 999 } };
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    await cancelThesisApplication(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Thesis application not found' });
  });

  test('should handle error and return 500', async () => {
    ThesisApplication.findByPk.mockRejectedValueOnce(new Error('Database error'));

    const req = { body: { id: 1 } };
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    await cancelThesisApplication(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
  });
});
