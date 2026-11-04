/* Conexión con el servidor privado del club (Supabase).
   Con js/config.js relleno, la app pide usuario y contraseña y trae de allí plantillas, asistencia,
   peticiones y avisos. Cada persona solo recibe lo que sus permisos le dejan ver. */
(function () {
  const C = window.SERVIDOR || {};
  if (!C.url || !C.clave || !window.supabase) return;
  const sb = window.supabase.createClient(C.url, C.clave, { auth: { persistSession: true, autoRefreshToken: true } });
  const DOMINIO = 'usuarios.cdaznalcollar.es';
  /* Las familias tienen su propia entrada y su propio tipo de cuenta (otro dominio interno, sin perfil de entrenador) */
  const DOMINIO_FAM = 'familias.cdaznalcollar.es';
  const emailDe = u => { u = u.trim().toLowerCase(); return u.includes('@') ? u : `${u}@${DOMINIO}`; };
  const emailFam = u => `${u.trim().toLowerCase().replace(/@.*$/, '')}@${DOMINIO_FAM}`;
  const esFamilia = user => !!user && (user.app_metadata || {}).tipo === 'familia';
  let modoEntrada = 'staff';
  /* El enlace para familias (…/?familias) y la app que instalan abren directamente la entrada de familias */
  if (/[?&]familias\b/.test(location.search)) try { localStorage.setItem('entrada', 'familia'); } catch (_) {}
  try { if (localStorage.getItem('entrada') === 'familia' || /[?&]familias\b/.test(location.search)) modoEntrada = 'familia'; } catch (_) { if (/[?&]familias\b/.test(location.search)) modoEntrada = 'familia'; }
  const ok = ({ data, error }) => { if (error) throw error; return data; };
  const nombreEq = id => (D.equipos.find(e => e.id === id) || {}).nombre || id;
  const idEq = nombre => (D.equipos.find(e => e.nombre === nombre) || {}).id || null;
  const cuando = iso => {
    const d = new Date(iso), dias = Math.round((new Date(TODAY) - new Date(ISO(d))) / 864e5);
    const h = `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
    return dias <= 0 ? `Hoy, ${h}` : dias === 1 ? 'Ayer' : `Hace ${dias} días`;
  };

  window.SERVIDOR_ON = true;
  window.API = {
    async asistencia(jugador, fecha, presente) {
      ok(presente ? await sb.from('asistencia').upsert({ jugador, fecha }, { ignoreDuplicates: true }) : await sb.from('asistencia').delete().match({ jugador, fecha }));
    },
    async jugador(team, p) {
      return ok(await sb.from('jugadores').insert({ equipo: idEq(team), nombre: p.n, dorsal: p.dorsal }).select('id').single()).id;
    },
    async editarJugador(id, n, dorsal) { ok(await sb.from('jugadores').update({ nombre: n, apellidos: '', dorsal }).eq('id', id)); },
    /* Foto del jugador (o null para quitarla). Solo la ven, con sesión iniciada, su entrenador y la junta */
    async fotoJugador(id, foto) { ok(await sb.from('jugadores').update({ foto }).eq('id', id)); },
    async quitarJugador(id, activo) { ok(await sb.from('jugadores').update({ activo }).eq('id', id)); },
    async peticion(r) {
      const fila = { equipo: idEq(r.team), tipo: r.kind, titulo: r.title, lugar: r.where || '', urgente: r.urgent };
      let res = await sb.from('peticiones').insert(r.foto ? { ...fila, foto: r.foto } : fila).select('id').single();
      /* Si aún no existe la columna "foto", la petición sale igualmente, sin foto */
      if (res.error && r.foto && /foto/.test(res.error.message || '')) { res = await sb.from('peticiones').insert(fila).select('id').single(); r.conFoto = false; }
      return ok(res).id;
    },
    async fotoPeticion(id) { return ok(await sb.from('peticiones').select('foto').eq('id', id).single()).foto; },
    async estado(id, st) { ok(await sb.from('peticiones').update({ estado: st }).eq('id', id)); },
    async aviso(n) { return ok(await sb.from('avisos').insert({ titulo: n.title, texto: n.body }).select('id').single()).id; },
    async borrarAviso(id) { ok(await sb.from('avisos').delete().eq('id', id)); },
    /* Si no se borra ninguna fila es que ya no está permitido (la junta la ha visto) */
    async borrarPeticion(id) { if (!(ok(await sb.from('peticiones').delete().eq('id', id).select('id')) || []).length) throw new Error('vista'); },
    async leido(id) { ok(await sb.from('avisos_leidos').upsert({ aviso: id }, { ignoreDuplicates: true })); },
    async alta(p) { return ok(await sb.rpc('crear_usuario', { p_usuario: p.usuario, p_clave: p.clave, p_nombre: p.nombre, p_rol: p.rol, p_equipos: p.equipos })); },
    async entreno(team, t) {
      const base = { dias: t.dias, hora: t.h, lugar: t.where };
      const r = await sb.from('equipos').update({ ...base, sesiones: t.ses }).eq('id', idEq(team));
      /* Si aún no existe la columna "sesiones", guarda al menos días, hora y campo */
      ok(r.error && /sesiones/.test(r.error.message || '') ? await sb.from('equipos').update(base).eq('id', idEq(team)) : r);
    },
    async foto(perfil, foto) { ok(await sb.from('perfiles').update({ foto }).eq('id', perfil)); },
    async clave(perfil, clave) { ok(await sb.rpc('cambiar_clave', { p_perfil: perfil, p_clave: clave })); },
    /* Anular (on = true) o recuperar el entreno de un equipo un día concreto. Solo la junta */
    async anularEntreno(team, fecha, on) {
      if (on) ok(await sb.from('entrenos_anulados').upsert({ equipo: idEq(team), fecha }, { onConflict: 'equipo,fecha' }));
      else ok(await sb.from('entrenos_anulados').delete().eq('equipo', idEq(team)).eq('fecha', fecha));
    },
    async modalidad(team, n) { ok(await sb.from('equipos').update({ modalidad: n }).eq('id', idEq(team))); },
    async duracion(team, partes, min) { ok(await sb.from('equipos').update({ partes, minutos_parte: min }).eq('id', idEq(team))); },
    async borrarUsuario(perfil) { ok(await sb.rpc('borrar_usuario', { p_perfil: perfil })); },
    async convocatoria(team, fecha, c) {
      ok(await sb.from('convocatorias').upsert({ equipo: idEq(team), fecha, jugadores: c.ids, hora: c.hora || '', lugar: c.lugar || '', nota: c.nota || '' }, { onConflict: 'equipo,fecha' }));
    },
    /* Minutos y goles de un partido: se guardan los que jugaron y se quitan los que ya no */
    async estadisticas(fecha, filas, quitar) {
      if (filas.length) ok(await sb.from('estadisticas').upsert(filas.map(f => ({ jugador: f.id, fecha, minutos: f.m, goles: f.g })), { onConflict: 'jugador,fecha' }));
      if (quitar.length) ok(await sb.from('estadisticas').delete().eq('fecha', fecha).in('jugador', quitar));
    },
    /* Directo del partido (se guarda cada vez que pasa algo; el móvil también lo guarda por si falla la conexión) */
    async directo(team, fecha, datos) { ok(await sb.from('partidos_directo').upsert({ equipo: idEq(team), fecha, datos, actualizado: new Date().toISOString() }, { onConflict: 'equipo,fecha' })); },
    async borrarDirecto(team, fecha) { ok(await sb.from('partidos_directo').delete().eq('equipo', idEq(team)).eq('fecha', fecha)); },
    async nombre(nombre) { ok(await sb.rpc('cambiar_nombre', { p_nombre: nombre })); },
    /* ---------- Familias y tienda ---------- */
    async solicitarFamilia(f) { ok(await sb.rpc('solicitar_familia', { p_usuario: f.usuario, p_clave: f.clave, p_nombre: f.nombre, p_telefono: f.telefono, p_hijos: f.hijos })); },
    async aceptarFamilia(id, jugadores) { ok(await sb.rpc('aceptar_familia', { p_id: id, p_jugadores: jugadores })); },
    async quitarFamilia(id) { ok(await sb.rpc('quitar_familia', { p_id: id })); },
    async producto(x) {
      const fila = { nombre: x.nombre, descripcion: x.descripcion, precio: x.precio, tallas: x.tallas, activo: x.activo, foto: x.foto || null };
      if (x.id) { ok(await sb.from('productos').update(fila).eq('id', x.id)); return x.id; }
      return ok(await sb.from('productos').insert(fila).select('id').single()).id;
    },
    async borrarProducto(id) { ok(await sb.from('productos').delete().eq('id', id)); },
    async fotosProductos(ids) { return ids.length ? ok(await sb.from('productos').select('id, foto, foto_hash').in('id', ids)) : []; },
    async hacerPedido(jugador, lineas, nota) { return ok(await sb.rpc('hacer_pedido', { p_jugador: jugador, p_lineas: lineas, p_nota: nota })); },
    async estadoPedido(id, st) { ok(await sb.from('pedidos').update({ estado: st }).eq('id', id)); },
    async estadoPedidos(ids, st) { ok(await sb.from('pedidos').update({ estado: st }).in('id', ids)); },
    async borrarPedido(id) { if (!(ok(await sb.from('pedidos').delete().eq('id', id).select('id')) || []).length) throw new Error('visto'); },
    async equipos(perfil, ids) {
      ok(await sb.from('entrenador_equipo').delete().eq('perfil', perfil).not('equipo', 'in', `(${ids.join(',')})`));
      ok(await sb.from('entrenador_equipo').upsert(ids.map(equipo => ({ perfil, equipo })), { ignoreDuplicates: true }));
    }
  };

  /* ---------- Pantalla de entrada ---------- */
  function pantallaEntrada(msg) {
    document.body.classList.add('sin-sesion');
    window.splashOff && splashOff();
    let box = $('#login');
    if (!box) { box = document.createElement('div'); box.id = 'login'; box.className = 'login'; document.body.prepend(box); }
    box.hidden = false;
    const fam = modoEntrada === 'familia';
    /* En el móvil, las familias solo entran con la app instalada: si no, primero la guía para instalarla */
    if (fam && window.Instalar && !Instalar.puedeSeguir()) return Instalar.pantalla(box, () => pantallaEntrada(msg));
    box.innerHTML = `<main class="card stack" aria-labelledby="lg-t">
      <img class="cr crest" src="${crestSm()}" alt="">
      <div><h1 id="lg-t">C.D. Aznalcóllar Fútbol Base</h1><p class="sub">${fam ? 'Familias de los jugadores' : 'Entrenadores y junta directiva'}</p></div>
      <div class="seg lg-seg" role="group" aria-label="Quién entra">
        <button type="button" data-modo="staff" aria-pressed="${!fam}">Entrenadores y junta</button>
        <button type="button" data-modo="familia" aria-pressed="${fam}">Familias</button></div>
      <form id="lg" class="stack" method="post" action="#" novalidate>
        <label class="f" for="lu">${fam ? 'Usuario' : 'Usuario o correo'}<input type="text" id="lu" name="username" autocomplete="username" autocapitalize="none" spellcheck="false" required></label>
        <label class="f" for="lp">Contraseña<span class="pw"><input type="password" id="lp" name="password" autocomplete="current-password" required>
          <button type="button" id="ver" aria-pressed="false">Ver</button></span></label>
        <p id="lerr" class="err" role="alert" ${msg ? '' : 'hidden'}>${msg ? esc(msg) : ''}</p>
        <button type="submit" class="btn blue block" id="lgo">Entrar</button>
      </form>
      ${fam ? `<button type="button" class="btn outline block" id="lg-pedir">${ic('user')} ¿Primera vez? Pide tu acceso</button>`
        : '<p class="help">¿Sin contraseña? Pídela a la junta.</p>'}
    </main>`;
    document.querySelectorAll('[data-modo]').forEach(b => b.onclick = () => {
      modoEntrada = b.dataset.modo; try { localStorage.setItem('entrada', modoEntrada); } catch (_) {}
      pantallaEntrada();
    });
    if ($('#lg-pedir')) $('#lg-pedir').onclick = () => pantallaSolicitud(box);
    $('#ver').onclick = e => { const v = $('#lp').type === 'password'; $('#lp').type = v ? 'text' : 'password'; e.target.textContent = v ? 'Ocultar' : 'Ver'; e.target.setAttribute('aria-pressed', v); };
    $('#lg').onsubmit = async e => {
      e.preventDefault();
      const err = m => { $('#lerr').textContent = m; $('#lerr').hidden = false; $('#lgo').disabled = false; $('#lgo').textContent = 'Entrar'; };
      const u = $('#lu').value, p = $('#lp').value;
      if (!u.trim() || !p) return err('Escribe tu usuario y tu contraseña.');
      $('#lgo').disabled = true; $('#lgo').textContent = 'Entrando…';
      const { data: dl, error } = await sb.auth.signInWithPassword({ email: fam ? emailFam(u) : emailDe(u), password: p });
      if (error) {
        if (!/invalid/i.test(error.message)) return err('No hay conexión. Prueba otra vez en un momento.');
        /* Familia que ya pidió el acceso pero la junta aún no lo ha aceptado */
        if (fam) { const r = await sb.rpc('estado_familia', { p_usuario: u.trim() }); if (r.data === 'pendiente') return err('La junta todavía no ha aceptado tu solicitud. Cuando la acepte, podrás entrar con este usuario y esta contraseña.'); }
        return err('Usuario o contraseña incorrectos.');
      }
      /* Cada tipo de cuenta entra solo por su sitio */
      if (esFamilia(dl.user) !== fam) {
        await sb.auth.signOut();
        return err(fam ? 'Esta cuenta es de un entrenador o de la junta. Entra desde “Entrenadores y junta”.' : 'Esta cuenta es de una familia. Entra desde “Familias”.');
      }
      /* El móvil ofrece guardar el usuario y la contraseña; además recordamos el usuario para la próxima vez */
      try { localStorage.setItem(fam ? 'ultimo-usuario-fam' : 'ultimo-usuario', u.trim()); } catch (_) {}
      try { if (window.PasswordCredential) await navigator.credentials.store(new PasswordCredential({ id: u.trim(), password: p, name: u.trim() })); } catch (_) {}
      entrar();
    };
    let ultimo = ''; try { ultimo = localStorage.getItem(fam ? 'ultimo-usuario-fam' : 'ultimo-usuario') || ''; } catch (_) {}
    if (ultimo) { $('#lu').value = ultimo; $('#lp').focus(); } else $('#lu').focus();
  }

  /* ---------- Pedir acceso (familias) ---------- */
  function pantallaSolicitud(box) {
    const eqs = D.equipos.slice().sort((a, b) => ORDEN.indexOf(a.id) - ORDEN.indexOf(b.id));
    const st = { hijos: [{ nombre: '', equipo: '' }] };
    const pinta = () => {
      const val = id => ($('#' + id) || {}).value || '';
      const prev = { nombre: val('sn'), tel: val('st'), usu: val('su'), clave: val('sp'), ok: ($('#sok') || {}).checked };
      document.querySelectorAll('[data-hn]').forEach(x => { st.hijos[+x.dataset.hn].nombre = x.value; });
      document.querySelectorAll('[data-he]').forEach(x => { st.hijos[+x.dataset.he].equipo = x.value; });
      box.innerHTML = `<main class="card stack sol" aria-labelledby="sl-t">
        <div class="rqd-h"><div class="grow"><h1 id="sl-t" class="st-h2">Pedir acceso</h1></div><button type="button" class="iconbtn" id="sl-x" aria-label="Volver">${ic('x')}</button></div>
        <p class="muted" style="margin:0">La junta comprobará tus datos antes de darte acceso. Solo para familias de jugadores del club.</p>
        <form id="sl" class="stack" novalidate>
          <label class="f" for="sn">Tu nombre y apellidos<input type="text" id="sn" autocomplete="name" maxlength="80" value="${esc(prev.nombre)}"></label>
          <label class="f" for="st">Teléfono<span class="hint">Por si la junta necesita hablar contigo</span><input type="tel" id="st" autocomplete="tel" inputmode="tel" maxlength="20" value="${esc(prev.tel)}"></label>
          ${st.hijos.map((h, i) => `<fieldset class="sl-h"><legend>${st.hijos.length > 1 ? `Jugador ${i + 1}` : 'Jugador'}</legend>
            <label class="f" for="hn${i}">Nombre y apellidos del jugador<input type="text" id="hn${i}" data-hn="${i}" maxlength="60" value="${esc(h.nombre)}"></label>
            <label class="f" for="he${i}">Equipo<select id="he${i}" data-he="${i}"><option value="">Elige el equipo</option>${eqs.map(e => `<option value="${e.id}" ${h.equipo === e.id ? 'selected' : ''}>${esc(e.nombre)}</option>`).join('')}</select></label>
            ${st.hijos.length > 1 ? `<button type="button" class="btn red sm" data-hq="${i}">${ic('trash')} Quitar este jugador</button>` : ''}</fieldset>`).join('')}
          ${st.hijos.length < 6 ? `<button type="button" class="btn ghost block" id="sl-mas">${ic('plus')} Añadir otro jugador</button>` : ''}
          <label class="f" for="su">Elige un usuario<span class="hint">Sin espacios ni tildes, como maria.lopez</span><input type="text" id="su" autocomplete="username" autocapitalize="none" spellcheck="false" maxlength="40" value="${esc(prev.usu)}"></label>
          <label class="f" for="sp">Elige una contraseña<span class="hint">Al menos 8 caracteres</span><span class="pw"><input type="password" id="sp" autocomplete="new-password" value="${esc(prev.clave)}">
            <button type="button" id="sp-ver" aria-pressed="false">Ver</button></span></label>
          <label class="chk"><input type="checkbox" id="sok" ${prev.ok ? 'checked' : ''}><span>Acepto que el club guarde estos datos solo para gestionar mi acceso a la app.</span></label>
          <p id="serr" class="err" role="alert" hidden></p>
          <button type="submit" class="btn blue block" id="sgo">${ic('send')} Enviar solicitud</button>
        </form></main>`;
      $('#sl-x').onclick = () => pantallaEntrada();
      $('#sp-ver').onclick = e => { const v = $('#sp').type === 'password'; $('#sp').type = v ? 'text' : 'password'; e.target.textContent = v ? 'Ocultar' : 'Ver'; e.target.setAttribute('aria-pressed', v); };
      if ($('#sl-mas')) $('#sl-mas').onclick = () => { pinta(); st.hijos.push({ nombre: '', equipo: '' }); pinta(); $('#hn' + (st.hijos.length - 1)).focus(); };
      document.querySelectorAll('[data-hq]').forEach(b => b.onclick = () => { pinta(); st.hijos.splice(+b.dataset.hq, 1); pinta(); });
      /* Propone un usuario con el nombre (maria.lopez) mientras no lo haya escrito */
      $('#sn').oninput = () => { if ($('#su').dataset.toc) return; const w = $('#sn').value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z ]/g, '').trim().split(/\s+/).filter(Boolean); $('#su').value = w.length > 1 ? `${w[0]}.${w[1]}` : w[0] || ''; };
      $('#su').oninput = () => { $('#su').dataset.toc = '1'; };
      $('#sl').onsubmit = async e => {
        e.preventDefault();
        document.querySelectorAll('[data-hn]').forEach(x => { st.hijos[+x.dataset.hn].nombre = x.value.trim(); });
        document.querySelectorAll('[data-he]').forEach(x => { st.hijos[+x.dataset.he].equipo = x.value; });
        const f = { nombre: $('#sn').value.trim(), telefono: $('#st').value.trim(), usuario: $('#su').value.trim().toLowerCase(), clave: $('#sp').value, hijos: st.hijos };
        const err = (m, el) => { $('#serr').textContent = m; $('#serr').hidden = false; $('#sgo').disabled = false; $('#sgo').innerHTML = `${ic('send')} Enviar solicitud`; if (el) el.focus(); };
        if (f.nombre.length < 3) return err('Escribe tu nombre y apellidos.', $('#sn'));
        if (f.telefono.replace(/\D/g, '').length < 9) return err('Escribe un teléfono de contacto.', $('#st'));
        const mal = f.hijos.findIndex(h => h.nombre.length < 2 || !h.equipo);
        if (mal >= 0) return err('Escribe el nombre y elige el equipo de cada jugador.', $(f.hijos[mal].nombre.length < 2 ? '#hn' + mal : '#he' + mal));
        if (!/^[a-z0-9][a-z0-9._-]{2,39}$/.test(f.usuario)) return err('El usuario solo puede llevar letras sin tildes, números, puntos o guiones (de 3 a 40).', $('#su'));
        if (f.clave.length < 8) return err('La contraseña debe tener al menos 8 caracteres.', $('#sp'));
        if (!$('#sok').checked) return err('Marca la casilla para aceptar que el club guarde estos datos.', $('#sok'));
        $('#sgo').disabled = true; $('#sgo').textContent = 'Enviando…';
        const { error } = await sb.rpc('solicitar_familia', { p_usuario: f.usuario, p_clave: f.clave, p_nombre: f.nombre, p_telefono: f.telefono, p_hijos: f.hijos });
        if (error) {
          const m = error.message || '';
          if (/function|schema cache|does not exist/i.test(m)) return err('El acceso para familias todavía no está abierto. Prueba en unos días.');
          return err(/Failed to fetch|network/i.test(m) ? 'No hay conexión. Prueba otra vez en un momento.' : m);
        }
        try { localStorage.setItem('ultimo-usuario-fam', f.usuario); } catch (_) {}
        box.innerHTML = `<main class="card stack sol-ok" aria-labelledby="ok-t"><span class="sol-ic">${ic('check')}</span>
          <h1 id="ok-t" class="st-h2">Solicitud enviada</h1>
          <p style="margin:0">La junta la revisará. Cuando la acepte, entra en “Familias” con tu usuario <b>${esc(f.usuario)}</b> y la contraseña que has elegido.</p>
          <button type="button" class="btn blue block" id="ok-v">Volver a la entrada</button></main>`;
        $('#ok-v').onclick = () => pantallaEntrada(); $('#ok-v').focus();
      };
    };
    pinta(); $('#sn').focus();
  }

  /* ---------- Familia: solo lo suyo (sus jugadores, la tienda y sus pedidos). Nada de plantillas ni datos internos ---------- */
  async function cargarFamilia(user) {
    const [yo, hijos, eqs, anu] = await Promise.all([
      sb.from('familias').select('id, nombre, usuario').eq('id', user.id).single().then(ok),
      sb.rpc('mis_jugadores').then(ok),
      sb.from('equipos').select('id, dias, hora, lugar, sesiones').then(ok),
      sb.from('entrenos_anulados').select('equipo, fecha').then(r => r.data || [])
    ]);
    S.live = true; S.role = 'family'; S.teams = {}; S.requests = []; S.notices = []; S.people = []; S.conv = {}; S.attend = {};
    S.me = { id: yo.id, nombre: yo.nombre, foto: null };
    S.anulados = new Set(anu.map(a => `${nombreEq(a.equipo)} ${a.fecha}`));
    const kids = hijos.map(h => ({ id: h.id, n: h.nombre, team: nombreEq(h.equipo) }));
    const train = {};
    for (const q of eqs) train[nombreEq(q.id)] = { dias: q.dias || [], h: q.hora || '', where: q.lugar || '', ses: Array.isArray(q.sesiones) ? q.sesiones : null };
    S.fam = Object.assign(S.fam || { cart: [], fotos: {} }, { kids, train,
      teams: [...new Set(kids.map(k => k.team))].sort((a, b) => ORDEN.indexOf(idEq(a)) - ORDEN.indexOf(idEq(b))) });
    await cargarTienda();
    AGENDA = [];
    return true;
  }
  /* Productos (sin fotos: van aparte y solo cuando cambian) y pedidos. Si la tienda aún no existe, se sigue sin ella */
  async function cargarTienda() {
    const [pr, pe] = await Promise.all([
      sb.from('productos').select('id, nombre, descripcion, precio, tallas, activo, orden, foto_hash').order('orden').order('id'),
      sb.from('pedidos').select('id, familia, jugador, equipo, lineas, total, nota, contacto, estado, creado').order('creado', { ascending: false })
    ]);
    S.shopOff = !!pr.error;
    S.products = (pr.data || []).map(x => ({ ...x, precio: +x.precio }));
    S.orders = (pe.data || []).map(x => ({ ...x, total: +x.total }));
  }
  window.cargarTienda = cargarTienda;

  /* ---------- Cargar los datos de la persona que entra ---------- */
  async function cargar() {
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return false;
    if (esFamilia(user)) return cargarFamilia(user);
    const yo = ok(await sb.from('perfiles').select('*').eq('id', user.id).single());
    const junta = yo.rol === 'junta';
    const asig = ok(await sb.from('entrenador_equipo').select('perfil, equipo'));
    const mios = junta ? D.equipos.map(e => e.id) : asig.filter(a => a.perfil === yo.id).map(a => a.equipo);
    const desde = new Date(); desde.setDate(desde.getDate() - 60);
    const [jug, asis, pet, avi, lei, gente] = await Promise.all([
      sb.from('jugadores').select('id, equipo, nombre, apellidos, dorsal').eq('activo', true).order('dorsal', { nullsFirst: false }),
      sb.from('asistencia').select('jugador, fecha').gte('fecha', ISO(desde)),
      sb.from('peticiones').select('id, equipo, tipo, titulo, lugar, urgente, estado, creada, con_foto, perfiles(nombre)').order('creada', { ascending: false })
        .then(r => r.error ? sb.from('peticiones').select('id, equipo, tipo, titulo, lugar, urgente, estado, creada, perfiles(nombre)').order('creada', { ascending: false }) : r),
      sb.from('avisos').select('*').order('creado', { ascending: false }).limit(50),
      sb.from('avisos_leidos').select('aviso, perfil'),
      junta ? sb.from('perfiles').select('id, usuario, nombre, rol, foto').order('nombre') : Promise.resolve({ data: [] })
    ].map(q => Promise.resolve(q).then(ok)));

    S.live = true;
    S.me = { id: yo.id, nombre: yo.nombre, foto: yo.foto || null };
    S.coach = yo.nombre;
    S.role = junta ? 'board' : 'coach';
    S.teams = {};
    const eqs = ok(await sb.from('equipos').select('*'));
    mios.sort((a, b) => ORDEN.indexOf(a) - ORDEN.indexOf(b));
    for (const id of mios) {
      const q = eqs.find(x => x.id === id) || {};
      S.teams[nombreEq(id)] = { cat: '', train: { dias: q.dias || [], h: q.hora || '', where: q.lugar || '', ses: Array.isArray(q.sesiones) ? q.sesiones : null }, players: [],
        dur: q.partes && q.minutos_parte ? { partes: q.partes, min: q.minutos_parte } : null, mod: q.modalidad === 7 || q.modalidad === 11 ? q.modalidad : null };
    }
    const equipoDe = {};
    for (const j of jug) {
      equipoDe[j.id] = nombreEq(j.equipo);
      const t = S.teams[equipoDe[j.id]];
      if (t) t.players.push({ id: j.id, n: `${j.nombre} ${j.apellidos}`.trim(), dorsal: j.dorsal });
    }
    /* Fotos de los jugadores (si la columna aún no existe, se sigue sin ellas) */
    const fot = await sb.from('jugadores').select('id, foto').eq('activo', true);
    S.fotosOff = !!fot.error;
    for (const j of fot.data || []) if (j.foto) { const t = S.teams[equipoDe[j.id]], x = t && t.players.find(y => y.id === j.id); if (x) x.foto = j.foto; }
    /* Entrenos anulados por la junta (si la tabla aún no existe, se sigue sin ellos) */
    const anu = await sb.from('entrenos_anulados').select('equipo, fecha');
    S.anulOff = !!anu.error; S.anulados = new Set((anu.data || []).map(a => `${nombreEq(a.equipo)} ${a.fecha}`));
    /* Convocatorias de la temporada (también las pasadas, para la ficha de cada partido) (si la tabla aún no existe, se sigue sin ellas) */
    S.conv = {};
    const conv = await sb.from('convocatorias').select('equipo, fecha, jugadores, hora, lugar, nota');
    for (const c of conv.data || []) S.conv[`${nombreEq(c.equipo)} ${c.fecha}`] = { ids: (c.jugadores || []).map(Number), hora: c.hora, lugar: c.lugar, nota: c.nota };
    /* Minutos y goles de la temporada (si la tabla aún no existe, se sigue sin ellos) */
    const est = { data: [] };
    for (let i = 0; ; i += 1000) {  /* el servidor da como mucho 1000 filas de cada vez */
      const r = await sb.from('estadisticas').select('jugador, fecha, minutos, goles').order('fecha').order('jugador').range(i, i + 999);
      if (r.error) { est.error = r.error; break; }
      est.data.push(...r.data); if (r.data.length < 1000) break;
    }
    S.statsOff = !!est.error; S.stats = {};
    /* Directos y actas de los partidos (si la tabla aún no existe, se sigue sin ellos) */
    const dir = await sb.from('partidos_directo').select('equipo, fecha, datos');
    S.directoOff = !!dir.error; S.actas = {};
    for (const x of dir.data || []) S.actas[`${nombreEq(x.equipo)} ${x.fecha}`] = x.datos;
    for (const x of est.data) (S.stats[x.jugador] = S.stats[x.jugador] || {})[x.fecha] = { m: x.minutos, g: x.goles };
    S.attend = {};
    for (const a of asis) {
      const k = `${equipoDe[a.jugador]} ${a.fecha}`;
      (S.attend[k] = S.attend[k] || new Set()).add(a.jugador);
    }
    S.requests = pet.map(r => ({ id: r.id, kind: r.tipo, title: r.titulo, where: r.lugar, team: r.equipo ? nombreEq(r.equipo) : '', by: (r.perfiles || {}).nombre || '', st: r.estado, when: cuando(r.creada), urgent: r.urgente, conFoto: !!r.con_foto }));
    S.people = gente.map(p => ({ ...p, equipos: asig.filter(a => a.perfil === p.id).map(a => a.equipo) }));
    const total = S.people.filter(p => p.rol === 'entrenador').length;
    S.notices = avi.map(n => ({ id: n.id, from: 'Junta directiva', title: n.titulo, body: n.texto,
      read: lei.some(l => l.aviso === n.id && l.perfil === yo.id), readBy: lei.filter(l => l.aviso === n.id).length, total }));
    if (!S.teams[S.team]) S.team = Object.keys(S.teams)[0] || null;
    /* Junta: familias (solicitudes y accesos), pedidos y productos de la tienda. Si aún no existen, se sigue sin ellos */
    if (junta) {
      const [fa, fj] = await Promise.all([
        sb.from('familias').select('id, usuario, nombre, telefono, hijos, estado, creada').order('creada', { ascending: false }),
        sb.from('familia_jugador').select('familia, jugador')
      ]);
      S.famOff = !!fa.error;
      S.fams = (fa.data || []).map(f => ({ ...f, jugadores: (fj.data || []).filter(x => x.familia === f.id).map(x => x.jugador) }));
      await cargarTienda();
    }
    AGENDA = buildAgenda();
    return true;
  }

  /* ---------- Notificaciones al móvil ---------- */
  /* Estados: 'on' activadas · 'off' se pueden activar · 'denied' bloqueadas en el móvil ·
     'ios' iPhone sin la app en la pantalla de inicio (allí no hay notificaciones) · 'no' el navegador no puede */
  const u8 = b64 => { const s = atob((b64 + '='.repeat((4 - b64.length % 4) % 4)).replace(/-/g, '+').replace(/_/g, '/')); return Uint8Array.from(s, c => c.charCodeAt(0)); };
  const suscripcion = async () => { const r = await navigator.serviceWorker.getRegistration(); return r && r.pushManager ? r.pushManager.getSubscription() : null; };
  window.Push = {
    async estado() {
      const ios = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      const app = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
      if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) return ios && !app ? 'ios' : 'no';
      if (Notification.permission === 'denied') return 'denied';
      try { return Notification.permission === 'granted' && await suscripcion() ? 'on' : 'off'; } catch (_) { return 'off'; }
    },
    async activar() {
      if (await Notification.requestPermission() !== 'granted') return Push.estado();
      const reg = await navigator.serviceWorker.ready;
      const { data, error } = await sb.functions.invoke('avisar', { body: { accion: 'clave' } });
      if (error || !data || !data.clave) throw new Error('sin clave');
      const sub = await suscripcion() || await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: u8(data.clave) });
      await Push.guardar(sub);
      return 'on';
    },
    async guardar(sub) {
      const j = sub.toJSON();
      ok(await sb.from('push_subs').upsert({ endpoint: j.endpoint, perfil: S.me.id, p256dh: j.keys.p256dh, auth: j.keys.auth }, { onConflict: 'endpoint' }));
    },
    /* Si este móvil ya las tenía activadas, al entrar se apuntan a quien inicia sesión sin volver a preguntar */
    async recuperar() {
      try { const sub = Notification.permission === 'granted' && await suscripcion(); if (sub) await Push.guardar(sub); } catch (_) {}
    }
  };
  /* La notificación llega o se toca con la app abierta: traer lo nuevo e ir a su pantalla */
  if ('serviceWorker' in navigator) navigator.serviceWorker.addEventListener('message', e => {
    const m = e.data || {};
    if (m.tab && S.live && typeof go === 'function') { S.tab = m.tab; }
    if (m.refrescar) refrescar(true);
  });

  /* Al cerrar sesión, este móvil deja de recibir las notificaciones de esa persona,
     pero el permiso se queda: al volver a entrar se activan solas */
  window.logout = async () => {
    try { const sub = await suscripcion(); if (sub) await sb.from('push_subs').delete().eq('endpoint', sub.endpoint); } catch (_) {}
    await sb.auth.signOut(); location.reload();
  };

  async function entrar() {
    try {
      if (!(await cargar())) return pantallaEntrada();
    } catch (_) {
      return pantallaEntrada('No se han podido cargar los datos. Revisa la conexión y vuelve a entrar.');
    }
    window.splashOff && splashOff();
    document.body.classList.remove('sin-sesion');
    if ($('#login')) $('#login').remove();
    if (S.role === 'coach' && !S.team) {
      $('#main').innerHTML = `<section class="card stack"><h1 style="margin:0">Hola, ${esc(S.me.nombre.split(' ')[0])}</h1>
        <p style="margin:0">Todavía no tienes ningún equipo asignado. Pide a la junta que te asigne el tuyo y vuelve a entrar.</p></section>`;
      return;
    }
    /* Al abrir desde una notificación, ir directamente a su pantalla */
    const pide = new URLSearchParams(location.search).get('tab');
    S.tab = (S.role === 'family' ? ['home', 'team', 'shop', 'games'] : ['home', 'team', 'ask', 'games', 'msg']).includes(pide) ? pide : 'home'; S.sub = null;
    if (pide) history.replaceState(null, '', location.pathname);
    if (S.role === 'family') { S.push = 'no'; render(); return; }
    S.push = await Push.estado();
    if (S.push === 'on') await Push.recuperar();
    render();
  }

  /* Traer lo último (peticiones nuevas, avisos, estados) sin tener que cerrar sesión:
     al volver a la app y en cuanto algo cambie (se mira cada 10 segundos). No se repinta si la persona
     está escribiendo, rellenando una petición o con una ventana abierta, ni si nada ha cambiado. */
  let refrescando = false;
  async function refrescar(forzar) {
    if (refrescando || (!forzar && document.visibilityState !== 'visible') || !S.live) return false;
    const ocupado = () => S.tab === 'team' || (S.tab === 'ask' && S.askView !== 'mine' && S.draft && S.draft.step > 1) || $('.modal') || ($('#me-menu') && !$('#me-menu').hidden) || document.activeElement.matches('input, textarea, select');
    if (ocupado()) return false;
    refrescando = true;
    try {
      const antes = JSON.stringify([S.requests, S.notices, S.conv, S.fams, S.orders, S.products]);
      const tab = S.tab, sub = S.sub, team = S.team, y = scrollY;
      if (await cargar() && !ocupado() && (forzar === true || JSON.stringify([S.requests, S.notices, S.conv, S.fams, S.orders, S.products]) !== antes)) {
        S.tab = tab; S.sub = sub; if (S.teams[team]) S.team = team;
        render(); scrollTo(0, y);
      }
      return true;
    } catch (_) { return false; } finally { refrescando = false; }
  }
  document.addEventListener('visibilitychange', () => refrescar());
  window.addEventListener('focus', () => refrescar());
  window.addEventListener('online', () => refrescar());
  /* Cada 10 segundos, una comprobación muy ligera (solo números de peticiones, estados y avisos);
     si algo ha cambiado, se trae todo */
  let huella = '';
  setInterval(async () => {
    /* Las familias no hacen esta comprobación: así el servidor aguanta a cientos de familias */
    if (document.visibilityState !== 'visible' || !S.live || S.role === 'family') return;
    try {
      const [p, a, l] = await Promise.all([sb.from('peticiones').select('id, estado'), sb.from('avisos').select('id'), sb.from('avisos_leidos').select('aviso, perfil')].map(q => Promise.resolve(q).then(ok)));
      /* La junta, además, solicitudes de familias y pedidos (si aún no existen, no cuentan) */
      const [fa, pe] = S.role === 'board' ? await Promise.all([sb.from('familias').select('id, estado'), sb.from('pedidos').select('id, estado')]) : [{}, {}];
      const h = JSON.stringify([p.map(x => x.id + ':' + x.estado).sort(), a.map(x => x.id).sort(), l.length,
        (fa.data || []).map(x => x.id + ':' + x.estado).sort(), (pe.data || []).map(x => x.id + ':' + x.estado).sort()]);
      /* Si ahora no se puede repintar (está escribiendo, etc.), se reintenta en la siguiente vuelta */
      if (h === huella || await refrescar()) huella = h;
    } catch (_) {}
  }, 10000);
  window.refrescar = refrescar;

  window.startServer = async () => {
    document.body.classList.add('sin-sesion');
    const { data: { session } } = await sb.auth.getSession();
    session ? entrar() : pantallaEntrada();
  };
})();
