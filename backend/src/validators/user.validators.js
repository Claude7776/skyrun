import { z } from 'zod';

export const updateProfileSchema = z
  .object({
    name: z.string().trim().min(2).max(60).optional(),
    email: z.string().trim().toLowerCase().email('Email invalide').optional(),
    currentPassword: z.string().min(8).optional(),
    newPassword: z
      .string()
      .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
      .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
      .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre')
      .optional(),
  })
  .refine((data) => !data.newPassword || data.currentPassword, {
    message: 'Le mot de passe actuel est requis pour le changer',
    path: ['currentPassword'],
  });
