const express = require("express");
const session = require("express-session");
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const path = require("path");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 30 * 60 * 1000
        }
    })
);

app.use(express.static(path.join(__dirname, "public")));

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10
});





const CHAVE = Buffer.from(process.env.ENCRYPTION_KEY, "hex");

function criptografar(texto) {
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(
        "aes-256-cbc",
        CHAVE,
        iv
    );

    let encrypted = cipher.update(texto, "utf8", "hex");

    encrypted += cipher.final("hex");

    return `${iv.toString("hex")}:${encrypted}`;
}

function descriptografar(texto) {
    const partes = texto.split(":");

    const iv = Buffer.from(partes[0], "hex");
    const encrypted = partes[1];

    const decipher = crypto.createDecipheriv(
        "aes-256-cbc",
        CHAVE,
        iv
    );

    let decrypted = decipher.update(
        encrypted,
        "hex",
        "utf8"
    );

    decrypted += decipher.final("utf8");

    return decrypted;
}

function hashCPF(cpf) {
    return crypto
        .createHash("sha256")
        .update(cpf)
        .digest("hex");
}





function verificarLogin(req, res, next) {
    if (!req.session.usuario) {
        return res.status(401).json({
            erro: "Usuário não autenticado."
        });
    }

    next();
}

/* =========================
   LOGIN
========================= */

app.post("/api/login", async (req, res) => {
    try {
        const { usuario, senha } = req.body;

        if (!usuario || !senha) {
            return res.status(400).json({
                erro: "Informe usuário e senha."
            });
        }

        const [usuarios] = await pool.execute(
            "SELECT * FROM usuarios WHERE usuario = ?",
            [usuario]
        );

        if (usuarios.length === 0) {
            return res.status(401).json({
                erro: "Usuário ou senha inválidos."
            });
        }

        const user = usuarios[0];

        const senhaValida = await bcrypt.compare(
            senha,
            user.senha
        );

        if (!senhaValida) {
            return res.status(401).json({
                erro: "Usuário ou senha inválidos."
            });
        }

        req.session.usuario = {
            id: user.id,
            nome: user.nome,
            usuario: user.usuario
        };

        res.json({
            sucesso: true,
            usuario: req.session.usuario
        });

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            erro: "Erro interno do servidor."
        });
    }
});




app.get("/api/sessao", verificarLogin, (req, res) => {
    res.json({
        autenticado: true,
        usuario: req.session.usuario
    });
});





app.post("/api/logout", (req, res) => {
    req.session.destroy(() => {
        res.json({
            sucesso: true
        });
    });
});






app.get("/api/clientes", verificarLogin, async (req, res) => {
    try {
        const [clientes] = await pool.execute(
            "SELECT id, nome, cpf, telefone, email, endereco FROM clientes ORDER BY id DESC"
        );

        const resultado = clientes.map(cliente => {

            let cpf = "";

            try {
                cpf = descriptografar(cliente.cpf);
            } catch {
                cpf = "Não disponível";
            }

            return {
                ...cliente,
                cpf
            };
        });

        res.json(resultado);

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            erro: "Erro ao buscar clientes."
        });
    }
});





