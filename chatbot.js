/* ==========================================================================
   VERITAS Assist — floating help chatbot.
   Rule-based (keyword matched) so it works fully offline with zero API keys,
   while still feeling like a real onboarding/support assistant. Injects its
   own markup so it can be dropped onto any page with one <script> tag.
   ========================================================================== */

const VERITAS_FAQ = [
  {
    id: "start",
    keywords: ["start", "begin", "how does this work", "getting started", "new here"],
    reply: "Getting verified takes three steps: 1) complete your profile, 2) submit your degree details from your dashboard, 3) our registry cross-check runs and issues a verified badge with a QR code. You can track progress any time on your dashboard."
  },
  {
    id: "upload",
    keywords: ["upload", "submit degree", "add degree", "certificate id", "how do i submit"],
    reply: "On your dashboard, open 'Submit degree details' and enter your certificate ID, institution and graduation year exactly as printed on your certificate. We match this against the centralized registry."
  },
  {
    id: "qr",
    keywords: ["qr", "scan", "camera", "code"],
    reply: "Every verified certificate gets a unique QR code. Anyone — an employer, a university — can scan it on the Verify page to instantly see the registry record, without contacting you directly."
  },
  {
    id: "hash",
    keywords: ["hash", "integrity", "tamper", "fingerprint", "secure", "encryption"],
    reply: "Each registry record has a SHA-256 integrity fingerprint generated at the moment it was issued. If even one character of a certificate is altered, the fingerprint no longer matches — that's how forged documents get caught."
  },
  {
    id: "time",
    keywords: ["how long", "time", "wait", "takes", "duration"],
    reply: "Most registry cross-checks resolve in seconds since institutions are directly connected. A small number of older records are reviewed manually and marked 'Pending' — those typically clear within 1–2 business days."
  },
  {
    id: "flagged",
    keywords: ["flag", "invalid", "fake", "rejected", "fraud", "mismatch"],
    reply: "A 'Flagged' result means the certificate's details or integrity hash didn't match the registry record — this is exactly how the system catches forged or altered degrees. If you believe this is an error, contact the issuing institution to confirm your record."
  },
  {
    id: "privacy",
    keywords: ["privacy", "data safe", "who sees", "share my data", "gdpr"],
    reply: "Your profile data stays private to you and is only shared with a verifier when you explicitly generate a certificate QR code or share a verification link — we never expose your full registry record in a public search."
  },
  {
    id: "institution",
    keywords: ["institution", "university", "college", "not listed", "add my school"],
    reply: "You can browse accredited institutions on the Institutions directory. If yours isn't listed yet, our onboarding team can connect a new institution to the registry — use 'Contact support' below."
  },
  {
    id: "manual",
    keywords: ["manual", "search", "lookup", "check someone else", "employer"],
    reply: "If you're an employer or admissions officer, use the Verify page's 'Search registry' tab and enter the candidate's certificate ID — no login required for a basic authenticity check."
  },
  {
    id: "contact",
    keywords: ["contact", "support", "human", "help me", "talk to someone", "agent"],
    reply: "I can flag this for our support team — they typically respond within one business day at support@veritas-verify.example. Want me to note down your question?"
  }
];

const VERITAS_QUICK_REPLIES = [
  "How do I get verified?",
  "What does 'flagged' mean?",
  "How does the QR code work?",
  "Talk to a human"
];

function veritasChatReply(text){
  const lower = text.toLowerCase();
  for(const item of VERITAS_FAQ){
    if(item.keywords.some(k=> lower.includes(k))){
      return item.reply;
    }
  }
  return "I didn't quite catch that. I can help with: getting verified, submitting a degree, QR codes, integrity hashes, flagged results, or connecting you to support — try one of the quick options below.";
}

function veritasBuildChatWidget(){
  if(document.querySelector(".chat-launch")) return;

  const launch = document.createElement("button");
  launch.className = "chat-launch";
  launch.setAttribute("aria-label", "Open VERITAS Assist help chat");
  launch.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5c-1.3 0-2.5-.27-3.6-.77L3 21l1.83-5.4A8.46 8.46 0 0 1 3.5 11.5 8.5 8.5 0 0 1 12 3a8.5 8.5 0 0 1 9 8.5Z"/></svg><span class="dot-badge"></span>`;

  const panel = document.createElement("div");
  panel.className = "chat-panel";
  panel.innerHTML = `
    <div class="chat-head">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="11" fill="#B8862F"/><path d="M8 12.5l2.5 2.5 5.5-5.5" stroke="#12202B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      <div class="who"><b>VERITAS Assist</b><span>Online</span></div>
      <button class="close-chat" aria-label="Close chat">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
      </button>
    </div>
    <div class="chat-body" id="veritasChatBody">
      <div class="msg bot">Hi, I'm VERITAS Assist. I can help you understand your verification status, explain how QR or hash checks work, or point you to the right page. What do you need?</div>
    </div>
    <div class="chat-quick" id="veritasChatQuick"></div>
    <form class="chat-input" id="veritasChatForm">
      <input type="text" placeholder="Ask a question…" aria-label="Type your question" id="veritasChatInput" />
      <button type="submit" aria-label="Send">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z"/></svg>
      </button>
    </form>
  `;

  document.body.appendChild(launch);
  document.body.appendChild(panel);

  const body = panel.querySelector("#veritasChatBody");
  const quick = panel.querySelector("#veritasChatQuick");
  const form = panel.querySelector("#veritasChatForm");
  const input = panel.querySelector("#veritasChatInput");

  function renderQuick(){
    quick.innerHTML = "";
    VERITAS_QUICK_REPLIES.forEach(q=>{
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = q;
      b.addEventListener("click", ()=> sendMessage(q));
      quick.appendChild(b);
    });
  }
  renderQuick();

  function addMsg(text, who){
    const m = document.createElement("div");
    m.className = `msg ${who}`;
    m.textContent = text;
    body.appendChild(m);
    body.scrollTop = body.scrollHeight;
  }

  function sendMessage(text){
    if(!text.trim()) return;
    addMsg(text, "user");
    input.value = "";
    setTimeout(()=>{
      addMsg(veritasChatReply(text), "bot");
    }, 380);
  }

  launch.addEventListener("click", ()=>{
    panel.classList.add("open");
    launch.querySelector(".dot-badge")?.remove();
    input.focus();
  });
  panel.querySelector(".close-chat").addEventListener("click", ()=> panel.classList.remove("open"));
  form.addEventListener("submit", (e)=>{ e.preventDefault(); sendMessage(input.value); });
}

document.addEventListener("DOMContentLoaded", veritasBuildChatWidget);
