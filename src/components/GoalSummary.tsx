import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrendingUp, MessageCircle, Copy, CheckCircle2, Clock, Share2, Edit2, Trash2, PlusCircle, Bell, BellRing } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useState } from 'react';
import { ReminderModal } from "./ReminderModal";

interface GoalSummaryProps {
  isEditing: boolean;
  setIsEditing: (val: boolean) => void;
  handleDeleteGoal: () => void;
  setShowPixModal: (val: boolean) => void;
  setCurrentPayer: (val: "P1" | "P2") => void;
  goalType: "individual" | "shared";
  category: string;
  interestRate: string;
  results: any;
  savedP1: string;
  savedP2: string;
  nameP1: string;
  nameP2: string;
  contributionP1: string;
  contributionP2: number;
  frequencyP1: string;
  frequencyP2: string;
  phoneP1: string;
  phoneP2: string;
  itemName: string;
  months: string;
  durationUnit: "days" | "weeks" | "months";
  formatCurrency: (value: number) => string;
  getFreqLabel: (freq: string) => string;
  handleExportText: () => string;
  showToast: (text: string, type?: 'success' | 'error') => void;
  remindersEnabled?: boolean;
  setRemindersEnabled?: (val: boolean) => void;
  handleSaveGoals?: (overrideUpdates?: any) => Promise<void>;
  motivationalMessage?: string;
}

