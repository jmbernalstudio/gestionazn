-- Familias y tienda del club. Pegar ENTERO en Supabase > SQL Editor > New query > Run (proyecto del club).
-- Solo añade cosas nuevas: no borra ni cambia ningún dato de los entrenadores ni de la junta.
--
-- Qué hace:
--   1. Las familias piden acceso desde la app y la junta lo acepta (o lo rechaza).
--   2. Una cuenta de familia es de otro tipo: no tiene perfil de entrenador ni de junta,
--      así que nunca puede ver ni cambiar plantillas, asistencia, peticiones, avisos internos, etc.
--   3. Tienda: la junta pone los productos y las familias hacen pedidos (el precio lo pone el servidor).
-- No lleva comillas simples a propósito (el móvil las cambia por comillas curvas).

-- ---------- Tablas ----------
create table if not exists public.familias (
  id        uuid primary key default gen_random_uuid(),  -- al aceptarla, es también el id de su cuenta
  usuario   text unique not null,
  nombre    text not null,
  telefono  text not null default $t$$t$,
  hijos     jsonb not null default $t$[]$t$::jsonb,      -- lo que escribe la familia: [{"nombre": …, "equipo": …}]
  estado    text not null default $t$pendiente$t$ check (estado in ($t$pendiente$t$, $t$aceptada$t$)),
  creada    timestamptz not null default now(),
  aceptada  timestamptz
);

-- La contraseña elegida al pedir el acceso, cifrada. Nadie la puede leer desde la app; se borra al aceptar.
create table if not exists public.familias_claves (
  familia uuid primary key references public.familias on delete cascade,
  clave   text not null
);

-- Qué jugadores son de cada familia (lo elige la junta al aceptar)
create table if not exists public.familia_jugador (
  familia uuid references public.familias on delete cascade,
  jugador bigint references public.jugadores on delete cascade,
  primary key (familia, jugador)
);

create table if not exists public.productos (
  id          bigint generated always as identity primary key,
  nombre      text not null,
  descripcion text not null default $t$$t$,
  precio      numeric(8, 2) not null default 0 check (precio >= 0),
  tallas      text[] not null default array[]::text[],
  foto        text,
  activo      boolean not null default true,
  orden       int not null default 0,
  creado      timestamptz not null default now()
);

-- Huella de la foto: el móvil solo vuelve a descargar la foto de un producto si ha cambiado
alter table public.productos add column if not exists foto_hash text generated always as (md5(coalesce(foto, $t$$t$))) stored;

create table if not exists public.pedidos (
  id       bigint generated always as identity primary key,
  familia  uuid references public.familias on delete set null,
  jugador  text not null default $t$$t$,    -- nombre del jugador en el momento del pedido
  equipo   text not null default $t$$t$,
  lineas   jsonb not null,                    -- [{"producto": id, "nombre": …, "talla": …, "cantidad": n, "precio": p}]
  total    numeric(9, 2) not null default 0,
  nota     text not null default $t$$t$,
  contacto text not null default $t$$t$,    -- nombre y teléfono de la familia en el momento del pedido
  estado   int not null default 0 check (estado between 0 and 3),  -- Recibido, Pedido al proveedor, Listo para recoger, Entregado
  creado   timestamptz not null default now()
);

-- ---------- Ayudantes de permisos ----------
-- Entrenadores y junta (tienen perfil)
create or replace function public.es_personal() returns boolean
language sql stable security definer set search_path = $t$$t$ as $f$
  select exists (select 1 from public.perfiles where id = auth.uid());
$f$;
-- Familia con el acceso aceptado
create or replace function public.es_familia() returns boolean
language sql stable security definer set search_path = $t$$t$ as $f$
  select exists (select 1 from public.familias where id = auth.uid() and estado = $t$aceptada$t$);
$f$;

-- Las cuentas de familia NO reciben perfil de entrenador (el resto de cuentas, igual que siempre)
create or replace function public.nuevo_perfil() returns trigger
language plpgsql security definer set search_path = $t$$t$ as $f$
begin
  if coalesce(new.raw_app_meta_data->>$t$tipo$t$, $t$$t$) = $t$familia$t$ then return new; end if;
  -- Solo las cuentas que crea la junta desde la app (o la primera de todas) reciben perfil.
  -- Así, aunque alguien consiguiera registrarse por su cuenta, no vería nada.
  if coalesce(current_setting($t$club.alta$t$, true), $t$$t$) <> $t$1$t$ and exists (select 1 from public.perfiles) then return new; end if;
  insert into public.perfiles (id, usuario, nombre, rol)
  values (new.id,
          coalesce(new.raw_user_meta_data->>$t$usuario$t$, new.email),
          coalesce(new.raw_user_meta_data->>$t$nombre$t$, split_part(new.email, $t$@$t$, 1)),
          case when exists (select 1 from public.perfiles) then $t$entrenador$t$ else $t$junta$t$ end)
  on conflict (id) do nothing;
  return new;
