module.exports = (sequelize, DataTypes) => {
  const ThesisApplicationProposal = sequelize.define(
    'thesis-application-proposal',
    {
      thesis_application_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
          model: 'thesis_application',
          key: 'id',
        },
      },
      proposal_id: {
        type: DataTypes.INTEGER,
        references: {
          model: 'thesis_proposal',
          key: 'id',
        },
      },
    },
    {
      tableName: 'thesis_application_proposal',
      timestamps: false,
    },
  );
  return ThesisApplicationProposal;
};