export function GoalSummary({
  isEditing,
  setIsEditing,
  handleDeleteGoal,
  setShowPixModal,
  setCurrentPayer,
  goalType,
  category,
  interestRate,
  results,
  savedP1,
  savedP2,
  nameP1,
  nameP2,
  contributionP1,
  contributionP2,
  frequencyP1,
  frequencyP2,
  phoneP1,
  phoneP2,
  itemName,
  months,
  durationUnit,
  formatCurrency,
  getFreqLabel,
  handleExportText,
  showToast,
  remindersEnabled,
  setRemindersEnabled,
  handleSaveGoals,
  motivationalMessage
}: GoalSummaryProps) {
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [summaryText, setSummaryText] = useState("");

  const handleOpenReminder = () => {
    const text = handleExportText();
    setSummaryText(text);
    setShowReminderModal(true);
  };

  return (
    <div className="space-y-6">
      
      {/* MAIN GOAL CARD */}
      <Card className="glass-card relative overflow-hidden text-white border-0">
        <CardContent className="p-5 sm:p-8">
          <div className="flex justify-between items-start mb-6 w-full">
             <div>
               <h2 className="text-2xl font-semibold text-white">{itemName || (category === 'loan' ? "Novo Empréstimo" : "Nova Meta")}</h2>
               <div className="flex items-center gap-2 mt-1">
                 <p className="text-slate-400">{goalType === 'individual' ? nameP1 : `${nameP1} & ${nameP2}`}</p>
                 {category === 'loan' && <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-rose-500/20 shadow-sm border border-rose-500/30 text-rose-400">Empréstimo ({interestRate}% Juros)</span>}
               </div>
             </div>
             <div className="flex gap-1 shrink-0">
               <button onClick={handleOpenReminder} title="Enviar Lembrete" className="p-2 text-sky-400 hover:text-sky-300 transition-colors"><BellRing className="w-5 h-5"/></button>
               <button onClick={() => setIsEditing(!isEditing)} title="Editar" className="p-2 text-slate-400 hover:text-white transition-colors"><Edit2 className="w-5 h-5"/></button>
               <button onClick={handleDeleteGoal} title="Excluir" className="p-2 text-slate-400 hover:text-rose-400 transition-colors"><Trash2 className="w-5 h-5"/></button>
             </div>
          </div>

          <div className="flex flex-col mb-6">
             <div className="flex justify-between items-end mb-2">
                 <div className="text-[3rem] sm:text-4xl leading-none font-bold text-white tracking-tighter">{Math.floor(results.progressPercent)}%</div>
                 <div className="text-right">
                    <div className="text-xl sm:text-3xl font-mono font-bold text-white">{formatCurrency(results.saved)}</div>
                     <span className="text-sm text-slate-500 italic">de {formatCurrency(results.total)}</span>
                 </div>
             </div>

             <div className="w-full h-8 bg-slate-900/50 rounded-full overflow-hidden border border-white/5 mb-2 relative">
                <div className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 progress-glow transition-all duration-1000 ease-in-out" style={{ width: `${Math.min(100, Math.floor(results.progressPercent))}%` }}></div>
             </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
               <div className="glass-card-subtle p-4">
                  <div className="flex items-center gap-2 text-slate-400 mb-1">
                     <Clock className="w-4 h-4"/>
                     <span className="text-xs font-medium">Prazo</span>
                  </div>
                  <span className="font-bold text-white text-lg">
                    {months} {durationUnit === 'days' ? 'dias' : durationUnit === 'weeks' ? 'semanas' : 'meses'}
                  </span>
               </div>
               <div className="glass-card-subtle p-4">
                  <div className="flex items-center gap-2 text-slate-400 mb-1">
                     <TrendingUp className="w-4 h-4"/>
                     <span className="text-xs font-medium">Restante</span>
                  </div>
                  <span className="font-bold text-pink-400 text-lg">{formatCurrency(results.total - results.saved)}</span>
               </div>
               <div className="glass-card-subtle p-4 col-span-2 md:col-span-1 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-1">
                     <div className="flex items-center gap-2 text-slate-400">
                       <Bell className="w-4 h-4"/>
                       <span className="text-xs font-medium">Lembretes</span>
                     </div>
                     <button 
                        onClick={() => {
                          const newValue = !remindersEnabled;
                          if (setRemindersEnabled) setRemindersEnabled(newValue);
                          if (handleSaveGoals) handleSaveGoals({ remindersEnabled: newValue });
                        }}
                        className={`w-10 h-5 rounded-full relative transition-colors focus:outline-none ${remindersEnabled ? 'bg-sky-500' : 'bg-slate-600'}`}
                     >
                       <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${remindersEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                     </button>
                  </div>
                  <span className="text-xs text-slate-500">{remindersEnabled ? 'Ativados (WhatsApp/Email)' : 'Desativados'}</span>
               </div>
          </div>

          <div className="mt-8 text-center text-sky-400 text-[15px] font-medium tracking-tight">
             {motivationalMessage || "Bom começo! Mantenham a consistência."}
          </div>
        </CardContent>
      </Card>

      {/* CONTRIBUTIONS OVERVIEW */}
      {!isEditing && (
        <div className="space-y-4 pt-2">
          <div className="uppercase tracking-widest text-[13px] font-bold text-slate-500 pl-2">
            Contribuições
          </div>

          <Card className="glass-card shadow-sm border-0 relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-5">
                 <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-xl shrink-0">
                     {nameP1.charAt(0).toUpperCase()}
                   </div>
                   <div>
                     <h3 className="font-bold text-white text-lg leading-tight">{nameP1}</h3>
                     <p className="text-[13px] text-slate-400 font-medium">{contributionP1}% {category === 'loan' ? 'do empréstimo' : 'da meta'}</p>
                   </div>
                 </div>
              </div>

              <div className="w-full bg-slate-900/50 border border-white/5 h-2 rounded-full mb-6 relative overflow-hidden">
                <div className="bg-emerald-500 progress-glow h-full rounded-full transition-all duration-1000 ease-in-out" style={{ width: `${Math.min(100, (results.sP1 / results.totalP1) * 100)}%` }}></div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-6 divide-x divide-white/10">
                 <div className="flex flex-col text-left px-1">
                   <span className="text-[11px] text-slate-400 mb-1">Guardado</span>
                   <span className="text-sm sm:text-[15px] font-bold text-white">{formatCurrency(results.sP1)}</span>
                 </div>
                 <div className="flex flex-col text-center px-1">
                   <span className="text-[11px] text-pink-400 mb-1">Restante</span>
                   <span className="text-sm sm:text-[15px] font-bold text-pink-500">{formatCurrency(results.remainingP1)}</span>
                 </div>
                 <div className="flex flex-col text-right px-1">
                   <span className="text-[11px] text-sky-400 mb-1">{getFreqLabel(frequencyP1)}</span>
                   <span className="text-sm sm:text-[15px] font-bold text-sky-500">{formatCurrency(results.installmentP1)}</span>
                 </div>
              </div>

              <div className="flex gap-3">
                 <Button className="flex-1 bg-white text-slate-900 border-0 hover:bg-slate-100 rounded-xl shadow-lg shadow-white/10 h-14 font-bold text-sm transition-colors" onClick={() => { setCurrentPayer('P1'); setShowPixModal(true); }}>
                   NOVA CONTRIBUIÇÃO
                 </Button>
              </div>
            </CardContent>
          </Card>

          {goalType === 'shared' && (
            <Card className="glass-card shadow-sm relative border-0 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-5">
                   <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-xl shrink-0">
                       {nameP2.charAt(0).toUpperCase()}
                     </div>
                     <div>
                       <h3 className="font-bold text-white text-lg leading-tight">{nameP2}</h3>
                       <p className="text-[13px] text-slate-400 font-medium">{contributionP2}% {category === 'loan' ? 'do empréstimo' : 'da meta'}</p>
                     </div>
                   </div>
                </div>

                <div className="w-full bg-slate-900/50 border border-white/5 h-2 rounded-full mb-6 relative overflow-hidden">
                  <div className="bg-purple-500 progress-glow h-full rounded-full transition-all duration-1000 ease-in-out" style={{ width: `${Math.min(100, (results.sP2 / results.totalP2) * 100)}%` }}></div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-6 divide-x divide-white/10">
                   <div className="flex flex-col text-left px-1">
                     <span className="text-[11px] text-slate-400 mb-1">Guardado</span>
                     <span className="text-sm sm:text-[15px] font-bold text-white">{formatCurrency(results.sP2)}</span>
                   </div>
                   <div className="flex flex-col text-center px-1">
                     <span className="text-[11px] text-pink-400 mb-1">Restante</span>
                     <span className="text-sm sm:text-[15px] font-bold text-pink-500">{formatCurrency(results.remainingP2)}</span>
                   </div>
                   <div className="flex flex-col text-right px-1">
                     <span className="text-[11px] text-sky-400 mb-1">{getFreqLabel(frequencyP2)}</span>
                     <span className="text-sm sm:text-[15px] font-bold text-sky-500">{formatCurrency(results.installmentP2)}</span>
                   </div>
                </div>

                <div className="flex gap-3">
                   <Button className="flex-1 bg-white text-slate-900 border-0 hover:bg-slate-100 rounded-xl shadow-lg shadow-white/10 h-14 font-bold text-sm transition-colors" onClick={() => { setCurrentPayer('P2'); setShowPixModal(true); }}>
                     NOVA CONTRIBUIÇÃO
                   </Button>
                </div>
              </CardContent>
            </Card>
          )}

        </div>
      )}

      <ReminderModal
        isOpen={showReminderModal}
        onClose={() => setShowReminderModal(false)}
        goalType={goalType}
        category={category}
        nameP1={nameP1}
        nameP2={nameP2}
        phoneP1={phoneP1}
        phoneP2={phoneP2}
        summaryText={summaryText}
        showToast={showToast}
      />
    </div>
  );
}
