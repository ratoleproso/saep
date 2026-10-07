let veiculos = [];

async function carregarClientes() {

    const resposta =
        await fetch("/api/clientes");

    if (!resposta.ok) {

        window.location.href = "index.html";

        return;
    }

    const clientes =
        await resposta.json();

    const select =
        document.getElementById("cliente");

    clientes.forEach(cliente => {

        const option =
            document.createElement("option");

        option.value = cliente.id;

        option.textContent = cliente.nome;

        select.appendChild(option);
    });
}

async function carregarVeiculos() {

    const resposta =
        await fetch("/api/veiculos");

    veiculos =
        await resposta.json();

    const select =
        document.getElementById("veiculo");

    veiculos.forEach(veiculo => {

        const option =
            document.createElement("option");

        option.value = veiculo.id;

        option.textContent =
            `${veiculo.placa} - ${veiculo.modelo} (${veiculo.cliente})`;

        option.dataset.cliente =
            veiculo.cliente_id;

        select.appendChild(option);
    });
}

async function carregarOrdens() {

    const resposta =
        await fetch("/api/ordens");

    if (!resposta.ok) {

        window.location.href = "index.html";

        return;
    }

    const ordens =
        await resposta.json();

    const tabela =
        document.getElementById("listaOrdens");

    tabela.innerHTML = "";

    ordens.forEach(ordem => {

        const data =
            new Date(ordem.data_abertura)
            .toLocaleDateString("pt-BR");

        const valor =
            Number(ordem.valor)
            .toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL"
            });

        tabela.innerHTML += `
            <tr>

                <td>${data}</td>

                <td>${ordem.cliente}</td>

                <td>
                    ${ordem.placa}
                    <br>
                    <small>
                        ${ordem.marca}
                        ${ordem.modelo}
                    </small>
                </td>

                <td>${ordem.descricao}</td>

                <td>${valor}</td>

                <td>
                    <span class="status">
                        ${ordem.status}
                    </span>
                </td>

            </tr>
        `;
    });
}

function abrirFormulario() {

    document.getElementById(
        "formularioOS"
    ).style.display = "block";
}

function fecharFormulario() {

    document.getElementById(
        "formularioOS"
    ).style.display = "none";

    document
        .getElementById("formOS")
        .reset();
}

document
    .getElementById("formOS")
    .addEventListener("submit", async function(event) {

        event.preventDefault();

        const dados = {

            cliente_id:
                document.getElementById("cliente").value,

            veiculo_id:
                document.getElementById("veiculo").value,

            descricao:
                document.getElementById("descricao").value,

            valor:
                document.getElementById("valor").value,

            status:
                document.getElementById("status").value
        };

        const resposta =
            await fetch("/api/ordens", {

                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify(dados)
            });

        const resultado =
            await resposta.json();

        if (!resposta.ok) {

            alert(resultado.erro);

            return;
        }

        alert(resultado.mensagem);

        fecharFormulario();

        carregarOrdens();
    });

carregarClientes();
carregarVeiculos();
carregarOrdens();