document.addEventListener("DOMContentLoaded", ()=>{
  const searchForm = document.getElementById("searchForm");
  const resultPanel = document.getElementById("resultPanel");
  const resultEmpty = document.getElementById("resultEmpty");
  const scanBtn = document.getElementById("scanToggleBtn");
  const scanBox = document.getElementById("scanBox");
  let html5QrCode = null;
  let scanning = false;

  /* ---------- Tabs ---------- */
  document.querySelectorAll(".tab-btn[data-verify-tab]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      document.querySelectorAll(".tab-btn[data-verify-tab]").forEach(b=> b.classList.remove("active"));
      btn.classList.add("active");
      document.querySelectorAll(".tab-panel[data-verify-panel]").forEach(p=> p.classList.remove("active"));
      document.querySelector(`.tab-panel[data-verify-panel="${btn.dataset.verifyTab}"]`).classList.add("active");
      if(btn.dataset.verifyTab !== "scan") stopScan();
    });
  });

  /* ---------- Manual search ---------- */
  searchForm?.addEventListener("submit", (e)=>{
    e.preventDefault();
    const id = document.getElementById("certSearchInput").value.trim().toUpperCase();
    if(!id){ veritasToast("Enter a certificate ID"); return; }
    runLookup(id);
  });

  document.querySelectorAll("[data-example-id]").forEach(chip=>{
    chip.addEventListener("click", ()=>{
      document.getElementById("certSearchInput").value = chip.dataset.exampleId;
      runLookup(chip.dataset.exampleId);
    });
  });

  async function runLookup(certificateId){
    const match = VERITAS_REGISTRY.find(r=> r.certificateId === certificateId);
    resultEmpty?.classList.add("hidden");
    resultPanel.classList.remove("hidden");
    resultPanel.style.display = "block";
    resultPanel.innerHTML = `<p class="muted" style="margin:0">Cross-checking ${certificateId} against the centralized registry…</p>`;

    await new Promise(res=> setTimeout(res, 700));

    if(!match){
      resultPanel.innerHTML = renderNotFound(certificateId);
      return;
    }
    const hash = await veritasHash({ certificateId: match.certificateId, studentName: match.studentName, degreeName: match.degreeName, institutionCode: match.institutionCode, year: match.year });
    resultPanel.innerHTML = renderMatch(match, hash);
    renderTrustGauge(match.status);
    drawQr(match.certificateId);
  }

  function renderNotFound(id){
    return `
      <div class="result-head">
        <div>
          <span class="badge badge-flagged"><span class="badge-dot"></span>No registry match</span>
          <h2 style="margin-top:12px">"${id}" was not found</h2>
        </div>
      </div>
      <p>This certificate ID does not exist in the centralized registry. That may mean it was mistyped, issued by an institution not yet onboarded, or is fraudulent. Double-check the ID printed on the certificate, or contact the issuing institution directly.</p>
    `;
  }

  function renderMatch(m, hash){
    const inst = veritasInstitution(m.institutionCode);
    const badgeMap = {
      verified: ["badge-verified", "Verified authentic"],
      pending: ["badge-pending", "Pending manual review"],
      flagged: ["badge-flagged", "Flagged — possible forgery"]
    };
    const [cls, label] = badgeMap[m.status] || badgeMap.pending;
    return `
      <div class="result-head">
        <div>
          <span class="badge ${cls}"><span class="badge-dot"></span>${label}</span>
          <h2 style="margin-top:12px">${m.degreeName}</h2>
          <p style="margin:0">${m.studentName}</p>
        </div>
        <div class="trust-gauge">
          <svg class="progress-ring" viewBox="0 0 84 84"><circle class="bg" cx="42" cy="42" r="34"/><circle class="fg" id="trustFg" cx="42" cy="42" r="34"/></svg>
          <div class="progress-pct" id="trustPct">–</div>
        </div>
      </div>
      <div class="result-grid">
        <div><b>Certificate ID</b><span class="mono">${m.certificateId}</span></div>
        <div><b>Institution</b><span>${inst?.name || m.institutionCode}${inst && !inst.accredited ? " (not accredited)" : ""}</span></div>
        <div><b>Year awarded</b><span>${m.year}</span></div>
        <div><b>Grade / result</b><span>${m.grade}</span></div>
      </div>
      <div style="margin-bottom:18px">
        <b style="display:block;font-size:12.5px;color:var(--slate-soft);font-weight:600;margin-bottom:6px">Integrity fingerprint (SHA-256)</b>
        <div class="hash-box">${hash}</div>
      </div>
      <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center">
        <canvas id="qrCanvas" width="120" height="120" style="border:1px solid var(--line);border-radius:8px"></canvas>
        <div style="flex:1;min-width:200px">
          <p style="margin-bottom:12px;font-size:13.5px">Scan this code to re-verify this exact record any time, or share it directly with an employer.</p>
          <button class="btn btn-outline btn-sm" id="printReportBtn" type="button">Download verification report</button>
        </div>
      </div>
    `;
  }

  function renderTrustGauge(status){
    const scoreMap = { verified: 98, pending: 58, flagged: 9 };
    const score = scoreMap[status] ?? 0;
    const fg = document.getElementById("trustFg");
    const pctEl = document.getElementById("trustPct");
    if(!fg) return;
    const r = 34, c = 2*Math.PI*r;
    fg.setAttribute("stroke-dasharray", c);
    fg.setAttribute("stroke-dashoffset", c);
    fg.style.stroke = status === "flagged" ? "var(--flag)" : status === "pending" ? "var(--gold)" : "var(--verified)";
    requestAnimationFrame(()=>{ fg.setAttribute("stroke-dashoffset", c - (score/100)*c); });
    if(pctEl) pctEl.textContent = score + "%";
  }

  function drawQr(text){
    const canvas = document.getElementById("qrCanvas");
    if(!canvas || typeof QRCode === "undefined") return;
    QRCode.toCanvas(canvas, text, { width: 120, margin: 1, color: { dark: "#12202B", light: "#FBFAF5" } }, ()=>{});
  }

  document.addEventListener("click", (e)=>{
    if(e.target.id === "printReportBtn") window.print();
  });

  /* ---------- QR camera scan ---------- */
  scanBtn?.addEventListener("click", ()=>{
    if(scanning) stopScan(); else startScan();
  });

  function startScan(){
    if(typeof Html5Qrcode === "undefined"){
      veritasToast("Camera scanner library unavailable offline — use Search registry instead");
      return;
    }
    scanBox.innerHTML = "";
    const readerDiv = document.createElement("div");
    readerDiv.id = "qrReader";
    readerDiv.style.width = "100%";
    readerDiv.style.height = "100%";
    scanBox.appendChild(readerDiv);
    scanBox.classList.add("active");

    html5QrCode = new Html5Qrcode("qrReader");
    html5QrCode.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: 220 },
      (decodedText)=>{
        stopScan();
        document.querySelector('.tab-btn[data-verify-tab="search"]').click();
        document.getElementById("certSearchInput").value = decodedText;
        runLookup(decodedText.trim().toUpperCase());
      },
      ()=>{}
    ).then(()=>{
      scanning = true;
      scanBtn.textContent = "Stop camera";
    }).catch(()=>{
      veritasToast("Couldn't access camera — check permissions, or use Search registry");
      scanBox.classList.remove("active");
      scanBox.innerHTML = originalScanBoxContent();
    });
  }

  function stopScan(){
    if(html5QrCode && scanning){
      html5QrCode.stop().then(()=>{ html5QrCode.clear(); }).catch(()=>{});
    }
    scanning = false;
    if(scanBtn) scanBtn.textContent = "Start camera scan";
    if(scanBox){
      scanBox.classList.remove("active");
      scanBox.innerHTML = originalScanBoxContent();
    }
  }

  function originalScanBoxContent(){
    return `
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 7V5a1 1 0 0 1 1-1h2M20 7V5a1 1 0 0 0-1-1h-2M4 17v2a1 1 0 0 0 1 1h2M20 17v2a1 1 0 0 1-1 1h-2M7 12h10"/></svg>
      <span style="font-size:13px">Camera preview appears here</span>
    `;
  }
});
