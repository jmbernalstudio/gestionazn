-- ============================================================================
-- Paso 11 · Packs en la tienda
-- Un pack (por ejemplo, el de entrenamiento) junta varias prendas que ya
-- existen como productos. La familia elige la talla de cada prenda, y si una
-- prenda tiene dos modelos (calzona entera o cortada), elige también el modelo.
-- En el Excel para el proveedor cada prenda cuenta por separado.
--
-- Solo AÑADE cosas: no borra tablas ni datos. Se puede pegar más de una vez.
-- Necesita el Paso 10 (familias y tienda) pegado antes.
-- ============================================================================

-- Prendas del pack: una lista de huecos, y en cada hueco los productos que se
-- pueden elegir. Ejemplo: [[camiseta], [medias], [calzona entera, calzona cortada]]
-- Un producto normal tiene la lista vacía.
alter table public.productos add column if not exists componentes jsonb not null default $t$[]$t$::jsonb;

-- ¿Este producto está dentro de algún pack que se ve en la tienda?
-- (así la familia puede ver sus tallas aunque la prenda suelta esté oculta)
create or replace function public.en_pack(p_id bigint) returns boolean
language sql stable security definer set search_path = $t$$t$ as $f$
  select exists (select 1 from public.productos k
    where k.activo and k.componentes @> jsonb_build_array(jsonb_build_array(p_id)));
$f$;
revoke all on function public.en_pack(bigint) from public, anon;
grant execute on function public.en_pack(bigint) to authenticated;

drop policy if exists prod_ver on public.productos;
create policy prod_ver on public.productos for select to authenticated
  using (public.es_junta() or ((activo or public.en_pack(id)) and (public.es_personal() or public.es_familia())));

-- Hacer un pedido. El precio y el nombre de cada producto los pone el servidor.
-- Un pack lleva "piezas": una por hueco, con el producto elegido y su talla.
create or replace function public.hacer_pedido(p_jugador bigint, p_lineas jsonb, p_nota text) returns bigint
language plpgsql security definer set search_path = $t$$t$ as $f$
declare
  v_lineas jsonb := $t$[]$t$::jsonb;
  v_total numeric := 0;
  v_jug text; v_eq text; v_id bigint;
  l jsonb; pr public.productos; pc public.productos; n int; i int;
  v_piezas jsonb; v_pz jsonb; v_talla text;
begin
  if not public.es_familia() then raise exception $m$Solo las familias pueden hacer pedidos$m$; end if;
  select trim(j.nombre || $t$ $t$ || j.apellidos), e.nombre into v_jug, v_eq
    from public.familia_jugador fj join public.jugadores j on j.id = fj.jugador join public.equipos e on e.id = j.equipo
    where fj.familia = auth.uid() and fj.jugador = p_jugador;
  if v_jug is null then raise exception $m$Elige para qué jugador es el pedido$m$; end if;
  if jsonb_typeof(p_lineas) is distinct from $t$array$t$ or jsonb_array_length(p_lineas) not between 1 and 30 then raise exception $m$El pedido está vacío$m$; end if;
  if (select count(*) from public.pedidos where familia = auth.uid() and creado > now() - interval $t$1 day$t$) >= 10 then
    raise exception $m$Has hecho muchos pedidos hoy. Si necesitas algo más, habla con la junta.$m$;
  end if;
  for l in select * from jsonb_array_elements(p_lineas) loop
    pr := null;
    select * into pr from public.productos where id = (l->>$t$producto$t$)::bigint and activo;
    if pr.id is null then raise exception $m$Un producto ya no está disponible. Vuelve a abrir la tienda.$m$; end if;
    n := coalesce((l->>$t$cantidad$t$)::int, 0);
    if n not between 1 and 20 then raise exception $m$Revisa las cantidades$m$; end if;
    if jsonb_array_length(pr.componentes) > 0 then
      -- Pack: una pieza por hueco, de los modelos que permite ese hueco, con una talla que exista
      v_piezas := $t$[]$t$::jsonb;
      if jsonb_typeof(l->$t$piezas$t$) is distinct from $t$array$t$ or jsonb_array_length(l->$t$piezas$t$) <> jsonb_array_length(pr.componentes) then
        raise exception $m$Elige la talla de cada prenda de %$m$, pr.nombre;
      end if;
      for i in 0 .. jsonb_array_length(pr.componentes) - 1 loop
        v_pz := l->$t$piezas$t$->i;
        pc := null;
        select * into pc from public.productos
          where id = (v_pz->>$t$producto$t$)::bigint and jsonb_array_length(componentes) = 0
            and (pr.componentes->i) @> to_jsonb(id);
        if pc.id is null then raise exception $m$Una prenda de % ya no está disponible. Vuelve a abrir la tienda.$m$, pr.nombre; end if;
        v_talla := coalesce(v_pz->>$t$talla$t$, $t$$t$);
        if coalesce(array_length(pc.tallas, 1), 0) > 0 then
          if not (v_talla = any (pc.tallas)) then raise exception $m$Elige la talla de % en %$m$, pc.nombre, pr.nombre; end if;
        else v_talla := $t$$t$; end if;
        v_piezas := v_piezas || jsonb_build_array(jsonb_build_object($t$producto$t$, pc.id, $t$nombre$t$, pc.nombre, $t$talla$t$, v_talla));
      end loop;
      v_lineas := v_lineas || jsonb_build_array(jsonb_build_object($t$producto$t$, pr.id, $t$nombre$t$, pr.nombre,
        $t$talla$t$, $t$$t$, $t$cantidad$t$, n, $t$precio$t$, pr.precio, $t$piezas$t$, v_piezas));
    else
      if coalesce(array_length(pr.tallas, 1), 0) > 0 and not (coalesce(l->>$t$talla$t$, $t$$t$) = any (pr.tallas)) then raise exception $m$Elige la talla de %$m$, pr.nombre; end if;
      v_lineas := v_lineas || jsonb_build_array(jsonb_build_object($t$producto$t$, pr.id, $t$nombre$t$, pr.nombre,
        $t$talla$t$, case when coalesce(array_length(pr.tallas, 1), 0) > 0 then l->>$t$talla$t$ else $t$$t$ end, $t$cantidad$t$, n, $t$precio$t$, pr.precio));
    end if;
    v_total := v_total + pr.precio * n;
  end loop;
  insert into public.pedidos (familia, jugador, equipo, lineas, total, nota, contacto)
  values (auth.uid(), v_jug, v_eq, v_lineas, v_total, left(coalesce(trim(p_nota), $t$$t$), 300),
          (select nombre || $t$ · $t$ || telefono from public.familias where id = auth.uid()))
  returning id into v_id;
  return v_id;
end $f$;
revoke all on function public.hacer_pedido(bigint, jsonb, text) from public, anon;
grant execute on function public.hacer_pedido(bigint, jsonb, text) to authenticated;
