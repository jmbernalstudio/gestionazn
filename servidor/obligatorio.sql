-- ============================================================================
-- Paso 13 · Productos obligatorios en la tienda
-- Los productos marcados como obligatorios (por ejemplo, el pack de
-- entrenamiento) salen arriba, en "Lo obligatorio". El resto sale debajo,
-- en "Más productos del club".
-- Solo AÑADE una columna: no borra nada. Se puede pegar más de una vez.
-- Necesita el Paso 10 (familias y tienda) pegado antes.
-- ============================================================================
alter table public.productos add column if not exists obligatorio boolean not null default false;

-- Que la app vea ya la columna nueva
notify pgrst, $$reload schema$$;
