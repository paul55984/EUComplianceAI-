exports.handler = async function (event) {
if (event.httpMethod !== “POST”) {
return {
statusCode: 405,
body: JSON.stringify({ error: “Method Not Allowed” }),
};
}

var useCase = “”;
try {
var body = JSON.parse(event.body);
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

var ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

if (!ANTHROPIC_API_KEY) {
return {
statusCode: 500,
body: JSON.stringify({ error: “API key not configured” }),
};
}

var prompt = “You are an EU AI Act compliance expert. Classify the following AI use case according to the EU AI Act risk tiers. Use case: “ + useCase + “ Respond in this exact JSON format with no markdown and no backticks: { "riskTier": "High Risk", "explanation": "your explanation here", "obligations": ["obligation 1", "obligation 2", "obligation 3"], "checklist": ["action 1", "action 2", "action 3", "action 4", "action 5"], "deadline": "your deadline here" }”;

try {
var response = await fetch(“https://api.anthropic.com/v1/messages”, {
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

```
var data = await response.json();

if (!response.ok) {
  return {
    statusCode: 500,
    body: JSON.stringify({ error: "Anthropic API error" }),
  };
}

var text = data.content[0].text.trim();
var jsonStart = text.indexOf("{");
var jsonEnd = text.lastIndexOf("}");
var clean = text.slice(jsonStart, jsonEnd + 1);
var result = JSON.parse(clean);

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
