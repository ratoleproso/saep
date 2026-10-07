const formLogin = document.getElementById("formLogin");

formLogin.addEventListener("submit", async function(event) {

    event.preventDefault();

    const usuario = document.getElementById("usuario").value;
    const senha = document.getElementById("senha").value;

    const mensagem = document.getElementById("mensagem");

    try {

        const resposta = await fetch("/api/login", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                usuario,
                senha
            })
        });

        const dados = await resposta.json();

        if (!resposta.ok) {

            mensagem.innerHTML = `
                <div class="erro">
                    ${dados.erro}
                </div>
            `;

            return;
        }

        window.location.href = "dashboard.html";

    } catch (erro) {

        mensagem.innerHTML = `
            <div class="erro">
                Não foi possível conectar ao servidor.
            </div>
        `;
    }

});