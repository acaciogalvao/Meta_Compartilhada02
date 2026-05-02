import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Heart, Target, Calculator, RefreshCcw, Download, TrendingUp, Sparkles, MessageCircle, QrCode, Copy, CheckCircle2, Trash2, Home, List, Plus, ChevronDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { PaymentHistory } from './components/PaymentHistory';
import { PixModal } from './components/PixModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { ClearHistoryConfirmModal } from './components/ClearHistoryConfirmModal';
import { GoalSummary } from './components/GoalSummary';
import { GoalForm } from './components/GoalForm';
import confetti from 'canvas-confetti';

export default function App() {
  const [toastMessage, setToastMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);
  const [goalsList, setGoalsList] = useState<any[]>([]);
  const [currentGoalId, setCurrentGoalId] = useState<string>("");
  const [currentSection, setCurrentSection] = useState<"metas" | "emprestimos">("metas");

  const [category, setCategory] = useState("saving");
  const [interestRate, setInterestRate] = useState("0");
  const [itemName, setItemName] = useState("");
  const [totalValue, setTotalValue] = useState("");
  const [months, setMonths] = useState("12"); // Now represents duration value
  const [durationUnit, setDurationUnit] = useState<"days" | "weeks" | "months">("months");
  const [deadlineType, setDeadlineType] = useState<"duration" | "dates">("duration");
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 12);
    return d.toISOString();
  });
  const [contributionP1, setContributionP1] = useState("50");
  const [goalType, setGoalType] = useState<"individual" | "shared">("shared");
  const [savedP1, setSavedP1] = useState("");
  const [savedP2, setSavedP2] = useState("");
  const [paymentsHistory, setPaymentsHistory] = useState<any[]>([]);
  
  const [nameP1, setNameP1] = useState("Você");
  const [nameP2, setNameP2] = useState("Seu Amor");
  const [phoneP1, setPhoneP1] = useState("");
  const [phoneP2, setPhoneP2] = useState("");
  const [pixKeyP1, setPixKeyP1] = useState("");
  const [pixKeyP2, setPixKeyP2] = useState("");
  const [frequencyP1, setFrequencyP1] = useState<"daily" | "weekly" | "monthly">("monthly");
  const [frequencyP2, setFrequencyP2] = useState<"daily" | "weekly" | "monthly">("monthly");
  const [dueDayP1, setDueDayP1] = useState(5);
  const [dueDayP2, setDueDayP2] = useState(5);
  const [startDate, setStartDate] = useState(new Date().toISOString());
  const [remindersEnabled, setRemindersEnabled] = useState(false);
  const previousSavedRef = useRef<number | null>(null);

  // Pix Modal State
  const [showPixModal, setShowPixModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showClearHistoryConfirm, setShowClearHistoryConfirm] = useState(false);
  const [currentPayer, setCurrentPayer] = useState<"P1" | "P2">("P1");
  const [pixAmount, setPixAmount] = useState("");
  const [pixCode, setPixCode] = useState("");
  const [isGeneratingPix, setIsGeneratingPix] = useState(false);
  const [copied, setCopied] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const [qrCodeBase64, setQrCodeBase64] = useState("");
  const [isManualPayment, setIsManualPayment] = useState(true);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "dinheiro">("pix");
  const [isConfirmingPayment, setIsConfirmingPayment] = useState(false);

  useEffect(() => {
    if (!pixAmount || Number(pixAmount) <= 0) {
      setPixCode("");
      setQrCodeBase64("");
      setIsGeneratingPix(false);
    }
  }, [pixAmount]);

  const showToast = (text: string, type: 'success' | 'error' = 'error') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const [activeTab, setActiveTab] = useState<"inicio" | "historico">("inicio");
  const [isEditing, setIsEditing] = useState(false);

  // Fetch data from MongoDB
  const handleDeletePaymentItem = async (pid: string) => {
    if (!currentGoalId) return;
    try {
      await fetch(`/api/goal/${currentGoalId}/payment/${pid}`, { method: 'DELETE' });
      const res = await fetch(`/api/goal/${currentGoalId}`);
      if (res.ok) {
        const data = await res.json();
        populateGoalData(data, false);
      }
    } catch (error) {
      console.error("Error deleting payment:", error);
    }
  };

  const clearGoalData = () => {
    setCurrentGoalId("");
    setCategory(currentSection === "emprestimos" ? "loan" : "saving");
    setItemName("");
    setTotalValue("");
    setMonths("12");
    setDurationUnit("months");
    setDeadlineType("duration");
    const d = new Date();
    setStartDate(d.toISOString());
    d.setMonth(d.getMonth() + 12);
    setEndDate(d.toISOString());
    setContributionP1("50");
    setGoalType("shared");
    setNameP1("Você");
    setNameP2("Seu Amor");
    setPhoneP1("");
    setPhoneP2("");
    setPixKeyP1("");
    setPixKeyP2("");
    setFrequencyP1("monthly");
    setFrequencyP2("monthly");
    setDueDayP1(5);
    setDueDayP2(5);
    setSavedP1("");
    setSavedP2("");
    setPaymentsHistory([]);
    setRemindersEnabled(false);
  };

  const populateGoalData = (data: any, isInitialLoad: boolean = false) => {
    if (isInitialLoad) {
      if (data.category !== undefined) setCategory(data.category);
      if (data.interestRate !== undefined) setInterestRate(data.interestRate.toString());
      if (data.itemName !== undefined) setItemName(data.itemName);
      if (data.totalValue !== undefined) setTotalValue(data.totalValue.toString());
      if (data.months !== undefined) setMonths(data.months.toString());
      if (data.durationUnit !== undefined) setDurationUnit(data.durationUnit);
      if (data.deadlineType !== undefined) setDeadlineType(data.deadlineType);
      if (data.endDate !== undefined) setEndDate(data.endDate);
      if (data.contributionP1 !== undefined) setContributionP1(data.contributionP1.toString());
      if (data.type !== undefined) setGoalType(data.type);
      if (data.nameP1 !== undefined) setNameP1(data.nameP1);
      if (data.nameP2 !== undefined) setNameP2(data.nameP2);
      if (data.phoneP1 !== undefined) setPhoneP1(data.phoneP1);
      if (data.phoneP2 !== undefined) setPhoneP2(data.phoneP2);
      if (data.pixKeyP1 !== undefined) setPixKeyP1(data.pixKeyP1);
      if (data.pixKeyP2 !== undefined) setPixKeyP2(data.pixKeyP2);
      if (data.frequencyP1 !== undefined) setFrequencyP1(data.frequencyP1);
      if (data.frequencyP2 !== undefined) setFrequencyP2(data.frequencyP2);
      if (data.dueDayP1 !== undefined) setDueDayP1(data.dueDayP1);
      if (data.dueDayP2 !== undefined) setDueDayP2(data.dueDayP2);
      if (data.startDate !== undefined) setStartDate(data.startDate);
      if (data.remindersEnabled !== undefined) setRemindersEnabled(data.remindersEnabled);
    }
    
    // Check if goal was just completed
    const oldSaved = Number(savedP1) + Number(savedP2);
    const newSaved = (data.savedP1 || 0) + (data.savedP2 || 0);
    const total = data.totalValue || 0;
    
    if (data.savedP1 !== undefined) setSavedP1(data.savedP1.toString());
    if (data.savedP2 !== undefined) setSavedP2(data.savedP2.toString());
    if (data.payments !== undefined) setPaymentsHistory(data.payments);

    if (isInitialLoad) {
      previousSavedRef.current = newSaved;
    } else if (previousSavedRef.current !== null && newSaved >= total && previousSavedRef.current < total && total > 0) {
      triggerConfetti();
      previousSavedRef.current = newSaved;
    } else {
      previousSavedRef.current = newSaved;
    }
  };

  const triggerConfetti = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    // Create a custom canvas to avoid conflicts with global canvas variables
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';
    document.body.appendChild(canvas);

    const myConfetti = confetti.create(canvas, {
      resize: true,
      useWorker: true
    });

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        setTimeout(() => {
          if (canvas.parentNode) {
            canvas.parentNode.removeChild(canvas);
          }
        }, 3000);
        return;
      }

      const particleCount = Math.floor(50 * (timeLeft / duration));
      myConfetti({
        ...defaults, particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      myConfetti({
        ...defaults, particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);
  };

  // Initial load
  useEffect(() => {
    const loadInitial = async () => {
      try {
        const res = await fetch("/api/goals");
        if (!res.ok) return;
        
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
           return;
        }
        
        const data = await res.json();
        setGoalsList(data);
        if (data.length > 0) {
          const firstGoal = data[0];
          setCurrentSection(firstGoal.category === "loan" ? "emprestimos" : "metas");
          setCurrentGoalId(firstGoal._id);
        } else {
          clearGoalData();
        }
      } catch (e) {
        console.error("Error loading initial goals", e);
      }
    };
    loadInitial();
  }, []);

  // Polling and data fetching when currentGoalId changes
  useEffect(() => {
    const fetchGoalsList = async () => {
      try {
        const res = await fetch("/api/goals");
        if (!res.ok) return;
        
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          return;
        }
        
        const data = await res.json();
        setGoalsList(data);
      } catch (e: any) {
        if (e.message === "Failed to fetch") return;
        console.error("Error loading goals list", e);
      }
    };

    const fetchGoalData = async (isInitialLoad: boolean = false) => {
      if (!currentGoalId) return;
      
      try {
        const res = await fetch(`/api/goal/${currentGoalId}`);
        if (!res.ok) return;
        
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          return;
        }
        
        const data = await res.json();
        populateGoalData(data, isInitialLoad);
      } catch (e: any) {
        // Ignore network errors during polling (e.g. when server restarts)
        if (e.message === "Failed to fetch") return;
        console.error("Error loading initial data", e);
      }
    };
    
    if (currentGoalId) {
      fetchGoalData(true);
    }
    
    const interval = setInterval(() => {
      if (currentGoalId) {
        fetchGoalData(false);
      }
      fetchGoalsList();
    }, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [currentGoalId]);

  const handleSaveGoals = async (overrideUpdates?: any) => {
    try {
      const updates = {
        type: goalType,
        category,
        interestRate: Number(interestRate),
        itemName,
        totalValue: Number(totalValue),
        months: Number(months),
        durationUnit,
        deadlineType,
        startDate,
        endDate,
        contributionP1: goalType === "individual" ? 100 : Number(contributionP1),
        remindersEnabled,
        nameP1,
        nameP2,
        phoneP1,
        phoneP2,
        pixKeyP1,
        pixKeyP2,
        frequencyP1,
        frequencyP2,
        dueDayP1,
        dueDayP2,
        savedP1: results.sP1,
        savedP2: goalType === "individual" ? 0 : results.sP2,
        ...overrideUpdates
      };

      let res;
      if (currentGoalId) {
        res = await fetch(`/api/goal/${currentGoalId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates)
        });
      } else {
        res = await fetch("/api/goal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates)
        });
      }
      
      if (res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
           const savedGoal = await res.json();
           setCurrentGoalId(savedGoal._id);
        } else {
           const text = await res.text();
           if (text.toLowerCase().includes("<!doctype html>")) {
             throw new Error("O servidor está reiniciando ou indisponível no momento. Por favor, aguarde alguns segundos e tente salvar novamente.");
           }
           throw new Error(`Erro desconhecido do servidor (Status ${res.status}). Detalhes: ${text.substring(0, 50)}`);
        }
        
        // Update goals list
        const listRes = await fetch("/api/goals");
        if (listRes.ok) {
          const listContentType = listRes.headers.get("content-type");
          if (listContentType && listContentType.includes("application/json")) {
            const data = await listRes.json();
            setGoalsList(data);
          }
        }
        showToast("Metas salvas com sucesso!", "success");
      } else {
        const errorData = await res.json().catch(() => ({}));
        showToast(errorData.error || "Erro ao salvar metas.", "error");
      }
    } catch (error: any) {
      console.error("Error saving goal data:", error);
      showToast(error.message || "Erro de conexão ao salvar metas.", "error");
    }
  };

  const handleClearHistoryClick = () => {
    setShowClearHistoryConfirm(true);
  };

  const confirmClearHistory = async () => {
    try {
      await Promise.all(paymentsHistory.map(p => 
        fetch(`/api/goal/${currentGoalId}/payment/${p.paymentId}`, { method: "DELETE" })
      ));
      showToast("Histórico excluído com sucesso!", "success");
      
      // Reset saved amounts locally
      setSavedP1("0");
      setSavedP2("0");
      setPaymentsHistory([]);
      
      // Re-fetch to ensure sync
      const res = await fetch(`/api/goal/${currentGoalId}`);
      if (res.ok) {
        const data = await res.json();
        populateGoalData(data, false);
      }
    } catch (error) {
      console.error("Error clearing history:", error);
      showToast("Erro ao excluir histórico.", "error");
    } finally {
      setShowClearHistoryConfirm(false);
    }
  };

  const handleDeleteGoal = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDeleteGoal = async () => {
    try {
      await fetch(`/api/goal/${currentGoalId}`, {
        method: "DELETE"
      });
      
      // Update goals list
      const listRes = await fetch("/api/goals");
      if (listRes.ok) {
        const data = await listRes.json();
        setGoalsList(data);
        if (data.length > 0) {
          const matchingGoals = data.filter((g: any) => currentSection === "emprestimos" ? g.category === "loan" : g.category !== "loan");
          if (matchingGoals.length > 0) {
              setCurrentGoalId(matchingGoals[0]._id);
          } else {
              clearGoalData();
          }
        } else {
          clearGoalData(); // Clear fields if all are deleted
        }
      }
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error("Error deleting goal:", error);
      // Fallback if alert is blocked, we just log it
    }
  };

  // Poll payment status
  useEffect(() => {
    if (!paymentId || !showPixModal || paymentSuccess) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/check-payment/${paymentId}`);
        const data = await res.json();
        if (data.status === "approved") {
          setPaymentSuccess(true);
          
          // Fetch updated data immediately
          fetch(`/api/goal/${currentGoalId}`)
            .then(r => {
              if (!r.ok || !r.headers.get("content-type")?.includes("application/json")) {
                throw new Error("Invalid response");
              }
              return r.json();
            })
            .then(goalData => {
            if (goalData.savedP1 !== undefined) setSavedP1(goalData.savedP1.toString());
            if (goalData.savedP2 !== undefined) setSavedP2(goalData.savedP2.toString());
            if (goalData.payments !== undefined) setPaymentsHistory(goalData.payments);
          }).catch(console.error);

          setTimeout(() => {
            setShowPixModal(false);
            setPaymentSuccess(false);
            setPixCode("");
            setQrCodeBase64("");
            setPixAmount("");
            setPaymentId(null);
          }, 2000);
        }
      } catch (e: any) {
        if (e.message === "Failed to fetch") return;
        console.error("Error checking payment status", e);
      }
    }, 3000); // Check every 3 seconds

    return () => clearInterval(interval);
  }, [paymentId, showPixModal, paymentSuccess]);

  const handleGeneratePix = async () => {
    if (!currentGoalId) {
      showToast("Por favor, salve os dados antes de gerar um Pix.");
      return;
    }
    const amount = Number(pixAmount);
    if (amount <= 0) return;
    
    setIsGeneratingPix(true);
    try {
      const activePixKey = currentPayer === "P1" ? pixKeyP1 : pixKeyP2;
      
      let response;
      if (activePixKey) {
        // Option 1: Direct personal Pix key provided
        response = await fetch('/api/generate-static-pix', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            amount, 
            pixKey: activePixKey,
            merchantName: currentPayer === "P1" ? nameP1 : nameP2
          })
        });
        
        // In personal pix mode, we don't have a MercadoPago ID to poll
        setPaymentId(null);
        // We set it as a manual payment to show the 'Simulate Pay' / 'Já Paguei' button
        setIsManualPayment(true);
        
      } else {
        // Option 2: Mercado Pago backend
        response = await fetch('/api/create-pix-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount, goalId: currentGoalId, payerId: currentPayer })
        });
      }

      const data = await response.json();
      
      if (!response.ok || data.error) {
        showToast(`Erro ao gerar Pix: ${data.error || 'Erro desconhecido'}`);
        return;
      }
      
      if (data.pixCode) {
        setPixCode(data.pixCode);
      }
      if (data.qrCodeBase64) {
        setQrCodeBase64(data.qrCodeBase64);
      }
      if (data.paymentId) {
        setPaymentId(data.paymentId);
      }
      if (data.isMock !== undefined && !activePixKey) {
        setIsManualPayment(data.isMock);
      }
    } catch (error) {
      console.error("Error generating pix:", error);
    } finally {
      setIsGeneratingPix(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!currentGoalId || isConfirmingPayment) {
      if (!currentGoalId) showToast("Por favor, salve os dados antes de simular um pagamento.");
      return;
    }
    const amount = Number(pixAmount);
    setIsConfirmingPayment(true);
    try {
      await fetch('/api/manual-pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, goalId: currentGoalId, payerId: currentPayer, method: paymentMethod })
      });
      setPaymentSuccess(true);
      
      // Fetch updated data immediately
      fetch(`/api/goal/${currentGoalId}`)
        .then(r => {
          if (!r.ok || !r.headers.get("content-type")?.includes("application/json")) {
            throw new Error("Invalid response");
          }
          return r.json();
        })
        .then(goalData => {
        if (goalData.savedP1 !== undefined) setSavedP1(goalData.savedP1.toString());
        if (goalData.savedP2 !== undefined) setSavedP2(goalData.savedP2.toString());
        if (goalData.payments !== undefined) setPaymentsHistory(goalData.payments);
      }).catch(console.error);

      setTimeout(() => {
        setShowPixModal(false);
        setPaymentSuccess(false);
        setPixCode("");
        setQrCodeBase64("");
        setPixAmount("");
        setPaymentId(null);
      }, 2000);
    } catch (error) {
      console.error("Error simulating payment:", error);
    } finally {
      setIsConfirmingPayment(false);
    }
  };

  const copyPixCode = () => {
    navigator.clipboard.writeText(pixCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const contributionP2 = 100 - (Number(contributionP1) || 0);

  const results = useMemo(() => {
    const baseTotal = Number(totalValue) || 0;
    const isLoan = category === 'loan';
    const total = isLoan ? baseTotal * (1 + (Number(interestRate) || 0) / 100) : baseTotal;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0,0,0,0);
    end.setHours(0,0,0,0);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const timeValue = Math.max(1, diffDays);
    const actualDurationUnit = 'days';
    
    let totalMonths = timeValue / 30.4166;
    const actualFreqP1 = frequencyP1;
    const actualFreqP2 = frequencyP2;

    // Calculate actual saved amounts from the database state (which includes initial values and tracks payments)
    const sP1 = Number(savedP1) || 0;
    const sP2 = Number(savedP2) || 0;
    const saved = sP1 + sP2;

    const remaining = Math.max(0, total - saved);
    const progressPercent = total > 0 ? Math.min(100, (saved / total) * 100) : 0;

    const actualContributionP1 = goalType === 'individual' ? 100 : (Number(contributionP1) || 0);
    const actualContributionP2 = goalType === 'individual' ? 0 : contributionP2;

    const totalP1 = total * (actualContributionP1 / 100);
    const totalP2 = total * (actualContributionP2 / 100);

    const remainingP1 = Math.max(0, totalP1 - sP1);
    const remainingP2 = Math.max(0, totalP2 - sP2);

    const getPeriodsCount = (rawTime: number, unit: string, freq: string) => {
      if (rawTime <= 0) return 1;
      let totalDays = rawTime;
      if (unit === 'weeks') totalDays = rawTime * 7;
      if (unit === 'months') totalDays = rawTime * 30.4166;
      
      if (freq === 'daily') return Math.max(1, Math.round(totalDays));
      if (freq === 'weekly') return Math.max(1, Math.round(totalDays / 7));
      return Math.max(1, Math.round(totalDays / 30.4166));
    };

    const getInstallment = (remainingAmount: number, rawTime: number, unit: string, freq: string) => {
      const periods = getPeriodsCount(rawTime, unit, freq);
      return remainingAmount / periods;
    };

    const baseInstallmentP1 = getInstallment(totalP1, timeValue, actualDurationUnit, actualFreqP1);
    const baseInstallmentP2 = getInstallment(totalP2, timeValue, actualDurationUnit, actualFreqP2);

    const installmentP1 = Math.min(baseInstallmentP1, remainingP1);
    const installmentP2 = Math.min(baseInstallmentP2, remainingP2);

    const totalPeriodsP1 = getPeriodsCount(timeValue, actualDurationUnit, actualFreqP1);
    const totalPeriodsP2 = getPeriodsCount(timeValue, actualDurationUnit, actualFreqP2);

    const paidPeriodsCountP1 = baseInstallmentP1 > 0 ? Math.floor((sP1 / baseInstallmentP1) + 0.05) : 0;
    const paidPeriodsCountP2 = baseInstallmentP2 > 0 ? Math.floor((sP2 / baseInstallmentP2) + 0.05) : 0;

    const monthlyP1 = totalMonths > 0 ? remainingP1 / totalMonths : 0;
    const monthlyP2 = totalMonths > 0 ? remainingP2 / totalMonths : 0;
    const monthlyTotal = monthlyP1 + monthlyP2;

    const weeklyP1 = monthlyP1 / 4.3333;
    const weeklyP2 = monthlyP2 / 4.3333;
    const weeklyTotal = monthlyTotal / 4.3333;

    const dailyP1 = monthlyP1 / 30.4166;
    const dailyP2 = monthlyP2 / 30.4166;
    const dailyTotal = monthlyTotal / 30.4166;

    // Chart Data Projection
    const chartData = [];
    let currentSaved = saved;
    // We project up to total time points based on duration unit
    for (let i = 0; i <= timeValue; i++) {
        const unitLabel = actualDurationUnit === 'days' ? 'Dia' : actualDurationUnit === 'weeks' ? 'Sem' : 'Mês';
      chartData.push({
        month: i === 0 ? 'Hoje' : `${unitLabel} ${i}`,
        acumulado: currentSaved,
        meta: total
      });
      if (actualDurationUnit === 'days') currentSaved += dailyTotal;
      else if (actualDurationUnit === 'weeks') currentSaved += weeklyTotal;
      else currentSaved += monthlyTotal;
    }

    const currentNow = new Date();
    const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const today = new Date(currentNow.getFullYear(), currentNow.getMonth(), currentNow.getDate());

    // Determine if late based on expected periods from startDate
    const checkIsLate = (payer: string, freq: string, paidPeriods: number, dueDay: number) => {
      const payerTotal = payer === 'P1' ? totalP1 : totalP2;
      const payerSaved = payer === 'P1' ? sP1 : sP2;
      if (payerSaved >= payerTotal || payerTotal === 0) return false;
      
      // Se hoje for antes da data de início, não pode estar atrasado
      if (today < startDay) return false;

      const daysElapsed = Math.floor((today.getTime() - startDay.getTime()) / (1000 * 60 * 60 * 24));
      if (daysElapsed <= 0) return false;

      let expectedPeriodsElapsed = 0;
      
      if (freq === 'daily') {
        expectedPeriodsElapsed = daysElapsed;
      } else if (freq === 'weekly') {
        const weeksElapsed = Math.floor(daysElapsed / 7);
        // If today's day of week is past the due day of week, add 1 (dueDay: 0=Sun, 1=Mon, ...)
        // We'll just do a rough estimate based on weeks elapsed since start date + current week check
        expectedPeriodsElapsed = weeksElapsed;
        const startDow = startDay.getDay();
        const currentDow = today.getDay();
        if (weeksElapsed > 0 && currentDow > dueDay && startDow <= dueDay) {
            expectedPeriodsElapsed += 1;
        }
      } else if (freq === 'monthly') {
        const monthsDiff = (today.getFullYear() - startDay.getFullYear()) * 12 + today.getMonth() - startDay.getMonth();
        // dueDay is 1-31
        expectedPeriodsElapsed = today.getDate() > dueDay ? monthsDiff : monthsDiff - 1;
        expectedPeriodsElapsed = Math.max(0, expectedPeriodsElapsed);
      }

      return paidPeriods < expectedPeriodsElapsed;
    };

    const getNextDueDate = (freq: string, paidPeriods: number, dueDay: number) => {
      const d = new Date(startDay.getFullYear(), startDay.getMonth(), startDay.getDate());
      if (freq === 'daily') {
          d.setDate(d.getDate() + paidPeriods + 1);
      } else if (freq === 'weekly') {
          let daysToFirst = (dueDay - d.getDay() + 7) % 7;
          if (daysToFirst === 0) daysToFirst = 7;
          d.setDate(d.getDate() + daysToFirst + (paidPeriods * 7));
      } else if (freq === 'monthly') {
          d.setDate(1);
          d.setMonth(startDay.getMonth() + paidPeriods + 1);
          const targetMonth = d.getMonth();
          d.setDate(dueDay);
          if (d.getMonth() !== targetMonth) d.setDate(0);
      }
      return d;
    };

    const isLateP1 = checkIsLate('P1', actualFreqP1, paidPeriodsCountP1, dueDayP1);
    const isLateP2 = checkIsLate('P2', actualFreqP2, paidPeriodsCountP2, dueDayP2);
    
    const nextDueDateP1 = getNextDueDate(actualFreqP1, paidPeriodsCountP1, dueDayP1);
    const nextDueDateP2 = getNextDueDate(actualFreqP2, paidPeriodsCountP2, dueDayP2);
    
    const referenceDate = today < startDay ? startDay : today;
    
    const daysToNextP1 = Math.ceil((nextDueDateP1.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysToNextP2 = Math.ceil((nextDueDateP2.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24));

    return {
      baseTotal,
      total,
      time: timeValue,
      saved,
      sP1,
      sP2,
      remaining,
      progressPercent,
      totalP1,
      totalP2,
      remainingP1,
      remainingP2,
      actualFreqP1,
      actualFreqP2,
      baseInstallmentP1,
      baseInstallmentP2,
      installmentP1,
      installmentP2,
      monthlyP1,
      monthlyP2,
      monthlyTotal,
      weeklyP1,
      weeklyP2,
      weeklyTotal,
      dailyP1,
      dailyP2,
      dailyTotal,
      totalPeriodsP1,
      paidPeriodsCountP1,
      totalPeriodsP2,
      paidPeriodsCountP2,
      chartData,
      isLateP1,
      isLateP2,
      daysToNextP1,
      daysToNextP2
    };
  }, [totalValue, months, durationUnit, deadlineType, contributionP1, savedP1, savedP2, frequencyP1, frequencyP2, contributionP2, paymentsHistory, dueDayP1, dueDayP2, startDate, endDate]);

  const getMotivationalMessage = (percent: number) => {
    if (percent === 0) return "Toda grande jornada começa com o primeiro passo. Vamos lá!";
    if (percent < 25) return "Bom começo! O importante é manter a consistência.";
    if (percent < 50) return "Quase na metade! Vocês estão indo super bem.";
    if (percent < 75) return "Passamos da metade! O sonho está cada vez mais perto.";
    if (percent < 100) return "Falta muito pouco! Reta final para a conquista.";
    return "🎉 Parabéns! Vocês alcançaram a meta juntos! Que venham os próximos sonhos!";
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string>>) => {
    const digits = e.target.value.replace(/\D/g, '');
    if (!digits) {
      setter("");
      return;
    }
    const numericValue = Number(digits) / 100;
    setter(numericValue.toString());
  };

  const getFreqLabel = (freq: string) => {
    if (freq === 'daily') return 'Por dia';
    if (freq === 'weekly') return 'Por semana';
    return 'Por mês';
  };

  const handleReset = () => {
    setItemName("");
    setTotalValue("");
    setMonths("12");
    setContributionP1("50");
    setSavedP1("");
    setSavedP2("");
  };

  const handleExportText = (): string => {
    let text = "";
    const formatPaidSequence = (paid: number, total: number) => {
       const current = Math.min(paid + 1, total);
       const totalStr = String(total).padStart(2, '0');
       return `${String(current).padStart(2, '0')}/${totalStr}`;
    };

    if (category === 'loan') {
        text = `
🔔 *LEMBRETE DE EMPRÉSTIMO*

Passando para atualizar o status do empréstimo: *${itemName || 'Empréstimo'}*

🏦 *Valor Original (Sem Juros):* ${formatCurrency(results.baseTotal)}
💰 *Valor Total (Com Juros):* ${formatCurrency(results.total)}
✅ *Já foi pago:* ${formatCurrency(results.saved)}
📉 *Falta pagar:* ${formatCurrency(results.remaining)}
`;
        if (goalType === "shared") {
            text += `
👥 *Resumo por Pessoa:*
👤 *${nameP1}:* ${results.isLateP1 ? '⚠️ ATRASADO' : '✅ EM DIA'}
   - Já quitou: ${formatCurrency(results.sP1)}
   - Parcela Atual: ${formatPaidSequence(results.paidPeriodsCountP1, results.totalPeriodsP1)}
   - Resta pagar: ${formatCurrency(results.remainingP1)}

👤 *${nameP2}:* ${results.isLateP2 ? '⚠️ ATRASADO' : '✅ EM DIA'}
   - Já quitou: ${formatCurrency(results.sP2)}
   - Parcela Atual: ${formatPaidSequence(results.paidPeriodsCountP2, results.totalPeriodsP2)}
   - Resta pagar: ${formatCurrency(results.remainingP2)}

📆 _Por favor, não se esqueçam do pagamento da parcela atual!_
`;
        } else {
            text += `
👤 *Titular:* ${nameP1} ${results.isLateP1 ? '⚠️ ATRASADO' : '✅ EM DIA'}
   - Parcela Atual: ${formatPaidSequence(results.paidPeriodsCountP1, results.totalPeriodsP1)}
   - Valor da Parcela: ${formatCurrency(results.installmentP1)} (${getFreqLabel(results.actualFreqP1).toLowerCase()})
   - Resta pagar: ${formatCurrency(results.remainingP1)}

📆 _Por favor, lembre-se do pagamento da parcela atual!_
`;
        }
    } else {
        text = `
🎯 *LEMBRETE DA META*

Passando para atualizar o progresso da ${goalType === 'individual' ? 'minha meta' : 'nossa meta'}: *${itemName || 'Sem nome'}*

💰 *Objetivo de Valor:* ${formatCurrency(results.total)}
✅ *Já Guardado:* ${formatCurrency(results.saved)} (${results.progressPercent.toFixed(1)}%)
📉 *Falta:* ${formatCurrency(results.remaining)}
`;

        if (goalType === "shared") {
          text += `
📊 *Resumo Individual:*
👤 *${nameP1} (${contributionP1}%):* ${results.isLateP1 ? '⚠️ ATRASADO' : '✅ EM DIA'}
   - Já guardou: ${formatCurrency(results.sP1)}
   - Guardar na vez: ${formatCurrency(results.installmentP1)} ${getFreqLabel(results.actualFreqP1).toLowerCase()}
   - Resta: ${formatCurrency(results.remainingP1)}

👤 *${nameP2} (${contributionP2}%):* ${results.isLateP2 ? '⚠️ ATRASADO' : '✅ EM DIA'}
   - Já guardou: ${formatCurrency(results.sP2)}
   - Guardar na vez: ${formatCurrency(results.installmentP2)} ${getFreqLabel(results.actualFreqP2).toLowerCase()}
   - Resta: ${formatCurrency(results.remainingP2)}

Bora conquistar esse objetivo juntos! ❤️💪`;
        } else {
          text += `
👤 *Meu Resumo:* ${results.isLateP1 ? '⚠️ ATRASADO' : '✅ EM DIA'}
   - Guardar na vez: ${formatCurrency(results.installmentP1)} ${getFreqLabel(results.actualFreqP1).toLowerCase()}

Bora conquistar! 💪`;
        }
    }

    return text.trim();
  };

  const handleCreateNewGoal = () => {
    clearGoalData();
    if (currentSection === "emprestimos") {
        setCategory("loan");
    } else {
        setCategory("saving");
    }
    setIsEditing(true);
    setActiveTab("inicio");
  };

  const filteredGoalsList = goalsList.filter(g => currentSection === "emprestimos" ? g.category === "loan" : g.category !== "loan");

  return (
    <>
    <div className="min-h-screen w-full flex justify-center font-sans selection:bg-sky-500/30 text-white relative">
      <div className="mesh-gradient"></div>
      <div className="w-full max-w-6xl min-h-screen relative pb-24 overflow-x-hidden flex flex-col mx-auto px-2 sm:px-6 md:px-8 z-0">
        {toastMessage && (
          <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full shadow-lg text-white text-sm font-medium transition-all w-11/12 max-w-sm text-center ${toastMessage.type === 'success' ? 'bg-emerald-500/90 backdrop-blur border border-emerald-400/20' : 'bg-rose-500/90 backdrop-blur border border-rose-400/20'}`}>
            {toastMessage.text}
          </div>
        )}

        {/* Global Tabs Navigation (Metas vs Empréstimos) */}
        {!isEditing && (
            <div className="flex justify-center mt-6 mb-4">
                <div className="bg-white/5 p-1 rounded-full border border-white/10 flex gap-1">
                    <button 
                        onClick={() => {
                            setCurrentSection("metas");
                            setCategory("saving");
                            const metas = goalsList.filter(g => g.category !== "loan");
                            if (metas.length > 0) setCurrentGoalId(metas[0]._id);
                            else clearGoalData();
                        }}
                        className={`px-6 py-2 rounded-full text-sm font-bold tracking-wide transition-all ${currentSection === "metas" ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-white"}`}
                    >
                        Minhas Metas
                    </button>
                    <button 
                        onClick={() => {
                            setCurrentSection("emprestimos");
                            setCategory("loan");
                            const loans = goalsList.filter(g => g.category === "loan");
                            if (loans.length > 0) setCurrentGoalId(loans[0]._id);
                            else clearGoalData();
                        }}
                        className={`px-6 py-2 rounded-full text-sm font-bold tracking-wide transition-all ${currentSection === "emprestimos" ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-white"}`}
                    >
                        Empréstimos
                    </button>
                </div>
            </div>
        )}

        {isEditing && (
          <GoalForm
          goalType={goalType}
          setGoalType={setGoalType}
          category={category}
          setCategory={setCategory}
          interestRate={interestRate}
          setInterestRate={setInterestRate}
          itemName={itemName}
          setItemName={setItemName}
          totalValue={totalValue}
          setTotalValue={setTotalValue}
          months={months}
          setMonths={setMonths}
          durationUnit={durationUnit}
          setDurationUnit={setDurationUnit}
          deadlineType={deadlineType}
          setDeadlineType={setDeadlineType}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          nameP1={nameP1}
          setNameP1={setNameP1}
          nameP2={nameP2}
          setNameP2={setNameP2}
          pixKeyP1={pixKeyP1}
          setPixKeyP1={setPixKeyP1}
          pixKeyP2={pixKeyP2}
          setPixKeyP2={setPixKeyP2}
          phoneP1={phoneP1}
          setPhoneP1={setPhoneP1}
          phoneP2={phoneP2}
          setPhoneP2={setPhoneP2}
          contributionP1={contributionP1}
          setContributionP1={setContributionP1}
          frequencyP1={frequencyP1}
          setFrequencyP1={setFrequencyP1}
          frequencyP2={frequencyP2}
          setFrequencyP2={setFrequencyP2}
          dueDayP1={dueDayP1}
          setDueDayP1={setDueDayP1}
          dueDayP2={dueDayP2}
          setDueDayP2={setDueDayP2}
          formatCurrency={formatCurrency}
          handleCurrencyChange={handleCurrencyChange}
          onCancel={() => setIsEditing(false)}
          onSave={async () => {
            await handleSaveGoals();
            setIsEditing(false);
          }}
        />
      )}

      <div className={`flex-1 p-4 md:p-8 space-y-6 flex flex-col ${isEditing ? 'hidden' : ''}`}>
        
        {/* Header */}
        <header className="flex justify-between items-end mb-8">
            <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight leading-none">
                    {currentSection === 'emprestimos' ? 'Meus Empréstimos' : (goalType === 'individual' ? 'Meta Individual' : 'Meta Compartilhada')}
                </h1>
                <p className="text-slate-400 mt-2 uppercase text-xs tracking-widest font-semibold">
                    {currentSection === 'emprestimos' ? 'Controle suas dívidas e quitações' : (goalType === 'individual' ? 'Acompanhe o seu progresso financeiro' : 'Dashboard de Controle Financeiro')}
                </p>
            </div>
            <div className="text-right flex items-center gap-2">
              <Button onClick={handleCreateNewGoal} className="w-10 h-10 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30 hover:bg-sky-500/30 shadow-none p-0 flex items-center justify-center shrink-0">
                <Plus className="w-5 h-5" />
              </Button>
            </div>
        </header>

        {/* Goals List Navigation */}
        {filteredGoalsList.length > 0 ? (
          <div className="relative mb-6 md:w-1/2 lg:w-1/3">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Target className="w-4 h-4 text-sky-400" />
            </div>
            <select
              value={currentGoalId}
              onChange={(e) => {
                setCurrentGoalId(e.target.value);
                setIsEditing(false);
              }}
              className="w-full h-11 pl-10 pr-10 bg-white/5 border border-white/10 rounded-xl text-white font-semibold text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-sky-500/50 shadow-sm"
            >
              {filteredGoalsList.map(goal => (
                <option key={goal._id} value={goal._id} className="bg-slate-900 text-white">
                  {goal.itemName || (currentSection === 'emprestimos' ? "Novo Empréstimo" : "Nova Meta")}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </div>
          </div>
        ) : (
          <div className="mb-6">
             <p className="text-sm text-slate-500 italic">Nenhum item cadastrado nesta sessão.</p>
          </div>
        )}

        {activeTab === "inicio" ? (
          <>
            <div className={`grid grid-cols-1 md:grid-cols-12 gap-6 ${isEditing ? 'hidden' : ''}`}>
              {/* Right Column: Results */}
              <div className="md:col-span-12 lg:col-span-12 space-y-6">
                <GoalSummary 
                  isEditing={isEditing}
                  setIsEditing={setIsEditing}
                  handleDeleteGoal={handleDeleteGoal}
                  setShowPixModal={setShowPixModal}
                  setCurrentPayer={setCurrentPayer}
                  goalType={goalType}
                  category={category}
                  interestRate={interestRate}
                  results={results}
                  savedP1={results.sP1.toString()}
                  savedP2={results.sP2.toString()}
                  nameP1={nameP1}
                  nameP2={nameP2}
                  contributionP1={contributionP1}
                  contributionP2={contributionP2}
                  frequencyP1={results.actualFreqP1 || frequencyP1}
                  frequencyP2={results.actualFreqP2 || frequencyP2}
                  startDate={startDate}
                  endDate={endDate}
                  phoneP1={phoneP1}
                  phoneP2={phoneP2}
                  itemName={itemName}
                  months={months}
                  durationUnit={durationUnit}
                  formatCurrency={formatCurrency}
                  getFreqLabel={getFreqLabel}
                  handleExportText={handleExportText}
                  showToast={showToast}
                  remindersEnabled={remindersEnabled}
                  setRemindersEnabled={setRemindersEnabled}
                  handleSaveGoals={handleSaveGoals}
                  motivationalMessage={getMotivationalMessage(results.progressPercent)}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="mb-24">
            <PaymentHistory 
              paymentsHistory={paymentsHistory}
              nameP1={nameP1}
              nameP2={nameP2}
              phoneP1={phoneP1}
              phoneP2={phoneP2}
              formatCurrency={formatCurrency}
              progressPercent={results.progressPercent}
              handleClearHistory={handleClearHistoryClick}
              installmentP1={results.baseInstallmentP1 || results.installmentP1}
              installmentP2={results.baseInstallmentP2 || results.installmentP2}
              totalPeriodsP1={results.totalPeriodsP1}
              totalPeriodsP2={results.totalPeriodsP2}
              handleDeletePayment={handleDeletePaymentItem}
            />
          </div>
        )}
      </div>
      
        {/* Bottom Navigation */}
        <div className={`fixed bottom-0 md:bottom-6 md:left-[10%] md:w-[80%] left-0 w-full glass-card border-x-0 md:border-x border-b-0 md:border-b border-t border-white/10 flex justify-around items-center p-3 md:p-4 z-40 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] md:pb-4 shadow-lg shadow-black/20 md:rounded-2xl rounded-none rounded-t-3xl ${isEditing ? 'hidden' : ''}`}>
          <button 
          onClick={() => setActiveTab("inicio")} 
          className={`flex flex-col items-center gap-2 w-full transition-colors ${activeTab === 'inicio' ? 'text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Início</span>
        </button>
        <button 
          onClick={() => setActiveTab("historico")} 
          className={`flex flex-col items-center gap-2 w-full transition-colors ${activeTab === 'historico' ? 'text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <List className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Histórico</span>
        </button>
      </div>
      
      <DeleteConfirmModal 
        showDeleteConfirm={showDeleteConfirm}
        setShowDeleteConfirm={setShowDeleteConfirm}
        confirmDeleteGoal={confirmDeleteGoal}
      />

      <ClearHistoryConfirmModal 
        showClearHistoryConfirm={showClearHistoryConfirm}
        setShowClearHistoryConfirm={setShowClearHistoryConfirm}
        confirmClearHistory={confirmClearHistory}
      />

        <PixModal 
          showPixModal={showPixModal}
          setShowPixModal={setShowPixModal}
          currentPayer={currentPayer}
          nameP1={nameP1}
          nameP2={nameP2}
          pixAmount={pixAmount}
          setPixAmount={setPixAmount}
          installmentP1={results.installmentP1}
          installmentP2={results.installmentP2}
          remainingP1={results.remainingP1}
          remainingP2={results.remainingP2}
          pixCode={pixCode}
          setPixCode={setPixCode}
          qrCodeBase64={qrCodeBase64}
          isGeneratingPix={isGeneratingPix}
          paymentSuccess={paymentSuccess}
          copied={copied}
          copyPixCode={copyPixCode}
          handleGeneratePix={handleGeneratePix}
          handleConfirmPayment={handleConfirmPayment}
          isConfirmingPayment={isConfirmingPayment}
          isManualPayment={isManualPayment}
          setIsManualPayment={setIsManualPayment}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          formatCurrency={formatCurrency}
          handleCurrencyChange={handleCurrencyChange}
        />
      </div>
    </div>
    </>
  );
}
