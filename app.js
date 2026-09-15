document.addEventListener("DOMContentLoaded", ()=>{

  /* ---------- Hero stat count-up (single orchestrated load moment) ---------- */
  document.querySelectorAll("[data-count-to]").forEach(el=>{
    const target = parseInt(el.dataset.countTo, 10);
    const suffix = el.dataset.suffix || "";
    let cur = 0;
    const step = Math.max(1, Math.round(target / 40));
    const tick = ()=>{
      cur = Math.min(target, cur + step);
      el.textContent = cur.toLocaleString() + suffix;
      if(cur < target) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

  /* ---------- Populate institution <select> elements ---------- */
  document.querySelectorAll("select[data-institution-select]").forEach(sel=>{
    VERITAS_INSTITUTIONS.forEach(inst=>{
      const opt = document.createElement("option");
      opt.value = inst.code;
      opt.textContent = inst.name;
      sel.appendChild(opt);
    });
  });

  /* ---------- Institution directory ---------- */
  const instList = document.getElementById("institutionList");
  if(instList){
    const searchInput = document.getElementById("institutionSearch");
    const render = (filter="")=>{
      const f = filter.toLowerCase();
      const items = VERITAS_INSTITUTIONS.filter(i=> i.name.toLowerCase().includes(f) || i.country.toLowerCase().includes(f));
      instList.innerHTML = items.map(i=> `
        <div class="inst-card">
          <div class="name">${i.name}</div>
          <div class="meta">${i.country} · Registry partner since ${i.since}</div>
          <span class="badge ${i.accredited ? "badge-verified" : "badge-pending"}"><span class="badge-dot"></span>${i.accredited ? "Accredited" : "Under review"}</span>
        </div>
      `).join("") || `<p>No institutions match "${filter}".</p>`;
    };
    render();
    searchInput?.addEventListener("input", (e)=> render(e.target.value));
  }
});
