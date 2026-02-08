let listaDeCompras = [];
let itemAEditar;

const form = document.getElementById("form-itens");
const itensInput = document.getElementById("receber-item");
const ulItens = document.getElementById("lista-de-itens");
const ulItensComprados = document.getElementById("itens-comprados");
const listaRecuperada = localStorage.getItem('listaDeCompras')

function atualizaLocalStorage() {
    localStorage.setItem('listaDeCompras', JSON.stringify(listaDeCompras))
}

if (listaRecuperada) {
    listaDeCompras = JSON.parse(listaRecuperada);
    mostrarItem();
} else {
    listaDeCompras = [];
}

form.addEventListener("submit", function (evento) {
    evento.preventDefault();
    salvarItem();
    mostrarItem();
    itensInput.focus();
});

function salvarItem() {
    const comprasItem = itensInput.value;
    const setorItem = document.getElementById("setor-item").value;

    if (!setorItem) {
        alert("Por favor, selecione um setor.");
        return;
    }

    const checarDuplicado = listaDeCompras.some((elemento) => elemento.valor.toUpperCase() === comprasItem.toUpperCase() && elemento.setor === setorItem);

    if (checarDuplicado) {
        alert("Item já existe nesse setor.");
    } else {
        listaDeCompras.push({
            valor: comprasItem,
            checar: false,
            setor: setorItem
        });

        itensInput.value = '';
        document.getElementById("setor-item").value = '';
    }
}


function mostrarItem() {
    ulItens.innerHTML = ``;
    ulItensComprados.innerHTML = ``;

    listaDeCompras.forEach((elemento, index) => {
        const itemHTML = `
           <li class="item-compra is-flex is-justify-content-space-between" data-value="${index}">
                <div>
                    <input type="checkbox" ${elemento.checar ? 'checked' : ''} class="is-clickable" />
                     ${index === Number(itemAEditar)
                ? `<input type="text" value="${elemento.valor}" class="input-edicao" />`
                : `<span class="${elemento.checar ? 'itens-comprados' : ''} is-size-5">
    ${elemento.valor}
    <span class="badge ${elemento.setor}">${elemento.setor}</span>
</span>
`
            }
                </div>
                <div>
                    ${index === Number(itemAEditar)
                ? '<button onclick="salvarEdicao()"><i class="fa-regular fa-floppy-disk is-clickable"></i></button>'
                : '<i class="fa-regular is-clickable fa-pen-to-square editar"></i>'
            }
                    <i class="fa-solid fa-trash is-clickable deletar"></i>
                </div>
            </li>
        `;

        if (elemento.checar) {
            ulItensComprados.innerHTML += itemHTML;
        } else {
            ulItens.innerHTML += itemHTML;
        }
    });

    const inputsCheck = document.querySelectorAll('input[type="checkbox"]');

    inputsCheck.forEach(i => {
        i.addEventListener('click', (evento) => {
            const valorDoElemento = evento.target.parentElement.parentElement.getAttribute('data-value');
            listaDeCompras[valorDoElemento].checar = evento.target.checked
            mostrarItem();
        })
    })

    const deletar = document.querySelectorAll('.deletar');

    deletar.forEach(i => {
        i.addEventListener('click', (evento) => {
            const valorDoElemento = evento.target.parentElement.parentElement.getAttribute('data-value');
            listaDeCompras.splice(valorDoElemento, 1);
            mostrarItem();
        })
    })

    const editarItens = document.querySelectorAll(".editar");

    editarItens.forEach(i => {
        i.addEventListener('click', (evento) => {
            itemAEditar = evento.target.parentElement.parentElement.getAttribute('data-value');
            mostrarItem();
        })
    });

    atualizaLocalStorage();
}

function editarItem(index) {
    itemAEditar = index;
    mostrarItem();
}

function salvarEdicao() {
    const itemEditado = document.querySelector(`[data-value="${itemAEditar}"] input[type="text"]`);
    if (itemEditado) {
        listaDeCompras[itemAEditar].valor = itemEditado.value;
    }
    itemAEditar = -1;
    mostrarItem();
}

const toggleDark = document.getElementById("toggle-dark");

toggleDark.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    localStorage.setItem("modoEscuro", document.body.classList.contains("dark"));
});

if (localStorage.getItem("modoEscuro") === "true") {
    document.body.classList.add("dark");
}

document.getElementById("exportar-pdf").addEventListener("click", () => {
    const elemento = document.querySelector(".hero-body");
    html2pdf().from(elemento).save("lista-de-compras.pdf");
});

window.addEventListener("load", () => {
    setTimeout(() => {
        itensInput.focus();
    }, 400);
});

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js");
}
