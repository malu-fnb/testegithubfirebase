"use client";

import React, { useState } from 'react';
import { plateEntryAssistant, type PlateEntryAssistantOutput } from '@/ai/flows/plate-entry-assistant';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PlateAssistantProps {
  onValidated: (result: PlateEntryAssistantOutput) => void;
  initialValue?: string;
}

export function PlateAssistant({ onValidated, initialValue = "" }: PlateAssistantProps) {
  const [plate, setPlate] = useState(initialValue);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PlateEntryAssistantOutput | null>(null);

  const handleValidate = async () => {
    if (!plate || plate.length < 3) return;
    setLoading(true);
    try {
      const data = await plateEntryAssistant({ plate });
      setResult(data);
      onValidated(data);
    } catch (error) {
      console.error("AI Validation error", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-secondary/50 border-accent/20">
      <div className="flex items-center gap-2 text-primary font-medium">
        <Sparkles className="h-4 w-4 text-accent" />
        <span className="text-sm">Assistente de Placa IA</span>
      </div>
      
      <div className="flex gap-2">
        <div className="flex-1 space-y-1">
          <Input 
            value={plate}
            onChange={(e) => setPlate(e.target.value.toUpperCase())}
            placeholder="Ex: ABC1D23"
            className="font-mono text-lg tracking-widest bg-white"
          />
        </div>
        <Button 
          onClick={handleValidate} 
          disabled={loading || plate.length < 3}
          variant="outline"
          className="border-accent text-accent hover:bg-accent hover:text-white"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Validar"}
        </Button>
      </div>

      {result && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {result.isValid ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-destructive" />
              )}
              <span className="text-sm font-semibold">
                {result.isValid ? "Formato Válido" : "Formato Inválido"}
              </span>
            </div>
            {result.isCorrected && (
              <Badge variant="outline" className="text-[10px] border-accent text-accent">Corrigido</Badge>
            )}
          </div>

          <div className="text-xs space-y-1 bg-white p-2 rounded border">
            {result.isCorrected && result.correctionMessage && (
              <p className="flex items-start gap-1 text-muted-foreground">
                <AlertCircle className="h-3 w-3 mt-0.5" />
                <span>{result.correctionMessage}</span>
              </p>
            )}
            {result.predictedVehicleMake && (
              <p className="font-medium text-primary">
                Sugestão de Fabricante: <span className="text-accent">{result.predictedVehicleMake}</span>
              </p>
            )}
            <p className="mt-1 font-mono text-sm font-bold border-t pt-1">
              Placa Final: {result.validatedPlate}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
