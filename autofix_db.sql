CREATE DATABASE IF NOT EXISTS autofix
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE autofix;

DROP TABLE IF EXISTS ordens_servico;
DROP TABLE IF EXISTS veiculos;
DROP TABLE IF EXISTS clientes;
DROP TABLE IF EXISTS usuarios;

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    usuario VARCHAR(50) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    cpf VARCHAR(500) NOT NULL,
    cpf_hash CHAR(64) NOT NULL UNIQUE,
    telefone VARCHAR(20),
    email VARCHAR(150),
    endereco VARCHAR(255),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE veiculos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL,
    placa VARCHAR(10) NOT NULL UNIQUE,
    marca VARCHAR(50) NOT NULL,
    modelo VARCHAR(80) NOT NULL,
    ano INT NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_veiculo_cliente
        FOREIGN KEY (cliente_id)
        REFERENCES clientes(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE ordens_servico (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL,
    veiculo_id INT NOT NULL,
    descricao TEXT NOT NULL,
    valor DECIMAL(10,2) DEFAULT 0.00,
    status VARCHAR(30) NOT NULL DEFAULT 'Aberta',
    data_abertura DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_os_cliente
        FOREIGN KEY (cliente_id)
        REFERENCES clientes(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_os_veiculo
        FOREIGN KEY (veiculo_id)
        REFERENCES veiculos(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- Usuário inicial
-- senha: 123456
INSERT INTO usuarios (nome, usuario, senha)
VALUES
(
    'Administrador',
    'admin',
    '$2a$10$5R8fuJP685SsPLmsugUtpO.Ak9eYeUH6MNZeFr8i6nM0r/r.V8xjG'
);

-- Clientes de teste
-- Os CPFs serão substituídos/criptografados pelo sistema quando cadastrados.
INSERT INTO clientes
(nome, cpf, cpf_hash, telefone, email, endereco)
VALUES
(
    'zeze',
    'CPF_DE_TESTE_1',
    SHA2('11111111111', 256),
    '(81) 99999-1111',
    'zezo@email.com',
    'Rua A, 100'
),
(
    'rafaelson',
    'CPF_DE_TESTE_2',
    SHA2('22222222222', 256),
    '(81) 99999-2222',
    'rafos@email.com',
    'Rua B, 200'
),
(
    'didi',
    'CPF_DE_TESTE_3',
    SHA2('33333333333', 256),
    '(81) 99999-3333',
    'didi@email.com',
    'Rua C, 300'
);

INSERT INTO veiculos
(cliente_id, placa, marca, modelo, ano)
VALUES
(1, 'ABC1D23', 'Fiat', 'Uno', 2018),
(2, 'DEF4G56', 'Volkswagen', 'Gol', 2020),
(3, 'HIJ7K89', 'Chevrolet', 'Onix', 2022);

INSERT INTO ordens_servico
(cliente_id, veiculo_id, descricao, valor, status, data_abertura)
VALUES
(1, 1, 'Troca de óleo e filtro', 250.00, 'Concluída', '2025-01-10 08:30:00'),
(2, 2, 'Revisão do sistema de freios', 480.00, 'Em andamento', '2025-01-12 10:00:00'),
(3, 3, 'Alinhamento e balanceamento', 180.00, 'Aberta', '2025-01-15 14:30:00');