-- C.D. Aznalcóllar Fútbol Base · servidor privado (Supabase)
-- Se pega UNA vez en Supabase > SQL Editor > New query > Run.
-- Aquí solo hay estructura y permisos: ningún dato personal.
--
-- Quién ve qué:
--   · Junta: todo (equipos, plantillas, peticiones, avisos, usuarios).
--   · Entrenador: solo los jugadores y la asistencia de SUS equipos,
--     sus propias peticiones y los avisos del club.
--   · Sin iniciar sesión: nada.

-- ---------- Tablas ----------
create table if not exists public.equipos (
  id     text primary key,          -- igual que en js/datos.js (senior, alevin2…)
  nombre text not null
);
-- Entrenos: días (1 = lunes … 7 = domingo), hora y campo. Los elige la junta.
alter table public.equipos add column if not exists dias int[] not null default array[]::int[],
  add column if not exists hora text, add column if not exists lugar text;
-- Hora y campo de cada día por separado: [{"d":1,"h":"18:00","where":"Campo 1"}, …]
alter table public.equipos add column if not exists sesiones jsonb;
-- Duración de los partidos (partes y minutos de cada parte). Vacío = la de la app.
alter table public.equipos add column if not exists partes int;
alter table public.equipos add column if not exists minutos_parte int;

create table if not exists public.perfiles (
  id      uuid primary key references auth.users on delete cascade,
  usuario text unique not null,     -- lo que se escribe para entrar (correo o usuario)
  nombre  text not null,
  rol     text not null default 'entrenador' check (rol in ('entrenador', 'junta')),
  creado  timestamptz not null default now()
);
alter table public.perfiles add column if not exists foto text;  -- foto pequeña (JPEG 192 px) que sube la junta

create table if not exists public.entrenador_equipo (
  perfil uuid references public.perfiles on delete cascade,
  equipo text references public.equipos on delete cascade,
  primary key (perfil, equipo)
);

create table if not exists public.jugadores (
  id         bigint generated always as identity primary key,
  equipo     text not null references public.equipos on delete cascade,
  nombre     text not null,
  apellidos  text not null default '',
  dorsal     int,
  nacimiento int,                   -- solo el año
  notas      text not null default '',
  activo     boolean not null default true
);

create table if not exists public.asistencia (
  jugador     bigint references public.jugadores on delete cascade,
  fecha       date not null,
  marcado_por uuid default auth.uid() references public.perfiles on delete set null,
  primary key (jugador, fecha)
);

create table if not exists public.peticiones (
  id      bigint generated always as identity primary key,
  equipo  text references public.equipos on delete set null,
  autor   uuid default auth.uid() references public.perfiles on delete set null,
  tipo    text not null check (tipo in ('material', 'roto', 'otra')),
  titulo  text not null,
  lugar   text not null default '',
  urgente boolean not null default false,
  estado  int not null default 0 check (estado between 0 and 3),  -- Enviada, Vista, En marcha, Resuelta
  creada  timestamptz not null default now()
);
-- Foto opcional de la petición (JPEG reducido). con_foto evita descargar la foto al listar.
alter table public.peticiones add column if not exists foto text;
alter table public.peticiones add column if not exists con_foto boolean generated always as (foto is not null) stored;

create table if not exists public.avisos (
  id     bigint generated always as identity primary key,
  titulo text not null,
  texto  text not null,
  autor  uuid default auth.uid() references public.perfiles on delete set null,
  creado timestamptz not null default now()
);

create table if not exists public.avisos_leidos (
  aviso    bigint references public.avisos on delete cascade,
  perfil   uuid references public.perfiles on delete cascade default auth.uid(),
  leido_en timestamptz not null default now(),
  primary key (aviso, perfil)
);

-- Convocatoria de cada partido: qué jugadores van, hora y sitio de quedada
create table if not exists public.convocatorias (
  equipo    text not null references public.equipos on delete cascade,
  fecha     date not null,
  jugadores bigint[] not null default array[]::bigint[],
  hora      text not null default '',
  lugar     text not null default '',
  nota      text not null default '',
  autor     uuid default auth.uid() references public.perfiles on delete set null,
  primary key (equipo, fecha)
);

insert into public.equipos (id, nombre) values
  ('senior', 'Senior'), ('juvenil', 'Juvenil'), ('cadete', 'Cadete F-7'), ('infantil', 'Infantil'),
  ('alevin2', 'Alevín 2º año'), ('alevin1', 'Alevín 1º año'), ('benjamin2', 'Benjamín 2º año'),
  ('benjamin1', 'Benjamín 1º año'), ('prebenjamin', 'Prebenjamín 2º año'), ('minis', 'Minis')