end $f$;

-- Altas de entrenadores y junta (igual que antes; solo añade la marca que comprueba nuevo_perfil)
create or replace function public.crear_usuario(p_usuario text, p_clave text, p_nombre text, p_rol text, p_equipos text[])
returns uuid language plpgsql security definer set search_path = $t$$t$ as $f$
declare
  v_id uuid := gen_random_uuid();
  v_usuario text := lower(trim(p_usuario));
  v_email text := case when position($t$@$t$ in v_usuario) > 0 then v_usuario else v_usuario || $t$@usuarios.cdaznalcollar.es$t$ end;
begin
  if not public.es_junta() then raise exception $t$Solo la junta puede crear usuarios$t$; end if;
  if length(p_clave) < 8 then raise exception $t$La contraseña debe tener al menos 8 caracteres$t$; end if;
  if exists (select 1 from auth.users where email = v_email) then raise exception $t$Ese usuario ya existe$t$; end if;

  perform set_config($t$club.alta$t$, $t$1$t$, true);  -- marca: esta cuenta la crea la junta
  insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
                          raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
                          confirmation_token, recovery_token, email_change_token_new, email_change,
                          email_change_token_current, phone_change, phone_change_token, reauthentication_token)
  values ($t$00000000-0000-0000-0000-000000000000$t$, v_id, $t$authenticated$t$, $t$authenticated$t$, v_email,
          extensions.crypt(p_clave, extensions.gen_salt($t$bf$t$)), now(),
          $t${"provider":"email","providers":["email"]}$t$, jsonb_build_object($t$nombre$t$, p_nombre, $t$usuario$t$, v_usuario),
          now(), now(), $t$$t$, $t$$t$, $t$$t$, $t$$t$, $t$$t$, $t$$t$, $t$$t$, $t$$t$);

  insert into auth.identities (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
  values (gen_random_uuid(), v_id, v_id::text, $t$email$t$,
          jsonb_build_object($t$sub$t$, v_id::text, $t$email$t$, v_email, $t$email_verified$t$, true), now(), now(), now());

  update public.perfiles set rol = coalesce(nullif(p_rol, $t$$t$), $t$entrenador$t$), nombre = p_nombre, usuario = v_usuario where id = v_id;
  insert into public.entrenador_equipo (perfil, equipo) select v_id, unnest(coalesce(p_equipos, $t${}$t$));
  return v_id;
end $f$;

-- ---------- Permisos (Row Level Security) ----------
alter table public.familias        enable row level security;
alter table public.familias_claves enable row level security;  -- sin políticas: nadie la lee desde la app
alter table public.familia_jugador enable row level security;
alter table public.productos       enable row level security;
alter table public.pedidos         enable row level security;

drop policy if exists fam_ver on public.familias;
create policy fam_ver on public.familias for select to authenticated using (id = auth.uid() or public.es_junta());
drop policy if exists fam_junta on public.familias;
create policy fam_junta on public.familias for update to authenticated using (public.es_junta()) with check (public.es_junta());

drop policy if exists famjug_ver on public.familia_jugador;
create policy famjug_ver on public.familia_jugador for select to authenticated using (familia = auth.uid() or public.es_junta());
drop policy if exists famjug_junta on public.familia_jugador;
create policy famjug_junta on public.familia_jugador for all to authenticated using (public.es_junta()) with check (public.es_junta());

drop policy if exists prod_ver on public.productos;
create policy prod_ver on public.productos for select to authenticated using (public.es_junta() or (activo and (public.es_personal() or public.es_familia())));
drop policy if exists prod_junta on public.productos;
create policy prod_junta on public.productos for all to authenticated using (public.es_junta()) with check (public.es_junta());

-- Pedidos: la familia ve los suyos y puede anularlos mientras sigan en "Recibido"; la junta, todos.
-- Se crean solo con hacer_pedido() (así el precio lo pone el servidor).
drop policy if exists ped_ver on public.pedidos;
create policy ped_ver on public.pedidos for select to authenticated using (familia = auth.uid() or public.es_junta());
drop policy if exists ped_junta on public.pedidos;
create policy ped_junta on public.pedidos for update to authenticated using (public.es_junta()) with check (public.es_junta());
drop policy if exists ped_borrar on public.pedidos;
create policy ped_borrar on public.pedidos for delete to authenticated using (public.es_junta() or (familia = auth.uid() and estado = 0));

-- Los avisos de la junta son solo para entrenadores y junta (antes los veía cualquier cuenta)
drop policy if exists "ver avisos" on public.avisos;
create policy "ver avisos" on public.avisos for select to authenticated using (public.es_personal());

-- ---------- Pedir acceso (sin cuenta todavía) ----------
create or replace function public.solicitar_familia(p_usuario text, p_clave text, p_nombre text, p_telefono text, p_hijos jsonb)
returns void language plpgsql security definer set search_path = $t$$t$ as $f$
declare
  v_usuario text := lower(trim(coalesce(p_usuario, $t$$t$)));
  v_id uuid;
  h jsonb;
begin
  if v_usuario !~ $t$^[a-z0-9][a-z0-9._-]{2,39}$$t$ then raise exception $m$El usuario solo puede llevar letras sin tildes, números, puntos o guiones (de 3 a 40)$m$; end if;
  if length(coalesce(p_clave, $t$$t$)) < 8 then raise exception $m$La contraseña debe tener al menos 8 caracteres$m$; end if;
  if length(trim(coalesce(p_nombre, $t$$t$))) < 3 then raise exception $m$Escribe tu nombre y apellidos$m$; end if;
  if length(regexp_replace(coalesce(p_telefono, $t$$t$), $t$\D$t$, $t$$t$, $t$g$t$)) < 9 then raise exception $m$Escribe un teléfono de contacto$m$; end if;
  if jsonb_typeof(p_hijos) is distinct from $t$array$t$ or jsonb_array_length(p_hijos) not between 1 and 6 then raise exception $m$Indica al menos un jugador$m$; end if;
  for h in select * from jsonb_array_elements(p_hijos) loop
    if length(trim(coalesce(h->>$t$nombre$t$, $t$$t$))) < 2 then raise exception $m$Escribe el nombre de cada jugador$m$; end if;
    if not exists (select 1 from public.equipos where id = h->>$t$equipo$t$) then raise exception $m$Elige el equipo de cada jugador$m$; end if;
  end loop;
  -- Freno por si alguien intenta llenar la lista de solicitudes
  if (select count(*) from public.familias where estado = $t$pendiente$t$) >= 300
     or (select count(*) from public.familias where creada > now() - interval $t$10 minutes$t$) >= 30 then
    raise exception $m$Ahora mismo no se pueden enviar más solicitudes. Prueba dentro de un rato.$m$;
  end if;
  if exists (select 1 from public.familias where usuario = v_usuario)
     or exists (select 1 from auth.users where email = v_usuario || $t$@familias.cdaznalcollar.es$t$) then
    raise exception $m$Ese usuario ya existe. Elige otro.$m$;
  end if;
  insert into public.familias (usuario, nombre, telefono, hijos)
  values (v_usuario, left(trim(p_nombre), 80), left(trim(p_telefono), 20),
          (select jsonb_agg(jsonb_build_object($t$nombre$t$, left(trim(x->>$t$nombre$t$), 60), $t$equipo$t$, x->>$t$equipo$t$)) from jsonb_array_elements(p_hijos) x))
  returning id into v_id;
  insert into public.familias_claves (familia, clave) values (v_id, extensions.crypt(p_clave, extensions.gen_salt($t$bf$t$)));
end $f$;

-- Para que la pantalla de entrada pueda decir "tu solicitud está pendiente"
create or replace function public.estado_familia(p_usuario text) returns text
language sql stable security definer set search_path = $t$$t$ as $f$
  select estado from public.familias where usuario = lower(trim(p_usuario));
$f$;

-- ---------- La junta acepta, rechaza o quita el acceso ----------
create or replace function public.aceptar_familia(p_id uuid, p_jugadores bigint[]) returns void
language plpgsql security definer set search_path = $t$$t$ as $f$
declare
  f public.familias;
  v_email text;
  v_clave text;
begin
  if not public.es_junta() then raise exception $m$Solo la junta puede aceptar familias$m$; end if;
  select * into f from public.familias where id = p_id;
  if f.id is null then raise exception $m$Esa solicitud ya no existe$m$; end if;
  if coalesce(array_length(p_jugadores, 1), 0) = 0 then raise exception $m$Elige al menos un jugador$m$; end if;
  if f.estado = $t$pendiente$t$ then
    select clave into v_clave from public.familias_claves where familia = p_id;
    v_email := f.usuario || $t$@familias.cdaznalcollar.es$t$;
    if exists (select 1 from auth.users where email = v_email) then raise exception $m$Ese usuario ya existe$m$; end if;
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
                            raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
                            confirmation_token, recovery_token, email_change_token_new, email_change,
                            email_change_token_current, phone_change, phone_change_token, reauthentication_token)
    values ($t$00000000-0000-0000-0000-000000000000$t$, p_id, $t$authenticated$t$, $t$authenticated$t$, v_email,
            v_clave, now(),
            jsonb_build_object($t$provider$t$, $t$email$t$, $t$providers$t$, jsonb_build_array($t$email$t$), $t$tipo$t$, $t$familia$t$),
            jsonb_build_object($t$nombre$t$, f.nombre, $t$usuario$t$, f.usuario),
            now(), now(), $t$$t$, $t$$t$, $t$$t$, $t$$t$, $t$$t$, $t$$t$, $t$$t$, $t$$t$);
    insert into auth.identities (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), p_id, p_id::text, $t$email$t$,
            jsonb_build_object($t$sub$t$, p_id::text, $t$email$t$, v_email, $t$email_verified$t$, true), now(), now(), now());
    update public.familias set estado = $t$aceptada$t$, aceptada = now() where id = p_id;
    delete from public.familias_claves where familia = p_id;
  end if;
  -- Jugadores de la familia (también sirve para cambiarlos más tarde)
  delete from public.familia_jugador where familia = p_id and jugador <> all (p_jugadores);
  insert into public.familia_jugador (familia, jugador) select p_id, unnest(p_jugadores) on conflict do nothing;
