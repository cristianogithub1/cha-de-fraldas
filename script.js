// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, set, get, child, onValue } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

// 🔥 Config Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBCc_v7iCv_74hfA2w_ksTVW4TJnTITGlc",
  authDomain: "cha-de-fraudas-1a5cb.firebaseapp.com",
  databaseURL: "https://cha-de-fraudas-1a5cb-default-rtdb.firebaseio.com",
  projectId: "cha-de-fraudas-1a5cb",
  storageBucket: "cha-de-fraudas-1a5cb.firebasestorage.app",
  messagingSenderId: "82003062025",
  appId: "1:82003062025:web:05e602712c28ffcb1cb7d8"
};
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let selectedNumber = null;

// Criar grid com tamanhos de fraldas
const grid = document.getElementById("number-grid");
for (let i = 1; i <= 100; i++) {
  let label = "";
  if (i <= 20) label = "RN";
  else if (i <= 45) label = "P";
  else if (i <= 80) label = "M";
  else label = "G";

  const btn = document.createElement("button");
  btn.textContent = `${i} (${label})`;
  btn.classList.add("number");
  btn.addEventListener("click", () => selectNumber(i, btn, label));
  grid.appendChild(btn);
}

// Selecionar número
function selectNumber(num, btn, label) {
  if (btn.classList.contains("taken")) {
    showToast("Esse número já foi escolhido ❌");
    return;
  }
  document.querySelectorAll("button.number").forEach(b => b.classList.remove("selected"));
  btn.classList.add("selected");
  selectedNumber = { num, label };
}

// Confirmar presença
document.getElementById("confirmBtn").addEventListener("click", () => {
  const name = document.getElementById("guestName").value.trim();
  if (!selectedNumber) {
    showToast("Escolha um número primeiro ⚠️");
    return;
  }
  if (!name) {
    showToast("Digite seu nome ⚠️");
    return;
  }

  const reservaRef = ref(db, "reservas/" + selectedNumber.num);
  set(reservaRef, {
    nome: name,
    numero: selectedNumber.num,
    tamanho: selectedNumber.label
  })
  .then(() => {
    showToast("Reserva confirmada com sucesso 🎉");
    document.getElementById("guestName").value = "";
  })
  .catch(err => {
    console.error("Erro ao salvar: ", err);
    showToast("Erro ao salvar ❌");
  });
});

// Painel admin em tempo real
const panel = document.getElementById("admin-panel");
onValue(ref(db, "reservas"), snapshot => {
  panel.innerHTML = "";
  const reservas = snapshot.val();
  document.querySelectorAll("button.number").forEach(btn => btn.classList.remove("taken"));
  if (reservas) {
    Object.values(reservas).forEach(r => {
      const li = document.createElement("li");
      li.textContent = `${r.nome} escolheu o número ${r.numero} (${r.tamanho})`;
      panel.appendChild(li);

      const btn = [...document.querySelectorAll("button.number")]
        .find(b => b.textContent.startsWith(r.numero));
      if (btn) btn.classList.add("taken");
    });
  }
});

// Toast
function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.style.display = "block";
  setTimeout(() => toast.style.display = "none", 3000);
}

// Teste de conexão Firebase
get(child(ref(db), "/"))
  .then(() => console.log("✅ Conectado ao Firebase"))
  .catch(() => console.error("❌ Erro de conexão com Firebase"));
