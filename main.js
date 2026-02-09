let listaDeCompras = [];
let itemAEditar = -1;

const form = document.getElementById("form-itens");
const itensInput = document.getElementById("receber-item");
const setorSelect = document.getElementById("setor-item");
const ulItens = document.getElementById("lista-de-itens");
const ulItensComprados = document.getElementById("itens-comprados");

/* ======================================================
   LOCAL STORAGE
====================================================== */
const listaRecuperada = localStorage.getItem("listaDeCompras");

if (listaRecuperada) {
    listaDeCompras = JSON.parse(listaRecuperada);
}

function atualizaLocalStorage() {
    localStorage.setItem("listaDeCompras", JSON.stringify(listaDeCompras));
}

/* ======================================================
   SALVAR ITEM
====================================================== */
form.addEventListener("submit", (e) => {
    e.preventDefault();

    const valor = itensInput.value.trim();
    const setor = setorSelect.value;

    if (!valor || !setor) {
        alert("Preencha o item e selecione um setor.");
        return;
    }

    const duplicado = listaDeCompras.some(
        i => i.valor.toUpperCase() === valor.toUpperCase() && i.setor === setor
    );

    if (duplicado) {
        alert("Item já existe nesse setor.");
        return;
    }

    listaDeCompras.push({
        valor,
        setor,
        checar: false
    });

    itensInput.value = "";
    setorSelect.value = "";
    itensInput.focus();

    mostrarItem();
});

/* ======================================================
   RENDERIZAÇÃO
====================================================== */
function mostrarItem() {
    ulItens.innerHTML = "";
    ulItensComprados.innerHTML = "";

    listaDeCompras.forEach((item, index) => {
        const li = document.createElement("li");
        li.className = "item-compra is-flex is-justify-content-space-between";
        li.dataset.index = index;

        li.innerHTML = `
            <div>
                <input type="checkbox" ${item.checar ? "checked" : ""}>
                ${
                    index === itemAEditar
                        ? `<input class="input input-edicao" value="${item.valor}">`
                        : `<span class="${item.checar ? "itens-comprados" : ""}">
                            ${item.valor}
                            <span class="badge ${item.setor}">${item.setor}</span>
                          </span>`
                }
            </div>
            <div>
                ${
                    index === itemAEditar
                        ? `<i class="fa-regular fa-floppy-disk salvar"></i>`
                        : `<i class="fa-regular fa-pen-to-square editar"></i>`
                }
                <i class="fa-solid fa-trash deletar"></i>
            </div>
        `;

        (item.checar ? ulItensComprados : ulItens).appendChild(li);
    });

    bindEventos();
    atualizaLocalStorage();
}

/* ======================================================
   EVENTOS DOS ITENS
====================================================== */
function bindEventos() {
    document.querySelectorAll(".deletar").forEach(btn => {
        btn.onclick = (e) => {
            const index = e.target.closest("li").dataset.index;
            listaDeCompras.splice(index, 1);
            mostrarItem();
        };
    });

    document.querySelectorAll(".editar").forEach(btn => {
        btn.onclick = (e) => {
            itemAEditar = e.target.closest("li").dataset.index;
            mostrarItem();
        };
    });

    document.querySelectorAll(".salvar").forEach(btn => {
        btn.onclick = (e) => {
            const li = e.target.closest("li");
            const index = li.dataset.index;
            const input = li.querySelector(".input-edicao");
            listaDeCompras[index].valor = input.value.trim();
            itemAEditar = -1;
            mostrarItem();
        };
    });

    document.querySelectorAll("input[type='checkbox']").forEach(check => {
        check.onchange = (e) => {
            const index = e.target.closest("li").dataset.index;
            listaDeCompras[index].checar = e.target.checked;
            mostrarItem();
        };
    });
}

/* ======================================================
   MODO ESCURO
====================================================== */
const toggleDark = document.getElementById("toggle-dark");

if (localStorage.getItem("modoEscuro") === "true") {
    document.body.classList.add("dark");
}

toggleDark.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    localStorage.setItem("modoEscuro", document.body.classList.contains("dark"));
});

/* ======================================================
   EXPORTAR PDF (CORRIGIDO)
====================================================== */
document.getElementById("exportar-pdf").addEventListener("click", async () => {
    document.body.classList.add("exportando");

    const wrapper = document.createElement("div");

    /* CABEÇALHO */
    wrapper.innerHTML = `
        <div style="text-align:center; margin-bottom:20px;">
            <img src="assets/OIP.jpg" style="width:60px">
            <h2>Lista de Compras</h2>
            <small>${new Date().toLocaleDateString("pt-BR")}</small>
            <hr>
        </div>
    `;

    /* AGRUPAR POR SETOR */
    const setores = {};

    listaDeCompras.forEach(item => {
        if (!setores[item.setor]) setores[item.setor] = [];
        setores[item.setor].push(item);
    });

    Object.entries(setores).forEach(([setor, itens]) => {
        const bloco = document.createElement("div");
        bloco.innerHTML = `
            <h3>${setor}</h3>
            <ul>
                ${itens.map(i => `<li>${i.valor}</li>`).join("")}
            </ul>
        `;
        wrapper.appendChild(bloco);
    });

    /* RODAPÉ */
    wrapper.innerHTML += `
        <hr>
        <p><strong>Total de itens:</strong> ${listaDeCompras.length}</p>
        <div style="margin-top:40px; text-align:center;">
            ___________________________<br>
            Assinatura
        </div>
    `;

    await html2pdf().from(wrapper).set({
        filename: "lista-de-compras.pdf",
        margin: 12,
        html2canvas: {
            scale: 2,
            backgroundColor: "#ffffff"
        },
        jsPDF: {
            unit: "mm",
            format: "a4",
            orientation: "portrait"
        }
    }).save();

    document.body.classList.remove("exportando");
});

/* ======================================================
   MODO MERCADO
====================================================== */
document.getElementById("modo-mercado").addEventListener("click", () => {
    document.body.classList.toggle("mercado");
});

/* ======================================================
   NOTIFICAÇÕES
====================================================== */
function solicitarNotificacao() {
    if ("Notification" in window && Notification.permission !== "granted") {
        Notification.requestPermission();
    }
}

function notificarItensPendentes() {
    const pendentes = listaDeCompras.filter(i => !i.checar);
    if (pendentes.length && Notification.permission === "granted") {
        new Notification("🛒 Lista de compras", {
            body: `Você ainda tem ${pendentes.length} item(ns).`,
            icon: "assets/OIP.jpg"
        });
    }
}

window.addEventListener("load", () => {
    mostrarItem();
    solicitarNotificacao();
    setTimeout(notificarItensPendentes, 1000 * 60 * 30);
    setTimeout(() => itensInput.focus(), 400);
});

/* ======================================================
   SERVICE WORKER
====================================================== */
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js");
}

/* ======================================================
   INSTALAÇÃO INTELIGENTE (PWA)
====================================================== */

let deferredPrompt;
const btnInstalar = document.getElementById("btn-instalar");

window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault(); // impede o prompt automático
    deferredPrompt = e;

    // mostra o botão apenas quando for possível instalar
    btnInstalar.style.display = "inline-flex";
});

btnInstalar.addEventListener("click", async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();

    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
        console.log("Usuário instalou o app 🎉");
    } else {
        console.log("Usuário recusou a instalação");
    }

    deferredPrompt = null;
    btnInstalar.style.display = "none";
});
