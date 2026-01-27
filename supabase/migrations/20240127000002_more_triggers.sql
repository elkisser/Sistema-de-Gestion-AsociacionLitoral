-- Function to handle order updates
create or replace function public.handle_order_update()
returns trigger as $$
begin
  -- Status change
  if old.estado_pedido != new.estado_pedido then
    insert into notifications (titulo, descripcion, tipo, pedido_id)
    values (
      'Estado Actualizado', 
      'El pedido de ' || new.variedad || ' cambió a ' || replace(new.estado_pedido, '_', ' '), 
      case 
        when new.estado_pedido = 'entregado' then 'success'
        when new.estado_pedido = 'en_reparto' then 'info'
        else 'warning'
      end,
      new.id
    );
  end if;

  -- Payment change
  if old.estado_pago != new.estado_pago then
    insert into notifications (titulo, descripcion, tipo, pedido_id)
    values (
      'Pago Actualizado', 
      'El pago del pedido de ' || new.variedad || ' está ' || new.estado_pago, 
      case 
        when new.estado_pago = 'confirmado' then 'success'
        else 'warning'
      end,
      new.id
    );
  end if;

  return new;
end;
$$ language plpgsql security definer;

-- Trigger for updates
drop trigger if exists on_order_update on pedidos;
create trigger on_order_update
  after update on pedidos
  for each row execute procedure public.handle_order_update();
