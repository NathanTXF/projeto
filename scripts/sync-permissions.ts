import { PrismaClient } from '@prisma/client';
import { ALL_PERMISSIONS } from '../src/lib/permissions';

const prisma = new PrismaClient();

async function main() {
    console.log('Iniciando sincronização de permissões...');

    for (const perm of ALL_PERMISSIONS) {
        await prisma.permission.upsert({
            where: { name: perm.name },
            update: {
                module: perm.module,
                description: perm.description,
            },
            create: {
                name: perm.name,
                module: perm.module,
                description: perm.description,
            },
        });
    }

    console.log(`Sincronizadas ${ALL_PERMISSIONS.length} permissões.`);

    // Mapping old permissions to new ones to preserve access
    const mapping: Record<string, string[]> = {
        'manage_users': ['view_users', 'create_users', 'edit_users', 'delete_users'],
        'manage_roles': ['view_roles', 'create_roles', 'edit_roles', 'delete_roles'],
        'manage_commissions': ['view_commissions', 'create_commissions', 'edit_commissions', 'delete_commissions'],
        'manage_financial': ['view_financial', 'create_financial', 'edit_financial', 'delete_financial'],
        'manage_agenda': ['view_agenda', 'create_agenda', 'edit_agenda', 'delete_agenda'],
        'manage_auxiliary': ['view_auxiliary', 'create_auxiliary', 'edit_auxiliary', 'delete_auxiliary'],
        'manage_settings': ['view_company', 'create_company', 'edit_company', 'delete_company', 'view_goals', 'create_goals', 'edit_goals', 'delete_goals'],
        // Simple 1:1 mappings for view_
        'view_dashboard': ['view_dashboard'],
        'view_clients': ['view_clients'],
        'create_clients': ['create_clients'],
        'edit_clients': ['edit_clients'],
        'delete_clients': ['delete_clients'],
        'view_loans': ['view_loans'],
        'create_loans': ['create_loans'],
        'edit_loans': ['edit_loans'],
        'view_commissions': ['view_commissions'],
        'view_financial': ['view_financial'],
        'view_agenda': ['view_agenda'],
        'view_audit': ['view_audit'],
    };

    console.log('Expandindo permissões existentes nos perfis...');

    const roles = await prisma.role.findMany({
        include: { permissions: { include: { permission: true } } }
    });

    for (const role of roles) {
        const currentPermNames = role.permissions.map(rp => rp.permission.name);
        const newPermNames = new Set<string>();

        for (const oldPerm of currentPermNames) {
            if (mapping[oldPerm]) {
                mapping[oldPerm].forEach(p => newPermNames.add(p));
            }
        }

        if (newPermNames.size > 0) {
            console.log(`Atualizando perfil: ${role.name} (+${newPermNames.size} novas permissões)`);

            for (const newPerm of newPermNames) {
                const permObj = await prisma.permission.findUnique({ where: { name: newPerm } });
                if (permObj) {
                    await prisma.rolePermission.upsert({
                        where: {
                            roleId_permissionId: {
                                roleId: role.id,
                                permissionId: permObj.id
                            }
                        },
                        update: {},
                        create: {
                            roleId: role.id,
                            permissionId: permObj.id
                        }
                    });
                }
            }
        }
    }

    console.log('Sincronização concluída com sucesso!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
