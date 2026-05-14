"use client";

import React, { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  UserPlus, 
  CarFront, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Trash2, 
  Search, 
  Info, 
  History, 
  DoorOpen 
} from 'lucide-react';
import { 
  initialEmployees, 
  initialVehicles, 
  initialLogs, 
  type Employee, 
  type Vehicle, 
  type AccessLog 
} from '@/lib/mock-db';
import { PlateAssistant } from '@/components/plate-assistant';
import { PlateEntryAssistantOutput } from '@/ai/flows/plate-entry-assistant';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function CampusGateApp() {
  const [activeView, setActiveView] = useState('overview');
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [logs, setLogs] = useState<AccessLog[]>(initialLogs);
  
  // Forms states
  const [searchQuery, setSearchQuery] = useState('');
  
  // Registration States
  const [newEmployee, setNewEmployee] = useState({ name: '', department: '', role: '', email: '', phone: '' });
  const [newVehicle, setNewVehicle] = useState({ ownerId: '', plate: '', make: '', model: '', color: '' });
  const [validatedPlateResult, setValidatedPlateResult] = useState<PlateEntryAssistantOutput | null>(null);

  // Computed data
  const filteredEmployees = useMemo(() => {
    return employees.filter(e => 
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      e.department.toLowerCase().includes(searchQuery.toLowerCase())
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

  // Actions
  const handleAddEmployee = () => {
    if (!newEmployee.name || !newEmployee.email) return;
    const employee = { ...newEmployee, id: Date.now().toString() };
    setEmployees([...employees, employee]);
    setNewEmployee({ name: '', department: '', role: '', email: '', phone: '' });
  };

  const handleAddVehicle = () => {
    if (!newVehicle.ownerId || !validatedPlateResult?.validatedPlate) return;
    const vehicle = { 
      ...newVehicle, 
      id: `v-${Date.now()}`, 
      plate: validatedPlateResult.validatedPlate,
      make: newVehicle.make || validatedPlateResult.predictedVehicleMake || 'Desconhecido'
    };
    setVehicles([...vehicles, vehicle]);
    setNewVehicle({ ownerId: '', plate: '', make: '', model: '', color: '' });
    setValidatedPlateResult(null);
  };

  const handleGateAction = (plate: string, type: 'entry' | 'exit') => {
    const vehicle = vehicles.find(v => v.plate === plate);
    if (!vehicle) return;
    const owner = employees.find(e => e.id === vehicle.ownerId);
    
    const newLog: AccessLog = {
      id: `l-${Date.now()}`,
      vehiclePlate: plate,
      type,
      timestamp: new Date(),
      ownerName: owner?.name || 'Visitante'
    };
    setLogs([newLog, ...logs]);
  };

  return (
    <DashboardLayout activeView={activeView} setActiveView={setActiveView}>
      <div className="space-y-6 max-w-7xl mx-auto">
        
        {/* VIEW: OVERVIEW */}
        {activeView === 'overview' && (
          <div className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-l-4 border-l-accent">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Ocupação Atual</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.currentOccupancy} <span className="text-sm font-normal text-muted-foreground">veículos</span></div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-primary">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Funcionários</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.totalEmployees}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Veículos Cadastrados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.totalVehicles}</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5 text-accent" />
                    Atividade Recente
                  </CardTitle>
                  <CardDescription>Últimas 5 movimentações na portaria</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {logs.slice(0, 5).map((log) => (
                      <div key={log.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${log.type === 'entry' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                            {log.type === 'entry' ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                          </div>
                          <div>
                            <p className="font-bold font-mono text-sm">{log.vehiclePlate}</p>
                            <p className="text-xs text-muted-foreground">{log.ownerName}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-medium">{log.type === 'entry' ? 'Entrada' : 'Saída'}</p>
                          <p className="text-[10px] text-muted-foreground">{log.timestamp.toLocaleTimeString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" className="w-full text-accent" onClick={() => setActiveView('history')}>Ver histórico completo</Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5 text-accent" />
                    Atalhos Rápidos
                  </CardTitle>
                  <CardDescription>Ações frequentes de administração</CardDescription>
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
                    Portaria ao Vivo
                  </Button>
                  <Button variant="outline" className="h-24 flex flex-col gap-2 border-accent/20 hover:border-accent hover:bg-accent/5" onClick={() => setActiveView('search')}>
                    <Search className="h-6 w-6 text-accent" />
                    Busca por Placa
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* VIEW: EMPLOYEES */}
        {activeView === 'employees' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Cadastro de Funcionário</CardTitle>
                <CardDescription>Insira os dados do novo membro do corpo administrativo/acadêmico.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Nome Completo</Label>
                    <Input value={newEmployee.name} onChange={e => setNewEmployee({...newEmployee, name: e.target.value})} placeholder="Ex: Maria Oliveira" />
                  </div>
                  <div className="space-y-2">
                    <Label>Departamento</Label>
                    <Input value={newEmployee.department} onChange={e => setNewEmployee({...newEmployee, department: e.target.value})} placeholder="Ex: Recursos Humanos" />
                  </div>
                  <div className="space-y-2">
                    <Label>Cargo/Papel</Label>
                    <Input value={newEmployee.role} onChange={e => setNewEmployee({...newEmployee, role: e.target.value})} placeholder="Ex: Professor Titular" />
                  </div>
                  <div className="space-y-2">
                    <Label>E-mail Institucional</Label>
                    <Input value={newEmployee.email} onChange={e => setNewEmployee({...newEmployee, email: e.target.value})} placeholder="maria@uni.edu" />
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
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Diretório de Funcionários</CardTitle>
                    <CardDescription>Lista de todos os funcionários aptos ao estacionamento.</CardDescription>
                  </div>
                  <div className="relative w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Buscar..." className="pl-8" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Departamento</TableHead>
                      <TableHead>Cargo</TableHead>
                      <TableHead>Contato</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEmployees.map(emp => (
                      <TableRow key={emp.id}>
                        <TableCell className="font-medium">{emp.name}</TableCell>
                        <TableCell>{emp.department}</TableCell>
                        <TableCell>{emp.role}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{emp.email}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* VIEW: VEHICLES */}
        {activeView === 'vehicles' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Cadastro de Veículo</CardTitle>
                  <CardDescription>Vincule um veículo a um proprietário funcionário.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Proprietário</Label>
                    <Select onValueChange={(val) => setNewVehicle({...newVehicle, ownerId: val})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o funcionário" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map(emp => (
                          <SelectItem key={emp.id} value={emp.id}>{emp.name} ({emp.department})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <PlateAssistant onValidated={(res) => setValidatedPlateResult(res)} />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Marca (Opcional)</Label>
                      <Input 
                        value={newVehicle.make} 
                        onChange={e => setNewVehicle({...newVehicle, make: e.target.value})} 
                        placeholder={validatedPlateResult?.predictedVehicleMake || "Ex: Toyota"} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Modelo</Label>
                      <Input value={newVehicle.model} onChange={e => setNewVehicle({...newVehicle, model: e.target.value})} placeholder="Ex: Corolla" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Cor</Label>
                    <Input value={newVehicle.color} onChange={e => setNewVehicle({...newVehicle, color: e.target.value})} placeholder="Ex: Prata" />
                  </div>
                  <Button className="w-full bg-primary" onClick={handleAddVehicle} disabled={!newVehicle.ownerId || !validatedPlateResult?.isValid}>
                    <CarFront className="mr-2 h-4 w-4" /> Registrar Veículo
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Veículos Registrados</CardTitle>
                  <CardDescription>Frota autorizada para acesso ao Campus.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Buscar por placa ou dono..." className="pl-8" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                    </div>
                    <div className="border rounded-md overflow-hidden">
                      <Table>
                        <TableHeader className="bg-muted/50">
                          <TableRow>
                            <TableHead>Placa</TableHead>
                            <TableHead>Veículo</TableHead>
                            <TableHead>Dono</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredVehicles.map(v => (
                            <TableRow key={v.id}>
                              <TableCell className="font-mono font-bold text-primary">{v.plate}</TableCell>
                              <TableCell className="text-sm">{v.make} {v.model} ({v.color})</TableCell>
                              <TableCell className="text-xs">{employees.find(e => e.id === v.ownerId)?.name}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* VIEW: GATE */}
        {activeView === 'gate' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <Card className="border-accent shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-headline flex items-center justify-center gap-2">
                  <DoorOpen className="h-8 w-8 text-accent" />
                  Terminal de Portaria
                </CardTitle>
                <CardDescription>Controle de entrada e saída em tempo real</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
                  <div className="space-y-4 p-6 border-2 border-dashed rounded-xl bg-green-50/30 border-green-200">
                    <div className="flex items-center gap-2 text-green-700 font-bold mb-4">
                      <ArrowDownLeft className="h-5 w-5" /> ENTRADA DE VEÍCULO
                    </div>
                    <Label>Identificar Placa</Label>
                    <Select onValueChange={(val) => handleGateAction(val, 'entry')}>
                      <SelectTrigger className="h-12 text-lg font-mono">
                        <SelectValue placeholder="--- --- ---" />
                      </SelectTrigger>
                      <SelectContent>
                        {vehicles.map(v => (
                          <SelectItem key={v.id} value={v.plate}>
                            <div className="flex justify-between w-64">
                              <span className="font-mono font-bold">{v.plate}</span>
                              <span className="text-muted-foreground text-xs">{employees.find(e => e.id === v.ownerId)?.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">Selecione a placa detectada para registrar entrada automática.</p>
                  </div>

                  <div className="space-y-4 p-6 border-2 border-dashed rounded-xl bg-orange-50/30 border-orange-200">
                    <div className="flex items-center gap-2 text-orange-700 font-bold mb-4">
                      <ArrowUpRight className="h-5 w-5" /> SAÍDA DE VEÍCULO
                    </div>
                    <Label>Identificar Placa</Label>
                    <Select onValueChange={(val) => handleGateAction(val, 'exit')}>
                      <SelectTrigger className="h-12 text-lg font-mono">
                        <SelectValue placeholder="--- --- ---" />
                      </SelectTrigger>
                      <SelectContent>
                        {vehicles.map(v => (
                          <SelectItem key={v.id} value={v.plate}>
                            <div className="flex justify-between w-64">
                              <span className="font-mono font-bold">{v.plate}</span>
                              <span className="text-muted-foreground text-xs">{employees.find(e => e.id === v.ownerId)?.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">Selecione a placa detectada para registrar saída automática.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Últimos Registros</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {logs.slice(0, 3).map(log => (
                    <div key={log.id} className="flex justify-between items-center p-3 border rounded-lg animate-in slide-in-from-left-2">
                       <div className="flex items-center gap-4">
                          <Badge variant={log.type === 'entry' ? 'default' : 'secondary'} className={log.type === 'entry' ? 'bg-green-600' : 'bg-orange-600 text-white'}>
                            {log.type === 'entry' ? 'ENTRADA' : 'SAÍDA'}
                          </Badge>
                          <div>
                            <span className="font-mono font-bold mr-2">{log.vehiclePlate}</span>
                            <span className="text-sm text-muted-foreground">({log.ownerName})</span>
                          </div>
                       </div>
                       <span className="text-xs font-medium text-muted-foreground">
                         {log.timestamp.toLocaleTimeString()}
                       </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* VIEW: SEARCH */}
        {activeView === 'search' && (
          <div className="space-y-6">
             <Card className="bg-primary text-white border-none overflow-hidden">
               <CardContent className="pt-6 relative">
                 <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                    <Search className="h-12 w-12 text-accent" />
                    <div>
                      <CardTitle className="text-2xl">Busca Global do Sistema</CardTitle>
                      <CardDescription className="text-white/80">Pesquise por qualquer termo: Placa, Nome, Departamento ou Modelo de Veículo.</CardDescription>
                    </div>
                    <div className="w-full max-w-2xl relative">
                      <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Input 
                        placeholder="Inicie sua busca aqui..." 
                        className="h-12 pl-10 text-lg bg-white text-foreground rounded-full border-accent border-2 focus:ring-accent" 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                      />
                    </div>
                 </div>
                 <div className="absolute top-0 right-0 h-full w-32 bg-accent/20 skew-x-12 transform translate-x-16"></div>
               </CardContent>
             </Card>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Resultados em Funcionários</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {filteredEmployees.length > 0 ? filteredEmployees.map(e => (
                        <div key={e.id} className="p-3 border rounded-md hover:border-accent transition-colors flex justify-between items-center">
                          <div>
                            <p className="font-bold">{e.name}</p>
                            <p className="text-xs text-muted-foreground">{e.department} - {e.role}</p>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => { setActiveView('employees'); setSearchQuery(e.name); }}><Info className="h-4 w-4" /></Button>
                        </div>
                      )) : <p className="text-sm text-muted-foreground text-center py-4">Nenhum funcionário encontrado.</p>}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Resultados em Veículos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {filteredVehicles.length > 0 ? filteredVehicles.map(v => (
                        <div key={v.id} className="p-3 border rounded-md hover:border-accent transition-colors flex justify-between items-center">
                          <div>
                            <p className="font-mono font-bold text-primary">{v.plate}</p>
                            <p className="text-xs text-muted-foreground">{v.make} {v.model} - {v.color}</p>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => { setActiveView('vehicles'); setSearchQuery(v.plate); }}><Info className="h-4 w-4" /></Button>
                        </div>
                      )) : <p className="text-sm text-muted-foreground text-center py-4">Nenhum veículo encontrado.</p>}
                    </div>
                  </CardContent>
                </Card>
             </div>
          </div>
        )}

        {/* VIEW: HISTORY */}
        {activeView === 'history' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Histórico de Registros</CardTitle>
                <CardDescription>Auditoria completa de todos os acessos ao Campus.</CardDescription>
              </div>
              <Button variant="outline" size="sm">Exportar CSV</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Operação</TableHead>
                    <TableHead>Placa</TableHead>
                    <TableHead>Funcionário</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map(log => (
                    <TableRow key={log.id}>
                      <TableCell className="text-xs">{log.timestamp.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {log.type === 'entry' ? (
                            <ArrowDownLeft className="h-3 w-3 text-green-600" />
                          ) : (
                            <ArrowUpRight className="h-3 w-3 text-orange-600" />
                          )}
                          <span className="text-sm font-medium">{log.type === 'entry' ? 'Entrada' : 'Saída'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono font-bold">{log.vehiclePlate}</TableCell>
                      <TableCell className="text-sm">{log.ownerName}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px] uppercase">Processado</Badge>
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
