-- Adicionar coluna role à tabela usuarios
ALTER TABLE usuarios ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'user';

-- Atualizar usuários existentes para terem o papel de administrador
UPDATE usuarios SET role = 'admin' WHERE id IN (
  SELECT id FROM (
    SELECT id FROM usuarios LIMIT 1
  ) AS temp
); 