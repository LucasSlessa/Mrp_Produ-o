-- Primeiro, remover a chave estrangeira existente
ALTER TABLE pedidos
DROP FOREIGN KEY pedidos_ibfk_1;

-- Adicionar a nova chave estrangeira sem ON DELETE CASCADE
ALTER TABLE pedidos
ADD CONSTRAINT pedidos_ibfk_1
FOREIGN KEY (fornecedor_id) REFERENCES fornecedores(id); 