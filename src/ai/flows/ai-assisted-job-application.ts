'use server';
/**
 * @fileOverview Provides an AI assistant for job applicants.
 *
 * - aiAssistedJobApplication - A function that recommends suitable job roles and generates a tailored application statement.
 * - AIAssistedJobApplicationInput - The input type for the aiAssistedJobApplication function.
 * - AIAssistedJobApplicationOutput - The return type for the aiAssistedJobApplication function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// List of available jobs from the prompt
const AVAILABLE_JOBS_LIST = [
  'Accounting Clerks/Accountants',
  'Administrative Assistants',
  'Air Hostesses/Flight Stewards/Stewardesses',
  'Architects',
  'Bakery Workers',
  'Bankers',
  'Bartenders',
  'Bookkeepers',
  'Cabin Crews/Flight Attendants',
  'Caregivers',
  'Carpenters (Construction Laborers)',
  'Cashiers',
  'Chefs',
  'Concierges',
  'Construction Laborers',
  'Customer Service Representatives',
  'Data Entry Clerks',
  'Dental Hygienists',
  'Doctors',
  'Drivers',
  'Electricians',
  'Environmental Scientists',
  'Errand Runners',
  'Event Coordinators',
  'Executive Secretaries',
  'Farmworkers',
  'Financial Advisors',
  'Financial Analysts',
  'Fish Plant Workers',
  'Food and Beverage Servers',
  'Front Desk Agents',
  'Gardeners',
  'Graphic Designers',
  'Health Educators',
  'Hospitality Managers',
  'Hostesses',
  'Hotel Front Desk Clerks',
  'Hotel Managers',
  'Hotel Valets',
  'Housekeepers',
  'Housekeeping/Cleaning Staff',
  'Human Resource Assistants',
  'Human Resource Managers',
  'Human Resource Officers',
  'Industrial Butchers and Meat Cutters',
  'Insurance Agents',
  'IT Project Managers',
  'Janitors/Caretakers',
  'Kitchen Helpers',
  'Laundry Workers',
  'Light Duty Cleaners',
  'Logistics Coordinators',
  'Machine Operators (Mechanical)',
  'Marketing Assistants/Specialists',
  'Marketing Managers',
  'Medical Assistants',
  'Medical Billers',
  'Medical Transcriptionists',
  'Motor Mechanics/Automotive Service Technicians',
  'Nannies',
  'Office Clerks and Secretaries',
  'Office Managers',
  'Parent’s helpers',
  'Parking Attendants',
  'Pet Sitters',
  'Pharmacy Technicians',
  'Plumber',
  'Poultry Production Workers',
  'Processing Equipment Cleaners',
  'Real Estate Agents',
  'Receptionists',
  'Registered Nurses',
  'Restaurant Managers',
  'Room Attendants',
  'Sales Representatives',
  'Security Guards',
  'Specialized Cleaners',
  'Store Keepers',
  'Teachers',
  'Telemarketing/Tele sales Representatives',
  'Tourism Managers',
  'Transportation Managers',
  'Travel Agents',
  'Truck Drivers',
  'Warehouse Workers',
  'Web Designers/Software Developers',
  'Welder',
  'Yard Workers/Gardeners'
];

const AIAssistedJobApplicationInputSchema = z.object({
  applicantQualifications: z.string().describe("A summary of the applicant's education, skills, and work experience."),
  desiredJobRole: z.string().optional().describe("An optional specific job role the applicant is interested in. If provided, the tailored statement will be generated for this role.")
});
export type AIAssistedJobApplicationInput = z.infer<typeof AIAssistedJobApplicationInputSchema>;

const AIAssistedJobApplicationOutputSchema = z.object({
  recommendedJobs: z.array(z.string()).describe("A list of job roles from the available jobs that are recommended for the applicant based on their qualifications."),
  tailoredStatement: z.string().describe("A compelling, tailored statement for the specified or a recommended job role, designed to be used in an application.")
});
export type AIAssistedJobApplicationOutput = z.infer<typeof AIAssistedJobApplicationOutputSchema>;

// Prompt for recommending job roles
const jobRecommendationPrompt = ai.definePrompt({
  name: 'jobRecommendationPrompt',
  input: { schema: z.object({
    qualifications: z.string(),
    availableJobs: z.array(z.string())
  }) },
  output: { schema: z.object({
    recommendedJobs: z.array(z.string()).describe("A list of job roles from the available jobs that are recommended for the applicant based on their qualifications.")
  }) },
  prompt: `You are a career advisor helping an applicant find suitable job roles.
Based on the applicant's qualifications, recommend up to 5 job roles from the provided list that are the best fit.
Output your recommendations as a JSON object with a single key 'recommendedJobs' which is an array of strings. Each string should be an exact job title from the provided list.
Do not include any other text or explanation outside the JSON.

Applicant's Qualifications:
{{{qualifications}}}

Available Job Roles:
{{#each availableJobs}}- {{{this}}}
{{/each}}`
});

// Prompt for generating a tailored statement
const tailoredStatementPrompt = ai.definePrompt({
  name: 'tailoredStatementPrompt',
  input: { schema: z.object({
    qualifications: z.string(),
    jobRole: z.string()
  }) },
  output: { schema: z.object({
    statement: z.string().describe("A compelling statement tailored for the specified job role based on the applicant's qualifications.")
  }) },
  prompt: `You are an expert resume writer. Write a concise and compelling statement (maximum 3-4 sentences) for a job application.
The statement should highlight how the applicant's qualifications make them an excellent candidate for the specific job role.
Do not start with "As an applicant..." or similar phrases. Focus on the value the applicant brings.
Output your statement as a JSON object with a single key 'statement'.
Do not include any other text or explanation outside the JSON.

Applicant's Qualifications:
{{{qualifications}}}

Target Job Role:
{{{jobRole}}}`
});

export async function aiAssistedJobApplication(input: AIAssistedJobApplicationInput): Promise<AIAssistedJobApplicationOutput> {
  return aiAssistedJobApplicationFlow(input);
}

const aiAssistedJobApplicationFlow = ai.defineFlow(
  {
    name: 'aiAssistedJobApplicationFlow',
    inputSchema: AIAssistedJobApplicationInputSchema,
    outputSchema: AIAssistedJobApplicationOutputSchema
  },
  async (input) => {
    // Step 1: Get job recommendations
    const { output: recommendationOutput } = await jobRecommendationPrompt({
      qualifications: input.applicantQualifications,
      availableJobs: AVAILABLE_JOBS_LIST
    });

    const recommendedJobs = recommendationOutput?.recommendedJobs || [];

    // Step 2: Determine which job to generate a tailored statement for
    let jobForStatement: string;
    if (input.desiredJobRole && AVAILABLE_JOBS_LIST.includes(input.desiredJobRole)) {
      jobForStatement = input.desiredJobRole;
    } else if (recommendedJobs.length > 0) {
      jobForStatement = recommendedJobs[0]; // Use the first recommended job
    } else {
      // Fallback if no desired role and no recommendations
      jobForStatement = "a suitable role in Canada";
    }

    // Step 3: Generate the tailored statement
    const { output: statementOutput } = await tailoredStatementPrompt({
      qualifications: input.applicantQualifications,
      jobRole: jobForStatement
    });

    const tailoredStatement = statementOutput?.statement || `Could not generate a tailored statement for ${jobForStatement}.`;

    return {
      recommendedJobs,
      tailoredStatement
    };
  }
);
