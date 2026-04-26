import express from "express";
import { createServer as createViteServer } from "vite";
import { MercadoPagoConfig, Payment } from "mercadopago";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import QRCode from "qrcode";
import mongoose from "mongoose";

dotenv.config();

// Initialize MongoDB
mongoose.set("bufferCommands", false);

if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI).then(() => {
    console.log("Connected to MongoDB");
  }).catch(err => {
    console.error("MongoDB connection error:", err);
  });
} else {
  console.warn("⚠️ MONGODB_URI is not set. Skipping database connection. API will return 503 errors.");
}

const paymentSchema = new mongoose.Schema({
  paymentId: String,
  amount: Number,
  payerId: String,
  date: { type: Date, default: Date.now }
});

const goalSchema = new mongoose.Schema({
  _id: { type: String, default: "default_goal" },
  type: { type: String, default: "shared" }, // 'individual' or 'shared'
  category: { type: String, default: "other" },
  interestRate: { type: Number, default: 0 },
  itemName: String,
  totalValue: Number,
  months: Number,
  durationUnit: { type: String, default: "months" },
  contributionP1: Number,
  nameP1: String,
  nameP2: String,
  phoneP1: String,
  phoneP2: String,
  pixKeyP1: String,
  pixKeyP2: String,
  frequencyP1: { type: String, default: "monthly" },
  frequencyP2: { type: String, default: "monthly" },
  dueDayP1: { type: Number, default: 5 },
  dueDayP2: { type: Number, default: 5 },
  savedP1: { type: Number, default: 0 },
  savedP2: { type: Number, default: 0 },
  startDate: { type: Date, default: Date.now },
  remindersEnabled: { type: Boolean, default: false },
  payments: [paymentSchema]
});

const Goal = mongoose.model("Goal", goalSchema);

// Initialize Mercado Pago
let cachedMpClient: MercadoPagoConfig | null = null;
let cachedToken: string | null = null;

