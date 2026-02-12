const { z } = require('zod');

const thesisStatusSchema = z.enum([
  'ongoing',
  'conclusion_requested',
  'conclusion_approved',
  'conclusion_rejected',
  'almalaurea',
  'compiled_questionnaire',
  'final_exam',
  'final_thesis',
  'done',
]);

module.exports = thesisStatusSchema;
