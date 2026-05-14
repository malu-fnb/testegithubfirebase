
"use client";

import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Car, 
  DoorOpen, 
  History, 
  ShieldCheck, 
  LogOut,
  Search as SearchIcon,
  UserCircle
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';

const navItems = [
  { id: 'overview', label: 'Painel Geral', icon: LayoutDashboard },
  { id: 'employees', label: 'Funcionários', icon: Users },
  { id: 'vehicles', label: 'Veículos', icon: Car },
  { id: 'gate', label: 'Controle de Portaria', icon: DoorOpen },
  { id: 'search', label: 'Busca Global', icon: SearchIcon },
  { id: 'history', label: 'Histórico de Acessos', icon: History },
  { id: 'profile', label: 'Meu Perfil', icon: UserCircle },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeView: string;
  setActiveView: (view: string) => void;
  onLogout?: () => void;
}

export function DashboardLayout({ children, activeView, setActiveView, onLogout }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" className="border-r border-border">
        <SidebarHeader className="p-4 border-b border-border bg-primary text-primary-foreground flex flex-row items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-accent" />
          <span className="font-headline font-bold text-lg group-data-[collapsible=icon]:hidden">
            CampusGate
          </span>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Administração</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton 
                      isActive={activeView === item.id}
                      onClick={() => setActiveView(item.id)}
                      tooltip={item.label}
                    >
                      <item.icon className={activeView === item.id ? "text-accent" : "text-muted-foreground"} />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="border-t border-border p-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton 
                className="text-destructive hover:bg-destructive/10"
                onClick={onLogout}
              >
                <LogOut />
                <span>Sair</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="bg-background">
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b border-border bg-card px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex-1">
            <h1 className="font-headline font-semibold text-lg">
              {navItems.find(i => i.id === activeView)?.label || 'CampusGate Staff'}
            </h1>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground px-4">
            <span className="bg-secondary text-primary px-3 py-1 rounded-full font-medium">Acesso: Funcionário</span>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