app.post("/api/clientes", verificarLogin, async (req, res) => {
    try {
        const {
            nome,
            cpf,
            telefone,
            email,
            endereco
        } = req.body;

        if (!nome || !cpf) {
            return res.status(400).json({
                erro: "Nome e CPF são obrigatórios."
            });
        }

        const cpfLimpo = cpf.replace(/\D/g, "");

        const hash = hashCPF(cpfLimpo);

        const cpfCriptografado = criptografar(cpfLimpo);

        await pool.execute(
            `INSERT INTO clientes
            (nome, cpf, cpf_hash, telefone, email, endereco)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                nome,
                cpfCriptografado,
                hash,
                telefone,
                email,
                endereco
            ]
        );

        res.json({
            sucesso: true,
            mensagem: "Cliente cadastrado com sucesso."
        });

    } catch (erro) {
        console.error(erro);

        if (erro.code === "ER_DUP_ENTRY") {
            return res.status(400).json({
                erro: "CPF já cadastrado."
            });
        }

        res.status(500).json({
            erro: "Erro ao cadastrar cliente."
        });
    }
});





app.put("/api/clientes/:id", verificarLogin, async (req, res) => {
    try {
        const id = req.params.id;

        const {
            nome,
            cpf,
            telefone,
            email,
            endereco
        } = req.body;

        const cpfLimpo = cpf.replace(/\D/g, "");

        const hash = hashCPF(cpfLimpo);

        const cpfCriptografado = criptografar(cpfLimpo);

        await pool.execute(
            `UPDATE clientes
             SET nome = ?,
                 cpf = ?,
                 cpf_hash = ?,
                 telefone = ?,
                 email = ?,
                 endereco = ?
             WHERE id = ?`,
            [
                nome,
                cpfCriptografado,
                hash,
                telefone,
                email,
                endereco,
                id
            ]
        );

        res.json({
            sucesso: true,
            mensagem: "Cliente atualizado."
        });

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            erro: "Erro ao atualizar cliente."
        });
    }
});





app.delete("/api/clientes/:id", verificarLogin, async (req, res) => {
    try {
        await pool.execute(
            "DELETE FROM clientes WHERE id = ?",
            [req.params.id]
        );

        res.json({
            sucesso: true,
            mensagem: "Cliente excluído."
        });

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            erro: "Erro ao excluir cliente."
        });
    }
});





app.get("/api/veiculos", verificarLogin, async (req, res) => {
    try {
        const [veiculos] = await pool.execute(`
            SELECT
                v.id,
                v.placa,
                v.marca,
                v.modelo,
                v.ano,
                c.id AS cliente_id,
                c.nome AS cliente
            FROM veiculos v
            INNER JOIN clientes c
                ON c.id = v.cliente_id
            ORDER BY v.id DESC
        `);

        res.json(veiculos);

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            erro: "Erro ao buscar veículos."
        });
    }
});




app.post("/api/veiculos", verificarLogin, async (req, res) => {
    try {
        const {
            cliente_id,
            placa,
            marca,
            modelo,
            ano
        } = req.body;

        if (!cliente_id || !placa || !marca || !modelo || !ano) {
            return res.status(400).json({
                erro: "Preencha todos os campos."
            });
        }

        await pool.execute(
            `INSERT INTO veiculos
            (cliente_id, placa, marca, modelo, ano)
            VALUES (?, ?, ?, ?, ?)`,
            [
                cliente_id,
                placa.toUpperCase(),
                marca,
                modelo,
                ano
            ]
        );

        res.json({
            sucesso: true,
            mensagem: "Veículo cadastrado."
        });

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            erro: "Erro ao cadastrar veículo."
        });
    }
});





app.get("/api/ordens", verificarLogin, async (req, res) => {
    try {
        const [ordens] = await pool.execute(`
            SELECT
                os.id,
                os.descricao,
                os.valor,
                os.status,
                os.data_abertura,
                c.nome AS cliente,
                v.placa,
                v.marca,
                v.modelo
            FROM ordens_servico os

            INNER JOIN clientes c
                ON c.id = os.cliente_id

            INNER JOIN veiculos v
                ON v.id = os.veiculo_id

            ORDER BY os.data_abertura DESC
        `);

        res.json(ordens);

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            erro: "Erro ao buscar ordens."
        });
    }
});




app.post("/api/ordens", verificarLogin, async (req, res) => {
    try {
        const {
            cliente_id,
            veiculo_id,
            descricao,
            valor,
            status
        } = req.body;

        if (!cliente_id || !veiculo_id || !descricao) {
            return res.status(400).json({
                erro: "Preencha os campos obrigatórios."
            });
        }

        await pool.execute(
            `INSERT INTO ordens_servico
            (cliente_id, veiculo_id, descricao, valor, status)
            VALUES (?, ?, ?, ?, ?)`,
            [
                cliente_id,
                veiculo_id,
                descricao,
                valor || 0,
                status || "Aberta"
            ]
        );

        res.json({
            sucesso: true,
            mensagem: "Ordem de serviço cadastrada."
        });

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            erro: "Erro ao cadastrar ordem."
        });
    }
});




const PORTA = 3000;

app.listen(PORTA, () => {
    console.log(`
========================================
        AUTOFIX INICIADO
========================================

Acesse:

http://localhost:${PORTA}

Usuário: admin
Senha: 123456

========================================
    `);
});