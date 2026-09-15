document.addEventListener("DOMContentLoaded", ()=>{
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");
  const tabButtons = document.querySelectorAll(".tab-btn[data-auth-tab]");

  tabButtons.forEach(btn=>{
    btn.addEventListener("click", ()=>{
      tabButtons.forEach(b=> b.classList.remove("active"));
      btn.classList.add("active");
      document.querySelectorAll(".tab-panel[data-auth-panel]").forEach(p=> p.classList.remove("active"));
      document.querySelector(`.tab-panel[data-auth-panel="${btn.dataset.authTab}"]`).classList.add("active");
    });
  });

  signupForm?.addEventListener("submit", (e)=>{
    e.preventDefault();
    const name = document.getElementById("suName").value.trim();
    const email = document.getElementById("suEmail").value.trim();
    const phone = document.getElementById("suPhone").value.trim();
    if(!name || !email){ veritasToast("Please fill in your name and email"); return; }

    const user = {
      name, email, phone,
      dob: "", nationality: "", address: "",
      profileComplete: false,
      createdAt: new Date().toISOString()
    };
    veritasSaveUser(user);
    veritasToast("Account created — welcome to VERITAS");
    window.location.href = "dashboard.html";
  });

  loginForm?.addEventListener("submit", (e)=>{
    e.preventDefault();
    const email = document.getElementById("liEmail").value.trim();
    if(!email){ veritasToast("Enter your email to continue"); return; }
    let user = veritasGetUser();
    if(!user || user.email !== email){
      // demo: sign the person in as a fresh profile tied to that email
      user = { name: email.split("@")[0].replace(/[._]/g," ").replace(/\b\w/g, c=>c.toUpperCase()), email, phone:"", dob:"", nationality:"", address:"", profileComplete:false, createdAt: new Date().toISOString() };
      veritasSaveUser(user);
    }
    veritasToast("Welcome back");
    window.location.href = "dashboard.html";
  });
});
