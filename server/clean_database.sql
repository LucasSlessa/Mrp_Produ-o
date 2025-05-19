-- Limpar todas as tabelas na ordem correta para respeitar as foreign keys
DELETE FROM pedido_itens;
DELETE FROM pedidos;
DELETE FROM notificacoes;
DELETE FROM mensagens;
DELETE FROM produto_materiais;
DELETE FROM produtos;
DELETE FROM materiais;
DELETE FROM fornecedores;
DELETE FROM usuarios;

-- Resetar os auto-incrementos
ALTER TABLE pedido_itens AUTO_INCREMENT = 1;
ALTER TABLE pedidos AUTO_INCREMENT = 1;
ALTER TABLE notificacoes AUTO_INCREMENT = 1;
ALTER TABLE mensagens AUTO_INCREMENT = 1;
ALTER TABLE produto_materiais AUTO_INCREMENT = 1;
ALTER TABLE produtos AUTO_INCREMENT = 1;
ALTER TABLE materiais AUTO_INCREMENT = 1;
ALTER TABLE fornecedores AUTO_INCREMENT = 1;
ALTER TABLE usuarios AUTO_INCREMENT = 1;

-- Inserir usuário administrador padrão (senha: admin123)
INSERT INTO usuarios (id, nome, email, senha, tipo) 
VALUES (UUID(), 'Administrador', 'admin@sistema.com', '$2b$10$8bEHQvKlrwHQxWqoYkQOvOkU7ankQnNpJAw0EKbP0MF1WJe7TPy8.', 'admin'); 