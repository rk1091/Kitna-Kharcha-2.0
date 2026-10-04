import { z } from 'zod';

export const importTextSchema = z.object({
  text: z.string().min(1, 'Text content is required'),
});

export type ImportTextDto = z.infer<typeof importTextSchema>;
