const url = "http://localhost:3000/api/webhook";

async function testWebhook() {
  console.log(`Sending POST to ${url}...`);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        event: "checkout.completed",
        data: {
          metadata: {
            userId: "00000000-0000-0000-0000-000000000000",
            planId: "pro"
          }
        }
      })
    });
    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Response:", text);
  } catch (err) {
    console.error("Error:", err);
  }
}

testWebhook();
