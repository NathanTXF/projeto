export const PERMISSIONS = {
    // Dashboard (Visão Geral)
    VIEW_DASHBOARD: 'view_dashboard',

    // Usuários & Perfis
    MANAGE_USERS: 'manage_users',
    MANAGE_ROLES: 'manage_roles',

    // Clientes
    VIEW_CLIENTS: 'view_clients',
    CREATE_CLIENTS: 'create_clients',
    EDIT_CLIENTS: 'edit_clients',
    DELETE_CLIENTS: 'delete_clients',

    // Empréstimos (Vendas)
    VIEW_LOANS: 'view_loans',
    CREATE_LOANS: 'create_loans',
    EDIT_LOANS: 'edit_loans',

    // Comissões
    VIEW_COMMISSIONS: 'view_commissions',
    MANAGE_COMMISSIONS: 'manage_commissions', // Aprovar/Editar valor

    // Financeiro
    VIEW_FINANCIAL: 'view_financial',
    MANAGE_FINANCIAL: 'manage_financial', // Registrar pagamentos

    // Agenda
    VIEW_AGENDA: 'view_agenda',
    MANAGE_AGENDA: 'manage_agenda',

    // Auditoria
    VIEW_AUDIT: 'view_audit',

    // Cadastros Auxiliares (Bancos, Tabelas, Órgãos)
    MANAGE_AUXILIARY: 'manage_auxiliary',

    // Configurações Globais
    MANAGE_SETTINGS: 'manage_settings',
} as const;

export type PermissionKey = keyof typeof PERMISSIONS;
export type PermissionValue = typeof PERMISSIONS[PermissionKey];

/**
 * Array com todas as permissões para facilitar seeds e listagens na UI.
 */
export const ALL_PERMISSIONS: { id: string; name: PermissionValue; module: string; description: string }[] = [
    { id: '1', name: PERMISSIONS.VIEW_DASHBOARD, module: 'DASHBOARD', description: 'Visão geral de métricas do sistema' },

    { id: '2', name: PERMISSIONS.MANAGE_USERS, module: 'USERS', description: 'Criar, editar e excluir usuários' },
    { id: '3', name: PERMISSIONS.MANAGE_ROLES, module: 'ROLES', description: 'Gerenciar perfis de acesso e permissões' },

    { id: '4', name: PERMISSIONS.VIEW_CLIENTS, module: 'CLIENTS', description: 'Visualizar listagem de clientes' },
    { id: '5', name: PERMISSIONS.CREATE_CLIENTS, module: 'CLIENTS', description: 'Cadastrar novos clientes' },
    { id: '6', name: PERMISSIONS.EDIT_CLIENTS, module: 'CLIENTS', description: 'Editar dados de clientes existentes' },
    { id: '7', name: PERMISSIONS.DELETE_CLIENTS, module: 'CLIENTS', description: 'Excluir clientes do sistema' },

    { id: '8', name: PERMISSIONS.VIEW_LOANS, module: 'LOANS', description: 'Visualizar lista de empréstimos' },
    { id: '9', name: PERMISSIONS.CREATE_LOANS, module: 'LOANS', description: 'Registrar novos empréstimos' },
    { id: '10', name: PERMISSIONS.EDIT_LOANS, module: 'LOANS', description: 'Editar ou cancelar empréstimos' },

    { id: '11', name: PERMISSIONS.VIEW_COMMISSIONS, module: 'COMMISSIONS', description: 'Visualizar cálculo de comissões' },
    { id: '12', name: PERMISSIONS.MANAGE_COMMISSIONS, module: 'COMMISSIONS', description: 'Aprovar e modificar comissões' },

    { id: '13', name: PERMISSIONS.VIEW_FINANCIAL, module: 'FINANCIAL', description: 'Visualizar painel financeiro' },
    { id: '14', name: PERMISSIONS.MANAGE_FINANCIAL, module: 'FINANCIAL', description: 'Efetuar pagamentos a vendedores' },

    { id: '15', name: PERMISSIONS.VIEW_AGENDA, module: 'AGENDA', description: 'Visualizar calendário e compromissos' },
    { id: '16', name: PERMISSIONS.MANAGE_AGENDA, module: 'AGENDA', description: 'Criar e editar compromissos' },

    { id: '17', name: PERMISSIONS.VIEW_AUDIT, module: 'AUDIT', description: 'Visualizar logs do sistema (rastreabilidade)' },

    { id: '18', name: PERMISSIONS.MANAGE_AUXILIARY, module: 'AUXILIARY', description: 'Gerenciar bancos, convênios, tabelas' },
    { id: '19', name: PERMISSIONS.MANAGE_SETTINGS, module: 'SETTINGS', description: 'Acesso às configurações globais' },
];

/**
 * Função utilitária (para usar em componentes Server Side) que valida se o array logado contém a permissão.
 */
export function hasPermission(userPermissions: string[], requiredPermission: PermissionValue): boolean {
    if (!userPermissions || !Array.isArray(userPermissions)) return false;
    return userPermissions.includes(requiredPermission);
}

/**
 * Função utilitária para checar múltiplas permissões (Ex: tem que ter pelo menos uma dessas)
 */
export function hasAnyPermission(userPermissions: string[], requiredPermissions: PermissionValue[]): boolean {
    if (!userPermissions || !Array.isArray(userPermissions)) return false;
    return requiredPermissions.some(perm => userPermissions.includes(perm));
}