on conflict (id) do update set nombre = excluded.nombre;

-- ---------- Ayudantes de permisos ----------
create or replace function public.es_junta() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.perfiles where id = auth.uid() and rol = 'junta');
$$;

create or replace function public.entrena(eq text) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.entrenador_equipo where perfil = auth.uid() and equipo = eq);
$$;

-- ---------- Permisos (Row Level Security) ----------
alter table public.equipos           enable row level security;
alter table public.perfiles          enable row level security;
alter table public.entrenador_equipo enable row level security;
alter table public.jugadores         enable row level security;
alter table public.asistencia        enable row level security;
alter table public.peticiones        enable row level security;
alter table public.avisos            enable row level security;
alter table public.avisos_leidos     enable row level security;

drop policy if exists "ver equipos" on public.equipos;
create policy "ver equipos" on public.equipos for select to authenticated using (true);
drop policy if exists junta_edita_equipos on public.equipos;
create policy junta_edita_equipos on public.equipos for update to authenticated using (public.es_junta()) with check (public.es_junta());

drop policy if exists "ver perfiles" on public.perfiles;
create policy "ver perfiles" on public.perfiles for select to authenticated using (id = auth.uid() or public.es_junta());
drop policy if exists "junta edita perfiles" on public.perfiles;
create policy "junta edita perfiles" on public.perfiles for update to authenticated using (public.es_junta());

drop policy if exists "ver asignaciones" on public.entrenador_equipo;
create policy "ver asignaciones" on public.entrenador_equipo for select to authenticated using (perfil = auth.uid() or public.es_junta());
drop policy if exists "junta asigna" on public.entrenador_equipo;
create policy "junta asigna" on public.entrenador_equipo for all to authenticated using (public.es_junta()) with check (public.es_junta());

drop policy if exists "plantilla de mis equipos" on public.jugadores;
create policy "plantilla de mis equipos" on public.jugadores for all to authenticated
  using (public.es_junta() or public.entrena(equipo)) with check (public.es_junta() or public.entrena(equipo));

drop policy if exists "asistencia de mis equipos" on public.asistencia;
create policy "asistencia de mis equipos" on public.asistencia for all to authenticated
  using (public.es_junta() or public.entrena((select j.equipo from public.jugadores j where j.id = jugador)))
  with check (public.es_junta() or public.entrena((select j.equipo from public.jugadores j where j.id = jugador)));

drop policy if exists "ver peticiones" on public.peticiones;
create policy "ver peticiones" on public.peticiones for select to authenticated using (autor = auth.uid() or public.es_junta());
drop policy if exists "crear peticiones" on public.peticiones;
create policy "crear peticiones" on public.peticiones for insert to authenticated
  with check (autor = auth.uid() and (equipo is null or public.es_junta() or public.entrena(equipo)));
drop policy if exists "junta cambia estado" on public.peticiones;
create policy "junta cambia estado" on public.peticiones for update to authenticated using (public.es_junta());
-- Borrar: la junta, cualquiera; el entrenador, solo la suya mientras siga en "Enviada" (estado 0)
drop policy if exists borrar_peticiones on public.peticiones;
create policy borrar_peticiones on public.peticiones for delete to authenticated using (public.es_junta() or (autor = auth.uid() and estado = 0));

alter table public.convocatorias enable row level security;
drop policy if exists conv_mis_equipos on public.convocatorias;
create policy conv_mis_equipos on public.convocatorias for all to authenticated
  using (public.es_junta() or public.entrena(equipo)) with check (public.es_junta() or public.entrena(equipo));

drop policy if exists "ver avisos" on public.avisos;
create policy "ver avisos" on public.avisos for select to authenticated using (true);
drop policy if exists "junta envia avisos" on public.avisos;
create policy "junta envia avisos" on public.avisos for all to authenticated using (public.es_junta()) with check (public.es_junta());

drop policy if exists "ver leidos" on public.avisos_leidos;
create policy "ver leidos" on public.avisos_leidos for select to authenticated using (perfil = auth.uid() or public.es_junta());
drop policy if exists "marcar leido" on public.avisos_leidos;
create policy "marcar leido" on public.avisos_leidos for insert to authenticated with check (perfil = auth.uid());

