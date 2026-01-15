const { z } = require('zod');

const supervisorSchema = z
  .object({
    id: z.number(),
    type: z.enum(['internal', 'external']),
    first_name: z.string(),
    last_name: z.string(),
    role: z.string().nullable(),
    email: z.string().nullable(),
    profile_url: z.string().nullable(),
    facility_short_name: z.string().nullable(),
    'thesis-proposal-supervisor-cosupervisor': z
      .object({ is_supervisor: z.boolean() })
      .optional(),
    'thesis-application-supervisor-cosupervisor': z
      .object({ is_supervisor: z.boolean() })
      .optional(),
  })
  .transform(supervisor => {
    const isSupervisor =
      supervisor['thesis-proposal-supervisor-cosupervisor']?.is_supervisor ??
      supervisor['thesis-application-supervisor-cosupervisor']?.is_supervisor ??
      null;

    return {
      id: supervisor.id,
      firstName: supervisor.first_name,
      lastName: supervisor.last_name,
      type: supervisor.type,
      role: supervisor.role,
      email: supervisor.email,
      profileUrl: supervisor.profile_url,
      profilePictureUrl: supervisor.profile_picture_url,
      facilityShortName: supervisor.facility_short_name,
      isSupervisor,
    };
  });

module.exports = supervisorSchema;
