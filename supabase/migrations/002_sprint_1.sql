alter table public.fornecedores
  add column if not exists cidade text,
  add column if not exists observacoes text;

create index if not exists compras_data_loja_idx
  on public.compras (data_compra desc, loja_id);

create index if not exists compras_fornecedor_idx
  on public.compras (fornecedor_id);

insert into public.lojas (nome, endereco, ativa)
values
  ('Sirlepan Resgate', 'Rua Nossa Senhora do Resgate, nº 42 — Resgate', true),
  ('Sirlepan Jardim Nova Esperança', 'Jardim Nova Esperança', true)
on conflict (nome)
do update set endereco = excluded.endereco, ativa = true;
