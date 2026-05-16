import { z } from "zod";

async function testAbacatePay() {
  const apiKey = "abc_dev_aykEduSMDCkdLZKZKdczhXt3"; // from conversation history
  const data = {
    planId: "elite",
    returnUrl: "http://localhost:5173/payment-callback?plan=elite"
  };

  const headers = {
    "Authorization": `Bearer ${apiKey}`,
    "Content-Type": "application/json"
  };

  try {
    console.log(`[Server] Criando cobrança para o plano: ${data.planId}`);
    let productId = "";
    
    const getRes = await fetch(`https://api.abacatepay.com/v2/products/get?externalId=${data.planId}`, { headers });
    if (getRes.ok) {
      const productData = await getRes.json();
      if (productData.data) productId = productData.data.id;
    }

    if (!productId) {
      console.log("Product not found, creating...");
      const createRes = await fetch("https://api.abacatepay.com/v2/products/create", {
        method: "POST",
        headers,
        body: JSON.stringify({
          externalId: data.planId,
          name: `Plano Elite`,
          description: "Operação nível enterprise.",
          price: 1990,
          currency: 'BRL'
        })
      });
      const newProduct = await createRes.json();
      if (!createRes.ok || !newProduct.data) throw new Error(newProduct.error || "Erro ao criar produto");
      productId = newProduct.data.id;
    }

    console.log("Product ID:", productId);

    const checkoutRes = await fetch("https://api.abacatepay.com/v2/checkouts/create", {
      method: "POST",
      headers,
      body: JSON.stringify({
        returnUrl: data.returnUrl,
        items: [{ id: productId, quantity: 1 }],
        methods: ["PIX", "CARD"]
      })
    });
    
    const checkoutData = await checkoutRes.json();
    console.log("Checkout Data:", checkoutData);
  } catch (error: any) {
    console.error("[AbacatePay Server Error]", error);
  }
}

testAbacatePay();
