const { z } = require('zod');

const companySchema = z
  .object({
    id: z.number(),
    corporate_name: z.string(),
    registered_office: z
      .object({
        street: z.string(),
        city: z.string(),
        postal_code: z.string().nullable(),
        state_or_province: z.string().nullable(),
        country: z.string(),
      })
      .nullable(),
  })
  .transform(company => ({
    id: company.id,
    corporateName: company.corporate_name,
    registeredOffice: {
      street: company.registered_office?.street,
      city: company.registered_office?.city,
      postalCode: company.registered_office?.postal_code,
      stateOrProvince: company.registered_office?.state_or_province,
      country: company.registered_office?.country,
    },
  }));

module.exports = companySchema;
