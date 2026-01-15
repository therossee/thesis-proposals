module.exports = (sequelize, DataTypes) => {
  const ThesisApplicationCompany = sequelize.define(
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
      company_id: {
        type: DataTypes.INTEGER,
        references: {
          model: 'company',
          key: 'id',
        },
      },
    },
    {
      tableName: 'thesis_application_company',
      timestamps: false,
    },
  );
  return ThesisApplicationCompany;
};
