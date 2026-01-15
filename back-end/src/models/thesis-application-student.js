module.exports = (sequelize, DataTypes) => {
  const ThesisApplicationStudent = sequelize.define(
    'thesis-application-student',
    {
      thesis_application_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
          model: 'thesis_application',
          key: 'id',
        },
      },
      student_id: {
        type: DataTypes.INTEGER,
        references: {
          model: 'student',
          key: 'id',
        },
      },
    },
    {
      tableName: 'thesis_application_student',
      timestamps: false,
    },
  );
  return ThesisApplicationStudent;
};
