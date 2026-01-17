const { z } = require('zod');

// Importiamo gli schemi originali (che si aspettano snake_case)
const teacherOverviewSchema  = require('./TeacherOverview');
const companyOverviewSchema  = require('./CompanyOverview');
const thesisProposalMinimalSchema = require('./ThesisProposalMinimal');

const teacherInputAdapter = z.preprocess((input) => {
  if (!input || typeof input !== 'object') return input;
  
  return {
    id: input.id,
    first_name: input.firstName || input.first_name,
    last_name: input.lastName || input.last_name,
  };
}, teacherOverviewSchema);

const companyInputAdapter = z.preprocess((input) => {
  if (!input || typeof input !== 'object') return input;
  return {
    id: input.id,
    corporate_name: input.corporateName || input.name,
  };
}, companyOverviewSchema);



const thesisApplicationRequestSchema = z.object({
  topic: z.string(),
  description: z.string().optional(),
  supervisor: teacherInputAdapter,
  co_supervisors: z.array(teacherInputAdapter).default([]).nullable(),
  company: companyInputAdapter.nullable().optional(),
  proposal: thesisProposalMinimalSchema.nullable().optional(),
});

module.exports = thesisApplicationRequestSchema;
