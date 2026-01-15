const { z } = require('zod');

const teacherSchema = require('./Teacher');
const companySchema = require('./Company');
const studentSchema = require('./Student');
const thesisApplicationStatusSchema = require('./ThesisApplicationStatus');
const thesisProposalOverviewSchema = require('./ThesisProposalOverview');


const thesisApplicationSchema = z.object({
    id: z.number(),
    topic: z.string(),
    student: z.object(studentSchema),
    supervisor: z.object(teacherSchema),
    coSupervisors: z.array(teacherSchema).default([]).nullable(),
    company: z.object(companySchema).nullable(),
    proposal: z.object(thesisProposalOverviewSchema).nullable(),
    submissionDate: z.string().datetime(),
    status: thesisApplicationStatusSchema,
})
.transform((application) => ({
    id: application.id,
    topic: application.topic,
    supervisor: application.supervisor,
    coSupervisors: application.coSupervisors,
    company: application.company,
    proposal: application.proposal,
    submissionDate: application.submissionDate,
    status: application.status,
}));

module.exports = thesisApplicationSchema;
