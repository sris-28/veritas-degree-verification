document.addEventListener("DOMContentLoaded", ()=>{
  veritasRequireAuth();
  const user = veritasGetUser();
  if(!user) return;

  /* ---------- Profile form ---------- */
  const pf = document.getElementById("profileForm");
  if(pf){
    const pfName = document.getElementById("pfName");
    const pfEmail = document.getElementById("pfEmail");
    const pfPhone = document.getElementById("pfPhone");
    const pfDob = document.getElementById("pfDob");
    const pfNationality = document.getElementById("pfNationality");
    const pfAddress = document.getElementById("pfAddress");

    pfName.value = user.name || "";
    pfEmail.value = user.email || "";
    pfPhone.value = user.phone || "";
    pfDob.value = user.dob || "";
    pfNationality.value = user.nationality || "";
    pfAddress.value = user.address || "";

    pf.addEventListener("submit", (e)=>{
      e.preventDefault();
      const updated = {
        ...user,
        name: pfName.value.trim(),
        email: pfEmail.value.trim(),
        phone: pfPhone.value.trim(),
        dob: pfDob.value,
        nationality: pfNationality.value.trim(),
        address: pfAddress.value.trim(),
      };
      updated.profileComplete = !!(updated.name && updated.email && updated.phone && updated.dob && updated.nationality && updated.address);
      veritasSaveUser(updated);
      veritasToast("Profile saved");
      veritasHydrateUserChrome();
      renderAll();
    });
  }

  /* ---------- Degree submission form ---------- */
  const df = document.getElementById("degreeForm");
  if(df){
    df.addEventListener("submit", async (e)=>{
      e.preventDefault();
      const certificateId = df.certificateId.value.trim().toUpperCase();
      const institutionCode = df.institutionCode.value;
      const degreeName = df.degreeName.value.trim();
      const year = df.year.value.trim();

      if(!certificateId || !institutionCode || !degreeName || !year){
        veritasToast("Fill in every field to submit for verification");
        return;
      }

      const submitBtn = df.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = "Submitting…";

      const req = {
        id: "REQ-" + Date.now(),
        certificateId, institutionCode, degreeName, year,
        studentName: veritasGetUser().name,
        status: "reviewing",
        submittedAt: new Date().toISOString()
      };
      veritasAddRequest(req);
      renderAll();
      df.reset();
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit for verification";
      veritasToast("Submitted — cross-checking with the registry…");

      // simulate the registry cross-check resolving
      setTimeout(async ()=>{
        const list = veritasGetRequests();
        const idx = list.findIndex(r=> r.id === req.id);
        if(idx === -1) return;
        const match = VERITAS_REGISTRY.find(r=> r.certificateId === req.certificateId);
        if(match){
          list[idx].status = match.status; // verified / pending / flagged
          list[idx].registryRecord = match;
          list[idx].integrityHash = await veritasHash({ certificateId: match.certificateId, studentName: match.studentName, degreeName: match.degreeName, institutionCode: match.institutionCode, year: match.year });
        } else {
          list[idx].status = "not_found";
        }
        veritasSaveRequests(list);
        renderAll();
        veritasToast(match ? `Cross-check complete — marked "${match.status}"` : "No matching registry record found");
      }, 1600);
    });
  }

  renderAll();

  function badgeFor(status){
    const map = {
      verified: ["badge-verified", "Verified"],
      pending: ["badge-pending", "Pending review"],
      reviewing: ["badge-pending", "Cross-checking…"],
      flagged: ["badge-flagged", "Flagged"],
      not_found: ["badge-flagged", "No match found"]
    };
    const [cls, label] = map[status] || map.pending;
    return `<span class="badge ${cls}"><span class="badge-dot"></span>${label}</span>`;
  }

  function renderAll(){
    const u = veritasGetUser();
    const requests = veritasGetRequests();
    const verifiedCount = requests.filter(r=> r.status === "verified").length;
    const pendingCount = requests.filter(r=> r.status === "pending" || r.status === "reviewing").length;
    const flaggedCount = requests.filter(r=> r.status === "flagged" || r.status === "not_found").length;

    // ----- stat row -----
    document.querySelectorAll("[data-stat-total]").forEach(el=> el.textContent = requests.length);
    document.querySelectorAll("[data-stat-verified]").forEach(el=> el.textContent = verifiedCount);
    document.querySelectorAll("[data-stat-flagged]").forEach(el=> el.textContent = flaggedCount);

    // ----- overall progress -----
    const steps = [
      { label: "Complete your profile", done: !!u.profileComplete },
      { label: "Submit degree details", done: requests.length > 0 },
      { label: "Registry cross-check", done: requests.some(r=> r.status !== "reviewing") && requests.length > 0 },
      { label: "Integrity hash generated", done: verifiedCount > 0 },
      { label: "Verified badge issued", done: verifiedCount > 0 }
    ];
    const doneCount = steps.filter(s=> s.done).length;
    const pct = Math.round((doneCount/steps.length)*100);

    const ringFg = document.querySelector(".progress-ring .fg");
    if(ringFg){
      const r = 34, c = 2*Math.PI*r;
      ringFg.setAttribute("stroke-dasharray", c);
      ringFg.setAttribute("stroke-dashoffset", c - (pct/100)*c);
    }
    document.querySelectorAll("[data-progress-pct]").forEach(el=> el.textContent = pct + "%");

    const stepperEl = document.getElementById("onboardingStepper");
    if(stepperEl){
      let currentAssigned = false;
      stepperEl.innerHTML = steps.map((s,i)=>{
        let cls = "";
        if(s.done) cls = "done";
        else if(!currentAssigned){ cls = "current"; currentAssigned = true; }
        return `<div class="s-item ${cls}">
          <div class="s-dot">${s.done ? "✓" : i+1}</div>
          <div class="s-body"><b>${s.label}</b><span>${s.done ? "Complete" : (cls==="current" ? "Up next" : "Waiting")}</span></div>
        </div>`;
      }).join("");
    }

    // ----- my verifications list -----
    const listEl = document.getElementById("verificationsList");
    if(listEl){
      if(requests.length === 0){
        listEl.innerHTML = `<div class="activity-row"><div class="a-body"><b>No degrees submitted yet</b><span>Use the form to submit your first certificate ID for cross-checking.</span></div></div>`;
      } else {
        listEl.innerHTML = requests.map(r=> `
          <div class="activity-row">
            <div class="a-ico">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2 3 6v6c0 5 4 8.5 9 10 5-1.5 9-5 9-10V6l-9-4Z"/></svg>
            </div>
            <div class="a-body">
              <b>${r.degreeName}</b>
              <span>${veritasInstitution(r.institutionCode)?.name || r.institutionCode} · ${r.certificateId}</span>
            </div>
            ${badgeFor(r.status)}
          </div>
        `).join("");
      }
    }

    // ----- recent activity feed -----
    const activityEl = document.getElementById("activityFeed");
    if(activityEl){
      const events = [];
      events.push({ text: "Account created", time: u.createdAt });
      requests.forEach(r=>{
        events.push({ text: `Submitted "${r.degreeName}" for verification`, time: r.submittedAt });
        if(r.status !== "reviewing"){
          events.push({ text: `Registry cross-check resolved: ${r.status.replace("_"," ")}`, time: r.submittedAt });
        }
      });
      events.sort((a,b)=> new Date(b.time) - new Date(a.time));
      activityEl.innerHTML = events.slice(0,6).map(ev=> `
        <div class="activity-row">
          <div class="a-ico"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg></div>
          <div class="a-body"><b>${ev.text}</b></div>
          <time>${new Date(ev.time).toLocaleDateString(undefined,{month:"short", day:"numeric"})}</time>
        </div>
      `).join("");
    }
  }
});