-- ---------- Perfil automático ----------
-- Cada cuenta nueva recibe su perfil. La PRIMERA cuenta que se cree será de la junta.
create or replace function public.nuevo_perfil() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.perfiles (id, usuario, nombre, rol)
  values (new.id,
          coalesce(new.raw_user_meta_data->>'usuario', new.email),
          coalesce(new.raw_user_meta_data->>'nombre', split_part(new.email, '@', 1)),
          case when exists (select 1 from public.perfiles) then 'entrenador' else 'junta' end)
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists al_crear_cuenta on auth.users;
create trigger al_crear_cuenta after insert on auth.users
  for each row execute function public.nuevo_perfil();

-- ---------- Altas desde la app (solo junta) ----------
-- Quien no tiene correo entra con un usuario sencillo (p. ej. "manolo.alevin").
-- Por dentro se guarda como manolo.alevin@usuarios.cdaznalcollar.es (nunca se envían correos ahí).
create or replace function public.crear_usuario(p_usuario text, p_clave text, p_nombre text, p_rol text, p_equipos text[])
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  v_id uuid := gen_random_uuid();
  v_usuario text := lower(trim(p_usuario));
  v_email text := case when position('@' in v_usuario) > 0 then v_usuario else v_usuario || '@usuarios.cdaznalcollar.es' end;
