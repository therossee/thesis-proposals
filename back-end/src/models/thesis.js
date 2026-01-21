module.exports = (sequelize, DataTypes) => {
  const Thesis = sequelize.define(
    'thesis',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      topic: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      company_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      student_id: {
        type: DataTypes.STRING(6),
        allowNull: false,
      },
      thesis_application_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      thesis_conclusion_request_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      thesis_conclusion_confirmation_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: 'thesis',
      timestamps: false,
    },
  );

  return Thesis;
};
