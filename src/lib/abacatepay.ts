"use server";

// Mapa de Planos
export const PLANS = {
  starter: {
    name: "Starter",
    description: "Para pequenos negócios.",
    priceCentavos: 990, // R$ 9,90
    limits: {
      maxCatalogs: 1,
      maxPhotosPerProduct: 1,
      maxProductsPerCatalog: 10,
      customColors: false,
      customCoverPhoto: false,
      removeWatermark: false
    }
  },
  pro: {
    name: "Pro",
    description: "Para escalar sua operação.",
    priceCentavos: 1490, // R$ 14,90
    limits: {
      maxCatalogs: 5,
      maxPhotosPerProduct: 5,
      maxProductsPerCatalog: 60,
      customColors: true,
      customCoverPhoto: false,
      removeWatermark: false
    }
  },
  elite: {
    name: "Elite",
    description: "Operação nível enterprise.",
    priceCentavos: 1990, // R$ 19,90
    limits: {
      maxCatalogs: 10,
      maxPhotosPerProduct: 10,
      maxProductsPerCatalog: 500,
      customColors: true,
      customCoverPhoto: true,
      removeWatermark: true
    }
  }
};

// Server function para criar o faturamento
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

export const createUpgradeBilling = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({
    planId: z.enum(["starter", "pro", "elite"]),
    returnUrl: z.string().url(),
    userId: z.string().uuid()
  }).parse(data))
  .handler(async ({ data }) => {
    // Pegamos a chave dentro do handler para segurança e compatibilidade
    const apiKey = (typeof process !== 'undefined' && process.env.ABACATEPAY_API_KEY) 
      ? process.env.ABACATEPAY_API_KEY 
      : (import.meta as any).env?.ABACATEPAY_API_KEY || "abc_dev_gSuRFrJTYckgy3uQnBLqzXhp";

    const plan = PLANS[data.planId];
    const headers = {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    };

    let discountPercentage = 0;
    try {
      const supabase = createClient(
        (typeof process !== 'undefined' && process.env.VITE_SUPABASE_URL) || "https://ylsdljylqbnuajjyipwy.supabase.co",
        (typeof process !== 'undefined' && process.env.VITE_SUPABASE_ANON_KEY) || "sb_publishable_nqdrO05frnjf0uatCInaNQ_KQQYbOry"
      );
      const { data: discountData, error: discountError } = await supabase.rpc('get_user_referral_discount', {
        p_user_id: data.userId
      });
      if (!discountError && typeof discountData === 'number') {
        discountPercentage = discountData;
      }
    } catch (e) {
      console.error("[AbacatePay] Erro ao buscar desconto de indicação", e);
    }

    const finalPriceCentavos = discountPercentage > 0 
      ? Math.round(plan.priceCentavos * (1 - discountPercentage)) 
      : plan.priceCentavos;

    const externalId = discountPercentage > 0 
      ? `${data.planId}-discount-${Math.round(discountPercentage * 100)}` 
      : data.planId;

    const productName = discountPercentage > 0 
      ? `Plano ${plan.name} (1º Mês Promo)`
      : `Plano ${plan.name}`;

    try {
      console.log(`[Server] Criando cobrança para o plano: ${data.planId} | Desconto: ${discountPercentage * 100}% | Novo valor: ${finalPriceCentavos}`);
      let productId = "";
      
      const getRes = await fetch(`https://api.abacatepay.com/v2/products/get?externalId=${externalId}`, { headers });
      if (getRes.ok) {
        const productData = await getRes.json();
        if (productData.data) productId = productData.data.id;
      }

      if (!productId) {
        const createRes = await fetch("https://api.abacatepay.com/v2/products/create", {
          method: "POST",
          headers,
          body: JSON.stringify({
            externalId: externalId,
            name: productName,
            description: plan.description,
            price: finalPriceCentavos,
            currency: 'BRL'
          })
        });
        const newProduct = await createRes.json();
        if (!createRes.ok || !newProduct.data) throw new Error(newProduct.error || "Erro ao criar produto");
        productId = newProduct.data.id;
      }

      const checkoutRes = await fetch("https://api.abacatepay.com/v2/checkouts/create", {
        method: "POST",
        headers,
        body: JSON.stringify({
          returnUrl: data.returnUrl,
          completionUrl: data.returnUrl,
          items: [{ id: productId, quantity: 1 }],
          methods: ["PIX", "CARD"],
          metadata: {
            userId: data.userId,
            planId: data.planId
          },
          customer: {
            metadata: {
              userId: data.userId,
              planId: data.planId
            }
          }
        })
      });
      
      const checkoutData = await checkoutRes.json();
      if (!checkoutRes.ok || !checkoutData.data) throw new Error(checkoutData.error || "Erro ao gerar checkout");

      return {
        success: true,
        checkoutUrl: checkoutData.data.url
      };
    } catch (error: any) {
      console.error("[AbacatePay Server Error]", error);
      throw new Error(error.message || "Falha ao processar pagamento no servidor.");
    }
  });
