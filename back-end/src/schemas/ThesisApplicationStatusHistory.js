const { z } = require('zod');
const thesisApplicationStatusSchema = require('./ThesisApplicationStatus');

const thesisApplicationStatusHistorySchema = z
  .object({
    id: z.number(),
    old_status: thesisApplicationStatusSchema.nullable(),
    new_status: thesisApplicationStatusSchema,
    note: z.string().nullable(),
    change_date: z.date(),
  })
  .transform(statusHistory => ({
    id: statusHistory.id,
    oldStatus: statusHistory.old_status,
    newStatus: statusHistory.new_status,
    note: statusHistory.note,
    changeDate: statusHistory.change_date,
  }));

module.exports = thesisApplicationStatusHistorySchema;
