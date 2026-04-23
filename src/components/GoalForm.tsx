import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface GoalFormProps {
  goalType: "individual" | "shared";
  setGoalType: (val: "individual" | "shared") => void;
  category: string;
  setCategory: (val: string) => void;
  interestRate: string;
  setInterestRate: (val: string) => void;
  itemName: string;
  setItemName: (val: string) => void;
  totalValue: string;
  setTotalValue: (val: string) => void;
  months: string;
  setMonths: (val: string) => void;
  nameP1: string;
  setNameP1: (val: string) => void;
  nameP2: string;
  setNameP2: (val: string) => void;
  pixKeyP1: string;
  setPixKeyP1: (val: string) => void;
  pixKeyP2: string;
  setPixKeyP2: (val: string) => void;
  phoneP1: string;
  setPhoneP1: (val: string) => void;
  phoneP2: string;
  setPhoneP2: (val: string) => void;
  contributionP1: string;
  setContributionP1: (val: string) => void;
  frequencyP1: string;
  setFrequencyP1: (val: string) => void;
  frequencyP2: string;
  setFrequencyP2: (val: string) => void;
  dueDayP1: number;
  setDueDayP1: (val: number) => void;
  dueDayP2: number;
  setDueDayP2: (val: number) => void;
  formatCurrency: (val: number) => string;
  handleCurrencyChange: (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string>>) => void;
  onCancel: () => void;
  onSave: () => void;
}

