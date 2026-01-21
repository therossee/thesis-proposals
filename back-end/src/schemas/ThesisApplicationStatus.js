const { z } = require('zod');

const thesisApplicationStatusSchema = z
  .enum(['pending', 'rejected', 'approved', 'canceled'])
  .transform(status => status);

module.exports = thesisApplicationStatusSchema;
