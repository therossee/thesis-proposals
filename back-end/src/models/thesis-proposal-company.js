module.exports = (sequelize, DataTypes) => {
  const ThesisProposalCompany = sequelize.define(
    'thesis-proposal-company',
    {
      thesis_proposal_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
          model: 'thesis_proposal',
          key: 'id',
        },
      },
      company_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
          model: 'company',
          key: 'id',
        },
      },
    },
    {
      tableName: 'thesis_proposal_company',
      timestamps: false,
    },
  );
  return ThesisProposalCompany;
};
