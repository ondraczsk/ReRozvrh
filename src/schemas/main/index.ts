import * as z from 'zod';
export const KOSAuthSchema = z.object({
    username: z.string().min(1, {
        message: "Zadejte platné uživatelské jméno do KOSu.",
      }),
    password: z.string().min(1, {
      message: "Zadejte platné heslo do KOSu.",
    }),
  });