export function GoalForm({
  goalType, setGoalType,
  category, setCategory,
  interestRate, setInterestRate,
  itemName, setItemName,
  totalValue, setTotalValue,
  months, setMonths,
  nameP1, setNameP1,
  nameP2, setNameP2,
  pixKeyP1, setPixKeyP1,
  pixKeyP2, setPixKeyP2,
  phoneP1, setPhoneP1,
  phoneP2, setPhoneP2,
  contributionP1, setContributionP1,
  frequencyP1, setFrequencyP1,
  frequencyP2, setFrequencyP2,
  dueDayP1, setDueDayP1,
  dueDayP2, setDueDayP2,
  formatCurrency, handleCurrencyChange,
  onCancel, onSave
}: GoalFormProps) {
  const [activeTab, setActiveTab] = useState<"meta" | "pessoas">("meta");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const getInitialPixType = (key: string) => {
    if (!key) return "celular";
    if (key.includes("@")) return "email";
    if (key.includes("-") && key.length === 36) return "random";
    const num = key.replace(/\D/g, "");
    if (num.length === 11 && !/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(key)) return "celular";
    if (num.length > 0) return "cpf_cnpj";
    return "celular";
  };

  const [pixTypeP1, setPixTypeP1] = useState<string>(getInitialPixType(pixKeyP1));
  const [pixTypeP2, setPixTypeP2] = useState<string>(getInitialPixType(pixKeyP2));

  const commonMonths = ["3", "6", "12", "18", "24", "36", "48", "60"];
  const percentages = ["10", "20", "30", "40", "50", "60", "70", "80", "90"];

  const formatPhone = (val: string) => {
    val = val.replace(/\D/g, "");
    if (val.length === 0) return "";
    if (val.length <= 2) return `(${val}`;
    if (val.length <= 6) return `(${val.slice(0, 2)}) ${val.slice(2)}`;
    if (val.length <= 10) return `(${val.slice(0, 2)}) ${val.slice(2, 6)}-${val.slice(6)}`;
    return `(${val.slice(0, 2)}) ${val.slice(2, 7)}-${val.slice(7, 11)}`;
  };

  const formatPixKeyInput = (inputVal: string, type: string) => {
    if (!inputVal) return "";
    let val = inputVal;

    // Extract from copy-paste BR-code
    if (val.startsWith('000201') && val.includes('br.gov.bcb.pix01')) {
      const idx = val.indexOf('br.gov.bcb.pix01');
      if (idx !== -1) {
         const lenStr = val.substring(idx + 16, idx + 18);
         const len = parseInt(lenStr, 10);
         if (!isNaN(len)) {
           val = val.substring(idx + 18, idx + 18 + len);
         }
      }
    }

    if (type === "email" || type === "random") return val;
    
    if (type === "celular") {
       const digits = val.replace(/\D/g, "");
       if (digits.length === 0) return "";
       if (digits.length <= 2) return `(${digits}`;
       if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
       if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
       return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
    }
    
    if (type === "cpf_cnpj") {
       const digits = val.replace(/\D/g, "");
       if (digits.length <= 11) {
           if (digits.length <= 3) return digits;
           if (digits.length <= 6) return `${digits.slice(0,3)}.${digits.slice(3)}`;
           if (digits.length <= 9) return `${digits.slice(0,3)}.${digits.slice(3,6)}.${digits.slice(6)}`;
           return `${digits.slice(0,3)}.${digits.slice(3,6)}.${digits.slice(6,9)}-${digits.slice(9,11)}`;
       } else {
           let res = digits.slice(0, 14);
           if (res.length <= 2) return res;
           if (res.length <= 5) return `${res.slice(0,2)}.${res.slice(2)}`;
           if (res.length <= 8) return `${res.slice(0,2)}.${res.slice(2,5)}.${res.slice(5)}`;
           if (res.length <= 12) return `${res.slice(0,2)}.${res.slice(2,5)}.${res.slice(5,8)}/${res.slice(8)}`;
           return `${res.slice(0,2)}.${res.slice(2,5)}.${res.slice(5,8)}/${res.slice(8,12)}-${res.slice(12,14)}`;
       }
    }

    return val;
  };

  const handleValidation = () => {
    const newErrors: Record<string, string> = {};
    if (!itemName.trim()) newErrors.itemName = "O nome da meta é obrigatório.";
    if (!totalValue || Number(totalValue) <= 0) newErrors.totalValue = "O valor deve ser maior que 0.";
    if (!months || Number(months) <= 0) newErrors.months = "Informe o prazo.";
    
    const isValidPix = (key: string, type: string) => {
      if (!key) return true;
      if (type === "email") return key.includes("@") && key.length > 4;
      if (type === "random") return key.length > 10;
      
      const digits = key.replace(/\D/g, "");
      if (type === "celular") return digits.length === 11 || digits.length === 10;
      if (type === "cpf_cnpj") return digits.length === 11 || digits.length === 14;
      return digits.length >= 10 && digits.length <= 14;
    };

    if (activeTab === "pessoas") {
      if (!nameP1.trim()) newErrors.nameP1 = "O nome é obrigatório.";
      if (pixKeyP1 && !isValidPix(pixKeyP1, pixTypeP1)) newErrors.pixKeyP1 = "Chave Pix inválida para o tipo selecionado.";
      
      if (goalType === "shared") {
        if (!nameP2.trim()) newErrors.nameP2 = "O nome é obrigatório.";
        if (pixKeyP2 && !isValidPix(pixKeyP2, pixTypeP2)) newErrors.pixKeyP2 = "Chave Pix inválida para o tipo selecionado.";
      }
    }

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      // If errors are on the other tab, switch to it
      if (newErrors.itemName || newErrors.totalValue || newErrors.months) {
        if (activeTab !== "meta") setActiveTab("meta");
      } else if (newErrors.nameP1 || newErrors.nameP2) {
        if (activeTab !== "pessoas") setActiveTab("pessoas");
      }
      return false;
    }
    return true;
  };

  const handleSaveClick = () => {
    if (handleValidation()) {
      onSave();
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-xl bg-slate-900/80 z-[100] flex flex-col sm:max-w-md sm:mx-auto sm:relative sm:min-h-screen overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center p-4 glass-card-subtle sticky top-0 z-10 border-b border-white/10 shadow-sm">
        <button onClick={onCancel} className="text-slate-400 hover:text-white font-medium transition-colors">Cancelar</button>
        <h2 className="font-bold text-white text-lg">{itemName ? 'Editar Meta' : 'Nova Meta'}</h2>
        <button onClick={handleSaveClick} className="text-sky-400 hover:text-sky-300 font-bold drop-shadow-[0_0_8px_rgba(56,189,248,0.3)] transition-colors">Salvar</button>
      </div>

      {/* Tabs */}
      <div className="flex p-4 pb-2 z-10">
        <div className="flex w-full bg-white/5 rounded-2xl p-1 border border-white/10 backdrop-blur-md">
          <button 
            className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${activeTab === 'meta' ? 'bg-sky-500/20 text-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.2)] border border-sky-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            onClick={() => setActiveTab('meta')}
          >
            A Meta
          </button>
          <button 
            className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${activeTab === 'pessoas' ? 'bg-sky-500/20 text-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.2)] border border-sky-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            onClick={() => setActiveTab('pessoas')}
          >
            {goalType === 'shared' ? 'As Pessoas' : 'Seus Dados'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide z-10 pb-20">
        {activeTab === 'meta' && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="space-y-2 mb-4">
              <Label className="text-sky-400 font-bold text-[10px] uppercase tracking-widest block mb-2">Tipo de Meta</Label>
              <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                <button
                  className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-colors ${goalType === "shared" ? "bg-white/10 text-white shadow-sm border border-white/10" : "text-slate-400 hover:text-slate-300"}`}
                  onClick={() => setGoalType("shared")}
                >
                  Em Casal (Dividida)
                </button>
                <button
                  className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-colors ${goalType === "individual" ? "bg-white/10 text-white shadow-sm border border-white/10" : "text-slate-400 hover:text-slate-300"}`}
                  onClick={() => setGoalType("individual")}
                >
                  Individual (Só eu)
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="itemName" className="text-sky-400 font-bold text-[10px] uppercase tracking-widest">O que {goalType === "shared" ? "vocês querem" : "você quer"} conquistar? *</Label>
              <Input 
                id="itemName" 
                value={itemName} 
                onChange={(e) => {
                  setItemName(e.target.value);
                  if (errors.itemName) setErrors({ ...errors, itemName: "" });
                }} 
                className={`rounded-xl h-12 text-white placeholder-slate-500 bg-white/5 focus-visible:ring-sky-500/50 ${errors.itemName ? 'border-red-400/50 focus-visible:ring-red-500/50' : 'border-white/10 focus:border-sky-500/50'}`}
              />
              {errors.itemName && <p className="text-xs text-red-400 font-medium mt-1">{errors.itemName}</p>}
            </div>

            <div className="space-y-2 mb-4">
              <Label className="text-sky-400 font-bold text-[10px] uppercase tracking-widest block mb-2">Categoria da Meta</Label>
              <select 
                value={category} 
                onChange={e => setCategory(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 text-white h-12 px-3 focus:outline-none focus-visible:ring-1 focus-visible:ring-sky-500/50 appearance-none"
              >
                <option value="saving" className="bg-slate-900">Economia / Compra / Viagem</option>
                <option value="loan" className="bg-slate-900">Empréstimo</option>
                <option value="other" className="bg-slate-900">Outro</option>
              </select>
            </div>

            <div className={category === 'loan' ? "grid grid-cols-[1fr_120px] sm:grid-cols-[1fr_150px] gap-3" : "space-y-2"}>
              <div className="space-y-2">
                <Label htmlFor="totalValue" className="text-sky-400 font-bold text-[10px] uppercase tracking-widest">Valor Total *</Label>
                <Input 
                  id="totalValue" 
                  inputMode="numeric"
                  value={totalValue === "" ? "" : formatCurrency(Number(totalValue))}
                  onChange={(e) => {
                    handleCurrencyChange(e, setTotalValue as any);
                    if (errors.totalValue) setErrors({ ...errors, totalValue: "" });
                  }} 
                  className={`rounded-xl h-12 text-white bg-white/5 focus-visible:ring-sky-500/50 ${errors.totalValue ? 'border-red-400/50 focus-visible:ring-red-500/50' : 'border-white/10 focus:border-sky-500/50'}`}
                />
                {errors.totalValue && <p className="text-xs text-red-400 font-medium mt-1">{errors.totalValue}</p>}
              </div>

              {category === 'loan' && (
                <div className="space-y-2 animate-in fade-in slide-in-from-right-2">
                  <Label htmlFor="interestRate" className="text-sky-400 font-bold text-[10px] uppercase tracking-widest">% Juros (a.m)</Label>
                  <div className="flex bg-white/5 border border-white/10 rounded-xl overflow-hidden shadow-sm h-12">
                    <Input 
                      id="interestRate" 
                      type="number"
                      step="0.1"
                      value={interestRate}
                      onChange={(e) => setInterestRate(e.target.value)} 
                      className="w-full border-0 bg-transparent text-center font-bold text-white focus-visible:ring-0 h-full px-1 sm:px-3"
                    />
                    <div className="flex items-center pr-2 pl-1 sm:px-3 text-slate-400 text-xs sm:text-sm border-l border-white/10 bg-black/20">
                      %
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Label className="text-sky-400 font-bold text-[10px] uppercase tracking-widest">Prazo em meses — {months} meses *</Label>
              <div className="flex items-center gap-3">
                <div className={`flex bg-white/5 border rounded-xl overflow-hidden shadow-sm h-12 ${errors.months ? 'border-red-400/50' : 'border-white/10'}`}>
                  <Input 
                    type="number"
                    value={months}
                    onChange={(e) => {
                      setMonths(e.target.value);
                      if (errors.months) setErrors({ ...errors, months: "" });
                    }}
                    className="w-16 border-0 bg-transparent text-center font-bold text-white focus-visible:ring-0 h-full"
                  />
                  <div className="flex items-center px-3 text-slate-400 text-sm border-l border-white/10 bg-black/20">
                    meses
                  </div>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide flex-1">
                  {commonMonths.map(m => (
                    <button 
                      key={m} 
                      onClick={() => setMonths(m)}
                      className="w-10 h-10 shrink-0 rounded-full border border-white/10 bg-white/5 text-slate-300 font-medium hover:bg-white/10 transition-colors"
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {goalType === 'shared' && (
              <div className="space-y-3">
                <Label className="text-sky-400 font-bold text-[10px] uppercase tracking-widest">Divisão: {nameP1} {contributionP1}% / {nameP2} {100 - Number(contributionP1)}%</Label>
                
                <div className="w-full bg-white/5 h-1.5 rounded-full mb-4 relative overflow-hidden border border-white/5">
                  <div className="bg-sky-500 h-full rounded-full transition-all shadow-[0_0_8px_rgba(56,189,248,0.8)]" style={{ width: `${contributionP1}%` }}></div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {percentages.map(p => (
                    <button 
                      key={p} 
                      onClick={() => setContributionP1(p)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${contributionP1 === p ? 'bg-sky-500 text-slate-900 shadow-[0_0_10px_rgba(56,189,248,0.5)]' : 'border border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 text-white'}`}
                    >
                      {p}%
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'pessoas' && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200 pb-10">
            {/* Pessoa 1 */}
            <Card className="glass-card-subtle border-white/10 rounded-2xl shadow-sm overflow-hidden bg-transparent">
               <div className="bg-white/5 p-3 border-b border-white/10">
                 <h3 className="font-bold text-sky-400">Pessoa 1</h3>
               </div>
               <CardContent className="p-4 space-y-4">
                 <div className="space-y-1.5">
                   <Label className="text-slate-400 font-bold text-xs">Nome *</Label>
                   <Input 
                     value={nameP1} 
                     onChange={e => {
                       setNameP1(e.target.value);
                       if (errors.nameP1) setErrors({ ...errors, nameP1: "" });
                     }} 
                     className={`rounded-xl bg-white/5 text-white h-11 focus-visible:ring-sky-500/50 ${errors.nameP1 ? 'border-red-400/50' : 'border-white/10'}`} 
                   />
                   {errors.nameP1 && <p className="text-[10px] text-red-400 font-medium">{errors.nameP1}</p>}
                 </div>
                 <div className="space-y-1.5">
                   <Label className="text-slate-400 font-bold text-xs">WhatsApp</Label>
                   <Input 
                     type="tel"
                     value={phoneP1} 
                     onChange={e => setPhoneP1(formatPhone(e.target.value))} 
                     placeholder="(99) 99999-9999"
                     className="rounded-xl border-white/10 bg-white/5 text-white placeholder-slate-600 h-11 focus-visible:ring-sky-500/50" 
                   />
                 </div>
                 <div className="space-y-1.5">
                   <Label className="text-slate-400 font-bold text-xs">Chave Pix</Label>
                   <div className="flex gap-2">
                       <select
                         value={pixTypeP1}
                         onChange={e => {
                           setPixTypeP1(e.target.value);
                           setPixKeyP1(formatPixKeyInput(pixKeyP1, e.target.value));
                         }}
                         className="rounded-xl border border-white/10 bg-white/5 text-white h-11 px-2 focus:outline-none focus:ring-1 focus:ring-sky-500/50 appearance-none text-[11px] w-[95px] sm:w-[120px] shrink-0"
                       >
                         <option value="celular" className="text-slate-900">Celular</option>
                         <option value="cpf_cnpj" className="text-slate-900">CPF/CNPJ</option>
                         <option value="email" className="text-slate-900">E-mail</option>
                         <option value="random" className="text-slate-900">Aleatória</option>
                       </select>
                       <Input 
                         value={pixKeyP1} 
                         onChange={e => {
                           setPixKeyP1(formatPixKeyInput(e.target.value, pixTypeP1));
                           if (errors.pixKeyP1) setErrors({ ...errors, pixKeyP1: "" });
                         }} 
                         className={`rounded-xl border-white/10 bg-white/5 text-white h-11 focus-visible:ring-sky-500/50 flex-1 ${errors.pixKeyP1 ? 'border-red-400/50 focus-visible:ring-red-500/50' : 'border-white/10'}`} 
                         placeholder={pixTypeP1 === 'celular' ? '(99) 99999-9999' : pixTypeP1 === 'cpf_cnpj' ? '000.000.000-00' : pixTypeP1 === 'email' ? 'email@exemplo.com' : 'Aleatória'}
                       />
                   </div>
                   {errors.pixKeyP1 && <p className="text-[10px] text-red-400 font-medium">{errors.pixKeyP1}</p>}
                 </div>
                 <div className="space-y-1.5 pt-2">
                   <Label className="text-sky-400 font-bold text-[10px] uppercase tracking-widest block mb-2">Frequência de contribuição</Label>
                   <div className="flex gap-2 bg-white/5 p-1 rounded-xl border border-white/10 mb-3">
                     {['daily', 'weekly', 'monthly'].map(freq => (
                       <button
                         key={freq}
                         onClick={() => setFrequencyP1(freq)}
                         className={`flex-1 py-2 text-[13px] font-bold rounded-lg transition-colors ${frequencyP1 === freq ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30 shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                       >
                         {freq === 'daily' ? 'Diário' : freq === 'weekly' ? 'Semanal' : 'Mensal'}
                       </button>
                     ))}
                   </div>
                   
                   {frequencyP1 === 'weekly' && (
                     <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
                       <Label className="text-slate-400 font-bold text-xs">Qual dia da semana?</Label>
                       <select 
                         value={dueDayP1} 
                         onChange={e => setDueDayP1(Number(e.target.value))}
                         className="w-full rounded-xl border border-white/10 bg-white/5 text-white h-11 px-3 focus:outline-none focus-visible:ring-1 focus-visible:ring-sky-500/50 appearance-none"
                       >
                         <option value={0} className="bg-slate-900">Domingo</option>
                         <option value={1} className="bg-slate-900">Segunda-feira</option>
                         <option value={2} className="bg-slate-900">Terça-feira</option>
                         <option value={3} className="bg-slate-900">Quarta-feira</option>
                         <option value={4} className="bg-slate-900">Quinta-feira</option>
                         <option value={5} className="bg-slate-900">Sexta-feira</option>
                         <option value={6} className="bg-slate-900">Sábado</option>
                       </select>
                     </div>
                   )}

                   {frequencyP1 === 'monthly' && (
                     <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
                       <Label className="text-slate-400 font-bold text-xs">Qual dia do mês?</Label>
                       <select 
                         value={dueDayP1} 
                         onChange={e => setDueDayP1(Number(e.target.value))}
                         className="w-full rounded-xl border border-white/10 bg-white/5 text-white h-11 px-3 focus:outline-none focus:-visible:ring-1 focus-visible:ring-sky-500/50 appearance-none"
                       >
                         {Array.from({length: 31}, (_, i) => i + 1).map(day => (
                           <option key={day} value={day} className="bg-slate-900">Dia {day}</option>
                         ))}
                       </select>
                     </div>
                   )}
                 </div>
               </CardContent>
            </Card>

            {/* Pessoa 2 */}
            {goalType === 'shared' && (
              <Card className="glass-card-subtle border-white/10 rounded-2xl shadow-sm overflow-hidden bg-transparent">
                 <div className="bg-white/5 p-3 border-b border-white/10">
                   <h3 className="font-bold text-sky-400">Pessoa 2</h3>
                 </div>
               <CardContent className="p-4 space-y-4">
                   <div className="space-y-1.5">
                     <Label className="text-slate-400 font-bold text-xs">Nome *</Label>
                     <Input 
                       value={nameP2} 
                       onChange={e => {
                         setNameP2(e.target.value);
                         if (errors.nameP2) setErrors({ ...errors, nameP2: "" });
                       }} 
                       className={`rounded-xl bg-white/5 text-white h-11 focus-visible:ring-sky-500/50 ${errors.nameP2 ? 'border-red-400/50' : 'border-white/10'}`} 
                     />
                     {errors.nameP2 && <p className="text-[10px] text-red-400 font-medium">{errors.nameP2}</p>}
                   </div>
                   <div className="space-y-1.5">
                     <Label className="text-slate-400 font-bold text-xs">WhatsApp</Label>
                     <Input 
                       type="tel"
                       value={phoneP2} 
                       onChange={e => setPhoneP2(formatPhone(e.target.value))} 
                       placeholder="(99) 99999-9999"
                       className="rounded-xl border-white/10 bg-white/5 text-white placeholder-slate-600 h-11 focus-visible:ring-sky-500/50" 
                     />
                   </div>
                   <div className="space-y-1.5">
                     <Label className="text-slate-400 font-bold text-xs">Chave Pix</Label>
                     <div className="flex gap-2">
  <select value={pixTypeP2} onChange={e => { setPixTypeP2(e.target.value); setPixKeyP2(formatPixKeyInput(pixKeyP2, e.target.value)); }} className="rounded-xl border border-white/10 bg-white/5 text-white h-11 px-2 focus:outline-none focus:ring-1 focus:ring-sky-500/50 appearance-none text-[11px] w-[95px] sm:w-[120px] shrink-0">
    <option value="celular" className="text-slate-900">Celular</option>
    <option value="cpf_cnpj" className="text-slate-900">CPF/CNPJ</option>
    <option value="email" className="text-slate-900">E-mail</option>
    <option value="random" className="text-slate-900">Aleatória</option>
  </select>
  <Input value={pixKeyP2} 
                       onChange={e => { setPixKeyP2(formatPixKeyInput(e.target.value, pixTypeP2)); if (errors.pixKeyP2) setErrors({ ...errors, pixKeyP2: "" }); }} 
                       className={`flex-1 rounded-xl border-white/10 bg-white/5 text-white h-11 focus-visible:ring-sky-500/50 ${errors.pixKeyP2 ? 'border-red-400/50 focus-visible:ring-red-500/50' : 'border-white/10'}`} 
                       placeholder={pixTypeP2 === "celular" ? "(99) 99999-9999" : pixTypeP2 === "cpf_cnpj" ? "000.000.000-00" : pixTypeP2 === "email" ? "email@exemplo.com" : "Aleatória"}
                     />
</div>
{errors.pixKeyP2 && <p className="text-[10px] text-red-400 font-medium">{errors.pixKeyP2}</p>}
                   </div>
                   <div className="space-y-1.5 pt-2">
                     <Label className="text-sky-400 font-bold text-[10px] uppercase tracking-widest block mb-2">Frequência de contribuição</Label>
                     <div className="flex gap-2 bg-white/5 p-1 rounded-xl border border-white/10 mb-3">
                       {['daily', 'weekly', 'monthly'].map(freq => (
                         <button
                           key={freq}
                           onClick={() => setFrequencyP2(freq)}
                           className={`flex-1 py-2 text-[13px] font-bold rounded-lg transition-colors ${frequencyP2 === freq ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30 shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                         >
                           {freq === 'daily' ? 'Diário' : freq === 'weekly' ? 'Semanal' : 'Mensal'}
                         </button>
                       ))}
                     </div>
                     
                     {frequencyP2 === 'weekly' && (
                       <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
                         <Label className="text-slate-400 font-bold text-xs">Qual dia da semana?</Label>
                         <select 
                           value={dueDayP2} 
                           onChange={e => setDueDayP2(Number(e.target.value))}
                           className="w-full rounded-xl border border-white/10 bg-white/5 text-white h-11 px-3 focus:outline-none focus-visible:ring-1 focus-visible:ring-sky-500/50 appearance-none"
                         >
                           <option value={0} className="bg-slate-900">Domingo</option>
                           <option value={1} className="bg-slate-900">Segunda-feira</option>
                           <option value={2} className="bg-slate-900">Terça-feira</option>
                           <option value={3} className="bg-slate-900">Quarta-feira</option>
                           <option value={4} className="bg-slate-900">Quinta-feira</option>
                           <option value={5} className="bg-slate-900">Sexta-feira</option>
                           <option value={6} className="bg-slate-900">Sábado</option>
                         </select>
                       </div>
                     )}

                     {frequencyP2 === 'monthly' && (
                       <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
                         <Label className="text-slate-400 font-bold text-xs">Qual dia do mês?</Label>
                         <select 
                           value={dueDayP2} 
                           onChange={e => setDueDayP2(Number(e.target.value))}
                           className="w-full rounded-xl border border-white/10 bg-white/5 text-white h-11 px-3 focus:outline-none focus:ring-1 focus:ring-sky-500/50 appearance-none"
                         >
                           {Array.from({length: 31}, (_, i) => i + 1).map(day => (
                             <option key={day} value={day} className="bg-slate-900">Dia {day}</option>
                           ))}
                         </select>
                       </div>
                     )}
                   </div>
                 </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
