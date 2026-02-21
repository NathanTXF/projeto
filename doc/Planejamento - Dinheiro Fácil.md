# Planejamento Técnico: Projeto Dinheiro Fácil (MVP)

Este documento detalha a arquitetura e o plano de execução para o sistema de gestão de empréstimos consignados, seguindo princípios de **Clean Architecture** e **Domain-Driven Design (DDD)**.

## Análise de Arquitetura (Sênior View)

Para garantir escalabilidade e manutenibilidade, adotaremos uma estrutura **Modular por Domínio**. Cada módulo será independente, comunicando-se através de interfaces bem definidas.

### Camadas por Módulo
1.  **Domain**: Entidades de negócio, regras de validação puras e interfaces de repositório.
2.  **Application**: Casos de uso (UseCases), DTOs e serviços de aplicação.
3.  **Infrastructure**: Implementações concretas (Prisma Repositories), serviços externos (e-mail, logs) e drivers.
4.  **Presentation**: Componentes React, Server Actions e Route Handlers (API).

## Stack Tecnológica

- **Frontend/Backend**: Next.js 14+ (App Router)
- **Linguagem**: TypeScript (Strict Mode)
- **Banco de Dados**: PostgreSQL (via Docker)
- **ORM**: Prisma
- **Estilização**: Tailwind CSS + Shadcn UI
- **Segurança**: JWT manual + Middleware + Bcrypt
- **Validação**: Zod

## User Review Required

> [!IMPORTANT]
> **Autenticação**: Foi solicitado JWT manual. Recomendo o uso de `next-auth` para maior segurança, mas seguirei com a implementação manual conforme o requisito do MVP para controle total.
> **Horário de Acesso**: O controle de acesso por horário será implementado via Middleware para garantir que nenhum endpoint seja acessado fora do período permitido.

## Estrutura de Pastas Proposta

```text
src/
├── app/                  # Next.js App Router (Presentation/Routes)
├── modules/              # Domínios de Negócio
│   ├── clients/
│   │   ├── domain/       # Entities, Repository Interfaces
│   │   ├── application/  # UseCases, DTOs
│   │   ├── infrastructure/# Prisma Repositories
│   │   └── presentation/ # Components, Actions, UI logic
│   ├── loans/
│   ├── commissions/
│   └── users/
├── shared/               # Componentes UI, Utils, Hooks globais
├── core/                 # Auth, Error Handling, Configurações Base
└── lib/                  # Instâncias de Prisma, Clients externos
```

## Cronograma de Execução (Sprints)

Seguiremos uma abordagem Ágil, com sprints de 2 semanas cada (estimado).

### Sprint 0: Setup & Fundações (Infraestrutura)
**Objetivo**: Ambiente funcional com Auth e DB pronto.
- [x] Configuração de ambiente Isolado: `Dockerfile` e `docker-compose.yml` (PostgreSQL + App).
- [x] Inicialização Next.js 14 (App Router) + Tailwind + Shadcn UI.
- [x] Configuração Prisma: Schema inicial e Seed de Admin.
- [x] Core Auth: JWT manual, Middleware de proteção e controle de horário.
- [x] Tratamento global de erros e Logger de auditoria base.

### Sprint 1: Domínio Base & Gestão de Clientes
**Objetivo**: CRUD completo de clientes e entidades auxiliares.
- [x] Implementação de Cadastros Auxiliares (Órgão, Banco, Tipo, Grupo, Tabela).
- [x] Módulo de Clientes (Entity, UseCases, Repositories).
- [x] UI de Clientes: Listagem, Cadastro, Busca por CPF (Zod validation).
- [x] Regras de idade calculada e visualização de senha cifrada.

### Sprint 2: Operações de Empréstimos (Core)
**Objetivo**: Registro e validação de empréstimos consignados.
- [x] Módulo de Registros (Empréstimos): Lógica de negócio e persistência.
- [x] Form de Registro: Auto-complete de Clientes, Selects auxiliares.
- [x] Regras de campos obrigatórios e preenchimento automático de vendedor.
- [x] Auditoria: Logar todas as criações e edições de registros.

### Sprint 3: Fluxo de Comissões e Financeiro
**Objetivo**: Integração entre vendas e financeiro com travas de segurança.
- [x] Tela de Gestão de Comissões: Filtros por usuário/período.
- [x] Lógica de cálculo (Percentual vs Fixo) e Aprovação.
- [x] Módulo Financeiro: Status de pagamento, anexo de comprovante.
- [x] Travas de Segurança: Bloqueio de edição pós-aprovação/pagamento.

### Sprint 4: Dashboards & Polimento
**Objetivo**: Visualização de dados e auditoria final.
- [x] **Dashboard Dinâmico**: Home do sistema agora reflete dados reais (Clientes, Contratos, Comissões).
- [x] **Visualização de Desempenho**: Gráfico nativo dos top vendedores.
- [x] **Auditoria Admin**: Interface analítica para consulta de logs filtrados.
- [x] **Perfil do Usuário**: Página `/dashboard/profile` para gestão de dados e senha.
- [x] **Deploy Readiness**: Variáveis de ambiente configuradas e build otimizado.

## Plano de Verificação

### Testes Automatizados
- Validação de regras de negócio no domínio usando Vitest (unidade).
- Testes de integração para Repositories Prisma.

### Verificação Manual
- Validação dos fluxos de comissão e financeiro.
- Teste de bloqueio de acesso por horário.
- Responsividade Mobile-First em todos os módulos.
