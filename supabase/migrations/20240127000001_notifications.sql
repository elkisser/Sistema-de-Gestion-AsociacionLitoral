-- Create notifications table
create table if not exists notifications (
  id uuid primary key default uuid_generate_v4(),
  titulo text not null,
  descripcion text,
  tipo text check (tipo in ('info', 'success', 'warning', 'error')) default 'info',
  leida boolean default false,
  pedido_id uuid references pedidos(id) on delete set null,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table notifications enable row level security;

-- Create policies
create policy "Enable all access for authenticated users" on notifications
  for all using (auth.role() = 'authenticated');

-- Function to handle new order notification
create or replace function public.handle_new_order()
returns trigger as $$
begin
  insert into notifications (titulo, descripcion, tipo, pedido_id)
  values ('Nuevo Pedido', 'Se ha creado un nuevo pedido de ' || new.variedad, 'success', new.id);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new order
drop trigger if exists on_new_order on pedidos;
create trigger on_new_order
  after insert on pedidos
  for each row execute procedure public.handle_new_order();
