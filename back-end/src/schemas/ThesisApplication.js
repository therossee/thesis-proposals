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
    co_supervisors: z.array(teacherSchema).default([]).nullable(),
    company: z.object(companySchema).nullable(),
    thesis_proposal: z.object(thesisProposalOverviewSchema).nullable(),
    submission_date: z.string().datetime(),
    status: thesisApplicationStatusSchema,
})
.transform((application) => ({
    id: application.id,
    topic: application.topic,
    supervisor: application.supervisor,
    coSupervisors: application.co_supervisors,
    company: application.company,
    thesisProposal: application.thesis_proposal,
    submission_date: application.submission_date,
    status: application.status,
}));

module.exports = thesisApplicationSchema;
