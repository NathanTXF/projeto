export const PERMISSIONS = {
    // Dashboard
    VIEW_DASHBOARD: 'view_dashboard',
    CREATE_DASHBOARD: 'create_dashboard',
    EDIT_DASHBOARD: 'edit_dashboard',
    DELETE_DASHBOARD: 'delete_dashboard',

    // Visão Geral
    VIEW_OVERVIEW: 'view_overview',
    CREATE_OVERVIEW: 'create_overview',
    EDIT_OVERVIEW: 'edit_overview',
    DELETE_OVERVIEW: 'delete_overview',

    // Agenda
    VIEW_AGENDA: 'view_agenda',
    CREATE_AGENDA: 'create_agenda',
    EDIT_AGENDA: 'edit_agenda',
    DELETE_AGENDA: 'delete_agenda',

    // Relatórios
    VIEW_REPORTS: 'view_reports',
    CREATE_REPORTS: 'create_reports',
    EDIT_REPORTS: 'edit_reports',
    DELETE_REPORTS: 'delete_reports',

    // Cadastros Auxiliares
    VIEW_AUXILIARY: 'view_auxiliary',
    CREATE_AUXILIARY: 'create_auxiliary',
    EDIT_AUXILIARY: 'edit_auxiliary',
    DELETE_AUXILIARY: 'delete_auxiliary',

    // Clientes
    VIEW_CLIENTS: 'view_clients',
    CREATE_CLIENTS: 'create_clients',
    EDIT_CLIENTS: 'edit_clients',
    DELETE_CLIENTS: 'delete_clients',

    // Empréstimos (Vendas)
    VIEW_LOANS: 'view_loans',
    CREATE_LOANS: 'create_loans',
    EDIT_LOANS: 'edit_loans',
    DELETE_LOANS: 'delete_loans',

    // Comissões
    VIEW_COMMISSIONS: 'view_commissions',
    CREATE_COMMISSIONS: 'create_commissions',
    EDIT_COMMISSIONS: 'edit_commissions',
    DELETE_COMMISSIONS: 'delete_commissions',

    // Financeiro
    VIEW_FINANCIAL: 'view_financial',
    CREATE_FINANCIAL: 'create_financial',
    EDIT_FINANCIAL: 'edit_financial',
    DELETE_FINANCIAL: 'delete_financial',

    // Gestão de Metas
    VIEW_GOALS: 'view_goals',
    CREATE_GOALS: 'create_goals',
    EDIT_GOALS: 'edit_goals',
    DELETE_GOALS: 'delete_goals',

    // Empresa
    VIEW_COMPANY: 'view_company',
    CREATE_COMPANY: 'create_company',
    EDIT_COMPANY: 'edit_company',
    DELETE_COMPANY: 'delete_company',

    // Usuários
    VIEW_USERS: 'view_users',
    CREATE_USERS: 'create_users',
    EDIT_USERS: 'edit_users',
    DELETE_USERS: 'delete_users',

    // Perfis de Acesso
    VIEW_ROLES: 'view_roles',
    CREATE_ROLES: 'create_roles',
    EDIT_ROLES: 'edit_roles',
    DELETE_ROLES: 'delete_roles',

    // Auditoria
    VIEW_AUDIT: 'view_audit',
    CREATE_AUDIT: 'create_audit',
    EDIT_AUDIT: 'edit_audit',
    DELETE_AUDIT: 'delete_audit',
} as const;

export type PermissionKey = keyof typeof PERMISSIONS;
export type PermissionValue = typeof PERMISSIONS[PermissionKey];

/**
 * Helper to generate all granular permissions for a module
 */
function createModulePermissions(moduleKey: string, moduleLabel: string) {
    return [
        { id: `view_${moduleKey.toLowerCase()}`, name: `view_${moduleKey.toLowerCase()}` as PermissionValue, module: moduleKey, description: `Visualizar ${moduleLabel}` },
        { id: `create_${moduleKey.toLowerCase()}`, name: `create_${moduleKey.toLowerCase()}` as PermissionValue, module: moduleKey, description: `Salvar/Criar ${moduleLabel}` },
        { id: `edit_${moduleKey.toLowerCase()}`, name: `edit_${moduleKey.toLowerCase()}` as PermissionValue, module: moduleKey, description: `Editar ${moduleLabel}` },
        { id: `delete_${moduleKey.toLowerCase()}`, name: `delete_${moduleKey.toLowerCase()}` as PermissionValue, module: moduleKey, description: `Excluir ${moduleLabel}` },
    ];
}

/**
 * Array com todas as permissões para facilitar seeds e listagens na UI.
 */
export const ALL_PERMISSIONS: { id: string; name: PermissionValue; module: string; description: string }[] = [
    ...createModulePermissions('DASHBOARD', 'Dashboard'),
    ...createModulePermissions('OVERVIEW', 'Visão Geral'),
    ...createModulePermissions('AGENDA', 'Agenda'),
    ...createModulePermissions('REPORTS', 'Relatórios'),
    ...createModulePermissions('AUXILIARY', 'Cadastros Auxiliares'),
    ...createModulePermissions('CLIENTS', 'Clientes'),
    ...createModulePermissions('LOANS', 'Empréstimos'),
    ...createModulePermissions('COMMISSIONS', 'Comissões'),
    ...createModulePermissions('FINANCIAL', 'Financeiro'),
    ...createModulePermissions('GOALS', 'Gestão de Metas'),
    ...createModulePermissions('COMPANY', 'Empresa'),
    ...createModulePermissions('USERS', 'Usuários'),
    ...createModulePermissions('ROLES', 'Perfis de Acesso'),
    ...createModulePermissions('AUDIT', 'Auditoria'),
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
