const { Company } = require('../models');
const companySchema = require('../schemas/Company');

const getCompanies = async (req, res) => {
  try {
    const companies = await Company.findAll({
      order: [['corporate_name', 'ASC']],
    });
    res.json(
      companies.map(company => {
        return companySchema.parse(company);
      }),
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getCompanies,
};
