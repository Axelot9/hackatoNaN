const BASE = process.env.API_URL || "http://localhost:3000";

async function postJson(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res;
}

async function getJson(path) {
  const res = await fetch(`${BASE}${path}`);
  return res;
}

function printStep(step, description) {
  console.log(`\n--- STEP ${step}: ${description} ---`);
}

function printResult(label, data) {
  console.log(`[${label}]`);
  console.log(JSON.stringify(data, null, 2));
}

async function readStream(response) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let text = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    text += decoder.decode(value, { stream: true });
  }
  return text;
}

async function main() {
  // ───────────────────────────────────────────────
  // STEP 1: Create session
  // ───────────────────────────────────────────────
  printStep(1, `Create session: POST ${BASE}/api/session/new`);
  const res1 = await fetch(`${BASE}/api/session/new`, { method: "POST" });
  const data1 = await res1.json();
  printResult("RESULT", data1);
  const sessionId = data1.sessionId;
  console.log(`\n> Session created with ID: ${sessionId}`);

  // ───────────────────────────────────────────────
  // STEP 2: Send first user message
  // ───────────────────────────────────────────────
  printStep(
    2,
    `Send first message: POST ${BASE}/api/session/${sessionId}/message`
  );
  console.log(`Body: { message: "mi cafetera llegó rota" }`);
  const res2 = await postJson(`/api/session/${sessionId}/message`, {
    message: "mi cafetera llegó rota",
  });
  const reply2 = await readStream(res2);
  printResult("RESULT", { reply: reply2.trim() });

  // ───────────────────────────────────────────────
  // STEP 3: Check session state
  // ───────────────────────────────────────────────
  printStep(3, `Check session state: GET ${BASE}/api/session/${sessionId}/state`);
  const res3 = await getJson(`/api/session/${sessionId}/state`);
  const data3 = await res3.json();
  printResult("RESULT", {
    claimType: data3.claimType,
    claimTypeLabel: data3.claimTypeLabel,
    score: data3.score,
    messagesCount: data3.messages?.length,
    evidenceCount: data3.evidence?.length,
  });

  // ───────────────────────────────────────────────
  // STEP 4: Send follow-up message
  // ───────────────────────────────────────────────
  printStep(
    4,
    `Send follow-up: POST ${BASE}/api/session/${sessionId}/message`
  );
  console.log(`Body: { message: "Sí, tengo la factura y la compré el 2024-03-15 por 89,99 € en Amazon" }`);
  const res4 = await postJson(`/api/session/${sessionId}/message`, {
    message: "Sí, tengo la factura y la compré el 2024-03-15 por 89,99 € en Amazon",
  });
  const reply4 = await readStream(res4);
  printResult("RESULT", { reply: reply4.trim() });

  // ───────────────────────────────────────────────
  // STEP 5: Upload evidence (mock image)
  // ───────────────────────────────────────────────
  printStep(5, `Upload evidence: POST ${BASE}/api/session/${sessionId}/upload`);
  const blob = new Blob(["fake image bytes"], { type: "image/png" });
  const form = new FormData();
  form.append("file", blob, "cafetera_rota.png");
  const res5 = await fetch(`${BASE}/api/session/${sessionId}/upload`, {
    method: "POST",
    body: form,
  });
  const data5 = await res5.json();
  printResult("RESULT", data5);

  // ───────────────────────────────────────────────
  // STEP 6: Check updated state
  // ───────────────────────────────────────────────
  printStep(6, `Check updated state: GET ${BASE}/api/session/${sessionId}/state`);
  const res6 = await getJson(`/api/session/${sessionId}/state`);
  const data6 = await res6.json();
  printResult("RESULT", {
    claimType: data6.claimType,
    claimTypeLabel: data6.claimTypeLabel,
    score: data6.score,
    evidenceCount: data6.evidence?.length,
    checklist: data6.checklist,
  });

  // ───────────────────────────────────────────────
  // STEP 7: Generate formal claim
  // ───────────────────────────────────────────────
  printStep(
    7,
    `Generate claim: POST ${BASE}/api/session/${sessionId}/generate`
  );
  const res7 = await postJson(`/api/session/${sessionId}/generate`, {});
  const data7 = await res7.json();
  printResult("RESULT", data7);

  // ───────────────────────────────────────────────
  // STEP 8: Analyze company reply
  // ───────────────────────────────────────────────
  printStep(
    8,
    `Analyze company reply: POST ${BASE}/api/session/${sessionId}/company-reply`
  );
  const res8 = await postJson(`/api/session/${sessionId}/company-reply`, {});
  const data8 = await res8.json();
  printResult("RESULT", data8);

  // ───────────────────────────────────────────────
  // STEP 9: Generate counter reply
  // ───────────────────────────────────────────────
  printStep(
    9,
    `Generate counter reply: POST ${BASE}/api/session/${sessionId}/counter`
  );
  const res9 = await postJson(`/api/session/${sessionId}/counter`, {});
  const data9 = await res9.json();
  printResult("RESULT", data9);

  // ───────────────────────────────────────────────
  // DONE
  // ───────────────────────────────────────────────
  console.log("\n=== TEST COMPLETED ===");
  console.log(`Session ID: ${sessionId}`);
  console.log(`You can inspect the full state anytime with:`);
  console.log(`  curl ${BASE}/api/session/${sessionId}/state | jq`);
}

main().catch((err) => {
  console.error("Test failed:", err.message);
  process.exit(1);
});
