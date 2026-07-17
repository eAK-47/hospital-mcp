import { Module } from '@nitrostack/core';
import { HospitalGuardianTools } from './hospital-guardian.tools.js';
import { HospitalGuardianResources } from './hospital-guardian.resources.js';
import { HospitalGuardianPrompts } from './hospital-guardian.prompts.js';

@Module({
  name: 'hospital-guardian',
  description: 'Hospital Guardian MCP Server - Patient vitals monitoring, emergency alerting, and medical brief generation',
  controllers: [HospitalGuardianTools, HospitalGuardianResources, HospitalGuardianPrompts],
})
export class HospitalGuardianModule {}