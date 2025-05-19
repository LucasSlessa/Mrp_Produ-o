-- Tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(191) NOT NULL UNIQUE,
    nome VARCHAR(255) NOT NULL,
    senha VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de produtos
CREATE TABLE IF NOT EXISTS produtos (
    id VARCHAR(36) PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    codigo_interno VARCHAR(50) NOT NULL UNIQUE,
    descricao TEXT,
    unidade VARCHAR(10) NOT NULL,
    preco DECIMAL(10,2) NOT NULL DEFAULT 0,
    tempo_producao INT NOT NULL DEFAULT 0,
    lote_minimo INT NOT NULL DEFAULT 1,
    lote_multiplo INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Adicionar coluna unidade se não existir
ALTER TABLE produtos ADD COLUMN IF NOT EXISTS unidade VARCHAR(10) NOT NULL DEFAULT 'UN';

-- Tabela de materiais
CREATE TABLE IF NOT EXISTS materiais (
    id VARCHAR(36) PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    codigo_interno VARCHAR(50) NOT NULL UNIQUE,
    descricao TEXT,
    unidade VARCHAR(10) NOT NULL,
    estoque_atual DECIMAL(10,2) NOT NULL DEFAULT 0,
    estoque_minimo DECIMAL(10,2) NOT NULL DEFAULT 0,
    estoque_maximo DECIMAL(10,2) NOT NULL DEFAULT 0,
    lead_time INT NOT NULL DEFAULT 0,
    custo DECIMAL(10,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de estrutura de materiais (BOM)
CREATE TABLE IF NOT EXISTS produto_materiais (
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

-- Tabela de mensagens do chat
CREATE TABLE IF NOT EXISTS mensagens (
    id VARCHAR(36) PRIMARY KEY,
    usuario_id VARCHAR(36) NOT NULL,
    conteudo TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
); 