begin
  if not public.es_junta() then raise exception 'Solo la junta puede crear usuarios'; end if;
  if length(p_clave) < 8 then raise exception 'La contraseña debe tener al menos 8 caracteres'; end if;
  if exists (select 1 from auth.users where email = v_email) then raise exception 'Ese usuario ya existe'; end if;

  insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
                          raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
                          confirmation_token, recovery_token, email_change_token_new, email_change,
                          email_change_token_current, phone_change, phone_change_token, reauthentication_token)
  values ('00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated', v_email,
          extensions.crypt(p_clave, extensions.gen_salt('bf')), now(),
          '{"provider":"email","providers":["email"]}', jsonb_build_object('nombre', p_nombre, 'usuario', v_usuario),
          now(), now(), '', '', '', '', '', '', '', '');

  insert into auth.identities (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
  values (gen_random_uuid(), v_id, v_id::text, 'email',
          jsonb_build_object('sub', v_id::text, 'email', v_email, 'email_verified', true), now(), now(), now());

  update public.perfiles set rol = coalesce(nullif(p_rol, ''), 'entrenador'), nombre = p_nombre, usuario = v_usuario where id = v_id;
  insert into public.entrenador_equipo (perfil, equipo) select v_id, unnest(coalesce(p_equipos, '{}'));
  return v_id;
end $$;

create or replace function public.cambiar_clave(p_perfil uuid, p_clave text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not (public.es_junta() or p_perfil = auth.uid()) then raise exception 'No permitido'; end if;
  if length(p_clave) < 8 then raise exception 'La contraseña debe tener al menos 8 caracteres'; end if;
  update auth.users set encrypted_password = extensions.crypt(p_clave, extensions.gen_salt('bf')), updated_at = now() where id = p_perfil;
end $$;

-- Cada persona cambia SOLO su propio nombre (no puede tocar su rol ni nada más)
create or replace function public.cambiar_nombre(p_nombre text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if length(trim(coalesce(p_nombre, ''))) = 0 then raise exception 'Escribe un nombre'; end if;
  update public.perfiles set nombre = left(trim(p_nombre), 60) where id = auth.uid();
end $$;

create or replace function public.borrar_usuario(p_perfil uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not public.es_junta() then raise exception $m$Solo la junta puede borrar accesos$m$; end if;
  if p_perfil = auth.uid() then raise exception $m$No puedes borrarte a ti mismo$m$; end if;
  delete from auth.users where id = p_perfil;
end $$;

revoke all on function public.borrar_usuario(uuid) from public, anon;
grant execute on function public.borrar_usuario(uuid) to authenticated;
revoke all on function public.crear_usuario(text, text, text, text, text[]) from public, anon;
revoke all on function public.cambiar_clave(uuid, text) from public, anon;
revoke all on function public.cambiar_nombre(text) from public, anon;
grant execute on function public.crear_usuario(text, text, text, text, text[]) to authenticated;
grant execute on function public.cambiar_clave(uuid, text) to authenticated;
grant execute on function public.cambiar_nombre(text) to authenticated;

-- ---------- Notificaciones al móvil (también en servidor/push.sql) ----------
create extension if not exists pg_net with schema extensions;

create table if not exists public.push_subs (
  endpoint text primary key,
  perfil   uuid not null references public.perfiles on delete cascade,
  p256dh   text not null,
  auth     text not null,
  creada   timestamptz not null default now()
);
alter table public.push_subs enable row level security;
drop policy if exists push_mias on public.push_subs;
create policy push_mias on public.push_subs for all to authenticated using (perfil = auth.uid()) with check (perfil = auth.uid());

-- Claves de las notificaciones: sin políticas, solo las lee la función del servidor
create table if not exists public.push_config (id int primary key, publica text not null, privada text not null);
alter table public.push_config enable row level security;

create or replace function public.avisar_push() returns trigger language plpgsql security definer set search_path = public, extensions as $$
begin
  perform net.http_post(
    url := $u$https://wkqifwtmbcutlqkonivv.supabase.co/functions/v1/avisar$u$,
    body := jsonb_build_object($k$tabla$k$, TG_TABLE_NAME, $k$op$k$, TG_OP, $k$id$k$, new.id),
    headers := jsonb_build_object($k$Content-Type$k$, $k$application/json$k$));
  return new;
end $$;

drop trigger if exists push_aviso on public.avisos;
create trigger push_aviso after insert on public.avisos for each row execute function public.avisar_push();
drop trigger if exists push_peticion on public.peticiones;
create trigger push_peticion after insert on public.peticiones for each row execute function public.avisar_push();
drop trigger if exists push_estado on public.peticiones;
create trigger push_estado after update of estado on public.peticiones for each row when (old.estado is distinct from new.estado) execute function public.avisar_push();

-- Estadísticas de cada jugador en los partidos de liga: minutos jugados y goles.
-- Las apunta el entrenador (o la junta) después de cada partido.
-- Solo añade una tabla nueva: no toca nada de lo que ya hay.
create table if not exists public.estadisticas (
  jugador  bigint references public.jugadores on delete cascade,
  fecha    date not null,
  minutos  int not null default 0,
  goles    int not null default 0,
  primary key (jugador, fecha)
);
alter table public.estadisticas enable row level security;
drop policy if exists est_mis_equipos on public.estadisticas;
create policy est_mis_equipos on public.estadisticas for all to authenticated
  using (public.es_junta() or public.entrena((select j.equipo from public.jugadores j where j.id = jugador)))
  with check (public.es_junta() or public.entrena((select j.equipo from public.jugadores j where j.id = jugador)));

-- Directo de los partidos: titulares, suplentes, goles, tarjetas y cambios con su minuto.
-- Lo apunta el entrenador durante el partido; al acabar, los minutos y goles pasan a "estadisticas".
-- Solo añade una tabla nueva: no toca nada de lo que ya hay.
create table if not exists public.partidos_directo (
  equipo      text references public.equipos on delete cascade,
  fecha       date not null,
  datos       jsonb not null,
  actualizado timestamptz not null default now(),
  primary key (equipo, fecha)
);
alter table public.partidos_directo enable row level security;
drop policy if exists directo_mis_equipos on public.partidos_directo;
create policy directo_mis_equipos on public.partidos_directo for all to authenticated
  using (public.es_junta() or public.entrena(equipo)) with check (public.es_junta() or public.entrena(equipo));

-- Fútbol 7 o fútbol 11 de cada equipo (la cambia la junta en Equipos > el equipo).
-- Solo añade una columna vacía: no toca nada de lo que ya hay.
alter table public.equipos add column if not exists modalidad int;

-- Foto de cada jugador (opcional). Solo añade una columna: no toca nada de lo que ya hay.
-- La ven únicamente su entrenador y la junta, con la sesión iniciada (la misma regla que la plantilla).
alter table public.jugadores add column if not exists foto text;

-- Entrenos anulados: la junta quita, desde el Calendario, el entreno de un equipo un día concreto
-- (por ejemplo, porque esa semana hay partido). Lo ven todos; solo la junta puede anular o recuperar.
-- Solo añade una tabla nueva: no toca nada de lo que ya hay.
create table if not exists public.entrenos_anulados (
  equipo text not null references public.equipos on delete cascade,
  fecha  date not null,
  primary key (equipo, fecha)
);
alter table public.entrenos_anulados enable row level security;
drop policy if exists anulados_ver on public.entrenos_anulados;
create policy anulados_ver on public.entrenos_anulados for select to authenticated using (true);
drop policy if exists anulados_junta on public.entrenos_anulados;
create policy anulados_junta on public.entrenos_anulados for all to authenticated using (public.es_junta()) with check (public.es_junta());

-- Familias y tienda (cuentas de familia, productos y pedidos): ver servidor/familias.sql