end $f$;

-- Rechazar una solicitud pendiente o quitar el acceso a una familia (sus pedidos se quedan)
create or replace function public.quitar_familia(p_id uuid) returns void
language plpgsql security definer set search_path = $t$$t$ as $f$
begin
  if not public.es_junta() then raise exception $m$Solo la junta puede quitar accesos$m$; end if;
  if exists (select 1 from public.perfiles where id = p_id) then raise exception $m$No permitido$m$; end if;
  delete from public.familias where id = p_id;
  delete from auth.users where id = p_id;
end $f$;

-- ---------- Lo que ve la familia ----------
-- Sus jugadores (nombre y equipo). No ve a nadie más de la plantilla.
create or replace function public.mis_jugadores() returns table (id bigint, nombre text, equipo text)
language sql stable security definer set search_path = $t$$t$ as $f$
  select j.id, trim(j.nombre || $t$ $t$ || j.apellidos), j.equipo
  from public.familia_jugador fj join public.jugadores j on j.id = fj.jugador
  where fj.familia = auth.uid() and public.es_familia();
$f$;

-- Hacer un pedido. El precio y el nombre de cada producto los pone el servidor.
create or replace function public.hacer_pedido(p_jugador bigint, p_lineas jsonb, p_nota text) returns bigint
language plpgsql security definer set search_path = $t$$t$ as $f$
declare
  v_lineas jsonb := $t$[]$t$::jsonb;
  v_total numeric := 0;
  v_jug text; v_eq text; v_id bigint;
  l jsonb; pr public.productos; n int;
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
    select * into pr from public.productos where id = (l->>$t$producto$t$)::bigint and activo;
    if pr.id is null then raise exception $m$Un producto ya no está disponible. Vuelve a abrir la tienda.$m$; end if;
    n := coalesce((l->>$t$cantidad$t$)::int, 0);
    if n not between 1 and 20 then raise exception $m$Revisa las cantidades$m$; end if;
    if coalesce(array_length(pr.tallas, 1), 0) > 0 and not (coalesce(l->>$t$talla$t$, $t$$t$) = any (pr.tallas)) then raise exception $m$Elige la talla de %$m$, pr.nombre; end if;
    v_lineas := v_lineas || jsonb_build_array(jsonb_build_object($t$producto$t$, pr.id, $t$nombre$t$, pr.nombre,
      $t$talla$t$, case when coalesce(array_length(pr.tallas, 1), 0) > 0 then l->>$t$talla$t$ else $t$$t$ end, $t$cantidad$t$, n, $t$precio$t$, pr.precio));
    v_total := v_total + pr.precio * n;
  end loop;
  insert into public.pedidos (familia, jugador, equipo, lineas, total, nota, contacto)
  values (auth.uid(), v_jug, v_eq, v_lineas, v_total, left(coalesce(trim(p_nota), $t$$t$), 300),
          (select nombre || $t$ · $t$ || telefono from public.familias where id = auth.uid()))
  returning id into v_id;
  return v_id;
end $f$;

-- ---------- Quién puede llamar a cada función ----------
revoke all on function public.solicitar_familia(text, text, text, text, jsonb) from public;
revoke all on function public.estado_familia(text) from public;
revoke all on function public.aceptar_familia(uuid, bigint[]) from public, anon;
revoke all on function public.quitar_familia(uuid) from public, anon;
revoke all on function public.mis_jugadores() from public, anon;
revoke all on function public.hacer_pedido(bigint, jsonb, text) from public, anon;
grant execute on function public.solicitar_familia(text, text, text, text, jsonb) to anon, authenticated;
grant execute on function public.estado_familia(text) to anon, authenticated;
grant execute on function public.aceptar_familia(uuid, bigint[]) to authenticated;
grant execute on function public.quitar_familia(uuid) to authenticated;
grant execute on function public.mis_jugadores() to authenticated;
grant execute on function public.hacer_pedido(bigint, jsonb, text) to authenticated;
