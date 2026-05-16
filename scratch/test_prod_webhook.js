const url = "https://gestaoshop.com.br/api/webhook";

async function testWebhook() {
  console.log(`Sending POST to ${url}...`);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        id: "log_abc123xyz",
        event: "checkout.completed",
        apiVersion: 2,
        devMode: true,
        data: {
          id: "chk_test123",
          status: "PAID",
          metadata: {
            userId: "6c93b6e8-0b5c-4f81-9b16-cd3c110b9a37", // Um id generico qlqr, n importa pra ver o log
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
