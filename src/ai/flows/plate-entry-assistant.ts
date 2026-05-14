'use server';
/**
 * @fileOverview An AI assistant for validating and correcting license plate formats.
 *
 * - plateEntryAssistant - A function that handles the license plate validation and correction process.
 * - PlateEntryAssistantInput - The input type for the plateEntryAssistant function.
 * - PlateEntryAssistantOutput - The return type for the plateEntryAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PlateEntryAssistantInputSchema = z.object({
  plate: z
    .string()
    .describe('The license plate string to validate and predict metadata for.'),
});
export type PlateEntryAssistantInput = z.infer<typeof PlateEntryAssistantInputSchema>;

const PlateEntryAssistantOutputSchema = z.object({
  validatedPlate: z.string().describe('The validated and potentially corrected license plate.'),
  isCorrected: z.boolean().describe('True if the plate was corrected, false otherwise.'),
  correctionMessage:
    z.string().optional().describe('A message explaining the correction if one was made.'),
  predictedVehicleMake: z
    .string()
    .optional()
    .describe('The predicted make of the vehicle based on the license plate, if discernible.'),
  isValid: z
    .boolean()
    .describe('True if the license plate is considered valid in format, false otherwise.'),
});
export type PlateEntryAssistantOutput = z.infer<typeof PlateEntryAssistantOutputSchema>;

export async function plateEntryAssistant(
  input: PlateEntryAssistantInput
): Promise<PlateEntryAssistantOutput> {
  return plateEntryAssistantFlow(input);
}

const plateEntryAssistantPrompt = ai.definePrompt({
  name: 'plateEntryAssistantPrompt',
  input: {schema: PlateEntryAssistantInputSchema},
  output: {schema: PlateEntryAssistantOutputSchema},
  prompt: `You are an expert assistant for validating and correcting vehicle license plates. Your task is to analyze the provided license plate, validate its format, suggest corrections if necessary, and attempt to predict the vehicle make.

Return your response in JSON format according to the provided schema instructions.

License Plate: {{{plate}}}

Guidance:
-   validatedPlate: If the plate is valid, return it as is. If corrections are needed, return the corrected version.
-   isCorrected: Set to true if any modification was made to the original plate.
-   correctionMessage: Provide a brief explanation of any corrections made. Omit if no correction.
-   isValid: Set to true if the plate adheres to a common license plate format after validation/correction. This means it should typically contain alphanumeric characters and adhere to a common regional pattern (e.g., AAA-DDDD, AADDDD, etc.).
-   predictedVehicleMake: Based on common license plate knowledge or patterns (e.g., specific prefixes or suffixes associated with certain manufacturers), attempt to predict the vehicle's make. If you cannot confidently determine the make, omit this field or return null.`,
});

const plateEntryAssistantFlow = ai.defineFlow(
  {
    name: 'plateEntryAssistantFlow',
    inputSchema: PlateEntryAssistantInputSchema,
    outputSchema: PlateEntryAssistantOutputSchema,
  },
  async input => {
    const {output} = await plateEntryAssistantPrompt(input);
    return output!;
  }
);
