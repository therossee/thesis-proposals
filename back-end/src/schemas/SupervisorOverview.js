const { z } = require('zod');

const supervisorOverviewSchema = z
  .object({
    id: z.number(),
    type: z.enum(['internal', 'external']),
  })
  .transform(supervisor => ({
    id: supervisor.id,
    type: supervisor.type,
  }));

module.exports = supervisorOverviewSchema;
