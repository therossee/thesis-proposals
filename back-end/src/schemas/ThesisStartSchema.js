const { z } = require('zod');
const snakecaseKeys = require('snakecase-keys');
const companySchema = require('./Company');
const teacherOverviewSchema = require('./TeacherOverview');

const thesisStartSchema = z.object({
    topic: z.string(),
    supervisor: teacherOverviewSchema,
    co_supervisors: z.array(teacherOverviewSchema).default([]).nullable(),
    company: companySchema.nullable(),
    thesis_application_date: z.string().datetime(),
});

module.exports = thesisStartSchema;