async function verificarSessao() {

    const resposta = await fetch("/api/sessao");

    if (!resposta.ok) {

        window.location.href = "index.html";

        return;
    }

    const dados = await resposta.json();

    document.getElementById("nomeUsuario").textContent =
        dados.usuario.nome;
}

async function logout() {

    await fetch("/api/logout", {
        method: "POST"
    });

    window.location.href = "index.html";
}

verificarSessao();