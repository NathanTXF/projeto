"use client"
import React from 'react'
import { Input } from "@/components/ui/input"

export default function ExampleDashboard() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex">
        <aside className="w-64 bg-sidebar text-sidebar-foreground p-6 stylized-scrollbar h-screen">
          <div className="mb-8">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-semibold">D</div>
          </div>
          <nav className="space-y-2">
            <a className="block py-2 px-3 rounded-md hover:bg-sidebar-border">Dashboard</a>
            <a className="block py-2 px-3 rounded-md hover:bg-sidebar-border">Clientes</a>
            <a className="block py-2 px-3 rounded-md hover:bg-sidebar-border">Empréstimos</a>
            <a className="block py-2 px-3 rounded-md hover:bg-sidebar-border">Relatórios</a>
          </nav>
        </aside>

        <main className="flex-1 p-8">
          <header className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-extrabold">Visão Geral</h1>
            <div className="flex items-center gap-4">
              <Input className="h-10" placeholder="Buscar" />
              <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground">Ações</button>
            </div>
          </header>

          <section className="grid grid-cols-3 gap-6 mb-8">
            <div className="p-6 bg-card rounded-lg shadow-card">
              <div className="text-sm text-muted mb-2">Receita (Mês)</div>
              <div className="text-2xl font-semibold">R$ 124.532</div>
            </div>
            <div className="p-6 bg-card rounded-lg shadow-card">
              <div className="text-sm text-muted mb-2">Comissões</div>
              <div className="text-2xl font-semibold">R$ 12.430</div>
            </div>
            <div className="p-6 bg-card rounded-lg shadow-card">
              <div className="text-sm text-muted mb-2">Novos Clientes</div>
              <div className="text-2xl font-semibold">124</div>
            </div>
          </section>

          <section>
            <div className="p-6 bg-card rounded-lg shadow-card">
              <h2 className="font-semibold mb-4">Resumo das últimas transações</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-sm text-muted">
                      <th className="py-2">Data</th>
                      <th className="py-2">Cliente</th>
                      <th className="py-2">Valor</th>
                      <th className="py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-border">
                      <td className="py-3">20/03/2026</td>
                      <td className="py-3">João Silva</td>
                      <td className="py-3">R$ 3.200</td>
                      <td className="py-3 text-green-600">Concluído</td>
                    </tr>
                    <tr className="border-t border-border">
                      <td className="py-3">19/03/2026</td>
                      <td className="py-3">Maria Souza</td>
                      <td className="py-3">R$ 1.200</td>
                      <td className="py-3 text-yellow-600">Pendente</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
