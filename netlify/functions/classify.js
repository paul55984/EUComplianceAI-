exports.handler = async function (event) {
if (event.httpMethod !== “POST”) {
return {
statusCode: 405,
body: JSON.stringify({ error: “Method Not Allowed” }),
};
}

let useCase = “”;
try {
const body = JSON.parse(event.body);
useCase = body.useCase || “”;
} catch (e) {
return {
statusCode: 400,
body: JSON.stringify({ error: “Invalid request body” }),
};
}

if (!useCase.trim()) {
return {
statusCode: 400,
body: JSON.stringify({ error: “No use case provided” }),
};
}

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

if (!ANTHROPIC_API_KEY) {
return {
statusCode: 500,
body: JSON.stringify({ error: “API key not configured” }),
};
}

const prompt = `You are an EU AI Act compliance expert. Classify the following AI use case according to the EU AI Act risk tiers.

Use case: ${useCase}

Respond in this exact JSON format (no markdown, no backticks, just raw JSON):
{
“riskTier”: “Unacceptable Risk” | “High Risk” | “Limited Risk” | “Minimal Risk”,
“explanation”: “2-3 sentence explanation of why this tier applies”,
“obligations”: [“obligation 1”, “obligation 2”, “obligation 3”],
“checklist”: [“action 1”, “action 2”, “action 3”, “action 4”, “action 5”],
“deadline”: “Key compliance deadline relevant to this tier”
}`;

try {
const response = await fetch(“https://api.anthropic.com/v1/messages”, {
method: “POST”,
headers: {
“Content-Type”: “application/json”,
“x-api-key”: ANTHROPIC_API_KEY,
“anthropic-version”: “2023-06-01”,
},
body: JSON.stringify({
model: “claude-opus-4-5”,
max_tokens: 1024,
messages: [{ role: “user”, content: prompt }],
}),
});

```
const data = await response.json();

if (!response.ok) {
  return {
    statusCode: 500,
    body: JSON.stringify({ error: data.error?.message || "Anthropic API error" }),
  };
}

const text = data.content[0].text.trim();

// Strip any accidental markdown fences
const clean = text.replace(/```json|```/g, "").trim();
const result = JSON.parse(clean);

return {
  statusCode: 200,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  },
  body: JSON.stringify(result),
};
```

} catch (err) {
return {
statusCode: 500,
body: JSON.stringify({ error: “Classification failed: “ + err.message }),
};
}
};
