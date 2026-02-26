import { prisma } from '@/lib/prisma';
import { Role } from '../domain/entities';
import { ALL_PERMISSIONS } from '@/lib/permissions';

export class PrismaRoleRepository {
    async syncAllPermissions() {
        for (const p of ALL_PERMISSIONS) {
            await prisma.permission.upsert({
                where: { name: p.name },
                update: { description: p.description, module: p.module },
                create: { name: p.name, description: p.description, module: p.module, id: p.id }
            });
        }
    }

    async findAll(): Promise<Role[]> {
        const roles = await prisma.role.findMany({
            include: {
                permissions: {
                    include: { permission: true }
                },
                users: {
                    select: { id: true, nome: true, usuario: true }
                },
                _count: {
                    select: { users: true }
                }
            },
            orderBy: { name: 'asc' }
        });

        return roles.map(r => ({
            id: r.id,
            name: r.name,
            description: r.description,
            createdAt: r.createdAt,
            updatedAt: r.updatedAt,
            permissions: r.permissions.map(rp => rp.permission.name),
            userCount: r._count.users,
            users: r.users
        }));
    }

    async findById(id: string): Promise<Role | null> {
        const role = await prisma.role.findUnique({
            where: { id },
            include: {
                permissions: {
                    include: { permission: true }
                },
                users: {
                    select: { id: true, nome: true, usuario: true }
                }
            }
        });

        if (!role) return null;
        return {
            id: role.id,
            name: role.name,
            description: role.description,
            createdAt: role.createdAt,
            updatedAt: role.updatedAt,
            permissions: role.permissions.map(rp => rp.permission.name),
            users: role.users
        };
    }

    async create(data: { name: string; description?: string; permissions: string[]; userIds?: string[] }): Promise<Role> {
        return prisma.$transaction(async (tx) => {
            const role = await tx.role.create({
                data: {
                    name: data.name,
                    description: data.description,
                    users: data.userIds ? {
                        connect: data.userIds.map(id => ({ id }))
                    } : undefined
                }
            });

            if (data.permissions && data.permissions.length > 0) {
                for (const permName of data.permissions) {
                    const permission = await tx.permission.findUnique({ where: { name: permName } });
                    if (permission) {
                        await tx.rolePermission.create({
                            data: {
                                roleId: role.id,
                                permissionId: permission.id
                            }
                        });
                    }
                }
            }

            return this.findById(role.id) as Promise<Role>;
        });
    }

    async update(id: string, data: { name?: string; description?: string; permissions?: string[]; userIds?: string[] }): Promise<Role> {
        return prisma.$transaction(async (tx) => {
            if (data.name || data.description !== undefined || data.userIds) {
                await tx.role.update({
                    where: { id },
                    data: {
                        name: data.name,
                        description: data.description,
                        users: data.userIds ? {
                            set: data.userIds.map(userId => ({ id: userId }))
                        } : undefined
                    }
                });
            }

            if (data.permissions) {
                await tx.rolePermission.deleteMany({ where: { roleId: id } });

                for (const permName of data.permissions) {
                    const permission = await tx.permission.findUnique({ where: { name: permName } });
                    if (permission) {
                        await tx.rolePermission.create({
                            data: {
                                roleId: id,
                                permissionId: permission.id
                            }
                        });
                    }
                }
            }

            return this.findById(id) as Promise<Role>;
        });
    }

    async delete(id: string): Promise<void> {
        await prisma.role.delete({ where: { id } });
    }
}
