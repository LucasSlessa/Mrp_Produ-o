-- Tabela de pedidos
CREATE TABLE IF NOT EXISTS pedidos (
  id VARCHAR(36) PRIMARY KEY,
  numero_pedido VARCHAR(20) NOT NULL UNIQUE,
  fornecedor_id VARCHAR(36) NOT NULL,
  usuario_id VARCHAR(36) NOT NULL,
  data_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_previsao DATE NOT NULL,
  observacoes TEXT,
  valor_total DECIMAL(10,2) NOT NULL DEFAULT 0,
  status ENUM('pendente', 'aprovado', 'enviado', 'recebido', 'cancelado') NOT NULL DEFAULT 'pendente',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (fornecedor_id) REFERENCES fornecedores(id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Tabela de itens do pedido
CREATE TABLE IF NOT EXISTS pedido_itens (
  id VARCHAR(36) PRIMARY KEY,
  pedido_id VARCHAR(36) NOT NULL,
  material_id VARCHAR(36) NOT NULL,
  quantidade DECIMAL(10,2) NOT NULL,
  valor_unitario DECIMAL(10,2) NOT NULL,
  valor_total DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pedido_id) REFERENCES pedidos(id),
  FOREIGN KEY (material_id) REFERENCES materiais(id)
);

-- Índices
CREATE INDEX idx_pedidos_numero ON pedidos(numero_pedido);
CREATE INDEX idx_pedidos_status ON pedidos(status);
CREATE INDEX idx_pedidos_data_previsao ON pedidos(data_previsao);
CREATE INDEX idx_pedido_itens_pedido ON pedido_itens(pedido_id);
CREATE INDEX idx_pedido_itens_material ON pedido_itens(material_id); 