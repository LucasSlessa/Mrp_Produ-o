-- Criar o banco de dados
CREATE DATABASE IF NOT EXISTS project_bolt;
USE project_bolt;

-- Drops em ordem para respeitar as foreign keys
DROP TABLE IF EXISTS historico_pedidos;
DROP TABLE IF EXISTS pedido_itens;
DROP TABLE IF EXISTS pedidos;
DROP TABLE IF EXISTS notificacoes;
DROP TABLE IF EXISTS mensagens;
DROP TABLE IF EXISTS produto_materiais;
DROP TABLE IF EXISTS produtos;
DROP TABLE IF EXISTS materiais;
DROP TABLE IF EXISTS fornecedores;
DROP TABLE IF EXISTS usuarios;

-- Criar tabela de usuários
CREATE TABLE usuarios (
    id VARCHAR(36) PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    senha VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE INDEX idx_email (email(100))
);

-- Criar tabela de fornecedores
CREATE TABLE fornecedores (
    id VARCHAR(36) PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    telefone VARCHAR(20),
    cnpj VARCHAR(14) UNIQUE,
    endereco TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Criar tabela de produtos
CREATE TABLE produtos (
    id VARCHAR(36) PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    codigo_interno VARCHAR(50) NOT NULL,
    unidade VARCHAR(10) NOT NULL DEFAULT 'UN',
    preco DECIMAL(10,2) NOT NULL DEFAULT 0,
    tempo_producao INT NOT NULL DEFAULT 0,
    lote_minimo INT NOT NULL DEFAULT 1,
    lote_multiplo INT NOT NULL DEFAULT 1,
    estoque_atual INT NOT NULL DEFAULT 0,
    estoque_minimo INT NOT NULL DEFAULT 0,
    estoque_maximo INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE INDEX idx_codigo_interno (codigo_interno(50))
);

-- Criar tabela de materiais
CREATE TABLE materiais (
    id VARCHAR(36) PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    codigo_interno VARCHAR(50) NOT NULL,
    unidade VARCHAR(10) NOT NULL DEFAULT 'UN',
    estoque_atual DECIMAL(10,2) NOT NULL DEFAULT 0,
    estoque_minimo DECIMAL(10,2) NOT NULL DEFAULT 0,
    estoque_maximo DECIMAL(10,2) NOT NULL DEFAULT 0,
    lead_time INT NOT NULL DEFAULT 0,
    custo DECIMAL(10,2) NOT NULL DEFAULT 0,
    fornecedor_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE INDEX idx_codigo_interno_material (codigo_interno(50)),
    FOREIGN KEY (fornecedor_id) REFERENCES fornecedores(id) ON DELETE SET NULL
);

-- Criar tabela de relacionamento entre produtos e materiais
CREATE TABLE produto_materiais (
    id VARCHAR(36) PRIMARY KEY,
    produto_id VARCHAR(36) NOT NULL,
    material_id VARCHAR(36) NOT NULL,
    quantidade DECIMAL(10,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE,
    FOREIGN KEY (material_id) REFERENCES materiais(id) ON DELETE CASCADE,
    UNIQUE KEY unique_produto_material (produto_id, material_id)
);

-- Criar tabela de pedidos
CREATE TABLE pedidos (
    id VARCHAR(36) PRIMARY KEY,
    numero_pedido VARCHAR(20) NOT NULL UNIQUE,
    fornecedor_id VARCHAR(36) NOT NULL,
    usuario_id VARCHAR(36) NOT NULL,
    status ENUM('pendente', 'aprovado', 'enviado', 'recebido', 'cancelado') NOT NULL DEFAULT 'pendente',
    tipo ENUM('manual', 'automatico') NOT NULL DEFAULT 'manual',
    data_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_previsao DATE,
    data_recebimento DATE,
    observacoes TEXT,
    valor_total DECIMAL(10,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (fornecedor_id) REFERENCES fornecedores(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Criar tabela de itens do pedido
CREATE TABLE pedido_itens (
    id VARCHAR(36) PRIMARY KEY,
    pedido_id VARCHAR(36) NOT NULL,
    material_id VARCHAR(36) NOT NULL,
    quantidade DECIMAL(10,2) NOT NULL,
    valor_unitario DECIMAL(10,2) NOT NULL,
    valor_total DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    FOREIGN KEY (material_id) REFERENCES materiais(id)
);

-- Criar tabela de histórico de pedidos
CREATE TABLE historico_pedidos (
    id VARCHAR(36) PRIMARY KEY,
    pedido_id VARCHAR(36) NOT NULL,
    usuario_id VARCHAR(36) NOT NULL,
    status VARCHAR(20) NOT NULL,
    data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Criar tabela de mensagens
CREATE TABLE mensagens (
    id VARCHAR(36) PRIMARY KEY,
    usuario_id VARCHAR(36) NOT NULL,
    conteudo TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Criar tabela de notificações
CREATE TABLE notificacoes (
    id VARCHAR(36) PRIMARY KEY,
    usuario_id VARCHAR(36) NOT NULL,
    titulo VARCHAR(100) NOT NULL,
    mensagem TEXT NOT NULL,
    tipo ENUM('info', 'warning', 'error', 'success') NOT NULL DEFAULT 'info',
    lida BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Inserir usuário administrador padrão (senha: admin123)
INSERT INTO usuarios (id, nome, email, senha, role) 
VALUES (UUID(), 'Administrador', 'admin@sistema.com', '$2b$10$8bEHQvKlrwHQxWqoYkQOvOkU7ankQnNpJAw0EKbP0MF1WJe7TPy8.', 'admin');