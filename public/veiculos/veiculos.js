async function carregarClientes() {

    const resposta = await fetch("/api/clientes");

    if (!resposta.ok) {

        window.location.href = "index.html";

        return;
    }

    const clientes = await resposta.json();

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

    if (!resposta.ok) {

        window.location.href = "index.html";

        return;
    }

    const veiculos =
        await resposta.json();

    const tabela =
        document.getElementById("listaVeiculos");

    tabela.innerHTML = "";

    veiculos.forEach(veiculo => {

        tabela.innerHTML += `
            <tr>

                <td>${veiculo.cliente}</td>

                <td>
                    <strong>${veiculo.placa}</strong>
                </td>

                <td>${veiculo.marca}</td>

                <td>${veiculo.modelo}</td>

                <td>${veiculo.ano}</td>

            </tr>
        `;
    });
}

function abrirFormulario() {

    document.getElementById(
        "formularioVeiculo"
    ).style.display = "block";
}

function fecharFormulario() {

    document.getElementById(
        "formularioVeiculo"
    ).style.display = "none";

    document
        .getElementById("formVeiculo")
        .reset();
}

document
    .getElementById("formVeiculo")
    .addEventListener("submit", async function(event) {

        event.preventDefault();

        const dados = {

            cliente_id:
                document.getElementById("cliente").value,

            placa:
                document.getElementById("placa").value,

            marca:
                document.getElementById("marca").value,

            modelo:
                document.getElementById("modelo").value,

            ano:
                document.getElementById("ano").value
        };

        const resposta = await fetch(
            "/api/veiculos",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify(dados)
            }
        );

        const resultado =
            await resposta.json();

        if (!resposta.ok) {

            alert(resultado.erro);

            return;
        }

        alert(resultado.mensagem);

        fecharFormulario();

        carregarVeiculos();
    });

carregarClientes();
carregarVeiculos();