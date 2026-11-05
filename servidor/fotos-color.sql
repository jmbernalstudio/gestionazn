-- ============================================================================
-- Paso 16 · Una foto para cada color
-- Si un producto viene en varios colores, la junta puede poner una foto de
-- cada color. Cuando la familia elige el color, cambia la foto.
-- Solo AÑADE columnas: no borra nada. Se puede pegar más de una vez.
-- Necesita el Paso 15 (colores) pegado antes.
-- ============================================================================

-- Fotos por color: { "Azul": foto, "Negro": foto }
alter table public.productos add column if not exists fotos_color jsonb not null default $t${}$t$::jsonb;

-- Huella de esas fotos: el móvil solo las vuelve a descargar si cambian
alter table public.productos add column if not exists fotos_color_hash text
  generated always as (case when fotos_color = $t${}$t$::jsonb then null else md5(fotos_color::text) end) stored;

-- Que la app vea ya las columnas nuevas
notify pgrst, $$reload schema$$;
