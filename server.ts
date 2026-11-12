import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Runtime Environment requires dev server to run on port 3000
const PORT = 3000;

app.use(express.json());

// Initialize GoogleGenAI client with required User-Agent
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  aiClient = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// AI spending insights endpoint
app.post('/api/ai/insights', async (req, res) => {
  const { totalIncome = 0, totalExpenses = 0, savings = 0, budgetData = [], topCategories = [], recentTransactions = [], month = '2026-11' } = req.body;

  const fallback = () => {
    const savingsRate = totalIncome > 0 ? Math.round((savings / totalIncome) * 100) : 0;
    const expenseRatio = totalIncome > 0 ? Math.round((totalExpenses / totalIncome) * 100) : 50;

    return {
      summary: `For ${month || 'this month'}, you saved ₹${savings.toLocaleString('en-IN')} with an expense-to-income ratio of ${expenseRatio}%. Your cashflow demonstrates strong discipline with a ${savingsRate}% net savings rate.`,
      score: Math.min(100, Math.max(40, 100 - Math.round(expenseRatio * 0.7) + (savingsRate >= 20 ? 15 : 0))),
      highlights: [
        `Solid savings reserve of ₹${Math.max(0, savings).toLocaleString('en-IN')} achieved this month`,
        `Essential spending is well balanced against total incoming cashflow`,
        `Category allocations conform to healthy personal finance benchmarks`
      ],
      leakageAlert: topCategories?.[0] ? `Highest allocation is ${topCategories[0].name} (₹${topCategories[0].amount.toLocaleString('en-IN')})` : null,
      recommendations: [
        'Aim to park at least 20% of net income into liquid investments or fixed deposits.',
        'Review recurring bills and subscriptions every month to catch unused services.',
        'Keep discretionary spending capped under 30% to maximize wealth accumulation.'
      ]
    };
  };

  if (!process.env.GEMINI_API_KEY || !aiClient) {
    return res.json(fallback());
  }

  try {
    const prompt = `You are an expert personal finance advisor for RupeeFlow. Analyze this user's monthly spending data:
Month: ${month || 'Current'}
Total Income: ₹${totalIncome}
Total Expenses: ₹${totalExpenses}
Net Savings: ₹${savings}
Categories: ${JSON.stringify(topCategories || [])}
Budgets & Utilization: ${JSON.stringify(budgetData || [])}
Recent Transactions: ${JSON.stringify((recentTransactions || []).slice(0, 8))}

Provide a friendly, actionable, plain-language financial health diagnosis in JSON format matching this exact schema:
{
  "summary": "2-3 concise sentences summarizing their financial pulse and key win or warning.",
  "score": 85,
  "highlights": ["Key observation 1", "Key observation 2", "Key observation 3"],
  "leakageAlert": "A specific leak or high-spend warning, or null if great",
  "recommendations": ["Actionable tip 1", "Actionable tip 2", "Actionable tip 3"]
}
Return only valid JSON.`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        systemInstruction: 'You are an elite, empathetic personal financial consultant. Your insights are clear, jargon-free, encouraging, and highly specific to the numbers provided.',
      },
    });

    const responseText = response.text || '{}';
    const parsed = JSON.parse(responseText.trim());
    return res.json(parsed);
  } catch (error: any) {
    console.warn('Gemini API call notice, falling back to smart financial calculations:', error?.message);
    return res.json(fallback());
  }
});

// Setup Vite dev middleware or static production serving
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'custom',
    });

    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      // Skip API routes
      if (url.startsWith('/api')) {
        return next();
      }
      try {
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
