module.exports = (sequelize, DataTypes) => {
  const ThesisSupervisorCoSupervisor = sequelize.define(
    'thesis-supervisor-cosupervisor',
    {
      thesis_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
          model: 'thesis',
          key: 'id',
        },
      },
      teacher_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
          model: 'teacher',
          key: 'id',
        },
      },
      is_supervisor: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
    },
    {
      tableName: 'thesis_supervisor_cosupervisor',
      timestamps: false,
    },
  );
  return ThesisSupervisorCoSupervisor;
};
