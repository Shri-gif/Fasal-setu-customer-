-- Fasal Vistaar customer order payment fields
-- Safe to run multiple times.
alter table public.orders
  add column if not exists payment_method text;

alter table public.orders
  add column if not exists payment_status text default 'pending';

alter table public.orders
  add column if not exists payment_reference text;

update public.orders
set payment_method = coalesce(payment_method, 'cash_on_delivery'),
    payment_status = coalesce(payment_status, 'pending')
where payment_method is null
   or payment_status is null;

alter table public.orders
  drop constraint if exists orders_payment_method_check;

alter table public.orders
  add constraint orders_payment_method_check
  check (payment_method in ('cash_on_delivery', 'upi', 'online') or payment_method is null);

alter table public.orders
  drop constraint if exists orders_payment_status_check;

alter table public.orders
  add constraint orders_payment_status_check
  check (payment_status in ('pending', 'paid', 'failed', 'refunded') or payment_status is null);
