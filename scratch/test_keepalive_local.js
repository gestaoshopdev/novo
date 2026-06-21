const baseUrl = "http://localhost:3000/api/keep-alive";

async function runTest(url, description) {
  console.log(`\n--- Test: ${description} ---`);
  console.log(`Sending GET to ${url}...`);
  try {
    const res = await fetch(url, { method: "GET" });
    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Response:", text);
  } catch (err) {
    console.error("Fetch Error:", err);
  }
}

async function testAll() {
  // Test 1: Sem segredo (Deve retornar 401)
  await runTest(baseUrl, "Sem parâmetro de segredo (Esperado: 401)");

  // Test 2: Segredo incorreto (Deve retornar 401)
  await runTest(`${baseUrl}?secret=errado`, "Segredo incorreto (Esperado: 401)");

  // Test 3: Segredo correto (Deve retornar 200 OK com atividade do banco)
  await runTest(`${baseUrl}?secret=atlas-keepalive-secret-2026`, "Segredo correto (Esperado: 200)");
}

testAll();
