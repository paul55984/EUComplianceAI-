
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

const prompt = "You are an EU AI Act compliance expert. Classify the following AI use case: " + useCase + ". Respond in raw JSON only with these fields: riskTier, explanation, obligations (array), checklist (array), deadline.";

try {
const response = await fetch(“https://api.anthropic.com/v1/messages”, {
method: “POST”,
headers: {
“Content-Type”: “application/json”,
“x-api-key”: ANTHROPIC_API_KEY,
“anthropic-version”: “2023-06-01”,
},
body: JSON.stringify({
model: “claude-haiku-4-5-20251001”,
max_tokens: 1024,
messages: [{ role: “user”, content: prompt }],
}),
});

const data = await response.json();

if (!response.ok) {
  return {
    statusCode: 500,
    body: JSON.stringify({ error: data.error && data.error.message ? data.error.message : "Anthropic API error" }),
  };
}

const text = data.content[0].text.trim();
const clean = text.replace(/^```[\w]*\n?/, "").replace(/```$/, "").trim();
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
