let clientes = [];

async function carregarClientes() {

    const resposta = await fetch("/api/clientes");

    if (!resposta.ok) {

        window.location.href = "index.html";

        return;
    }

    clientes = await resposta.json();

    mostrarClientes(clientes);
}

function mostrarClientes(lista) {

    const tabela = document.getElementById("listaClientes");

    tabela.innerHTML = "";

    if (lista.length === 0) {

        tabela.innerHTML = `
            <tr>
                <td colspan="5">
                    Nenhum cliente encontrado.
                </td>
            </tr>
        `;

        return;
    }

    lista.forEach(cliente => {

        tabela.innerHTML += `
            <tr>

                <td>${cliente.nome}</td>

                <td>${formatarCPF(cliente.cpf)}</td>

                <td>${cliente.telefone || "-"}</td>

                <td>${cliente.email || "-"}</td>

                <td>

                    <button
                        class="btn-small editar"
                        onclick="editarCliente(${cliente.id})">

                        Editar

                    </button>

                    <button
                        class="btn-small excluir"
                        onclick="excluirCliente(${cliente.id})">

                        Excluir

                    </button>

                </td>

            </tr>
        `;
    });
}

function formatarCPF(cpf) {

    if (!cpf || cpf === "Não disponível") {
        return cpf;
    }

    cpf = cpf.replace(/\D/g, "");

    if (cpf.length !== 11) {
        return cpf;
    }

    return cpf.replace(
        /(\d{3})(\d{3})(\d{3})(\d{2})/,
        "$1.$2.$3-$4"
    );
}

function filtrarClientes() {

    const texto = document
        .getElementById("busca")
        .value
        .toLowerCase();

    const resultado = clientes.filter(cliente => {

        return (
            cliente.nome.toLowerCase().includes(texto) ||
            cliente.cpf.includes(texto.replace(/\D/g, ""))
        );

    });

    mostrarClientes(resultado);
}

function abrirFormulario() {

    document.getElementById(
        "formularioCliente"
    ).style.display = "block";
}

function fecharFormulario() {

    document.getElementById(
        "formularioCliente"
    ).style.display = "none";

    document
        .getElementById("formCliente")
        .reset();

    document.getElementById("clienteId").value = "";
}

document
    .getElementById("formCliente")
    .addEventListener("submit", async function(event) {

        event.preventDefault();

        const id =
            document.getElementById("clienteId").value;

        const dados = {

            nome:
                document.getElementById("nome").value,

            cpf:
                document.getElementById("cpf").value,

            telefone:
                document.getElementById("telefone").value,

            email:
                document.getElementById("email").value,

            endereco:
                document.getElementById("endereco").value
        };

        const url = id
            ? `/api/clientes/${id}`
            : "/api/clientes";

        const metodo = id
            ? "PUT"
            : "POST";

        const resposta = await fetch(url, {

            method: metodo,

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(dados)
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {

            alert(resultado.erro);

            return;
        }

        alert(resultado.mensagem);

        fecharFormulario();

        carregarClientes();
    });

async function excluirCliente(id) {

    if (!confirm(
        "Deseja realmente excluir este cliente?"
    )) {
        return;
    }

    const resposta = await fetch(
        `/api/clientes/${id}`,
        {
            method: "DELETE"
        }
    );

    const dados = await resposta.json();

    alert(dados.mensagem || dados.erro);

    carregarClientes();
}

function editarCliente(id) {

    const cliente = clientes.find(
        item => item.id === id
    );

    if (!cliente) {
        return;
    }

    abrirFormulario();

    document.getElementById("clienteId").value =
        cliente.id;

    document.getElementById("nome").value =
        cliente.nome;

    document.getElementById("cpf").value =
        cliente.cpf;

    document.getElementById("telefone").value =
        cliente.telefone || "";

    document.getElementById("email").value =
        cliente.email || "";

    document.getElementById("endereco").value =
        cliente.endereco || "";
}

carregarClientes();