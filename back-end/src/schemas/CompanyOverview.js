const { z } = require('zod');

const companyOverviewSchema = z.object({
  id: z.number(),
  corporateName: z.string()
}).transform((company) => ({
  id: company.id,
  corporateName: company.corporateName,
}));

module.exports = companyOverviewSchema;