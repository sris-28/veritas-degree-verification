/* ==========================================================================
   Shared utilities used across every page
   ========================================================================== */

/* ---------- Theme ---------- */
function veritasInitTheme(){
  const saved = localStorage.getItem("veritas_theme") || "light";
  document.documentElement.setAttribute("data-theme", saved);
  document.querySelectorAll("[data-theme-toggle]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const cur = document.documentElement.getAttribute("data-theme");
      const next = cur === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("veritas_theme", next);
    });
  });
}

/* ---------- Toast ---------- */
function veritasToast(message){
  let toast = document.querySelector(".toast");
  if(!toast){
    toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `<span class="t-dot"></span><span class="t-msg"></span>`;
    document.body.appendChild(toast);
  }
  toast.querySelector(".t-msg").textContent = message;
  toast.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(()=> toast.classList.remove("show"), 2600);
}

/* ---------- Session / profile (all local, demo-only auth) ---------- */
function veritasGetUser(){
  const raw = localStorage.getItem("veritas_user");
  return raw ? JSON.parse(raw) : null;
}
function veritasSaveUser(user){
  localStorage.setItem("veritas_user", JSON.stringify(user));
}
function veritasLogout(){
  localStorage.removeItem("veritas_user");
  window.location.href = "index.html";
}
function veritasRequireAuth(){
  if(!veritasGetUser()){
    window.location.href = "auth.html";
  }
}
function veritasInitials(name){
  if(!name) return "?";
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0]||"") + (parts[1]?.[0]||"")).toUpperCase();
}

/* ---------- My verification requests (the applications a user has submitted) ---------- */
function veritasGetRequests(){
  const raw = localStorage.getItem("veritas_requests");
  return raw ? JSON.parse(raw) : [];
}
function veritasSaveRequests(list){
  localStorage.setItem("veritas_requests", JSON.stringify(list));
}
function veritasAddRequest(req){
  const list = veritasGetRequests();
  list.unshift(req);
  veritasSaveRequests(list);
  return list;
}

/* ---------- Real SHA-256 (Web Crypto) — used to demonstrate genuine
   tamper-evident hashing of a certificate's data, the same principle a real
   registry would use to sign records. ---------- */
async function veritasHash(payloadObj){
  const enc = new TextEncoder().encode(JSON.stringify(payloadObj));
  const digest = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(digest)).map(b=>b.toString(16).padStart(2,"0")).join("");
}

/* ---------- Mobile nav drawer ---------- */
function veritasInitMobileNav(){
  const toggle = document.querySelector(".nav-toggle");
  const drawer = document.querySelector(".mobile-drawer");
  if(!toggle || !drawer) return;
  toggle.addEventListener("click", ()=> drawer.classList.add("open"));
  drawer.querySelector(".close-drawer")?.addEventListener("click", ()=> drawer.classList.remove("open"));
  drawer.addEventListener("click", (e)=>{ if(e.target === drawer) drawer.classList.remove("open"); });
}

/* ---------- Fill sidebar / nav user info if logged in ---------- */
function veritasHydrateUserChrome(){
  const user = veritasGetUser();
  document.querySelectorAll("[data-user-name]").forEach(el=> el.textContent = user ? user.name : "Guest");
  document.querySelectorAll("[data-user-email]").forEach(el=> el.textContent = user ? user.email : "");
  document.querySelectorAll("[data-user-initials]").forEach(el=> el.textContent = veritasInitials(user?.name));
}

document.addEventListener("DOMContentLoaded", ()=>{
  veritasInitTheme();
  veritasInitMobileNav();
  veritasHydrateUserChrome();
  document.querySelectorAll("[data-logout]").forEach(el=> el.addEventListener("click", (e)=>{ e.preventDefault(); veritasLogout(); }));
});
