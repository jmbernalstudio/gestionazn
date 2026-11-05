-- ============================================================================
-- Paso 12 · Modelo y color de los productos de la tienda
-- Para que el Excel del proveedor diga qué es cada prenda (por ejemplo,
-- camiseta modelo Rigel, color azul).
-- Solo AÑADE dos columnas: no borra nada. Se puede pegar más de una vez.
-- Necesita el Paso 10 (familias y tienda) pegado antes.
-- ============================================================================
alter table public.productos add column if not exists modelo text not null default $t$$t$;
alter table public.productos add column if not exists color  text not null default $t$$t$;

-- Que la app vea ya las columnas nuevas
notify pgrst, $$reload schema$$;
