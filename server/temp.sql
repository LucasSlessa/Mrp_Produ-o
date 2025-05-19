USE project_bolt;

CREATE TABLE IF NOT EXISTS historico_pedidos (
  id VARCHAR(36) PRIMARY KEY,
  pedido_id VARCHAR(36) NOT NULL,
  usuario_id VARCHAR(36) NOT NULL,
  status VARCHAR(20) NOT NULL,
  data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Desabilitar verificação de chaves estrangeiras temporariamente
SET FOREIGN_KEY_CHECKS = 0;

-- Excluir dados da tabela historico_pedidos
DELETE FROM historico_pedidos;

-- Excluir dados da tabela pedido_itens
DELETE FROM pedido_itens;

-- Excluir dados da tabela pedidos
DELETE FROM pedidos;

-- Excluir dados da tabela produto_materiais
DELETE FROM produto_materiais;

-- Excluir dados da tabela produtos
DELETE FROM produtos;

-- Excluir dados da tabela materiais
DELETE FROM materiais;

-- Reabilitar verificação de chaves estrangeiras
SET FOREIGN_KEY_CHECKS = 1;

-- Primeiro, vamos remover a chave estrangeira existente
ALTER TABLE pedidos
DROP FOREIGN KEY pedidos_ibfk_1;

-- Agora, vamos adicionar a nova chave estrangeira com RESTRICT
ALTER TABLE pedidos
ADD CONSTRAINT pedidos_ibfk_1
FOREIGN KEY (fornecedor_id) REFERENCES fornecedores(id)
ON DELETE RESTRICT;

-- Inserir 20 materiais
INSERT INTO materiais (id, nome, descricao, codigo_interno, unidade, estoque_atual, estoque_minimo, estoque_maximo, lead_time, custo) VALUES
(UUID(), 'Aço Inox 304', 'Aço inoxidável grau 304', 'ACO-304', 'kg', 1000, 200, 2000, 15, 45.90),
(UUID(), 'Alumínio 6061', 'Liga de alumínio 6061', 'ALU-6061', 'kg', 800, 150, 1600, 10, 38.50),
(UUID(), 'Cobre Eletrolítico', 'Cobre puro para aplicações elétricas', 'COB-EL', 'kg', 500, 100, 1000, 20, 65.75),
(UUID(), 'Plástico ABS', 'Plástico ABS para moldagem', 'PLA-ABS', 'kg', 2000, 300, 4000, 7, 25.90),
(UUID(), 'Borracha EPDM', 'Borracha sintética EPDM', 'BOR-EPDM', 'kg', 1500, 250, 3000, 12, 32.40),
(UUID(), 'Vidro Temperado', 'Vidro temperado 6mm', 'VID-6MM', 'm²', 300, 50, 600, 25, 85.00),
(UUID(), 'Tinta Epóxi', 'Tinta epóxi industrial', 'TIN-EPOX', 'L', 200, 40, 400, 8, 120.00),
(UUID(), 'Parafuso M6', 'Parafuso sextavado M6', 'PAR-M6', 'un', 5000, 1000, 10000, 5, 0.45),
(UUID(), 'Porca M6', 'Porca sextavada M6', 'POR-M6', 'un', 5000, 1000, 10000, 5, 0.35),
(UUID(), 'Arruela M6', 'Arruela plana M6', 'ARR-M6', 'un', 5000, 1000, 10000, 5, 0.15),
(UUID(), 'Fio Elétrico 2.5mm²', 'Fio elétrico 2.5mm²', 'FIO-2.5', 'm', 1000, 200, 2000, 10, 3.50),
(UUID(), 'Interruptor 10A', 'Interruptor simples 10A', 'INT-10A', 'un', 500, 100, 1000, 8, 8.90),
(UUID(), 'Tomada 20A', 'Tomada 2P+T 20A', 'TOM-20A', 'un', 500, 100, 1000, 8, 12.90),
(UUID(), 'Disjuntor 25A', 'Disjuntor termomagnético 25A', 'DIS-25A', 'un', 300, 50, 600, 15, 45.00),
(UUID(), 'Cabo de Rede', 'Cabo de rede CAT6', 'CAB-CAT6', 'm', 2000, 400, 4000, 7, 2.90),
(UUID(), 'Placa de Circuito', 'PCB padrão', 'PCB-STD', 'un', 1000, 200, 2000, 20, 15.90),
(UUID(), 'Resistor 1kΩ', 'Resistor 1kΩ 1/4W', 'RES-1K', 'un', 10000, 2000, 20000, 5, 0.10),
(UUID(), 'Capacitor 100μF', 'Capacitor eletrolítico 100μF', 'CAP-100U', 'un', 5000, 1000, 10000, 5, 0.25),
(UUID(), 'LED 5mm', 'LED vermelho 5mm', 'LED-5MM', 'un', 10000, 2000, 20000, 5, 0.15),
(UUID(), 'Bateria 9V', 'Bateria alcalina 9V', 'BAT-9V', 'un', 500, 100, 1000, 10, 12.90);

-- Inserir 5 fornecedores
INSERT INTO fornecedores (id, nome, cnpj, email, telefone, endereco) VALUES
(UUID(), 'Metalúrgica São Paulo', '12345678000190', 'contato@metalurgicasp.com.br', '(11) 3333-4444', 'Rua das Indústrias, 100 - São Paulo/SP'),
(UUID(), 'Eletrônicos Brasil', '98765432000110', 'vendas@eletronicosbrasil.com.br', '(11) 4444-5555', 'Av. Paulista, 1000 - São Paulo/SP'),
(UUID(), 'Plásticos do Sul', '45678901000123', 'comercial@plasticosdoul.com.br', '(51) 5555-6666', 'Rua Industrial, 500 - Porto Alegre/RS'),
(UUID(), 'Componentes Elétricos', '34567890000145', 'atendimento@componenteseletricos.com.br', '(21) 6666-7777', 'Av. Rio Branco, 200 - Rio de Janeiro/RJ'),
(UUID(), 'Materiais Industriais', '23456789000167', 'contato@materiaisindustriais.com.br', '(31) 7777-8888', 'Rua da Indústria, 300 - Belo Horizonte/MG');

-- Inserir 10 pedidos
INSERT INTO pedidos (id, numero_pedido, fornecedor_id, usuario_id, data_pedido, data_previsao, valor_total, status, observacoes) VALUES
(UUID(), 'PED-2024-0001', (SELECT id FROM fornecedores LIMIT 1), (SELECT id FROM usuarios LIMIT 1), NOW(), DATE_ADD(NOW(), INTERVAL 15 DAY), 2500.00, 'pendente', 'Entrega urgente'),
(UUID(), 'PED-2024-0002', (SELECT id FROM fornecedores LIMIT 1), (SELECT id FROM usuarios LIMIT 1), NOW(), DATE_ADD(NOW(), INTERVAL 20 DAY), 1800.00, 'aprovado', 'Material para manutenção'),
(UUID(), 'PED-2024-0003', (SELECT id FROM fornecedores LIMIT 1), (SELECT id FROM usuarios LIMIT 1), NOW(), DATE_ADD(NOW(), INTERVAL 10 DAY), 3200.00, 'enviado', 'Projeto novo'),
(UUID(), 'PED-2024-0004', (SELECT id FROM fornecedores LIMIT 1), (SELECT id FROM usuarios LIMIT 1), NOW(), DATE_ADD(NOW(), INTERVAL 25 DAY), 1500.00, 'recebido', 'Reposição de estoque'),
(UUID(), 'PED-2024-0005', (SELECT id FROM fornecedores LIMIT 1), (SELECT id FROM usuarios LIMIT 1), NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 4200.00, 'pendente', 'Material para produção'),
(UUID(), 'PED-2024-0006', (SELECT id FROM fornecedores LIMIT 1), (SELECT id FROM usuarios LIMIT 1), NOW(), DATE_ADD(NOW(), INTERVAL 12 DAY), 2800.00, 'aprovado', 'Manutenção preventiva'),
(UUID(), 'PED-2024-0007', (SELECT id FROM fornecedores LIMIT 1), (SELECT id FROM usuarios LIMIT 1), NOW(), DATE_ADD(NOW(), INTERVAL 18 DAY), 1900.00, 'enviado', 'Reposição de peças'),
(UUID(), 'PED-2024-0008', (SELECT id FROM fornecedores LIMIT 1), (SELECT id FROM usuarios LIMIT 1), NOW(), DATE_ADD(NOW(), INTERVAL 22 DAY), 3500.00, 'recebido', 'Projeto de expansão'),
(UUID(), 'PED-2024-0009', (SELECT id FROM fornecedores LIMIT 1), (SELECT id FROM usuarios LIMIT 1), NOW(), DATE_ADD(NOW(), INTERVAL 8 DAY), 2200.00, 'pendente', 'Material urgente'),
(UUID(), 'PED-2024-0010', (SELECT id FROM fornecedores LIMIT 1), (SELECT id FROM usuarios LIMIT 1), NOW(), DATE_ADD(NOW(), INTERVAL 15 DAY), 2800.00, 'aprovado', 'Reposição de estoque');

-- Inserir itens para cada pedido
INSERT INTO pedido_itens (id, pedido_id, material_id, quantidade, valor_unitario, valor_total)
SELECT 
    UUID(),
    p.id,
    m.id,
    FLOOR(RAND() * 10) + 1,
    m.custo,
    (FLOOR(RAND() * 10) + 1) * m.custo
FROM pedidos p
CROSS JOIN materiais m
WHERE RAND() < 0.3
LIMIT 50; 