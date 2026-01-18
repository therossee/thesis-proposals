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



const thesisApplicationRequestSchema = z.preprocess(
  (input) => {
    // Convert camelCase to snake_case
    if (input && typeof input === 'object') {
      return {
        ...input,
        thesis_proposal: input.thesisProposal || input.thesis_proposal,
        co_supervisors: input.coSupervisors || input.co_supervisors,
      };
    }
    return input;
  }, z.object({
  topic: z.string(),
  description: z.string().optional(),
  supervisor: teacherInputAdapter,
  co_supervisors: z.array(teacherInputAdapter).default([]).nullable(),
  company: companyInputAdapter.nullable().optional(),
  thesis_proposal: thesisProposalMinimalSchema.nullable().optional(),
})
.transform((request) => ({
  topic: request.topic,
  description: request.description,
  supervisor: request.supervisor,
  coSupervisors: request.co_supervisors,
  company: request.company,
  thesisProposal: request.thesis_proposal,
})));

module.exports = thesisApplicationRequestSchema;
