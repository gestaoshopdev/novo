import { createUpgradeBilling } from '../src/lib/abacatepay';

async function test() {
  try {
    const result = await createUpgradeBilling({
      data: {
        planId: 'elite',
        returnUrl: 'http://localhost:5173/payment-callback?plan=elite'
      }
    });
    console.log(result);
  } catch (e) {
    console.error(e);
  }
}

test();