async function getMpConfig(): Promise<{ client: MercadoPagoConfig | null, isMock: boolean }> {
  let token = process.env.MERCADOPAGO_ACCESS_TOKEN || process.env.APP_USR || process.env.MP_ACCESS_TOKEN;
  
  const isMock = !token || token === "test_dummy";
  
  if (!isMock && (!cachedMpClient || cachedToken !== token)) {
    cachedMpClient = new MercadoPagoConfig({ accessToken: token! });
    cachedToken = token!;
  }
  
  return { client: cachedMpClient, isMock };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Database Connection Check Middleware
  app.use((req, res, next) => {
    if (req.path.startsWith("/api/")) {
      if (mongoose.connection.readyState !== 1) { // 1 = connected
        if (!process.env.MONGODB_URI) {
          return res.status(400).json({ error: "Banco de dados não conectado. Adicione sua variável MONGODB_URI nas configurações do AI Studio (Secrets)." });
        }
        return res.status(400).json({ error: "Conexão com o banco falhou. Verifique sua MONGODB_URI ou se o IP está liberado no Atlas." });
      }
    }
    next();
  });

  // API Endpoints for frontend state
  app.get("/api/goals", async (req, res) => {
    try {
      const goals = await Goal.find().sort({ _id: -1 });
      res.json(goals);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/goal/:id", async (req, res) => {
    try {
      const goal = await Goal.findById(req.params.id);
      if (!goal) return res.status(404).json({ error: "Goal not found" });
      res.json(goal);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/goal", async (req, res) => {
    try {
      console.log("POST /api/goal body:", req.body);
      const newGoal = await Goal.create({
        _id: "goal_" + Date.now(),
        ...req.body,
        payments: []
      });
      console.log("Created goal:", newGoal);
      res.json(newGoal);
    } catch (e: any) {
      console.error("Error creating goal:", e);
      res.status(500).json({ error: e.message });
    }
  });

  app.put("/api/goal/:id", async (req, res) => {
    try {
      const updates = req.body;
      const goal = await Goal.findByIdAndUpdate(req.params.id, updates, { new: true });
      res.json(goal);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete("/api/goal/:id", async (req, res) => {
    try {
      await Goal.findByIdAndDelete(req.params.id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete("/api/goal/:goalId/payment/:paymentId", async (req, res) => {
    try {
      const { goalId, paymentId } = req.params;
      const goal = await Goal.findById(goalId);
      
      if (!goal) {
        return res.status(404).json({ error: "Goal not found" });
      }

      const paymentIndex = goal.payments.findIndex(p => p.paymentId === paymentId);
      if (paymentIndex === -1) {
        return res.status(404).json({ error: "Payment not found" });
      }

      const payment = goal.payments[paymentIndex];
      
      // Deduct the amount from the respective payer
      if (payment.payerId === 'P2') {
        goal.savedP2 = Math.max(0, (goal.savedP2 || 0) - (payment.amount || 0));
      } else {
        goal.savedP1 = Math.max(0, (goal.savedP1 || 0) - (payment.amount || 0));
      }

      // Remove the payment
      goal.payments.splice(paymentIndex, 1);
      
      await goal.save();
      res.json({ success: true, goal });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Webhook endpoint for Mercado Pago
  app.post("/api/webhook", async (req, res) => {
    console.log("Webhook received:", JSON.stringify(req.body, null, 2), "Query:", req.query);
    const { client, isMock } = await getMpConfig();

    if (isMock || !client) {
      res.status(400).send("Mock mode or missing config");
      return;
    }

    const paymentId = req.body?.data?.id || req.query?.['data.id'] || req.query?.id;
    const type = req.body?.type || req.body?.topic || req.body?.action || req.query?.type || req.query?.topic;

    if ((type === "payment" || type === "payment.created" || type === "payment.updated") && paymentId) {
      try {
        const payment = new Payment(client);
        const paymentData = await payment.get({ id: paymentId });

        if (paymentData.status === "approved") {
          const amountReceived = paymentData.transaction_amount;
          const goalId = paymentData.metadata?.goal_id || "default_goal";
          const payerId = paymentData.metadata?.payer_id; // 'P1' or 'P2'

          console.log(`Payment received! Amount: ${amountReceived}, Payer: ${payerId}`);

          if (amountReceived) {
            const goal = await Goal.findById(goalId);
            if (goal && !goal.payments.some(p => p.paymentId === paymentId.toString())) {
              goal.payments.push({
                paymentId: paymentId.toString(),
                amount: amountReceived,
                payerId: payerId || 'P1'
              });
              if (payerId === 'P2') {
                goal.savedP2 = (goal.savedP2 || 0) + amountReceived;
              } else {
                goal.savedP1 = (goal.savedP1 || 0) + amountReceived;
              }
              await goal.save();
              console.log("MongoDB updated successfully.");
            }
          }
        }
      } catch (error) {
        console.error("Error processing MP webhook:", error);
      }
    }

    res.json({ received: true });
  });

  function getCRC16(payload: string) {
    let crc = 0xFFFF;
    for (let i = 0; i < payload.length; i++) {
      crc ^= payload.charCodeAt(i) << 8;
      for (let j = 0; j < 8; j++) {
        if ((crc & 0x8000) > 0) {
          crc = (crc << 1) ^ 0x1021;
        } else {
          crc = crc << 1;
        }
      }
    }
    return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
  }

  function formatPixKey(key: string) {
    let k = key.trim();
    
    // Extract key from full BR Code if user pasted "Pix Copia e Cola"
    if (k.startsWith('000201') && k.includes('br.gov.bcb.pix01')) {
      const idx = k.indexOf('br.gov.bcb.pix01');
      if (idx !== -1) {
         const lenStr = k.substring(idx + 16, idx + 18);
         const len = parseInt(lenStr, 10);
         if (!isNaN(len)) {
           k = k.substring(idx + 18, idx + 18 + len);
         }
      }
    }

    // Email
    if (k.includes('@')) return k;
    // EVP (Random Key) - keep as is
    if (k.length === 36 && k.includes('-')) return k;
    
    const numeric = k.replace(/\D/g, '');
    
    // CNPJ
    if (numeric.length === 14) return numeric;
    
    // Exactly 11 digits could be CPF or Mobile Phone
    if (numeric.length === 11) {
      
      const isValidCpfLogic = (cpf: string) => {
        if (/^(\d)\1{10}$/.test(cpf)) return false;
        let sum = 0;
        for (let i = 0; i < 9; i++) sum += parseInt(cpf.charAt(i)) * (10 - i);
        let rev = 11 - (sum % 11);
        if (rev === 10 || rev === 11) rev = 0;
        if (rev !== parseInt(cpf.charAt(9))) return false;
        sum = 0;
        for (let i = 0; i < 10; i++) sum += parseInt(cpf.charAt(i)) * (11 - i);
        rev = 11 - (sum % 11);
        if (rev === 10 || rev === 11) rev = 0;
        if (rev !== parseInt(cpf.charAt(10))) return false;
        return true;
      };

      const isCpfFormatStrict = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(k);
      const isPhoneFormatStrict = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/.test(k) || k.includes('+');

      if (isCpfFormatStrict) {
        return numeric; // Definitely formatted as CPF
      }

      if (isPhoneFormatStrict) {
        return `+55${numeric}`; // Definitely formatted as Phone
      }
      
      // Fallback if raw digits without explicit mask were provided
      if (isValidCpfLogic(numeric)) {
        return numeric;
      } else {
        return `+55${numeric}`;
      }
    }
    
    // Phone with country code but no '+' (e.g. 5511999999999)
    if (numeric.length === 12 || numeric.length === 13) {
      return `+${numeric}`;
    }
    
    // Fallback: strip spaces to make sure it doesn't break the BR Code format completely
    return k.replace(/\s+/g, '');
  }

  app.post("/api/generate-static-pix", async (req, res) => {
    try {
      const { amount, pixKey, merchantName = "Favorecido", merchantCity = "Cidade" } = req.body;
      
      if (!amount || amount <= 0 || !pixKey) {
        return res.status(400).json({ error: "Valor ou chave Pix inválidos." });
      }

      const formattedPixKey = formatPixKey(pixKey);

      const formatStr = (id: string, value: string) => {
        const len = value.length.toString().padStart(2, '0');
        return `${id}${len}${value}`;
      };

      const merchantAccountInfo = formatStr("00", "br.gov.bcb.pix") + formatStr("01", formattedPixKey);
      const cleanName = merchantName.substring(0, 25).normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Za-z0-9 ]/g, "").trim();
      const cleanCity = merchantCity.substring(0, 15).normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Za-z0-9 ]/g, "").trim();
      const amountStr = Number(amount).toFixed(2);
      
      let payload = 
        formatStr("00", "01") + 
        formatStr("01", "11") + 
        formatStr("26", merchantAccountInfo) + 
        formatStr("52", "0000") + 
        formatStr("53", "986") + 
        formatStr("54", amountStr) + 
        formatStr("58", "BR") + 
        formatStr("59", cleanName) + 
        formatStr("60", cleanCity) + 
        formatStr("62", formatStr("05", "***"));

      payload += "6304";
      const pixCode = payload + getCRC16(payload);

      const dataUrl = await QRCode.toDataURL(pixCode);
      const qrCodeBase64 = dataUrl.split(',')[1];

      res.json({
        pixCode,
        qrCodeBase64
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/create-pix-payment", async (req, res) => {
    try {
      const { amount, goalId, payerId } = req.body;

      if (!amount || amount <= 0) {
        res.status(400).json({ error: "Invalid amount" });
        return;
      }

      const { client, isMock } = await getMpConfig();
      
      if (!isMock && client) {
        const protocol = req.headers['x-forwarded-proto'] || 'https';
        const host = req.headers.host;
        const notificationUrl = host && !host.includes('localhost') 
          ? `${protocol}://${host}/api/webhook` 
          : undefined;

        const payment = new Payment(client);
        const paymentData: any = {
          transaction_amount: Number(amount.toFixed(2)),
          description: "Meta Compartilhada",
          payment_method_id: "pix",
          payer: {
            email: "cliente@exemplo.com",
          },
          metadata: { 
            goal_id: goalId || "default_goal",
            payer_id: payerId || "P1"
          },
        };

        if (notificationUrl) {
          paymentData.notification_url = notificationUrl;
        }

        const paymentResponse = await payment.create({
          body: paymentData
        });
        
        console.log("MP Payment Response:", JSON.stringify(paymentResponse, null, 2));
        
        const pixCode = paymentResponse.point_of_interaction?.transaction_data?.qr_code;
        let qrCodeBase64 = paymentResponse.point_of_interaction?.transaction_data?.qr_code_base64;

        if (pixCode && !qrCodeBase64) {
          try {
            const dataUrl = await QRCode.toDataURL(pixCode);
            qrCodeBase64 = dataUrl.split(',')[1];
          } catch (err) {
            console.error("Erro ao gerar QR Code de fallback:", err);
          }
        }

        res.json({
          pixCode: pixCode,
          qrCodeBase64: qrCodeBase64,
          paymentId: paymentResponse.id,
          isMock: false
        });
      } else {
        const mockId = "pi_mock_" + Math.random().toString(36).substring(7);
        res.json({
          paymentId: mockId,
          isMock: true,
          pixCode: "00020101021126580014br.gov.bcb.pix0136mock-pix-key-for-prototype-only5204000053039865405" + amount.toFixed(2) + "5802BR5918Meta Compartilhada6009Sao Paulo62070503***6304ABCD"
        });
      }
    } catch (error: any) {
      console.error("Error creating Pix payment:", error);
      const errorMessage = error.message || error.response?.data?.message || error.cause?.message || "Erro desconhecido";
      res.status(500).json({ error: errorMessage });
    }
  });

  app.get("/api/check-payment/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { client, isMock } = await getMpConfig();

      if (isMock || !client) {
        res.json({ status: "pending", isMock: true });
        return;
      }

      const payment = new Payment(client);
      const paymentData = await payment.get({ id });

      if (paymentData.status === "approved") {
        const amountReceived = paymentData.transaction_amount;
        const goalId = paymentData.metadata?.goal_id || "default_goal";
        const payerId = paymentData.metadata?.payer_id;

        if (amountReceived) {
          const goal = await Goal.findById(goalId);
          if (goal && !goal.payments.some(p => p.paymentId === id)) {
            goal.payments.push({
              paymentId: id,
              amount: amountReceived,
              payerId: payerId || 'P1'
            });
            if (payerId === 'P2') {
              goal.savedP2 = (goal.savedP2 || 0) + amountReceived;
            } else {
              goal.savedP1 = (goal.savedP1 || 0) + amountReceived;
            }
            await goal.save();
          }
        }
      }

      res.json({ status: paymentData.status });
    } catch (error: any) {
      console.error("Error checking payment:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/mock-pay", async (req, res) => {
    const { amount, goalId, payerId } = req.body;
    try {
      const mockPaymentId = "mock_" + Date.now();
      const goal = await Goal.findById(goalId || "default_goal");
      if (goal) {
        goal.payments.push({
          paymentId: mockPaymentId,
          amount: amount,
          payerId: payerId || 'P1'
        });
        if (payerId === 'P2') {
          goal.savedP2 = (goal.savedP2 || 0) + amount;
        } else {
          goal.savedP1 = (goal.savedP1 || 0) + amount;
        }
        await goal.save();
      } else {
        const newGoal = { 
          _id: goalId || "default_goal",
          payments: [{
            paymentId: mockPaymentId,
            amount: amount,
            payerId: payerId || 'P1'
          }]
        } as any;
        if (payerId === 'P2') newGoal.savedP2 = amount;
        else newGoal.savedP1 = amount;
        await Goal.create(newGoal);
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
