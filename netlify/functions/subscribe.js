exports.handler = async function(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method Not Allowed" }) };
  }

  var body;
  try {
    body = JSON.parse(event.body);
  } catch(e) {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  var email = body.email;
  if (!email || email.indexOf("@") === -1) {
    return { statusCode: 400, body: JSON.stringify({ error: "Valid email required" }) };
  }

  var key = process.env.MAILCHIMP_API_KEY;
  var audienceId = process.env.MAILCHIMP_AUDIENCE_ID;

  var data = JSON.stringify({
    email_address: email,
    status: "subscribed"
  });

  var response = await fetch("https://us11.api.mailchimp.com/3.0/lists/" + audienceId + "/members", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Basic " + Buffer.from("anystring:" + key).toString("base64")
    },
    body: data
  });

  var result = await response.json();

  if (response.status === 200 || response.status === 201) {
    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  }

  if (result.title === "Member Exists") {
    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  }

  return { statusCode: 500, body: JSON.stringify({ error: result.detail || "Subscription failed" }) };
};
