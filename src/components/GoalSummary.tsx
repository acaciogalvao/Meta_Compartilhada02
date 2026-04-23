import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrendingUp, MessageCircle, Copy, CheckCircle2, Clock, Share2, Edit2, Trash2, PlusCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useState } from 'react';

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
  formatCurrency: (value: number) => string;
  getFreqLabel: (freq: string) => string;
  handleExportText: () => void;
  showToast: (text: string, type?: 'success' | 'error') => void;
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
  formatCurrency,
  getFreqLabel,
  handleExportText,
  showToast
}: GoalSummaryProps) {
  const [chargeModalState, setChargeModalState] = useState<{
    isOpen: boolean;
    name: string;
    phone: string;
    amount: number;
    pixCode: string;
    text: string;
  }>({
    isOpen: false,
    name: '',
    phone: '',
    amount: 0,
    pixCode: '',
    text: ''
  });

  const [copiedPix, setCopiedPix] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  const handleCharge = async (name: string, phone: string, amount: number) => {
    if (!phone) {
      showToast(`Cadastre o WhatsApp de ${name} na área de Divisão da Meta.`, "error");
      return;
    }
    
    try {
      showToast("Gerando código Pix...", "success");
      const res = await fetch("/api/create-pix-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amount })
      });
      const data = await res.json();
      const pixCode = data.pixCode;
      
      const isFeminine = (n: string) => {
        const firstWord = n.trim().split(' ')[0].toLowerCase();
        return firstWord.endsWith('a') || firstWord.endsWith('ely') || firstWord.endsWith('ele') || firstWord.endsWith('eli');
      };
      
      const term = isFeminine(name) ? 'sua parcela' : 'seu pagamento';
      const adjective = isFeminine(name) ? 'atrasada' : 'atrasado';
      
      const text = `Oi ${name}, vi que ${term} da meta *${itemName || 'Sem nome'}* está ${adjective}. O valor é de *${formatCurrency(amount)}*. Vou te mandar o código Pix Copia e Cola separadamente logo abaixo para facilitar o pagamento!`;

      setChargeModalState({
        isOpen: true,
        name,
        phone,
        amount,
        pixCode,
        text
      });
      setCopiedPix(false);
      setCopiedText(false);

    } catch (err) {
      console.error(err);
      showToast("Erro ao gerar Pix para cobrança.", "error");
    }
  };

  const copyToClipboard = (text: string, type: 'pix' | 'text') => {
    navigator.clipboard.writeText(text).then(() => {
      if (type === 'pix') {
        setCopiedPix(true);
        setTimeout(() => setCopiedPix(false), 2000);
        showToast("Código Pix copiado!", "success");
      } else {
        setCopiedText(true);
        setTimeout(() => setCopiedText(false), 2000);
        showToast("Texto copiado!", "success");
      }
    });
  };

  const sendWhatsAppMsg = () => {
    const encodedText = encodeURIComponent(chargeModalState.text);
    const cleanPhone = chargeModalState.phone.replace(/\D/g, "");
    window.open(`https://api.whatsapp.com/send?phone=55${cleanPhone}&text=${encodedText}`, '_blank');
  };

  const sendWhatsAppPix = () => {
    const encodedPix = encodeURIComponent(chargeModalState.pixCode);
    const cleanPhone = chargeModalState.phone.replace(/\D/g, "");
    window.open(`https://api.whatsapp.com/send?phone=55${cleanPhone}&text=${encodedPix}`, '_blank');
  };

  return (
    <div className="space-y-6">
      
      {/* MAIN GOAL CARD */}
      <Card className="glass-card relative overflow-hidden text-white border-0">
        <CardContent className="p-5 sm:p-8">
          <div className="flex justify-between items-start mb-6 w-full">
             <div>
               <h2 className="text-2xl font-semibold text-white">{itemName || "Nova Meta"}</h2>
               <div className="flex items-center gap-2 mt-1">
                 <p className="text-slate-400">{goalType === 'individual' ? nameP1 : `${nameP1} & ${nameP2}`}</p>
                 {category === 'loan' && <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-rose-500/20 shadow-sm border border-rose-500/30 text-rose-400">Empréstimo ({interestRate}% a.m.)</span>}
               </div>
             </div>
             <div className="flex gap-1 shrink-0">
               <button onClick={handleExportText} className="p-2 text-slate-400 hover:text-white transition-colors"><Share2 className="w-5 h-5"/></button>
               <button onClick={() => setIsEditing(!isEditing)} className="p-2 text-slate-400 hover:text-white transition-colors"><Edit2 className="w-5 h-5"/></button>
               <button onClick={handleDeleteGoal} className="p-2 text-slate-400 hover:text-white transition-colors"><Trash2 className="w-5 h-5"/></button>
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
                  <span className="font-bold text-white text-lg">{months} meses</span>
               </div>
               <div className="glass-card-subtle p-4">
                  <div className="flex items-center gap-2 text-slate-400 mb-1">
                     <TrendingUp className="w-4 h-4"/>
                     <span className="text-xs font-medium">Restante</span>
                  </div>
                  <span className="font-bold text-pink-400 text-lg">{formatCurrency(results.total - results.saved)}</span>
               </div>
          </div>

          <div className="mt-8 text-center text-sky-400 text-[15px] font-medium tracking-tight">
             Bom começo! Mantenham a consistência.
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
                     <p className="text-[13px] text-slate-400 font-medium">{contributionP1}% da meta</p>
                   </div>
                 </div>
              </div>

              <div className="w-full bg-slate-900/50 border border-white/5 h-2 rounded-full mb-6 relative overflow-hidden">
                <div className="bg-emerald-500 progress-glow h-full rounded-full transition-all duration-1000 ease-in-out" style={{ width: `${Math.min(100, (Number(savedP1) / results.totalP1) * 100)}%` }}></div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-6 divide-x divide-white/10">
                 <div className="flex flex-col text-left px-1">
                   <span className="text-[11px] text-slate-400 mb-1">Guardado</span>
                   <span className="text-sm sm:text-[15px] font-bold text-white">{formatCurrency(Number(savedP1))}</span>
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
                 <Button variant="outline" className="flex-none px-6 h-14 rounded-xl border-white/10 text-slate-300 bg-white/5 hover:bg-white/10 font-bold transition-colors" onClick={() => handleCharge(nameP1, phoneP1, results.installmentP1)}>
                   <MessageCircle className="w-5 h-5"/>
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
                       <p className="text-[13px] text-slate-400 font-medium">{contributionP2}% da meta</p>
                     </div>
                   </div>
                </div>

                <div className="w-full bg-slate-900/50 border border-white/5 h-2 rounded-full mb-6 relative overflow-hidden">
                  <div className="bg-purple-500 progress-glow h-full rounded-full transition-all duration-1000 ease-in-out" style={{ width: `${Math.min(100, (Number(savedP2) / results.totalP2) * 100)}%` }}></div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-6 divide-x divide-white/10">
                   <div className="flex flex-col text-left px-1">
                     <span className="text-[11px] text-slate-400 mb-1">Guardado</span>
                     <span className="text-sm sm:text-[15px] font-bold text-white">{formatCurrency(Number(savedP2))}</span>
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
                   <Button variant="outline" className="flex-none px-6 h-14 rounded-xl border-white/10 text-slate-300 bg-white/5 hover:bg-white/10 font-bold transition-colors" onClick={() => handleCharge(nameP2, phoneP2, results.installmentP2)}>
                     <MessageCircle className="w-5 h-5"/>
                   </Button>
                </div>
              </CardContent>
            </Card>
          )}

        </div>
      )}

      {chargeModalState.isOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md shadow-2xl rounded-3xl animate-in fade-in zoom-in duration-200">
            <CardHeader className="bg-emerald-50 border-b border-emerald-100 rounded-t-3xl p-6">
              <CardTitle className="text-emerald-800">Enviar Cobrança</CardTitle>
              <CardDescription className="text-emerald-600 mt-1">
                O WhatsApp envia apenas uma mensagem por vez no atalho automático. Complete o envio em 2 passos.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              
              <div className="space-y-3">
                <Button 
                  onClick={sendWhatsAppMsg} 
                  className="w-full bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 flex justify-start h-auto p-4 rounded-2xl relative shadow-sm"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold mr-4 shrink-0">1</div>
                  <div className="text-left font-normal overflow-hidden w-full">
                    <span className="block font-bold text-slate-900 mb-1">Clica aqui para Enviar Mensagem</span>
                    <span className="text-xs text-slate-500 truncate block">"{chargeModalState.text}"</span>
                  </div>
                  <MessageCircle className="w-5 h-5 text-emerald-500 shrink-0 ml-2" />
                </Button>

                <Button 
                  onClick={sendWhatsAppPix} 
                  className="w-full bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 flex justify-start h-auto p-4 rounded-2xl relative shadow-sm"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold mr-4 shrink-0">2</div>
                  <div className="text-left font-normal overflow-hidden w-full">
                    <span className="block font-bold text-emerald-900 mb-1">Clica aqui para Enviar Código Pix</span>
                    <span className="text-xs text-emerald-600/80 truncate block">{chargeModalState.pixCode}</span>
                  </div>
                  <MessageCircle className="w-5 h-5 text-emerald-500 shrink-0 ml-2" />
                </Button>
              </div>

            </CardContent>
            <CardFooter className="flex justify-center border-t border-slate-100 bg-slate-50/50 p-4 rounded-b-3xl gap-2">
              <Button variant="ghost" className="w-full rounded-2xl h-12 text-slate-500" onClick={() => setChargeModalState(prev => ({...prev, isOpen: false}))}>
                Fechar
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
