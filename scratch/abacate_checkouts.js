

const apiKey = "abc_dev_gSuRFrJTYckgy3uQnBLqzXhp";
const headers = {
  "Authorization": `Bearer ${apiKey}`,
  "Content-Type": "application/json"
};

async function getCheckouts() {
  try {
    // Tenta pegar a lista de checkouts para ver se o metadata está lá
    const res = await fetch("https://api.abacatepay.com/v2/checkouts", { headers });
    const text = await res.text();
    console.log("Checkouts:", text);
  } catch (err) {
    console.error(err);
  }
}

getCheckouts();
