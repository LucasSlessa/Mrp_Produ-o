-- Atualizar tabela produtos
ALTER TABLE produtos
  ADD COLUMN unidade VARCHAR(10) NOT NULL DEFAULT 'UN',
  ADD COLUMN preco DECIMAL(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN tempo_producao INT NOT NULL DEFAULT 0,
  ADD COLUMN lote_minimo INT NOT NULL DEFAULT 1,
  ADD COLUMN lote_multiplo INT NOT NULL DEFAULT 1,
  MODIFY COLUMN codigo_interno VARCHAR(50) NOT NULL,
  ADD UNIQUE INDEX idx_codigo_interno (codigo_interno);

-- Atualizar tabela materiais
ALTER TABLE materiais
  ADD COLUMN codigo_interno VARCHAR(50) NOT NULL DEFAULT '',
  ADD COLUMN descricao TEXT,
  ADD COLUMN unidade VARCHAR(10) NOT NULL DEFAULT 'UN',
  ADD COLUMN estoque_atual DECIMAL(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN estoque_minimo DECIMAL(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN estoque_maximo DECIMAL(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN lead_time INT NOT NULL DEFAULT 0,
  ADD COLUMN custo DECIMAL(10,2) NOT NULL DEFAULT 0,
  ADD UNIQUE INDEX idx_codigo_interno_material (codigo_interno);

-- Atualizar tabela produto_materiais
ALTER TABLE produto_materiais
  ADD COLUMN quantidade DECIMAL(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  ADD CONSTRAINT fk_produto_id FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_material_id FOREIGN KEY (material_id) REFERENCES materiais(id) ON DELETE CASCADE,
  ADD CONSTRAINT unique_produto_material UNIQUE (produto_id, material_id);

-- Atualizar tabela usuarios
ALTER TABLE usuarios
  ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Atualizar tabela mensagens
ALTER TABLE mensagens
  ADD CONSTRAINT fk_usuario_id FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE; 