import { z } from 'zod';

export const uploadFileSchema = z.object({
  // Typically we'll validate file presence via Multer, but we can have a generic schema if needed.
  // In a real app we might validate metadata here.
});

export type UploadFileDto = z.infer<typeof uploadFileSchema>;
