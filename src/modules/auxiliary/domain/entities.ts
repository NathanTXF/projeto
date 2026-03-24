export interface AuxiliaryEntity {
    id: number;
    nome: string;
}

export type Organ = AuxiliaryEntity;
export type Bank = AuxiliaryEntity;
export type LoanType = AuxiliaryEntity;
export type LoanGroup = AuxiliaryEntity;
export type LoanTable = AuxiliaryEntity;

export interface AuxiliaryListOptions {
    query?: string;
    sort?: 'alphabetic' | 'newest';
    page?: number;
    pageSize?: number;
}

export interface AuxiliaryPaginatedResult<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export interface AuxiliaryRepository<T> {
    findAll(): Promise<T[]>;
    findPaginated(options: AuxiliaryListOptions): Promise<AuxiliaryPaginatedResult<T>>;
    findById(id: number): Promise<T | null>;
    create(data: Omit<T, 'id'>): Promise<T>;
    update(id: number, data: Partial<T>): Promise<T>;
    delete(id: number): Promise<void>;
}
