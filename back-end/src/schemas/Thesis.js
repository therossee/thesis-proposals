const { z } = require('zod');

const studentSchema = require('./Student');
const companySchema = require('./Company');
const teacherSchema = require('./Teacher');

const thesisSchema = z
  .object({
    id: z.number(),
    topic: z.string(),
    student: studentSchema,
    supervisor: teacherSchema,
    co_supervisors: z.array(teacherSchema).default([]).nullable(),
    company: companySchema.nullable(),
    thesis_application_date: z.string().datetime(),
    thesis_conclusion_request_date: z.string().datetime().nullable(),
    thesis_conclusion_confirmation_date: z.string().datetime().nullable(),
  })
  .transform(thesis => ({
    id: thesis.id,
    topic: thesis.topic,
    student: thesis.student,
    supervisor: thesis.supervisor,
    coSupervisors: thesis.co_supervisors,
    company: thesis.company,
    thesisApplicationDate: thesis.thesis_application_date,
    thesisConclusionRequestDate: thesis.thesis_conclusion_request_date,
    thesisConclusionConfirmationDate: thesis.thesis_conclusion_confirmation_date,
  }));

module.exports = thesisSchema;
