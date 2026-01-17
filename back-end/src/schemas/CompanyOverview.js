const { z } = require('zod');

const companyOverviewSchema = z.object({
  id: z.number(),
  corporateName: z.string()
}).transform((company) => ({
  id: company.id,
  corporate_name: company.corporateName,
}));

module.exports = companyOverviewSchema;