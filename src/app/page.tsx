"use client";

import React, { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  UserPlus,
  CarFront,
  ArrowUpRight,
  ArrowDownLeft,
  Trash2,
  Search,
  Info,
  History,
  DoorOpen,
  UserCircle,
  LogIn,
  UserCheck,
  ShieldAlert,
  KeyRound,
  LogOut,
  Phone,
  Mail,
  Fingerprint
} from 'lucide-react';
import {
  initialEmployees,
  initialVehicles,
  initialLogs,
  type Employee,
  type Vehicle,
  type AccessLog
} from '@/lib/mock-db';
import { useToast } from '@/hooks/use-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

interface GatekeeperData {
  name: string;
  phone: string;
  email: string;
  cpf: string;
}

export default function CampusGateApp() {
  const { toast } = useToast();
  const [activeView, setActiveView] = useState('overview');

  // Auth States
  const [gatekeeper, setGatekeeper] = useState<GatekeeperData | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Login Form
  const [loginInput, setLoginInput] = useState('');

  // Register Form
  const [regForm, setRegForm] = useState({
    name: '',
    phone: '',
    email: '',
    cpf: '',
    password: '',
    confirmPassword: ''
  });

  // App Data States
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [logs, setLogs] = useState<AccessLog[]>(initialLogs);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');

  // Gate Terminal States
  const [entryPlate, setEntryPlate] = useState('');
  const [exitPlate, setExitPlate] = useState('');

  // Registration States
  const [newEmployee, setNewEmployee] = useState({ name: '', department: '', ra: '', email: '', phone: '' });
  const [newVehicle, setNewVehicle] = useState({ ownerRa: '', plate: '', make: '', model: '', color: '' });

  // Computed data
  const filteredEmployees = useMemo(() => {
    return employees.filter(e =>
        e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.ra.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [employees, searchQuery]);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v =>
        v.plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employees.find(e => e.id === v.ownerId)?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [vehicles, employees, searchQuery]);

  const stats = useMemo(() => {
    const activeEntries = logs.filter(l => l.type === 'entry').length;
    const activeExits = logs.filter(l => l.type === 'exit').length;
    return {
      currentOccupancy: Math.max(0, activeEntries - activeExits),
      totalEmployees: employees.length,
      totalVehicles: vehicles.length
    };
  }, [logs, employees, vehicles]);


  const showSuccessToast = (title: string, description: string) => {
    toast({
      title,
      description,
      className: "border-green-600 bg-green-50 text-green-900",
    });
  };

  // Auth Actions
  const handleLogin = () => {
    if (loginInput.trim().length < 3) {
      toast({
        variant: "destructive",
        title: "Erro de Identificação",
        description: "Por favor, insira seu nome completo."
      });
      return;
    }
    // Mock login persistent data
    setGatekeeper({
      name: loginInput,
      phone: '(11) 99999-8888',
      email: `${loginInput.toLowerCase().replace(/\s/g, '.')}@campusgate.com`,
      cpf: '000.111.222-33'
    });
    showSuccessToast("Bem-vindo!", `Plantão iniciado por ${loginInput}`);
  };

  const handleRegister = () => {
    const { name, email, cpf, password, confirmPassword, phone } = regForm;

    if (!name || !email || !cpf || !password) {
      toast({ variant: "destructive", title: "Campos vazios", description: "Preencha todos os campos obrigatórios." });
      return;
    }

    if (password !== confirmPassword) {
      toast({ variant: "destructive", title: "Senhas divergentes", description: "A confirmação de senha não coincide." });
      return;
    }

    setGatekeeper({ name, phone, email, cpf });
    showSuccessToast("Cadastro realizado", "Conta de porteiro criada com sucesso!");
  };

  const handleLogout = () => {
    setGatekeeper(null);
    setLoginInput('');
    setRegForm({ name: '', phone: '', email: '', cpf: '', password: '', confirmPassword: '' });
    setActiveView('overview');
  };

  // App Actions
  const handleAddEmployee = () => {
    if (!newEmployee.name || !newEmployee.ra) {
      toast({ variant: "destructive", title: "Erro no cadastro", description: "Nome e RA são obrigatórios." });
      return;
    }
    const employee = { ...newEmployee, id: Date.now().toString() };
    setEmployees([...employees, employee]);
    setNewEmployee({ name: '', department: '', ra: '', email: '', phone: '' });
    showSuccessToast("Sucesso", "Funcionário cadastrado!");
  };

  const handleAddVehicle = () => {
    if (!newVehicle.ownerRa || !newVehicle.plate) {
      toast({
        variant: "destructive",
        title: "Dados incompletos",
        description: "Informe o RA do proprietário e a placa do veículo.",
      });
      return;
    }

    const owner = employees.find(
        (e) => e.ra.toUpperCase() === newVehicle.ownerRa.toUpperCase(),
    );

    if (!owner) {
      toast({
        variant: "destructive",
        title: "RA não encontrado",
        description: "Nenhum funcionário cadastrado com este RA.",
      });
      return;
    }

    const vehicle = {
      id: `v-${Date.now()}`,
      ownerId: owner.id,
      plate: newVehicle.plate.toUpperCase().replace(/[^A-Z0-9]/g, ''),
      make: newVehicle.make || 'Desconhecido',
      model: newVehicle.model || 'Desconhecido',
      color: newVehicle.color || 'Desconhecida',
    };

    setVehicles([...vehicles, vehicle]);
    setNewVehicle({ ownerRa: '', plate: '', make: '', model: '', color: '' });

    showSuccessToast(
        "Sucesso",
        `Veículo ${vehicle.plate} vinculado a ${owner.name}`,
    );
  };

  const handleDeleteEmployee = async (employeeId: string) => {
    const employee = employees.find((e) => e.id === employeeId);

    if (!employee) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/employees/${employeeId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);

        toast({
          variant: 'destructive',
          title: 'Erro ao excluir funcionário',
          description:
              error?.message ||
              'Não foi possível remover o funcionário do banco de dados.',
        });

        return;
      }

      const employeeVehicles = vehicles.filter((v) => v.ownerId === employeeId);
      const employeeVehiclePlates = employeeVehicles.map((v) => v.plate);

      setEmployees((current) => current.filter((e) => e.id !== employeeId));
      setVehicles((current) => current.filter((v) => v.ownerId !== employeeId));
      setLogs((current) =>
          current.filter((log) => !employeeVehiclePlates.includes(log.vehiclePlate)),
      );

      showSuccessToast(
          'Funcionário excluído',
          `${employee.name} foi removido do sistema.`,
      );
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro de conexão',
        description: 'Não foi possível conectar ao backend.',
      });
    }
  };

  const handleDeleteVehicle = async (vehicleId: string) => {
    const vehicle = vehicles.find((v) => v.id === vehicleId);

    if (!vehicle) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/vehicles/${vehicleId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);

        toast({
          variant: 'destructive',
          title: 'Erro ao excluir veículo',
          description:
              error?.message ||
              'Não foi possível remover o veículo do banco de dados.',
        });

        return;
      }

      setVehicles((current) => current.filter((v) => v.id !== vehicleId));
      setLogs((current) =>
          current.filter((log) => log.vehiclePlate !== vehicle.plate),
      );

      showSuccessToast(
          'Veículo excluído',
          `O veículo ${vehicle.plate} foi removido da frota.`,
      );
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro de conexão',
        description: 'Não foi possível conectar ao backend.',
      });
    }
  };

  const handleGateAction = (plate: string, type: 'entry' | 'exit') => {
    const cleanPlate = plate.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const vehicle = vehicles.find(v => v.plate.toUpperCase().replace(/[^A-Z0-9]/g, '') === cleanPlate);

    if (!vehicle) {
      toast({ variant: "destructive", title: "Não autorizado", description: `Placa ${plate} não encontrada.` });
      return;
    }

    const owner = employees.find(e => e.id === vehicle.ownerId);
    const newLog: AccessLog = {
      id: `l-${Date.now()}`,
      vehiclePlate: vehicle.plate,
      type,
      timestamp: new Date(),
      ownerName: owner?.name || 'Visitante',
      gatekeeperName: gatekeeper?.name || 'Sistema'
    };

    setLogs([newLog, ...logs]);
    if (type === 'entry') setEntryPlate(''); else setExitPlate('');

    showSuccessToast(
        type === 'entry' ? "Entrada Liberada" : "Saída Liberada",
        `Veículo ${vehicle.plate} (${owner?.name})`,
    );
  };

  if (!gatekeeper) {
    return (
        <div className="min-h-screen bg-muted flex items-center justify-center p-4">
          <Card className="w-full max-w-md shadow-xl border-t-4 border-t-primary">
            <CardHeader className="text-center space-y-1">
              <div className="flex justify-center mb-4">
                <div className="bg-primary p-3 rounded-full shadow-lg">
                  <DoorOpen className="h-8 w-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl">
                {authMode === 'login' ? 'Acesso CampusGate' : 'Cadastro de Porteiro'}
              </CardTitle>
              <CardDescription>
                {authMode === 'login'
                    ? 'Identifique o porteiro responsável pelo turno'
                    : 'Crie uma nova conta de acesso ao sistema'}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 pt-4">
              {authMode === 'login' ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="gatekeeper">Nome Completo</Label>
                      <Input
                          id="gatekeeper"
                          placeholder="Digite seu nome completo"
                          value={loginInput}
                          onChange={(e) => setLoginInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Senha</Label>
                      <Input id="password" type="password" placeholder="••••••••" />
                    </div>
                    <Button className="w-full bg-accent hover:bg-accent/90" onClick={handleLogin}>
                      <LogIn className="mr-2 h-4 w-4" /> Entrar no Plantão
                    </Button>
                  </div>
              ) : (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label>Nome Completo</Label>
                      <Input
                          placeholder="Digite seu nome"
                          value={regForm.name}
                          onChange={e => setRegForm({...regForm, name: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label>Celular</Label>
                        <Input
                            placeholder="(00) 00000-0000"
                            value={regForm.phone}
                            onChange={e => setRegForm({...regForm, phone: e.target.value})}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>CPF</Label>
                        <Input
                            placeholder="000.000.000-00"
                            value={regForm.cpf}
                            onChange={e => setRegForm({...regForm, cpf: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label>E-mail</Label>
                      <Input
                          type="email"
                          placeholder="email@institucional.edu"
                          value={regForm.email}
                          onChange={e => setRegForm({...regForm, email: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Senha</Label>
                      <Input
                          type="password"
                          placeholder="Crie uma senha"
                          value={regForm.password}
                          onChange={e => setRegForm({...regForm, password: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Confirmar Senha</Label>
                      <Input
                          type="password"
                          placeholder="Repita a senha"
                          value={regForm.confirmPassword}
                          onChange={e => setRegForm({...regForm, confirmPassword: e.target.value})}
                      />
                    </div>
                    <Button className="w-full bg-accent hover:bg-accent/90 mt-4" onClick={handleRegister}>
                      <UserCheck className="mr-2 h-4 w-4" /> Finalizar Cadastro
                    </Button>
                  </div>
              )}
            </CardContent>

            <CardFooter className="flex flex-col gap-2">
              <Button
                  variant="link"
                  className="text-xs text-muted-foreground"
                  onClick={() => {
                    setAuthMode(authMode === 'login' ? 'register' : 'login');
                    setLoginInput('');
                  }}
              >
                {authMode === 'login' ? 'Não possui conta? Cadastre-se' : 'Já possui conta? Faça Login'}
              </Button>
              <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                <ShieldAlert className="h-3 w-3" /> Sistema de Auditoria Interna
              </div>
            </CardFooter>
          </Card>
        </div>
    );
  }

  return (
      <DashboardLayout
          activeView={activeView}
          setActiveView={setActiveView}
      >
        <div className="space-y-6 max-w-7xl mx-auto">

          {activeView === 'overview' && (
              <div className="grid gap-6">
                <div className="flex items-center justify-between bg-white p-4 rounded-lg border shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="bg-secondary p-2 rounded-full">
                      <UserCircle className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-tight">Porteiro em Turno</p>
                      <p className="text-sm font-bold text-primary">{gatekeeper.name}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="border-l-4 border-l-accent shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Pátio Atual</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{stats.currentOccupancy} <span className="text-sm font-normal text-muted-foreground">veículos</span></div>
                    </CardContent>
                  </Card>
                  <Card className="border-l-4 border-l-primary shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Funcionários Ativos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{stats.totalEmployees}</div>
                    </CardContent>
                  </Card>
                  <Card className="shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Frota Total</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{stats.totalVehicles}</div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <History className="h-5 w-5 text-accent" />
                        Últimas Movimentações
                      </CardTitle>
                      <CardDescription>Fluxo recente processado neste terminal</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {logs.slice(0, 5).map((log) => (
                            <div key={log.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full ${log.type === 'entry' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                  {log.type === 'entry' ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                                </div>
                                <div>
                                  <p className="font-bold font-mono text-sm tracking-widest">{log.vehiclePlate}</p>
                                  <p className="text-[10px] text-muted-foreground uppercase">{log.ownerName}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <Badge variant="outline" className={`text-[10px] ${log.type === 'entry' ? 'border-green-600 text-green-700' : 'border-orange-600 text-orange-700'}`}>
                                  {log.type === 'entry' ? 'ENTRADA' : 'SAÍDA'}
                                </Badge>
                                <p className="text-[9px] text-muted-foreground mt-1">{log.timestamp.toLocaleTimeString()}</p>
                              </div>
                            </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <UserPlus className="h-5 w-5 text-accent" />
                        Atalhos do Sistema
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                      <Button variant="outline" className="h-24 flex flex-col gap-2 border-primary/20 hover:border-primary hover:bg-primary/5" onClick={() => setActiveView('employees')}>
                        <UserPlus className="h-6 w-6 text-primary" />
                        Novo Funcionário
                      </Button>
                      <Button variant="outline" className="h-24 flex flex-col gap-2 border-accent/20 hover:border-accent hover:bg-accent/5" onClick={() => setActiveView('vehicles')}>
                        <CarFront className="h-6 w-6 text-accent" />
                        Novo Veículo
                      </Button>
                      <Button variant="outline" className="h-24 flex flex-col gap-2 border-primary/20 hover:border-primary hover:bg-primary/5" onClick={() => setActiveView('gate')}>
                        <DoorOpen className="h-6 w-6 text-primary" />
                        Portaria Direta
                      </Button>
                      <Button variant="outline" className="h-24 flex flex-col gap-2 border-accent/20 hover:border-accent hover:bg-accent/5" onClick={() => setActiveView('profile')}>
                        <UserCircle className="h-6 w-6 text-accent" />
                        Meu Perfil
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
          )}

          {activeView === 'profile' && (
              <div className="max-w-4xl mx-auto space-y-6">
                <Card className="overflow-hidden">
                  <div className="h-32 bg-primary relative">
                    <div className="absolute -bottom-12 left-8">
                      <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                        <AvatarImage src={`https://picsum.photos/seed/${gatekeeper.name}/200`} />
                        <AvatarFallback className="text-xl bg-accent text-white">{gatekeeper.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                  <CardHeader className="pt-16 pb-4 px-8">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-2xl font-bold">{gatekeeper.name}</CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <ShieldAlert className="h-3 w-3" /> Operador de Portaria • Turno Ativo
                        </CardDescription>
                      </div>
                      <Button variant="outline" size="sm" onClick={handleLogout} className="text-destructive border-destructive hover:bg-destructive/10">
                        <LogOut className="h-4 w-4 mr-2" /> Sair do Sistema
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="px-8 pb-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 p-3 border rounded-xl bg-muted/20">
                          <Fingerprint className="h-5 w-5 text-primary" />
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold">CPF</p>
                            <p className="text-sm font-medium">{gatekeeper.cpf}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 border rounded-xl bg-muted/20">
                          <Phone className="h-5 w-5 text-primary" />
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold">Celular</p>
                            <p className="text-sm font-medium">{gatekeeper.phone}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 border rounded-xl bg-muted/20">
                          <Mail className="h-5 w-5 text-primary" />
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold">E-mail</p>
                            <p className="text-sm font-medium">{gatekeeper.email}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4 p-6 border rounded-2xl bg-secondary/10 border-accent/20">
                        <h3 className="font-bold flex items-center gap-2 text-primary">
                          <KeyRound className="h-4 w-4 text-accent" />
                          Segurança da Conta
                        </h3>
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Nova Senha</Label>
                            <Input type="password" placeholder="••••••••" className="bg-white" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Confirmar Nova Senha</Label>
                            <Input type="password" placeholder="••••••••" className="bg-white" />
                          </div>
                          <Button className="w-full bg-accent hover:bg-accent/90 mt-2" size="sm">
                            Atualizar Senha
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
          )}

          {activeView === 'employees' && (
              <div className="space-y-6">
                <Card className="border-primary/20">
                  <CardHeader>
                    <CardTitle>Cadastro de Funcionário</CardTitle>
                    <CardDescription>Registre o funcionário da universidade através do seu RA.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Nome Completo</Label>
                        <Input value={newEmployee.name} onChange={e => setNewEmployee({...newEmployee, name: e.target.value})} placeholder="Ex: João da Silva" />
                      </div>
                      <div className="space-y-2">
                        <Label>RA (Registro Administrativo)</Label>
                        <Input value={newEmployee.ra} onChange={e => setNewEmployee({...newEmployee, ra: e.target.value})} placeholder="Ex: RA24001" />
                      </div>
                      <div className="space-y-2">
                        <Label>Departamento</Label>
                        <Input value={newEmployee.department} onChange={e => setNewEmployee({...newEmployee, department: e.target.value})} placeholder="Ex: Biblioteca" />
                      </div>
                      <div className="space-y-2">
                        <Label>E-mail Corporativo</Label>
                        <Input value={newEmployee.email} onChange={e => setNewEmployee({...newEmployee, email: e.target.value})} placeholder="joao@uni.edu" />
                      </div>
                      <div className="space-y-2">
                        <Label>Telefone</Label>
                        <Input value={newEmployee.phone} onChange={e => setNewEmployee({...newEmployee, phone: e.target.value})} placeholder="(11) 90000-0000" />
                      </div>
                      <div className="flex items-end">
                        <Button className="w-full bg-accent hover:bg-accent/90" onClick={handleAddEmployee}>
                          <UserPlus className="mr-2 h-4 w-4" /> Cadastrar Funcionário
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Diretório de Funcionários</CardTitle>
                      <CardDescription>Gerencie o acesso através do RA universitário.</CardDescription>
                    </div>
                    <div className="relative w-72">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Buscar por RA ou Nome..." className="pl-10 h-10" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/30">
                          <TableHead className="w-24">RA</TableHead>
                          <TableHead>Nome</TableHead>
                          <TableHead>Departamento</TableHead>
                          <TableHead>E-mail</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredEmployees.map(emp => (
                            <TableRow key={emp.id} className="hover:bg-muted/10">
                              <TableCell className="font-mono font-bold text-primary">{emp.ra}</TableCell>
                              <TableCell className="font-medium">{emp.name}</TableCell>
                              <TableCell>{emp.department}</TableCell>
                              <TableCell className="text-xs">{emp.email}</TableCell>
                              <TableCell className="text-right">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive hover:bg-destructive/10"
                                    onClick={() => handleDeleteEmployee(emp.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
          )}

          {activeView === 'vehicles' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="border-accent/20">
                    <CardHeader>
                      <CardTitle>Vincular Novo Veículo</CardTitle>
                      <CardDescription>Associe um automóvel ao proprietário pelo RA.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>RA do Proprietário (Funcionário)</Label>
                        <Input
                            placeholder="Ex: RA2024001"
                            value={newVehicle.ownerRa}
                            onChange={(e) => setNewVehicle({...newVehicle, ownerRa: e.target.value.toUpperCase()})}
                        />
                        <p className="text-[10px] text-muted-foreground italic">Dica: Digite o RA cadastrado no diretório de funcionários.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Placa do Veículo</Label>
                          <Input
                              value={newVehicle.plate}
                              onChange={(e) =>
                                  setNewVehicle({
                                    ...newVehicle,
                                    plate: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''),
                                  })
                              }
                              placeholder="Ex: ABC1234 ou ABC1D23"
                              maxLength={7}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Marca</Label>
                          <Input
                              value={newVehicle.make}
                              onChange={(e) => setNewVehicle({ ...newVehicle, make: e.target.value })}
                              placeholder="Ex: Toyota"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Modelo</Label>
                          <Input
                              value={newVehicle.model}
                              onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                              placeholder="Ex: Corolla"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Cor Predominante</Label>
                          <Input
                              value={newVehicle.color}
                              onChange={(e) => setNewVehicle({ ...newVehicle, color: e.target.value })}
                              placeholder="Ex: Prata Metálico"
                          />
                        </div>
                      </div>

                      <Button
                          className="w-full bg-primary"
                          onClick={handleAddVehicle}
                          disabled={!newVehicle.ownerRa || !newVehicle.plate}
                      >
                        <CarFront className="mr-2 h-4 w-4" /> Registrar na Frota
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Frota Autorizada</CardTitle>
                      <CardDescription>Lista de veículos registrados no Campus.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Filtrar por placa ou proprietário..." className="pl-10" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                      </div>
                      <div className="border rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader className="bg-muted/50">
                            <TableRow>
                              <TableHead>Placa</TableHead>
                              <TableHead>Dono (RA)</TableHead>
                              <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredVehicles.map(v => (
                                <TableRow key={v.id}>
                                  <TableCell className="font-mono font-bold text-primary tracking-widest">{v.plate}</TableCell>
                                  <TableCell className="text-xs">
                                    {employees.find(e => e.id === v.ownerId)?.name}
                                    <span className="text-muted-foreground ml-1">({employees.find(e => e.id === v.ownerId)?.ra})</span>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-destructive hover:bg-destructive/10"
                                        onClick={() => handleDeleteVehicle(v.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
          )}

          {activeView === 'gate' && (
              <div className="max-w-4xl mx-auto space-y-6">
                <Card className="border-accent shadow-lg border-2">
                  <CardHeader className="text-center pb-2">
                    <CardTitle className="text-2xl font-bold flex items-center justify-center gap-3">
                      <div className="bg-accent p-2 rounded-lg"><DoorOpen className="h-6 w-6 text-white" /></div>
                      Terminal de Controle
                    </CardTitle>
                    <CardDescription className="text-xs font-medium uppercase tracking-widest text-primary pt-2">Operador Atual: {gatekeeper.name}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6">
                      <div className="space-y-4 p-6 border-2 border-dashed rounded-2xl bg-green-50/20 border-green-200">
                        <div className="flex items-center gap-2 text-green-700 font-bold text-sm mb-4">
                          <ArrowDownLeft className="h-5 w-5" /> REGISTRAR ENTRADA
                        </div>
                        <Label className="text-xs uppercase text-green-800">Digitar Placa</Label>
                        <div className="flex gap-2">
                          <Input
                              className="h-14 text-2xl font-mono text-center tracking-[0.3em] bg-white border-green-300 uppercase shadow-inner"
                              placeholder="ABC1234"
                              value={entryPlate}
                              onChange={(e) => setEntryPlate(e.target.value.toUpperCase())}
                              onKeyDown={(e) => e.key === 'Enter' && handleGateAction(entryPlate, 'entry')}
                          />
                          <Button
                              size="icon"
                              className="h-14 w-14 bg-green-600 hover:bg-green-700 shadow-md"
                              onClick={() => handleGateAction(entryPlate, 'entry')}
                              disabled={!entryPlate}
                          >
                            <LogIn className="h-6 w-6" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-4 p-6 border-2 border-dashed rounded-2xl bg-orange-50/20 border-orange-200">
                        <div className="flex items-center gap-2 text-orange-700 font-bold text-sm mb-4">
                          <ArrowUpRight className="h-5 w-5" /> REGISTRAR SAÍDA
                        </div>
                        <Label className="text-xs uppercase text-orange-800">Digitar Placa</Label>
                        <div className="flex gap-2">
                          <Input
                              className="h-14 text-2xl font-mono text-center tracking-[0.3em] bg-white border-orange-300 uppercase shadow-inner"
                              placeholder="ABC1234"
                              value={exitPlate}
                              onChange={(e) => setExitPlate(e.target.value.toUpperCase())}
                              onKeyDown={(e) => e.key === 'Enter' && handleGateAction(exitPlate, 'exit')}
                          />
                          <Button
                              size="icon"
                              className="h-14 w-14 bg-orange-600 hover:bg-orange-700 shadow-md"
                              onClick={() => handleGateAction(exitPlate, 'exit')}
                              disabled={!exitPlate}
                          >
                            <LogIn className="h-6 w-6" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
          )}

          {activeView === 'search' && (
              <div className="space-y-6">
                <Card className="bg-primary text-white border-none overflow-hidden shadow-xl">
                  <CardContent className="pt-8 relative">
                    <div className="relative z-10 flex flex-col items-center text-center space-y-5">
                      <div className="bg-accent/20 p-4 rounded-full"><Search className="h-10 w-10 text-accent" /></div>
                      <div>
                        <CardTitle className="text-3xl font-bold">Busca Unificada CampusGate</CardTitle>
                        <CardDescription className="text-white/70">Consulte veículos ou funcionários pelo RA universitário.</CardDescription>
                      </div>
                      <div className="w-full max-w-2xl relative">
                        <Search className="absolute left-4 top-4 h-6 w-6 text-muted-foreground" />
                        <Input
                            placeholder="Nome, RA, Placa ou CPF..."
                            className="h-14 pl-12 text-lg bg-white text-foreground rounded-2xl border-accent border-2 shadow-lg"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Card className="shadow-sm">
                    <CardHeader className="bg-muted/30 border-b">
                      <CardTitle className="text-sm font-bold uppercase text-muted-foreground">Funcionários</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        {filteredEmployees.length > 0 ? filteredEmployees.map(e => (
                            <div key={e.id} className="p-4 border rounded-xl hover:border-accent transition-all flex justify-between items-center bg-card shadow-sm">
                              <div>
                                <p className="font-bold text-primary">{e.name}</p>
                                <p className="text-[10px] text-muted-foreground font-medium uppercase">RA: {e.ra} • {e.department}</p>
                              </div>
                              <Button variant="ghost" size="sm" onClick={() => { setActiveView('employees'); setSearchQuery(e.ra); }}><Info className="h-4 w-4 text-accent" /></Button>
                            </div>
                        )) : <div className="text-center py-8 text-muted-foreground text-sm italic">Nenhum funcionário encontrado</div>}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-sm">
                    <CardHeader className="bg-muted/30 border-b">
                      <CardTitle className="text-sm font-bold uppercase text-muted-foreground">Frota</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        {filteredVehicles.length > 0 ? filteredVehicles.map(v => (
                            <div key={v.id} className="p-4 border rounded-xl hover:border-accent transition-all flex justify-between items-center bg-card shadow-sm">
                              <div>
                                <p className="font-mono font-bold text-primary text-lg tracking-widest">{v.plate}</p>
                                <p className="text-[10px] text-muted-foreground font-medium uppercase">{v.make} {v.model} • RA Dono: {employees.find(e => e.id === v.ownerId)?.ra}</p>
                              </div>
                              <Button variant="ghost" size="sm" onClick={() => { setActiveView('vehicles'); setSearchQuery(v.plate); }}><Info className="h-4 w-4 text-accent" /></Button>
                            </div>
                        )) : <div className="text-center py-8 text-muted-foreground text-sm italic">Nenhum veículo encontrado</div>}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
          )}

          {activeView === 'history' && (
              <Card className="shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between bg-muted/20 border-b py-6">
                  <div>
                    <CardTitle className="text-xl">Auditoria de Acessos</CardTitle>
                    <CardDescription>Registro de entradas e saídas do Campus vinculados ao operador.</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40 border-y">
                        <TableHead>Horário</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Placa</TableHead>
                        <TableHead>Proprietário (RA)</TableHead>
                        <TableHead>Porteiro Resp.</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logs.map(log => (
                          <TableRow key={log.id} className="hover:bg-muted/20 transition-colors">
                            <TableCell className="text-xs font-mono font-bold">{log.timestamp.toLocaleString()}</TableCell>
                            <TableCell>
                        <span className={`text-xs font-bold ${log.type === 'entry' ? 'text-green-700' : 'text-orange-700'}`}>
                          {log.type === 'entry' ? 'ENTRADA' : 'SAÍDA'}
                        </span>
                            </TableCell>
                            <TableCell className="font-mono font-bold tracking-widest text-primary">{log.vehiclePlate}</TableCell>
                            <TableCell className="text-xs font-medium">
                              {log.ownerName}
                              <span className="block text-[9px] text-muted-foreground">RA: {employees.find(e => e.name === log.ownerName)?.ra || 'N/A'}</span>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="text-[9px] uppercase font-bold tracking-tighter bg-secondary/80">{log.gatekeeperName}</Badge>
                            </TableCell>
                          </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
          )}

        </div>
      </DashboardLayout>
  );
}
