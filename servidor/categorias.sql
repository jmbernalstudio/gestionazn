-- ============================================================================
-- Paso 14 · Categorías en la tienda
-- Cada producto puede tener una categoría (por ejemplo: Entrenamiento,
-- Partido, Merchandising). En la tienda, cada categoría es un apartado.
-- Solo AÑADE una columna: no borra nada. Se puede pegar más de una vez.
-- Necesita el Paso 10 (familias y tienda) pegado antes.
-- ============================================================================
alter table public.productos add column if not exists categoria text not null default $t$$t$;

-- Que la app vea ya la columna nueva
notify pgrst, $$reload schema$$;
