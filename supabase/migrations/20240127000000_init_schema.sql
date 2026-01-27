-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create socios table
create table if not exists socios (
  id uuid primary key default uuid_generate_v4(),
  nombre text not null,
  telefono text,
  created_at timestamp with time zone default now()
);

-- Create pedidos table
create table if not exists pedidos (
  id uuid primary key default uuid_generate_v4(),
  socio_id uuid references socios(id) on delete set null,
  fecha_pedido timestamp with time zone default now(),
  variedad text not null,
  cantidad numeric not null,
  precio_total numeric not null,
  modalidad text check (modalidad in ('retiro', 'envio')) not null,
  direccion text,
  metodo_pago text check (metodo_pago in ('transferencia', 'efectivo')) not null,
  estado_pago text check (estado_pago in ('pendiente', 'confirmado')) not null default 'pendiente',
  estado_pedido text check (estado_pedido in ('pendiente', 'en_reparto', 'entregado')) not null default 'pendiente',
  fecha_entrega date,
  horario_entrega text default '18-20',
  created_at timestamp with time zone default now()
);

-- Add indexes
create index if not exists idx_pedidos_socio_id on pedidos(socio_id);
create index if not exists idx_pedidos_created_at on pedidos(created_at);
create index if not exists idx_socios_nombre on socios(nombre);

-- Enable RLS
alter table socios enable row level security;
alter table pedidos enable row level security;

-- Create policies
create policy "Enable all access for authenticated users" on socios
  for all using (auth.role() = 'authenticated');

create policy "Enable all access for authenticated users" on pedidos
  for all using (auth.role() = 'authenticated');

-- Insert seed data
insert into socios (id, nombre, telefono) values
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Juan Perez', '+5491122334455'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Maria Garcia', '+5491155667788'),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Carlos Lopez', '+5491188990011')
on conflict (id) do nothing;

insert into pedidos (socio_id, variedad, cantidad, precio_total, modalidad, direccion, metodo_pago, estado_pago, estado_pedido, fecha_entrega) values
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Lemon Haze', 5, 25000, 'envio', 'Av. Siempreviva 123', 'transferencia', 'confirmado', 'entregado', current_date - 1),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Purple Kush', 10, 45000, 'retiro', null, 'efectivo', 'pendiente', 'pendiente', current_date),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Gorilla Glue', 2, 12000, 'envio', 'Calle Falsa 123', 'transferencia', 'confirmado', 'en_reparto', current_date),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Lemon Haze', 5, 25000, 'envio', 'Av. Siempreviva 123', 'transferencia', 'confirmado', 'entregado', current_date - 7),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Purple Kush', 10, 45000, 'retiro', null, 'efectivo', 'confirmado', 'entregado', current_date - 5)
;
