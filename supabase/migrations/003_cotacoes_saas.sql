-- Modelo futuro do módulo de cotações. NÃO aplicar automaticamente no banco atual.
create table if not exists public.erp_quote_requests (
 id uuid primary key default gen_random_uuid(),
 tenant_id uuid,
 code text not null unique,
 unit_id uuid,
 status text not null default 'draft' check (status in ('draft','sent','collecting','analysis','approved','ordered','closed','cancelled')),
 due_at timestamptz,
 notes text,
 created_by uuid,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create table if not exists public.erp_quote_request_items (
 id uuid primary key default gen_random_uuid(),
 quote_request_id uuid not null references public.erp_quote_requests(id) on delete cascade,
 stock_item_id uuid,
 product_name text not null,
 quantity numeric(14,3) not null check(quantity>0),
 purchase_unit text not null,
 package_description text,
 package_quantity numeric(14,3),
 notes text,
 created_at timestamptz not null default now()
);
create table if not exists public.erp_quote_suppliers (
 id uuid primary key default gen_random_uuid(),
 quote_request_id uuid not null references public.erp_quote_requests(id) on delete cascade,
 supplier_id uuid,
 supplier_name text not null,
 access_token uuid not null default gen_random_uuid() unique,
 sent_at timestamptz,
 responded_at timestamptz,
 freight numeric(14,2),
 payment_terms text,
 delivery_terms text,
 proposal_valid_until date,
 notes text,
 created_at timestamptz not null default now()
);
create table if not exists public.erp_quote_offers (
 id uuid primary key default gen_random_uuid(),
 quote_supplier_id uuid not null references public.erp_quote_suppliers(id) on delete cascade,
 quote_item_id uuid not null references public.erp_quote_request_items(id) on delete cascade,
 available boolean not null default true,
 unit_price numeric(14,4),
 offered_unit text,
 offered_package_description text,
 comparable boolean not null default true,
 comparison_note text,
 selected boolean not null default false,
 created_at timestamptz not null default now(),
 unique(quote_supplier_id,quote_item_id)
);
create table if not exists public.erp_purchase_orders (
 id uuid primary key default gen_random_uuid(),
 tenant_id uuid,
 quote_request_id uuid references public.erp_quote_requests(id),
 supplier_id uuid,
 supplier_name text not null,
 code text not null unique,
 status text not null default 'draft',
 total_amount numeric(14,2) not null default 0,
 created_at timestamptz not null default now()
);
create index if not exists erp_quote_items_request_idx on public.erp_quote_request_items(quote_request_id);
create index if not exists erp_quote_suppliers_request_idx on public.erp_quote_suppliers(quote_request_id);
create index if not exists erp_quote_offers_supplier_idx on public.erp_quote_offers(quote_supplier_id);
