const { z } = require('zod');

// Importiamo gli schemi originali (che si aspettano snake_case)
const teacherOverviewSchema  = require('./TeacherOverview');
const companyOverviewSchema  = require('./CompanyOverview');
const thesisProposalMinimalSchema = require('./ThesisProposalMinimal');

const thesisApplicationRequestSchema =  z.object({
  topic: z.string(),
  description: z.string().optional(),
  supervisor: teacherOverviewSchema,
  co_supervisors: z.array(teacherOverviewSchema).default([]).nullable(),
  company: companyOverviewSchema.nullable().optional(),
  thesis_proposal: thesisProposalMinimalSchema.nullable().optional(),
});

module.exports = thesisApplicationRequestSchema;
