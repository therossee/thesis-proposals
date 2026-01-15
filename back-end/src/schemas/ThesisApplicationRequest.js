const { z } = require('zod');

const supervisorOverviewSchema = require('./SupervisorOverview');
const thesisProposalOverviewSchema = require('./ThesisProposalOverview');
const studentSchema = require('./Student');

const thesisApplicationRequestSchema = z.object({
    topic: z.string(),
    student: z.object(studentSchema),
    supervisor: z.object(supervisorOverviewSchema),
    coSupervisors: z.array(supervisorOverviewSchema).default([]).nullable(),
    proposal: z.object(thesisProposalOverviewSchema).nullable(),
    companyId: z.number().nullable(),
    thesisProposal: z.object(thesisProposalOverviewSchema).nullable(),
});

module.exports = thesisApplicationRequestSchema;
