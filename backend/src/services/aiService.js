// backend/src/services/aiService.js
// Wraps calls to the Google Gemini API (gemini-1.5-flash).
// Keeps the AI API key strictly server-side — never sent to the client.
//
// Environment variables required:
//   AI_API_KEY  — your Google AI Studio API key
//   AI_MODEL    — optional, defaults to 'gemini-1.5-flash'

const https = require('https');

const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const MODEL = process.env.AI_MODEL || 'gemini-1.5-flash';

/**
 * Send a prompt to Gemini and return the text response.
 * @param {string} prompt
 * @returns {Promise<string>}
 */
function callGemini(prompt) {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.AI_API_KEY;
    if (!apiKey) {
      return reject(new Error('AI_API_KEY is not configured'));
    }

    const body = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 1024,
      },
    });

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) {
            return reject(new Error(parsed.error.message || 'Gemini API error'));
          }
          const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (!text) return reject(new Error('Empty response from Gemini'));
          resolve(text.trim());
        } catch (e) {
          reject(new Error('Failed to parse Gemini response'));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

/**
 * Build a spending context string from dashboard data for Gemini.
 */
function buildSpendingContext(data) {
  const { month, year, totalSpent, expenseCount, budget, topCategory, byCategory, recentExpenses } = data;

  const monthNames = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December',
  ];
  const monthName = monthNames[month - 1] || month;

  const categoryLines = byCategory.length > 0
    ? byCategory.map((c) => `  - ${c.name}: ₹${Number(c.value).toFixed(2)}`).join('\n')
    : '  (no category data)';

  const recentLines = recentExpenses.length > 0
    ? recentExpenses
        .map((e) => `  - ${e.expense_date?.toString().slice(0,10) || ''} | ${e.category_name} | ${e.note || '—'} | ₹${e.amount}`)
        .join('\n')
    : '  (no recent expenses)';

  const budgetLine = budget != null
    ? `Monthly budget: ₹${budget}. Amount spent: ₹${Number(totalSpent).toFixed(2)}. Remaining: ₹${(budget - totalSpent).toFixed(2)}.`
    : `No budget has been set for this month.`;

  return `
User's expense data for ${monthName} ${year}:
- Total spent: ₹${Number(totalSpent).toFixed(2)} across ${expenseCount} transaction(s)
- ${budgetLine}
- Top spending category: ${topCategory || 'N/A'}

Spending by category:
${categoryLines}

Recent expenses (up to 5):
${recentLines}
`.trim();
}

/**
 * Generate a spending summary analysis.
 */
async function generateSummary(spendingData) {
  const context = buildSpendingContext(spendingData);

  const prompt = `You are a helpful personal finance assistant for an Indian user who tracks expenses in Indian Rupees (₹).

Here is the user's spending data:
${context}

Please provide a concise, friendly, and actionable spending analysis. Structure your response with these sections:
1. **Overview** – A 1-2 sentence summary of the month's spending.
2. **Key Insights** – 2-3 bullet points about spending patterns, notable categories, or budget status.
3. **Saving Tips** – 2-3 practical, specific tips to help reduce spending.
4. **Watch Out** – Flag any category that seems unusually high or any spending concern.

Keep the tone helpful, encouraging, and to the point. Use ₹ for amounts.`;

  return callGemini(prompt);
}

/**
 * Answer a specific question about the user's expenses.
 */
async function answerQuestion(spendingData, question) {
  const context = buildSpendingContext(spendingData);

  const prompt = `You are a helpful personal finance assistant for an Indian user who tracks expenses in Indian Rupees (₹).

Here is the user's spending data:
${context}

The user is asking: "${question}"

Please answer helpfully, specifically, and concisely based on the data above. If the answer cannot be determined from the data provided, say so clearly. Use ₹ for all amounts.`;

  return callGemini(prompt);
}

module.exports = { generateSummary, answerQuestion, buildSpendingContext };
