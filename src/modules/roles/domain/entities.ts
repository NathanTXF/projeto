import { z } from 'zod';

export const RoleSchema = z.object({
    name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
    description: z.string().optional(),
    permissions: z.array(z.string()).min(1, 'Deve ter pelo menos uma permissão vinculada') // IDs or names of permissions
});

export type Role = {
    id: string;
    name: string;
    description?: string | null;
    createdAt: Date;
    updatedAt: Date;
    permissions?: string[]; // Array of permission names for frontend convenience
};
