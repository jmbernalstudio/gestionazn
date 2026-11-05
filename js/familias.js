/* Zona de familias (padres y madres de los jugadores) y tienda del club.
   · Las familias ven partidos, calendario, resultados y clasificaciones de todos los equipos, y hacen pedidos en la tienda.
     No ven plantillas, asistencia, minutos, estadísticas ni nada interno (el servidor tampoco se lo da).
   · La junta, en su Bandeja, acepta a las familias, gestiona los productos y los pedidos y los exporta a Excel. */
(function () {
  /* Iconos que solo usa esta parte */
  I.phone = '<path d="M6.5 3.5h3l1.5 4-2 1.5a11 11 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2 2A16.5 16.5 0 0 1 4.5 5.5a2 2 0 0 1 2-2z"/>';
  I.download = '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>';
  const euro = n => `${(+n || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
  const ESTADOS_PED = ['Recibido', 'Pedido al proveedor', 'Listo para recoger', 'Entregado'];
  const pedCls = st => ['blue', 'gold', '', 'grey'][st] || 'grey';
  const teamOrder = (a, b) => ORDEN.indexOf((EQ[a] || {}).id) - ORDEN.indexOf((EQ[b] || {}).id);
  const allTeams = () => D.equipos.slice().sort((a, b) => ORDEN.indexOf(a.id) - ORDEN.indexOf(b.id));
  const F = () => S.fam || { kids: [], teams: [], train: {}, cart: [], fotos: {} };
  /* Packs: "componentes" es una lista de huecos con los productos que se pueden elegir en cada uno */
  const esPack = p => !!(p && p.componentes && p.componentes.length);
  const prodId = id => (S.products || []).find(x => x.id === +id);
  const slotNombre = (sl, fam) => sl.map(id => prodId(id) ? (fam ? prodId(id).nombre : nomMod(prodId(id))) : 'Prenda que ya no existe').join(' o ');
  /* Para las familias solo el nombre del producto: el modelo es para el proveedor.
     Si dos opciones se llaman igual, se añade el modelo (o el color) para poder distinguirlas */
  const nomFam = (o, ops) => ops.filter(x => x.nombre === o.nombre).length > 1 ? `${o.nombre} ${o.modelo || o.color || ''}`.trim() : o.nombre;
  const nomMod = p => p.nombre + (p.modelo && !p.nombre.toLowerCase().includes(p.modelo.toLowerCase()) ? ' ' + p.modelo : '');
  const modTxt = p => p ? [p.modelo && 'Modelo ' + p.modelo, p.color].filter(Boolean).join(' · ') : '';
  const piezasTxt = l => (l.piezas || []).map(z => `${z.nombre}${z.color ? ' · ' + z.color : ''}${z.talla ? ' · talla ' + z.talla : ''}`).join('\n');
  /* Colores: si un producto viene en varios, la familia elige uno */
  const colorOpts = pr => `<option value="">Elige</option>${(pr.colores || []).map(c => `<option>${esc(c)}</option>`).join('')}`;
  const elegirTxt = p => esPack(p) ? 'Elegir tallas' : (p.colores || []).length ? (p.tallas.length ? 'Elegir color y talla' : 'Elegir color') : 'Elegir talla';
  const fecha = iso => { const d = new Date(iso); return `${d.getDate()} ${MES[d.getMonth()]} · ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`; };
  /* Tabla de goleadores oficial de la Federación Andaluza (competición y grupo de cada equipo de la RFAF) */
  const GOLEADORES = { senior: [48466186, 48466191], juvenil: [48466231, 48466242], infantil: [48466271, 48466273], alevin2: [48466388, 48466390],
    benjamin2: [48466406, 48466408], benjamin1: [48466406, 48466416], internacional: [48466530, 49641343] };
  const golUrl = id => GOLEADORES[id] ? `https://www.rfaf.es/pnfg/NPcd/NFG_CMP_Goleadores?cod_primaria=1000120&codcompeticion=${GOLEADORES[id][0]}&codgrupo=${GOLEADORES[id][1]}` : null;

  /* ---------- Entrenamientos de los equipos de la familia ---------- */
  const fTrain = team => { const t = F().train[team]; return t && t.dias.length ? t : null; };
  const fTrainAt = (team, iso) => { const t = fTrain(team); if (!t || !t.dias.includes(dow(iso)) || anulado(team, iso)) return null; return sesiones(t).find(x => x.d === dow(iso)) || { d: dow(iso), h: t.h, where: t.where }; };
  const trainTxt = t => { const ses = sesiones(t); if (!ses.length) return 'Sin días de entrenamiento todavía';
    const same = ses.every(x => x.h === ses[0].h && x.where === ses[0].where);
    return same ? `${ses.map(x => DIAS_L[x.d - 1]).join(' y ').replace(/s$/, 's')}${ses[0].h ? ' · ' + ses[0].h : ''}${ses[0].where ? ' · ' + ses[0].where : ''}`
      : ses.map(x => `${DIAS[x.d - 1]} ${x.h || ''}${x.where ? ' (' + x.where + ')' : ''}`.trim()).join(' · '); };
  function fAgenda() {
    const ev = [];
    for (const team of F().teams) WEEK.forEach((iso, i) => { const t = fTrainAt(team, iso); if (t) ev.push({ iso, day: i === 0 ? 'Hoy' : dayLbl(iso), h: t.h || '--:--', kind: 'train', team, where: t.where || '' }); });
    for (const e of D.equipos) if (F().teams.includes(e.nombre)) for (const p of e.partidos)
      if (!p.descansa && !p.nojuega && p.fecha >= WEEK[0] && p.fecha <= WEEK[6]) ev.push({ iso: p.fecha, day: p.fecha === TODAY ? 'Hoy' : dayLbl(p.fecha), h: p.hora || '--:--', kind: 'match', team: e.nombre, p, e });
    return ev.sort((a, b) => (a.iso + a.h).localeCompare(b.iso + b.h));
  }

  /* ---------- Fotos de los productos: se guardan en el móvil y solo se descargan si cambian ---------- */
  const fotoKey = h => 'pf-' + h;
  function fotoDe(p) {
    if (!p.foto_hash) return null;
    const c = F().fotos || {}; if (c[p.foto_hash] !== undefined) return c[p.foto_hash];
    try { const v = localStorage.getItem(fotoKey(p.foto_hash)); if (v) return (c[p.foto_hash] = v); } catch (_) {}
    return undefined;
  }
  /* Fotos de cada color: { Azul: foto, Negro: foto }. undefined = aún no descargadas */
  const fcKey = h => 'pfc-' + h;
  function fotosColorDe(p) {
    if (!p || !p.fotos_color_hash) return {};
    const c = F().fotosC || {}; if (c[p.fotos_color_hash] !== undefined) return c[p.fotos_color_hash];
    try { const v = localStorage.getItem(fcKey(p.fotos_color_hash)); if (v) return (c[p.fotos_color_hash] = JSON.parse(v)); } catch (_) {}
    return undefined;
  }
  /* Foto de la tarjeta: la del producto o, si no tiene, la del primer color que tenga foto */
  const fotoPrincipal = p => { const f = fotoDe(p); if (f) return f; const fc = fotosColorDe(p) || {}; const c = (p.colores || []).find(c => fc[c]); return c ? fc[c] : f; };
  let pidiendo = false, pidiendoC = null;
  async function traerFotos() {
    traerFotosColor();
    const faltan = (S.products || []).filter(p => p.foto_hash && fotoDe(p) === undefined);
    if (!faltan.length || pidiendo || !API()) return;
    pidiendo = true;
    try {
      const filas = await API().fotosProductos(faltan.map(p => p.id));
      S.fam = S.fam || { kids: [], teams: [], train: {}, cart: [], fotos: {} }; S.fam.fotos = S.fam.fotos || {};
      for (const r of filas) {
        S.fam.fotos[r.foto_hash] = r.foto || null;
        if (r.foto) try { localStorage.setItem(fotoKey(r.foto_hash), r.foto); } catch (_) {}
        document.querySelectorAll(`[data-pf="${r.id}"]`).forEach(el => { if (r.foto) el.innerHTML = `<img src="${r.foto}" alt="">`; });
      }
    } catch (_) {} finally { pidiendo = false; }
  }
  function traerFotosColor() {
    const faltan = (S.products || []).filter(p => p.fotos_color_hash && fotosColorDe(p) === undefined);
    if (!faltan.length || !API() || !API().fotosColor) return Promise.resolve();
    if (pidiendoC) return pidiendoC;
    return (pidiendoC = (async () => {
      try {
        const filas = await API().fotosColor(faltan.map(p => p.id));
        S.fam = S.fam || { kids: [], teams: [], train: {}, cart: [], fotos: {} }; S.fam.fotosC = S.fam.fotosC || {};
        for (const r of filas) {
          if (!r.fotos_color_hash) continue;
          S.fam.fotosC[r.fotos_color_hash] = r.fotos_color || {};
          try { localStorage.setItem(fcKey(r.fotos_color_hash), JSON.stringify(r.fotos_color || {})); } catch (_) {}
          const p = prodId(r.id), f = p && fotoPrincipal(p);
          if (f) document.querySelectorAll(`[data-pf="${r.id}"]`).forEach(el => { if (!el.querySelector('img')) el.innerHTML = `<img src="${f}" alt="">`; });
        }
      } catch (_) {} finally { pidiendoC = null; }
    })());
  }
  const prFoto = (p, cls = 'pr-f') => { const f = fotoPrincipal(p); return `<span class="${cls}" data-pf="${p.id}" aria-hidden="true">${f ? `<img src="${f}" alt="">` : ic('box')}</span>`; };

  /* ---------- FAMILIA ---------- */
  function nextCard(team, i) {
    const e = EQ[team], nm = e && nextMatch(e);
    const away = nm && !nm.casa && nm.campo;
    return `<section class="card match" aria-labelledby="h-fm${i}"><div class="card-h"><h2 id="h-fm${i}">Próximo partido</h2>${nm ? `<span class="tag gold">${dateLbl(nm.fecha)}</span>` : ''}</div>
      <p class="fm-team"><span class="pill gold">${esc(team)}</span></p>${scoreHTML(team)}
      ${nm ? `<div class="match-btns"><button type="button" class="btn white" data-match="${e.id}|${nm.j}">${ic('list')} Ver partido</button>${away ? `<a class="btn gold" target="_blank" rel="noopener" href="${esc(mapsUrl(nm))}">${ic('pin')} Cómo llegar</a>` : ''}</div>` : ''}</section>`;
  }
  function myTeamsCard() {
    return card('h-ft', F().teams.length > 1 ? 'Tus equipos' : 'Tu equipo', F().teams.map(team => {
      const e = EQ[team], r = e && ourRow(e), l = e && lastMatch(e), res = l ? outcome(l) : null, t = fTrain(team);
      return `<button type="button" class="tm tm-btn" data-fteam="${esc(team)}"><span class="k">${r ? r.pos + 'º' : '–'}</span><div class="grow"><b>${esc(team)}</b>
        <small>${r ? r.pts + (r.pts === 1 ? ' punto · ' : ' puntos · ') : ''}${t ? 'Entrena ' + esc(trainTxt(t)) : esc(e ? e.cat : '')}</small></div>${l ? `<span class="res ${res}" title="Último: ${esc(nice(l.rival))}">${scoreTxt(l)}</span>` : ''}</button>`;
    }).join(''), 'f-teams');
  }
  const FAMILY = {
    opts: optsScreen,
    home() {
      const f = F(), ag = fAgenda(), mt = new Set(ag.filter(x => x.kind === 'match').map(x => x.iso));
      if (!f.kids.length) return { kicker: `${greet()},`, title: esc(myName()), body: emptyPage('team', 'Todavía no tienes jugadores asignados', 'Habla con la junta para que te asigne a tu hijo o hija.') };
      return {
        kicker: `${greet()},`, title: esc(myName()),
        body: `<div class="days" aria-label="Esta semana">${MONWEEK.map(iso => { const [w, n] = dayLbl(iso).split(' '); const tr = f.teams.some(tm => fTrainAt(tm, iso)), m = f.teams.some(tm => (EQ[tm] ? EQ[tm].partidos : []).some(p => p.fecha === iso && !p.descansa && !p.nojuega));
            return `<span class="${iso === TODAY ? 'today' : ''}" aria-label="${dateLbl(iso)}${tr ? ', entrenamiento' : ''}${m ? ', partido' : ''}">${w}<b>${n}</b><i class="dots" aria-hidden="true">${tr ? '<i class="dt"></i>' : ''}${m ? '<i class="dm"></i>' : ''}</i></span>`; }).join('')}</div>
          <p class="days-key" aria-hidden="true"><span><i class="dt"></i>Entrenamiento</span><span><i class="dm"></i>Partido</span></p>
          <div class="fam-home"><div class="fh-main"><div class="fh-matches">${f.teams.map(nextCard).join('')}</div>
            ${card('h-fag', 'Próximos 7 días', ag.length ? ag.map(x => agendaRow(x, false)).join('') : '<p class="muted" style="margin:0">No hay entrenamientos ni partidos en los próximos 7 días.</p>', 'f-agenda')}</div>
            <div class="fh-side">${myTeamsCard()}
            <section class="hero f-shop" aria-labelledby="h-fsh"><span class="kick">Tienda del club</span><h2 id="h-fsh">Packs y ropa de entrenamiento</h2>
              <p>Haz tu pedido desde aquí. Se paga en efectivo en el club.</p><div class="btns"><button type="button" class="btn gold" data-go="shop">${ic('box')} Ir a la tienda</button></div></section></div>
          </div>`,
        bind() { document.querySelectorAll('[data-fteam]').forEach(b => b.onclick = () => { S.fteam = b.dataset.fteam; go('team'); }); }
      };
    },
    games: gamesScreen,
    team() {
      const teams = allTeams(), team = S.fteam && EQ[S.fteam] ? S.fteam : F().teams[0] || teams[0].nombre, e = EQ[team];
      const v = ['games', 'group', 'table'].includes(S.fview) ? S.fview : 'games', gol = golUrl(e.id);
      const mine = F().teams.includes(team);
      let body;
      if (v === 'group') body = groupView(e);
      /* Solo Partidos, Jornada y Clasificación. El botón de goleadores va con la clasificación */
      else if (v === 'table') body = card('h-ftb', 'Clasificación', tableHTML(e) + (gol ? `<a class="btn blue block f-gol" target="_blank" rel="noopener" href="${gol}">${ic('ball')} Ver goleadores (RFAF)</a>` : ''));
      else body = card('h-fgm', `Temporada · ${e.partidos.length} jornadas`, [...e.partidos].sort(byDate).map(p => matchRow(e, p)).join(''));
      return {
        kicker: `Equipos${mine ? ' · Tu equipo' : ''}`, title: esc(team),
        body: `<div class="stack"><div class="dd f-tsel"><button type="button" class="dd-b" id="ft-b" aria-haspopup="listbox" aria-expanded="false" aria-label="Equipo: ${esc(team)}. Toca para cambiarlo">${esc(team)}</button>
            <ul class="dd-l" id="ft-l" role="listbox" aria-label="Elige equipo" hidden>${teams.map(x => `<li><button type="button" role="option" data-ft="${esc(x.nombre)}" aria-selected="${x.nombre === team}"><span>${esc(x.nombre)}${F().teams.includes(x.nombre) ? ' <small class="ft-mine">· Tu equipo</small>' : ''}</span>${x.nombre === team ? ic('check') : ''}</button></li>`).join('')}</ul></div>
          <div class="tabs" role="group" aria-label="Qué ver">${[['games', 'Partidos'], ['group', 'Jornada'], ['table', 'Clasificación']].map(([k, l]) => `<button type="button" data-fv="${k}" aria-pressed="${v === k}">${l}</button>`).join('')}</div>
          ${body}</div>`,
        bind() {
          /* Selector de equipo: se abre al tocarlo y se cierra al elegir, al tocar fuera o con Escape */
          const fb = $('#ft-b'), fl = $('#ft-l');
          const shut = () => { fl.hidden = true; fb.setAttribute('aria-expanded', 'false'); document.removeEventListener('pointerdown', out, true); };
          const out = ev => { if (!ev.target.closest('.f-tsel')) shut(); };
          fb.onclick = () => { if (!fl.hidden) return shut();
            fl.hidden = false; fb.setAttribute('aria-expanded', 'true'); document.addEventListener('pointerdown', out, true);
            (fl.querySelector('[aria-selected="true"]') || fl.querySelector('button')).focus({ preventScroll: true }); };
          fl.onkeydown = ev => { if (ev.key === 'Escape') { ev.stopPropagation(); shut(); fb.focus(); } };
          fl.querySelectorAll('[data-ft]').forEach(b => b.onclick = () => { shut(); if (b.dataset.ft !== team) { S.fteam = b.dataset.ft; S.gj = null; render(); } });
          document.querySelectorAll('[data-fv]').forEach(b => b.onclick = () => { S.fview = b.dataset.fv; render(); });
          document.querySelectorAll('[data-gj]').forEach(b => b.onclick = () => { if (b.dataset.gj) { S.gj = +b.dataset.gj; render(); } });
        }
      };
    },
    shop() {
      const f = F(), mine = S.orders || [];
      if (S.shopOff) return { kicker: 'Club', title: 'Tienda', body: emptyPage('box', 'La tienda abrirá muy pronto', 'La junta está preparando los productos.') };
      /* Apartados de la tienda, siempre a la vista arriba: lo obligatorio, cada categoría y mis pedidos */
      const tabs = shopTabs(), view = tabs.some(t => t.k === S.shopView) ? S.shopView : tabs[0].k, tab = tabs.find(t => t.k === view);
      const nav = `<nav class="sh-tabs" aria-label="Apartados de la tienda">${tabs.map(t => `<button type="button" data-shv="${esc(t.k)}" ${t.k === view ? 'aria-current="page"' : ''}>${ic(t.ic)}<span>${esc(t.label)}</span></button>`).join('')}</nav>`;
      if (view === 'mine') return {
        kicker: 'Tienda', title: 'Mis pedidos',
        body: `<div class="stack">${nav}${mine.length ? `<div class="cards-grid">${mine.map(o => orderCard(o, false)).join('')}</div>`
          : emptyPage('box', 'Aún no has hecho ningún pedido', 'Cuando hagas uno, aquí verás cómo va.', '', `<button type="button" class="btn blue" data-shv="${esc(tabs[0].k)}">${ic('box')} Ir a la tienda</button>`)}</div>`,
        bind() { bindShopSeg(); bindOrders(false); }
      };
      const cart = f.cart || [], n = cart.reduce((a, l) => a + l.cantidad, 0), tot = cart.reduce((a, l) => a + l.cantidad * l.precio, 0);
      return {
        kicker: 'Tienda', title: esc(tab.title),
        body: `<div class="stack">${nav}
          ${tab.hint ? `<p class="sh-hint">${esc(tab.hint)}</p>` : ''}
          ${tab.prods.length ? `<div class="pr-grid">${tab.prods.map(prodCard).join('')}</div>` : emptyPage('box', 'Todavía no hay productos', 'La junta está preparando la tienda. Vuelve pronto.')}
          <p class="card pay-note">${ic('check')}<span>Haz el pedido aquí y <b>págalo en efectivo en el club</b>. La junta te avisará cuando esté listo para recoger.</span></p>
          ${n ? `<div class="cart-bar" role="region" aria-label="Tu pedido"><div class="grow"><b>${n === 1 ? '1 producto' : n + ' productos'}</b><small>${euro(tot)} · pago en efectivo</small></div>
            <button type="button" class="btn gold" id="cart-go">${ic('box')} Ver pedido</button></div>` : ''}</div>`,
        bind() {
          bindShopSeg(); traerFotos();
          document.querySelectorAll('[data-open]').forEach(b => b.onclick = () => prodModal(S.products.find(x => x.id == b.dataset.open)));
          if ($('#cart-go')) $('#cart-go').onclick = cartModal;
        }
      };
    }
  };
  /* Pestañas de la tienda. Lo obligatorio va solo en su apartado; el resto, por categorías en el orden en que la junta ordena los productos */
  function shopTabs() {
    const prods = (S.products || []).filter(p => p.activo), oblig = prods.filter(p => p.obligatorio), resto = prods.filter(p => !p.obligatorio);
    const tabs = [];
    if (oblig.length) tabs.push({ k: 'obl', ic: 'check', label: 'Obligatorio', title: 'Lo obligatorio', hint: 'Lo que el club pide a cada jugador. Empieza por aquí.', prods: oblig });
    const cats = [...new Set(resto.map(p => p.categoria))], conCat = cats.some(c => c);
    cats.sort((x, y) => (x ? 0 : 1) - (y ? 0 : 1)).forEach(c => {
      const label = c || (conCat ? 'Otros' : oblig.length ? 'Más productos' : 'Productos');
      tabs.push({ k: 'c:' + c, ic: 'box', label, title: label, hint: oblig.length && !conCat ? 'No es obligatorio. Por si quieres algo más.' : '', prods: resto.filter(p => p.categoria === c) });
    });
    if (!tabs.length) tabs.push({ k: 'c:', ic: 'box', label: 'Productos', title: 'Tienda', prods: [] });
    const nm = (S.orders || []).length;
    tabs.push({ k: 'mine', ic: 'list', label: 'Mis pedidos' + (nm ? ' · ' + nm : ''), title: 'Mis pedidos' });
    return tabs;
  }
  function bindShopSeg() { document.querySelectorAll('[data-shv]').forEach(b => b.onclick = () => { S.shopView = b.dataset.shv; render(); }); }
  const tallaOpts = pr => pr && pr.tallas.length ? `<option value="">Elige</option>${pr.tallas.map(t => `<option>${esc(t)}</option>`).join('')}` : '<option value="">Talla única</option>';
  /* Prendas de un pack: talla de cada una, y modelo si el hueco tiene más de uno */
  function packCampos(p) {
    return `<div class="pk-l" role="group" aria-label="Prendas del pack">${p.componentes.map((sl, i) => {
      const ops = sl.map(prodId).filter(Boolean), id = `${p.id}-${i}`;
      if (!ops.length) return `<p class="muted pk-s">Una prenda de este pack ya no está disponible.</p>`;
      if (ops.length === 1 && ops[0].colores.length) return `<div class="pk-s"><b>${esc(ops[0].nombre)}</b><div class="pk-f">
        <label class="f" for="pc${id}">Color<select id="pc${id}">${colorOpts(ops[0])}</select></label>
        ${ops[0].tallas.length ? `<label class="f" for="pt${id}">Talla<select id="pt${id}" data-pt="${p.id}" data-i="${i}" data-pz="${ops[0].id}">${tallaOpts(ops[0])}</select></label>` : '<small class="muted">Talla única</small>'}</div></div>`;
      if (ops.length === 1) return `<div class="pk-s"><b>${esc(ops[0].nombre)}</b>${ops[0].tallas.length ? `<label class="f" for="pt${id}"><span class="sr">Talla de ${esc(ops[0].nombre)}</span><select id="pt${id}" data-pt="${p.id}" data-i="${i}" data-pz="${ops[0].id}">${tallaOpts(ops[0])}</select></label>` : '<small class="muted">Talla única</small>'}</div>`;
      return `<div class="pk-s"><b>${esc(ops.map(o => nomFam(o, ops)).join(' o '))}</b><div class="pk-f">
        <label class="f" for="pm${id}">Modelo<select id="pm${id}" data-pm="${id}"><option value="">Elige</option>${ops.map(o => `<option value="${o.id}">${esc(nomFam(o, ops))}</option>`).join('')}</select></label>
        <label class="f" for="pc${id}" id="pcw${id}" hidden>Color<select id="pc${id}"></select></label>
        <label class="f" for="pt${id}">Talla<select id="pt${id}" data-pt="${p.id}" data-i="${i}" disabled><option value="">Elige antes el modelo</option></select></label></div></div>`;
    }).join('')}</div>`;
  }
  /* Tarjeta de la tienda: foto, nombre y precio. Al tocarla se abre la ficha para elegir tallas */
  function prodCard(p) {
    const yaN = (F().cart || []).filter(l => l.producto === p.id).reduce((a, l) => a + l.cantidad, 0);
    return `<button type="button" class="card pr pr-pick" data-open="${p.id}" aria-label="${esc(p.nombre)}, ${euro(p.precio)}.${yaN ? ` Ya tienes ${yaN} en tu pedido.` : ''} ${elegirTxt(p)}">${yaN ? `<span class="pill green pr-ya">${ic('check')} En tu pedido${yaN > 1 ? ' · ' + yaN : ''}</span>` : ''}${prFoto(p)}
      <span class="pr-b"><b class="pr-n">${esc(p.nombre)}</b>${esPack(p) ? `<span class="pr-m">${esc(p.componentes.map(sl => slotNombre(sl, true)).join(' + '))}</span>` : ''}<b class="pr-p">${euro(p.precio)}</b></span>
      <span class="btn blue block">${ic('plus')} ${elegirTxt(p)}</span></button>`;
  }
  /* Ficha del producto (pantalla completa): tallas, modelo si hay que elegirlo y cantidad */
  function prodModal(p) {
    const pk = esPack(p), roto = pk && p.componentes.some(sl => !sl.some(prodId));
    const m = modal(`<h2 id="mdl-t">${esc(p.nombre)}</h2>
      <div class="pr-d">${prFoto(p)}<div class="pr-b">${p.descripcion ? `<p>${esc(p.descripcion)}</p>` : ''}<b class="pr-p">${euro(p.precio)}</b></div></div>
      ${pk ? packCampos(p) : ''}
      <div class="pr-c">${!pk && p.colores.length ? `<label class="f" for="c${p.id}">Color<select id="c${p.id}">${colorOpts(p)}</select></label>` : ''}${!pk && p.tallas.length ? `<label class="f" for="t${p.id}">Talla<select id="t${p.id}"><option value="">Elige</option>${p.tallas.map(t => `<option>${esc(t)}</option>`).join('')}</select></label>` : ''}
        <div class="f"><span id="ql${p.id}">Cantidad</span><div class="qty" role="group" aria-labelledby="ql${p.id}"><button type="button" class="iconbtn" data-qty="${p.id}" data-d="-1" aria-label="Uno menos">${ic('minus')}</button>
          <output id="qv${p.id}" aria-live="polite">1</output><input type="hidden" id="q${p.id}" value="1"><button type="button" class="iconbtn" data-qty="${p.id}" data-d="1" aria-label="Uno más">${ic('plus')}</button></div></div></div>
      <p class="err" id="te${p.id}" role="alert" hidden>Elige la talla.</p>
      <button type="button" class="btn blue block" data-add="${p.id}" ${roto ? 'disabled' : ''}>${ic('plus')} Añadir al pedido</button>`, 'dialog', () => render());
    m.el.classList.add('rqd', 'pr-mdl');
    traerFotos();
          /* Al elegir el color, sale la foto de ese color (si la junta la ha puesto) */
          if ($('#c' + p.id)) $('#c' + p.id).onchange = async () => {
            const sel = $('#c' + p.id), c = sel.value;
            if (fotosColorDe(p) === undefined) await traerFotosColor();
            if (sel.value !== c) return;
            /* Si ese color no tiene foto, la general del producto (nunca la de otro color) */
            const f = c ? (fotosColorDe(p) || {})[c] || fotoDe(p) : fotoPrincipal(p), box = m.el.querySelector('.pr-d [data-pf]');
            if (box) box.innerHTML = f ? `<img src="${f}" alt="">` : ic('box');
          };
          document.querySelectorAll('[data-qty]').forEach(b => b.onclick = () => { const i = $('#q' + b.dataset.qty), v = Math.min(20, Math.max(1, +i.value + +b.dataset.d)); i.value = v; $('#qv' + b.dataset.qty).textContent = v; });
          /* Pack: al elegir el modelo, salen las tallas de ese modelo */
          document.querySelectorAll('[data-pm]').forEach(s => s.onchange = () => {
            const t = $('#pt' + s.dataset.pm), pr = prodId(s.value);
            t.dataset.pz = pr ? pr.id : ''; t.innerHTML = pr ? tallaOpts(pr) : '<option value="">Elige antes el modelo</option>'; t.disabled = !pr || !pr.tallas.length;
            const cw = $('#pcw' + s.dataset.pm), cs = $('#pc' + s.dataset.pm), conC = !!(pr && pr.colores.length);
            cw.hidden = !conC; cs.innerHTML = conC ? colorOpts(pr) : '';
            s.closest('.pk-f').classList.toggle('tres', conC);
          });
          document.querySelectorAll('[data-add]').forEach(b => b.onclick = () => {
            const p = S.products.find(x => x.id == b.dataset.add), sel = $('#t' + p.id), cantidad = +$('#q' + p.id).value, e = $('#te' + p.id);
            const fallo = (t, el) => { e.textContent = t; e.hidden = false; if (el) el.focus(); };
            let talla = '', color = '', piezas = null;
            if (esPack(p)) {
              piezas = [];
              for (let i = 0; i < p.componentes.length; i++) {
                const ops = p.componentes[i].map(prodId).filter(Boolean), m = $(`#pm${p.id}-${i}`), t = $(`#pt${p.id}-${i}`);
                const pr = ops.length === 1 ? ops[0] : prodId(m && m.value);
                if (!pr) return fallo(`Elige el modelo de ${ops.map(o => o.nombre).join(' o ')}.`, m);
                const c = $(`#pc${p.id}-${i}`);
                if (pr.colores.length && !(c && c.value)) return fallo(`Elige el color de ${pr.nombre}.`, c);
                if (pr.tallas.length && !(t && t.value)) return fallo(`Elige la talla de ${pr.nombre}.`, t);
                piezas.push({ producto: pr.id, nombre: pr.nombre, talla: pr.tallas.length ? t.value : '', ...(pr.colores.length ? { color: c.value } : {}) });
              }
            } else {
              const cs = $('#c' + p.id);
              color = cs ? cs.value : '';
              if (cs && !color) return fallo('Elige el color.', cs);
              talla = sel ? sel.value : '';
              if (sel && !talla) return fallo('Elige la talla.', sel);
            }
            e.hidden = true;
            S.fam.cart = S.fam.cart || [];
            const k = JSON.stringify(piezas), l = S.fam.cart.find(x => x.producto === p.id && x.talla === talla && (x.color || '') === color && JSON.stringify(x.piezas || null) === k);
            if (l) l.cantidad = Math.min(20, l.cantidad + cantidad); else S.fam.cart.push({ producto: p.id, nombre: p.nombre, talla, ...(color ? { color } : {}), cantidad, precio: p.precio, ...(piezas ? { piezas } : {}) });
            m.close(false); say(`Añadido: ${p.nombre}${color || talla ? ' (' + [color, talla && 'talla ' + talla].filter(Boolean).join(', ') + ')' : ''}`);
            if (esPack(p)) sugerir(p);
          });
  }
  /* Después de añadir un pack: ¿quieres alguna prenda más? Se ofrecen sus prendas que también se venden sueltas */
  function sugerir(p) {
    const ids = [...new Set(p.componentes.flat())], sug = ids.map(prodId).filter(x => x && x.activo && !esPack(x));
    if (!sug.length) return;
    const m = modal(`<h2 id="mdl-t">¿Quieres alguna prenda más?</h2>
      <p class="card pay-note">${ic('check')}<span><b>${esc(p.nombre)}</b> ya está en tu pedido. Si además quieres alguna prenda suelta (por ejemplo, otras medias), elígela aquí.</span></p>
      <div class="pr-grid">${sug.map(prodCard).join('')}</div>
      <button type="button" class="btn ghost block" data-v="0">No, gracias</button>`, 'dialog', () => render());
    m.el.classList.add('rqd', 'pr-mdl');
    traerFotos();
    m.el.querySelectorAll('[data-open]').forEach(b => b.onclick = () => { const x = prodId(b.dataset.open); m.close(false); prodModal(x); });
  }
  function cartModal() {
    const f = F(), kids = f.kids;
    const draw = () => {
      const cart = f.cart, tot = cart.reduce((a, l) => a + l.cantidad * l.precio, 0);
      return `<div class="rqd-h"><div class="grow"><h2 id="mdl-t" class="st-h2">Tu pedido</h2><small>Se paga en efectivo en el club</small></div><button type="button" class="iconbtn" data-v="0" aria-label="Cerrar">${ic('x')}</button></div>
        <div class="cart">${cart.map((l, i) => `<div class="cart-l"><div class="grow"><b>${esc(l.nombre)}</b>${l.piezas ? `<small class="pk-z">${esc(piezasTxt(l))}</small>` : ''}<small>${l.color ? esc(l.color) + ' · ' : ''}${l.talla ? 'Talla ' + esc(l.talla) + ' · ' : ''}${l.cantidad} × ${euro(l.precio)}</small></div>
          <b>${euro(l.cantidad * l.precio)}</b><button type="button" class="iconbtn" data-rm="${i}" aria-label="Quitar ${esc(l.nombre)}">${ic('trash')}</button></div>`).join('')}
          <div class="cart-t"><span>Total</span><b>${euro(tot)}</b></div></div>
        ${kids.length > 1 ? `<label class="f" for="ck">¿Para qué jugador es?<select id="ck"><option value="">Elige</option>${kids.map(k => `<option value="${k.id}">${esc(k.n)} · ${esc(k.team)}</option>`).join('')}</select></label>`
          : `<p class="muted" style="margin:0">Para ${esc(kids[0] ? kids[0].n : '')}${kids[0] ? ' · ' + esc(kids[0].team) : ''}</p>`}
        <label class="f" for="cn">Nota para la junta<span class="hint">Opcional</span><textarea id="cn" maxlength="300" rows="2"></textarea></label>
        <p class="err" id="cerr" role="alert" hidden></p>
        <button type="button" class="btn blue block" id="c-ok">${ic('send')} Hacer pedido · ${euro(tot)}</button>`;
    };
    const m = modal(draw(), 'dialog', () => render());
    m.el.classList.add('rqd');
    const bind = () => {
      m.el.querySelectorAll('[data-rm]').forEach(b => b.onclick = () => { f.cart.splice(+b.dataset.rm, 1); if (!f.cart.length) return m.close(false); m.el.firstElementChild.innerHTML = draw(); bind(); });
      m.el.querySelector('#c-ok').onclick = async () => {
        const err = t => { const e = m.el.querySelector('#cerr'); e.textContent = t; e.hidden = false; b.disabled = false; b.innerHTML = `${ic('send')} Hacer pedido`; };
        const b = m.el.querySelector('#c-ok'), sel = m.el.querySelector('#ck'), kid = sel ? +sel.value : kids[0] && kids[0].id;
        if (!kid) { m.el.querySelector('#cerr').textContent = 'Elige para qué jugador es el pedido.'; m.el.querySelector('#cerr').hidden = false; sel.focus(); return; }
        b.disabled = true; b.textContent = 'Enviando…';
        try { await API().hacerPedido(kid, f.cart.map(l => ({ producto: l.producto, talla: l.talla, ...(l.color ? { color: l.color } : {}), cantidad: l.cantidad, ...(l.piezas ? { piezas: l.piezas.map(z => ({ producto: z.producto, talla: z.talla, ...(z.color ? { color: z.color } : {}) })) } : {}) })), m.el.querySelector('#cn').value.trim()); }
        catch (x) { return err(/Failed to fetch|network/i.test(x.message || '') ? 'No hay conexión. Prueba otra vez en un momento.' : x.message || 'No se ha podido hacer el pedido.'); }
        f.cart = []; await window.cargarTienda(); S.shopView = 'mine'; m.close(false); say('¡Pedido hecho! La junta ya lo tiene. Lo pagas en efectivo en el club.');
      };
    };
    bind();
  }
  function orderCard(o, junta) {
    const ls = Array.isArray(o.lineas) ? o.lineas : [];
    const [nom, tel] = (o.contacto || '').split(' · ');
    return `<section class="card ped" aria-labelledby="pd${o.id}"><div class="ped-h"><div class="grow"><h2 id="pd${o.id}">Pedido nº ${o.id}</h2><small>${fecha(o.creado)}${o.jugador ? ' · ' + esc(o.jugador) : ''}${o.equipo ? ' · ' + esc(o.equipo) : ''}</small></div>
        ${junta ? '' : `<span class="pill ${pedCls(o.estado)}">${ESTADOS_PED[o.estado]}</span>`}</div>
      ${junta ? `<p class="ped-who">${ic('user')}<span>${esc(nom || 'Familia sin acceso')}${tel ? ` · <a href="tel:${esc(tel.replace(/\s/g, ''))}">${esc(tel)}</a>` : ''}</span></p>` : ''}
      <ul class="ped-l">${ls.map(l => `<li><span>${l.cantidad} × ${esc(l.nombre)}${l.color || l.talla ? ` <small>${[l.color && esc(l.color), l.talla && 'talla ' + esc(l.talla)].filter(Boolean).join(' · ')}</small>` : ''}${l.piezas ? `<small class="pk-z">${esc(piezasTxt(l))}</small>` : ''}</span><b>${euro(l.cantidad * l.precio)}</b></li>`).join('')}</ul>
      ${o.nota ? `<p class="ped-n">“${esc(o.nota)}”</p>` : ''}
      <div class="ped-t"><span>Total · en efectivo</span><b>${euro(o.total)}</b></div>
      ${junta ? `<div class="ped-a"><label class="f" for="pe${o.id}">Estado<select id="pe${o.id}" data-pest="${o.id}">${ESTADOS_PED.map((s, i) => `<option value="${i}" ${i === o.estado ? 'selected' : ''}>${s}</option>`).join('')}</select></label>
          <button type="button" class="btn red" data-pdel="${o.id}">${ic('trash')} Borrar pedido</button></div>`
        : o.estado === 0 ? `<button type="button" class="btn red block" data-pdel="${o.id}">${ic('trash')} Anular pedido</button>`
        : o.estado < 3 ? '<p class="muted ped-x">Ya está en marcha, así que no se puede anular. Si necesitas cambiar algo, habla con la junta.</p>' : ''}</section>`;
  }
  function bindOrders(junta) {
    document.querySelectorAll('[data-pdel]').forEach(b => b.onclick = async () => {
      const o = S.orders.find(x => x.id == b.dataset.pdel);
      if (!(await ask(junta ? `¿Borrar el pedido nº ${o.id}?` : `¿Anular el pedido nº ${o.id}?`, junta ? 'Desaparecerá también del móvil de la familia. No se puede deshacer.' : 'La junta dejará de verlo. No se puede deshacer.', junta ? 'Sí, borrar' : 'Sí, anular'))) return;
      try { await API().borrarPedido(o.id); } catch (x) {
        /* Ya no se puede anular: la junta lo ha pedido al proveedor. Se muestra el estado nuevo */
        if (x.message === 'visto') { if (!junta && o.estado === 0) o.estado = 1; render(); }
        return say(x.message === 'visto' ? 'Ya no se puede anular: la junta lo ha pedido al proveedor. Si necesitas cambiar algo, habla con la junta.' : 'No se ha podido borrar. Revisa la conexión.'); }
      S.orders = S.orders.filter(x => x !== o); render(); say(junta ? 'Pedido borrado.' : 'Pedido anulado.');
    });
    document.querySelectorAll('[data-pest]').forEach(s => s.onchange = async () => {
      const o = S.orders.find(x => x.id == s.dataset.pest), prev = o.estado; o.estado = +s.value;
      try { await API().estadoPedido(o.id, o.estado); } catch (_) { o.estado = prev; render(); return say('No se ha podido guardar. Revisa la conexión.'); }
      render(); say(`Pedido nº ${o.id}: ${ESTADOS_PED[o.estado]}. La familia lo verá en su móvil.`);
    });
  }

  /* ---------- JUNTA: Bandeja dividida en Peticiones, Pedidos y Familias ---------- */
  const famPend = () => (S.fams || []).filter(f => f.estado === 'pendiente');
  const pedNuevos = () => (S.orders || []).filter(o => o.estado === 0);
  function inboxSeg() {
    const v = S.inbox || 'pet', np = pedNuevos().length, nf = famPend().length;
    return `<div class="seg g-scope inbox-seg" role="group" aria-label="Qué ver en la bandeja">
      <button type="button" data-inbox="pet" aria-pressed="${v === 'pet'}">Peticiones</button>
      <button type="button" data-inbox="ped" aria-pressed="${v === 'ped'}">Pedidos${np ? ` <span class="pdot" aria-label="${np} nuevos"></span>` : ''}</button>
      <button type="button" data-inbox="tienda" aria-pressed="${v === 'tienda'}">Tienda</button>
      <button type="button" data-inbox="fam" aria-pressed="${v === 'fam'}">Familias${nf ? ` <span class="pdot" aria-label="${nf} solicitudes"></span>` : ''}</button></div>`;
  }
  function bindInboxSeg() { document.querySelectorAll('[data-inbox]').forEach(b => b.onclick = () => { S.inbox = b.dataset.inbox; render(); }); }
  const falta = () => emptyPage('box', 'Falta un paso en Supabase', 'Pega el SQL “Paso 10 - familias y tienda” en Supabase y vuelve a abrir la app.');
  /* Orden de la tienda: los productos van juntos por categoría (en el orden en que aparece cada categoría)
     y dentro de cada categoría en el orden que elige la junta */
  const catDe = p => p.categoria || '';
  /* "Sin categoría" siempre al final, como "Otros" en la tienda */
  const ordenCats = l => { const c = [...new Set(l.map(catDe))]; return c.filter(Boolean).concat(c.includes('') ? [''] : []); };
  function agrupar(l) { return ordenCats(l).flatMap(c => l.filter(p => catDe(p) === c)); }
  async function guardarOrden(lista, foco) {
    S.products = lista;
    const cambios = lista.map((p, k) => ({ p, orden: k + 1 })).filter(x => x.p.orden !== x.orden);
    cambios.forEach(x => { x.p.orden = x.orden; });
    render();
    const b = foco && (document.querySelector(foco[0]) || document.querySelector(foco[1])); if (b) b.focus();
    if (!cambios.length) return;
    try { await API().ordenProductos(cambios.map(x => ({ id: x.p.id, orden: x.orden }))); }
    catch (e) { say('No se pudo guardar el orden. Inténtalo otra vez.'); }
  }
  /* Subir o bajar un producto dentro de su categoría */
  function moverProducto(id, d) {
    const a = agrupar(S.products), i = a.findIndex(p => p.id === id), j = i + d;
    if (i < 0 || j < 0 || j >= a.length || catDe(a[j]) !== catDe(a[i])) return;
    [a[i], a[j]] = [a[j], a[i]];
    guardarOrden(a, [`[data-id="${id}"][data-mv="${d}"]:not([disabled])`, `[data-id="${id}"][data-mv="${-d}"]`]);
  }
  /* Subir o bajar una categoría entera: en la tienda, sus apartados salen en este orden */
  function moverCategoria(cat, d) {
    const a = agrupar(S.products), cats = ordenCats(a), i = cats.indexOf(cat), j = i + d;
    if (!cat || i < 0 || j < 0 || j >= cats.length || !cats[j]) return;
    [cats[i], cats[j]] = [cats[j], cats[i]];
    const sel = c => `[data-cat="${CSS.escape(cat)}"][data-mvc="${c}"]`;
    guardarOrden(cats.flatMap(c => a.filter(p => catDe(p) === c)), [sel(d) + ':not([disabled])', sel(-d)]);
  }
  /* Junta: productos de la tienda, por categorías, con filtro y flechas para ordenar */
  function listaProductos() {
    const all = agrupar(S.products || []);
    if (!all.length) return card('h-prs', 'Productos · 0', '<p class="muted" style="margin:0">Añade el primer producto con el botón “Añadir producto”.</p>');
    const cats = ordenCats(all), nom = c => c || 'Sin categoría', conNombre = cats.filter(Boolean);
    const f = cats.includes(S.prCat) ? S.prCat : '*', ver = f === '*' ? cats : [f];
    const n = c => all.filter(p => catDe(p) === c).length;
    const fila = (p, i, a) => `<div class="tm pr-row"><div class="pr-ord"><button type="button" class="pr-mv" data-mv="-1" data-id="${p.id}" aria-label="Subir ${esc(p.nombre)}" ${i ? '' : 'disabled'}>${ic('up')}</button><button type="button" class="pr-mv" data-mv="1" data-id="${p.id}" aria-label="Bajar ${esc(p.nombre)}" ${i < a.length - 1 ? '' : 'disabled'}>${ic('down')}</button></div>${prFoto(p, 'pr-th')}
            <div class="grow"><b>${esc(p.nombre)}</b><small>${euro(p.precio)}${modTxt(p) ? ' · ' + esc(modTxt(p)) : ''}${esPack(p) ? ' · Pack: ' + esc(p.componentes.map(sl => slotNombre(sl)).join(' + ')) : (p.colores.length ? ' · Colores ' + esc(p.colores.join(', ')) : '') + (p.tallas.length ? ' · Tallas ' + esc(p.tallas.join(', ')) : ' · Talla única')}</small></div>
            ${p.obligatorio ? '<span class="pill blue">Obligatorio</span>' : ''}${p.activo ? '' : '<span class="pill grey">Oculto</span>'}<button type="button" class="btn ghost sm" data-pr="${p.id}">${ic('pen')} Editar</button></div>`;
    const grupo = c => { const l = all.filter(p => catDe(p) === c), ci = cats.indexOf(c);
      return `<section class="pr-cg" aria-label="${esc(nom(c))}"><div class="pr-cat-h">${f === '*' && c && conNombre.length > 1 ? `<div class="pr-ord h"><button type="button" class="pr-mv" data-mvc="-1" data-cat="${esc(c)}" aria-label="Subir la categoría ${esc(nom(c))}" ${ci ? '' : 'disabled'}>${ic('up')}</button><button type="button" class="pr-mv" data-mvc="1" data-cat="${esc(c)}" aria-label="Bajar la categoría ${esc(nom(c))}" ${ci < conNombre.length - 1 ? '' : 'disabled'}>${ic('down')}</button></div>` : ''}
        <div class="grow"><b>${esc(nom(c))}</b><small>${l.length === 1 ? '1 producto' : l.length + ' productos'}</small></div></div>${l.map(fila).join('')}</section>`; };
    return card('h-prs', `Productos · ${all.length}`, `<div class="pr-filt">
        <label class="f" for="prcf">Ver<select id="prcf"><option value="*">Todas las categorías · ${all.length}</option>${cats.map(c => `<option value="${esc(c)}" ${c === f ? 'selected' : ''}>${esc(nom(c))} · ${n(c)}</option>`).join('')}</select></label>
        <p class="muted">Las familias ven los productos en este orden. Con las flechas de cada producto lo subes o bajas dentro de su categoría.${f === '*' && conNombre.length > 1 ? ' Con las flechas de la categoría cambias el orden de los apartados de la tienda.' : ''}</p></div>
      ${ver.map(grupo).join('')}`);
  }
  function boardInbox() {
    const v = S.inbox;
    /* Tienda: los productos, por categorías, con su orden. Separado de los pedidos para no tener que bajar */
    if (v === 'tienda') {
      const body = S.shopOff ? falta() : `<div class="btn-row ped-btns"><button type="button" class="btn blue" id="pr-new">${ic('plus')} Añadir producto</button></div>${listaProductos()}`;
      return { body: `<div class="stack">${inboxSeg()}${body}</div>`, bind() { bindInboxSeg(); traerFotos();
        if ($('#pr-new')) $('#pr-new').onclick = () => productoForm(null);
        document.querySelectorAll('[data-pr]').forEach(b => b.onclick = () => productoForm(S.products.find(p => p.id == b.dataset.pr)));
        document.querySelectorAll('[data-mv]').forEach(b => b.onclick = () => moverProducto(+b.dataset.id, +b.dataset.mv));
        document.querySelectorAll('[data-mvc]').forEach(b => b.onclick = () => moverCategoria(b.dataset.cat, +b.dataset.mvc));
        if ($('#prcf')) $('#prcf').onchange = () => { S.prCat = $('#prcf').value; render(); }; } };
    }
    if (v === 'ped') {
      const os = S.orders || [], c = st => os.filter(o => o.estado === st).length;
      const body = S.shopOff ? falta() : `<div class="kpis ped-k"><div class="kpi dark blue"><small>Recibidos</small><b>${c(0)}</b></div><div class="kpi"><small>Pedidos al proveedor</small><b>${c(1)}</b></div>
          <div class="kpi"><small>Listos para recoger</small><b>${c(2)}</b></div><div class="kpi"><small>Entregados</small><b>${c(3)}</b></div></div>
        <div class="btn-row ped-btns"><button type="button" class="btn blue" id="xls" ${os.length ? '' : 'disabled'}>${ic('list')} Exportar a Excel</button><button type="button" class="btn blue" id="mail" ${os.length ? '' : 'disabled'}>${ic('send')} Copiar para el correo</button></div>
        ${os.length ? `<div class="cards-grid">${os.map(o => orderCard(o, true)).join('')}</div>` : emptyPage('box', 'Todavía no hay pedidos', 'Cuando una familia haga un pedido en la tienda, aparecerá aquí.')}
`;
      return { body: `<div class="stack">${inboxSeg()}${body}</div>`, bind() { bindInboxSeg(); bindOrders(true); traerFotos();
        if ($('#xls')) $('#xls').onclick = () => exportar(); if ($('#mail')) $('#mail').onclick = () => exportar('correo'); } };
    }
    /* Familias: solicitudes pendientes y familias con acceso */
    const pend = famPend(), acc = (S.fams || []).filter(f => f.estado === 'aceptada');
    const jug = id => { for (const [team, t] of Object.entries(S.teams)) { const p = t.players.find(x => x.id === id); if (p) return { ...p, team }; } return null; };
    const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    const guess = (h, players) => { const w = norm(h.nombre).split(/\s+/).filter(x => x.length > 1); let best = null, sc = 0;
      for (const p of players) { const n = norm(p.n), s = w.filter(x => n.includes(x)).length; if (s > sc) { sc = s; best = p; } } return sc >= Math.min(2, w.length) ? best : null; };
    const reqCard = f => `<section class="card fam" aria-labelledby="fa${f.id}"><div class="ped-h"><div class="grow"><h2 id="fa${f.id}">${esc(f.nombre)}</h2><small>${fecha(f.creada)} · usuario ${esc(f.usuario)}</small></div><span class="pill blue">Nueva</span></div>
      <p class="ped-who">${ic('phone')}<a href="tel:${esc(f.telefono.replace(/\s/g, ''))}">${esc(f.telefono)}</a></p>
      ${(f.hijos || []).map((h, i) => { const team = teamOf(h.equipo), pl = (S.teams[team] || { players: [] }).players, g = guess(h, pl);
        return `<label class="f" for="fj${f.id}-${i}">Escribe: ${esc(h.nombre)} · ${esc(team)}<span class="hint">Elige el jugador de la plantilla</span><select id="fj${f.id}-${i}" data-fj="${f.id}">
          <option value="">No está en la plantilla</option>${pl.map(p => `<option value="${p.id}" ${g && g.id === p.id ? 'selected' : ''}>${esc(p.n)}${p.dorsal ? ' · ' + p.dorsal : ''}</option>`).join('')}</select></label>`; }).join('')}
      <p class="err" id="fe${f.id}" role="alert" hidden>Elige al menos un jugador de la plantilla.</p>
      <div class="btn-row"><button type="button" class="btn red" data-frej="${f.id}">${ic('trash')} Rechazar</button><button type="button" class="btn blue" data-facc="${f.id}">${ic('check')} Aceptar</button></div></section>`;
    const accRow = f => `<div class="tm fam-row"><span class="k">${esc(initials(f.nombre))}</span><div class="grow"><b>${esc(f.nombre)}</b>
        <small>${f.jugadores.map(id => { const p = jug(id); return p ? `${esc(p.n)} (${esc(p.team)})` : 'Jugador dado de baja'; }).join(', ') || 'Sin jugadores'} · ${esc(f.usuario)} · ${esc(f.telefono)}</small></div>
      <button type="button" class="btn ghost sm" data-fpw="${f.id}">${ic('pen')} Contraseña</button><button type="button" class="btn red sm" data-fdel="${f.id}">${ic('trash')} Quitar acceso</button></div>`;
    const L = window.Instalar ? Instalar.ENLACE : 'https://jmbernalstudio.github.io/gestionazn/?familias';
    const invita = `<section class="card inv" aria-labelledby="h-inv"><img class="inv-qr" src="icons/qr-familias.png" alt="Código QR del enlace para familias" width="160" height="160">
      <div class="grow stack"><h2 id="h-inv" class="st-h2">Invita a las familias</h2><p class="muted" style="margin:0">Pásales este enlace o el código QR. Les guía para instalar la app y pedir su acceso.</p>
        <p class="inv-l">${esc(L)}</p><div class="btn-row"><button type="button" class="btn ghost" id="inv-copy">${ic('list')} Copiar enlace</button>
        <a class="btn blue" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent('Ya podéis seguir los partidos, resultados y clasificaciones del C.D. Aznalcóllar Fútbol Base y pedir la ropa de entrenamiento desde la app del club. Instaladla y pedid vuestro acceso aquí: ' + L)}">${ic('send')} Enviar por WhatsApp</a>
        <a class="btn ghost" href="icons/qr-familias.png" download="qr-familias-cd-aznalcollar.png">${ic('download')} Descargar QR</a></div></div></section>`;
    /* Filtro por equipo: una familia sale en cada equipo de sus hijos */
    const teamsOf = f => (f.jugadores || []).map(id => (jug(id) || {}).team).filter(Boolean);
    const tOpts = Object.keys(S.teams).sort(teamOrder).map(t => [t, acc.filter(f => teamsOf(f).includes(t)).length]);
    const ft = S.famTeam && S.teams[S.famTeam] ? S.famTeam : '';
    const accV = ft ? acc.filter(f => teamsOf(f).includes(ft)) : acc;
    const filtro = acc.length ? `<label class="f fam-ft" for="fam-ft"><span class="sr">Ver familias de</span><select id="fam-ft"><option value="">Todos los equipos (${acc.length})</option>
        ${tOpts.map(([t, n]) => `<option value="${esc(t)}" ${t === ft ? 'selected' : ''}>${esc(t)} (${n})</option>`).join('')}</select></label>` : '';
    const body = S.famOff ? falta() : `${pend.length ? `<div class="cards-grid">${pend.map(reqCard).join('')}</div>` : ''}
      ${invita}
      ${card('h-fac', `Familias con acceso · ${accV.length}`, acc.length ? filtro + (accV.length ? accV.map(accRow).join('') : `<p class="muted" style="margin:0">Ninguna familia de ${esc(ft)} tiene acceso todavía.</p>`) : '<p class="muted" style="margin:0">Todavía no hay familias con acceso. Pasa a las familias el enlace de la app: entrarán en “Familias” y pedirán su acceso.</p>')}`;
    return { body: `<div class="stack">${inboxSeg()}${!S.famOff && !pend.length ? '<p class="card muted" style="margin:0">No hay solicitudes nuevas de familias.</p>' : ''}${body}</div>`, bind() {
      bindInboxSeg();
      if ($('#fam-ft')) $('#fam-ft').onchange = e => { S.famTeam = e.target.value; render(); };
      if ($('#inv-copy')) $('#inv-copy').onclick = async () => { try { await navigator.clipboard.writeText(L); say('Enlace copiado. Pégalo en el grupo de WhatsApp del equipo.'); } catch (_) { prompt('Copia este enlace:', L); } };
      document.querySelectorAll('[data-facc]').forEach(b => b.onclick = async () => {
        const id = b.dataset.facc, ids = [...document.querySelectorAll(`[data-fj="${id}"]`)].map(s => +s.value).filter(Boolean);
        if (!ids.length) { $('#fe' + id).hidden = false; return; }
        b.disabled = true;
        try { await API().aceptarFamilia(id, [...new Set(ids)]); } catch (x) { b.disabled = false; return say(x.message || 'No se ha podido aceptar. Revisa la conexión.'); }
        const f = S.fams.find(x => x.id === id); f.estado = 'aceptada'; f.jugadores = [...new Set(ids)];
        render(); say(`${f.nombre} ya puede entrar. Avísale por WhatsApp o por teléfono.`);
      });
      document.querySelectorAll('[data-frej],[data-fdel]').forEach(b => b.onclick = async () => {
        const id = b.dataset.frej || b.dataset.fdel, f = S.fams.find(x => x.id === id), rej = !!b.dataset.frej;
        if (!(await ask(rej ? `¿Rechazar a ${f.nombre}?` : `¿Quitar el acceso a ${f.nombre}?`, rej ? 'Se borrará su solicitud. Si es un error, podrá volver a pedir acceso.' : 'Ya no podrá entrar en la app. Sus pedidos se quedan. No se puede deshacer.', rej ? 'Sí, rechazar' : 'Sí, quitar acceso'))) return;
        try { await API().quitarFamilia(id); } catch (_) { return say('No se ha podido hacer. Revisa la conexión.'); }
        S.fams = S.fams.filter(x => x !== f); render(); say(rej ? 'Solicitud rechazada.' : 'Acceso quitado.');
      });
      document.querySelectorAll('[data-fpw]').forEach(b => b.onclick = () => nuevaClave(S.fams.find(x => x.id === b.dataset.fpw)));
    } };
  }
  function nuevaClave(f) {
    const m = modal(`<h2 id="mdl-t">Nueva contraseña</h2><form id="fpf" class="stack" novalidate><p class="muted" style="margin:0">Para ${esc(f.nombre)} (usuario ${esc(f.usuario)}). Después, díselo por WhatsApp o por teléfono.</p>
      <label class="f" for="fpn">Contraseña nueva<span class="hint">Al menos 8 caracteres</span><input type="text" id="fpn" autocomplete="off" autocapitalize="none" spellcheck="false"></label>
      <p class="err" id="fpe" role="alert" hidden></p><button type="submit" class="btn blue block">${ic('check')} Guardar contraseña</button></form>`, 'dialog', () => {});
    $('#fpn').focus();
    $('#fpf').onsubmit = async e => { e.preventDefault(); const v = $('#fpn').value;
      if (v.length < 8) { $('#fpe').textContent = 'Debe tener al menos 8 caracteres.'; $('#fpe').hidden = false; return; }
      try { await API().clave(f.id, v); } catch (_) { $('#fpe').textContent = 'No se ha podido guardar. Revisa la conexión.'; $('#fpe').hidden = false; return; }
      m.close(); say('Contraseña cambiada.'); };
  }
  /* Alta y edición de productos (solo junta) */
  /* Categorías: las de siempre más las que ya use la junta. "merchandising" y "Merchandising" cuentan como la misma */
  function catsSug() {
    const l = ['Entrenamiento', 'Partido', 'Merchandising', ...(S.products || []).map(p => p.categoria).filter(Boolean)];
    return l.filter((c, i) => l.findIndex(d => d.toLowerCase() === c.toLowerCase()) === i);
  }
  function catNorm(v) {
    v = (v || '').trim().replace(/\s+/g, ' ');
    if (!v) return '';
    return catsSug().find(c => c.toLowerCase() === v.toLowerCase()) || v.charAt(0).toUpperCase() + v.slice(1);
  }
  const parseColores = v => [...new Set((v || '').split(',').map(t => t.trim().replace(/\s+/g, ' ')).filter(Boolean).map(t => t.charAt(0).toUpperCase() + t.slice(1)))];
  function productoForm(p) {
    const x = p ? { ...p, tallas: p.tallas.slice() } : { nombre: '', descripcion: '', precio: '', tallas: [], colores: [], activo: true };
    const st = { foto: p ? fotoDe(p) : null, cambiada: false, fc: p ? fotosColorDe(p) : {}, fcCambiada: false, pack: esPack(p), slots: esPack(p) ? p.componentes.map(sl => sl.slice()) : [] };
    /* Prendas que se pueden meter en un pack: productos normales (no otros packs), estén o no a la vista en la tienda */
    const cands = (S.products || []).filter(y => !esPack(y) && (!p || y.id !== p.id));
    const m = modal(`<h2 id="mdl-t">${p ? 'Editar producto' : 'Añadir producto'}</h2>
      <form id="prf" class="stack" novalidate>
        <label class="photo pr-ph" for="prfo">${st.foto ? `<span class="pr-f"><img src="${st.foto}" alt=""></span>` : `<span class="pr-f">${ic('camera')}</span>`}<span id="prfo-t">${st.foto ? 'Foto añadida · toca para cambiarla' : 'Añadir foto (opcional)'}</span></label>
        <input type="file" id="prfo" accept="image/*" class="sr">
        ${S.packOff ? '' : `<div class="opts-row"><div class="grow"><b id="prk-l">Es un pack</b><small>Junta varias prendas de la tienda. La familia elige la talla de cada una.</small></div>
          <button type="button" class="tgl" role="switch" id="prk" aria-checked="${st.pack}" aria-labelledby="prk-l"><span></span></button></div>`}
        <label class="f" for="prn">Nombre<input type="text" id="prn" maxlength="80" value="${esc(x.nombre)}" placeholder="${st.pack ? 'Por ejemplo: Pack de entrenamiento' : 'Por ejemplo: Camiseta Rigel'}"></label>
        ${S.catOff ? '' : `<div class="f pr-cat-f"><label for="prc">Categoría</label><span class="hint">Cada categoría es un apartado de la tienda. Toca una o escribe otra</span>
          <div class="chips pr-cats" role="group" aria-label="Categorías">${catsSug().map(c => `<button type="button" class="chip" data-cat="${esc(c)}" aria-pressed="${c === x.categoria}">${esc(c)}</button>`).join('')}</div>
          <input type="text" id="prc" maxlength="40" value="${esc(x.categoria || '')}" placeholder="Por ejemplo: Merchandising"></div>`}
        ${S.modOff ? '' : `<label class="f" for="prmo" id="prmc" ${st.pack ? 'hidden' : ''}>Modelo<span class="hint">Para el Excel del proveedor</span><input type="text" id="prmo" maxlength="60" value="${esc(x.modelo || '')}" placeholder="Por ejemplo: Rigel"></label>`}
        ${!S.colOff ? `<label class="f" for="prcl" id="prcl-w" ${st.pack ? 'hidden' : ''}>Color<span class="hint">Si hay varios, sepáralos con comas</span><input type="text" id="prcl" maxlength="200" value="${esc((x.colores || []).length ? x.colores.join(', ') : x.color || '')}" placeholder="Por ejemplo: Negro"></label>`
          : S.modOff ? '' : `<label class="f" for="prco" id="prcl-w" ${st.pack ? 'hidden' : ''}>Color<input type="text" id="prco" maxlength="60" value="${esc(x.color || '')}" placeholder="Por ejemplo: Negro"></label>`}
        ${S.colOff || S.fcOff ? '' : `<div class="pr-fc" id="prfc" ${st.pack ? 'hidden' : ''}></div>`}
        <label class="f" for="prd">Descripción<span class="hint">Opcional. Qué incluye</span><textarea id="prd" maxlength="300" rows="2">${esc(x.descripcion)}</textarea></label>
        <label class="f" for="prp">Precio en euros<input type="text" id="prp" inputmode="decimal" value="${x.precio === '' ? '' : String(x.precio).replace('.', ',')}" placeholder="35,00"></label>
        <label class="f" for="prt" id="prt-w" ${st.pack ? 'hidden' : ''}>Tallas disponibles<span class="hint">Separadas por comas. Déjalo vacío si es talla única</span><input type="text" id="prt" value="${esc(x.tallas.join(', '))}" placeholder="6, 8, 10, 12, 14, S, M, L, XL"></label>
        <div class="pk-ed stack" id="pk-ed" ${st.pack ? '' : 'hidden'}></div>
        ${S.oblOff ? '' : `<div class="opts-row"><div class="grow"><b id="pro-l">Obligatorio</b><small>Sale en el apartado “Obligatorio” de la tienda, el primero. Por ejemplo, el pack de entrenamiento.</small></div>
          <button type="button" class="tgl" role="switch" id="pro" aria-checked="${!!x.obligatorio}" aria-labelledby="pro-l"><span></span></button></div>`}
        <div class="opts-row"><div class="grow"><b id="pra-l">Se ve en la tienda</b><small>Si lo quitas, las familias no lo ven, pero no se borra.</small></div>
          <button type="button" class="tgl" role="switch" id="pra" aria-checked="${x.activo}" aria-labelledby="pra-l"><span></span></button></div>
        <p class="err" id="pre" role="alert" hidden></p>
        <button type="submit" class="btn blue block">${ic('check')} Guardar producto</button>
        ${p ? `<button type="button" class="btn red block" id="prx">${ic('trash')} Borrar producto</button>` : ''}
      </form>`, 'dialog', () => {});
    m.el.classList.add('rqd');
    $('#prn').focus();
    $('#pra').onclick = () => { x.activo = !x.activo; $('#pra').setAttribute('aria-checked', x.activo); };
    const marcaCat = () => document.querySelectorAll('[data-cat]').forEach(b => b.setAttribute('aria-pressed', b.dataset.cat.toLowerCase() === $('#prc').value.trim().toLowerCase()));
    document.querySelectorAll('[data-cat]').forEach(b => b.onclick = () => { $('#prc').value = b.dataset.cat; marcaCat(); });
    if ($('#prc')) $('#prc').oninput = marcaCat;
    if ($('#pro')) $('#pro').onclick = () => { x.obligatorio = !x.obligatorio; $('#pro').setAttribute('aria-checked', x.obligatorio); };
    /* Prendas del pack: cada prenda es un producto; si tiene varios modelos, la familia elige uno */
    const opt = (sel) => `<option value="">Elige un producto</option>${cands.map(y => `<option value="${y.id}" ${y.id === sel ? 'selected' : ''}>${esc(y.nombre)}${y.activo ? '' : ' (oculto)'}</option>`).join('')}`;
    const drawPk = () => {
      const box = $('#pk-ed');
      box.innerHTML = `<div><b>Prendas del pack</b><p class="muted pk-h">Añade antes cada prenda como producto, con sus tallas. Si no quieres venderla suelta, déjala oculta. Si una prenda tiene dos modelos (por ejemplo, calzona entera o cortada), pulsa “Dar a elegir otro modelo”.</p></div>
        ${cands.length ? '' : '<p class="err">Todavía no hay prendas. Guarda primero cada prenda como producto.</p>'}
        ${st.slots.map((sl, i) => `<div class="pk-es"><div class="pk-eh"><b>Prenda ${i + 1}</b><button type="button" class="btn ghost sm" data-pkx="${i}">${ic('trash')} Quitar</button></div>
          ${sl.map((id, j) => `<div class="pk-o">${j ? '<span class="pk-or">o</span>' : ''}<label class="f"><span class="sr">${j ? 'Otro modelo' : 'Producto'} de la prenda ${i + 1}</span><select data-pks="${i}" data-j="${j}">${opt(id)}</select></label>
            ${j ? `<button type="button" class="iconbtn pk-del" data-pko="${i}" data-j="${j}" aria-label="Quitar este modelo">${ic('trash')}</button>` : ''}</div>`).join('')}
          <button type="button" class="btn ghost sm" data-pkm="${i}">${ic('plus')} Dar a elegir otro modelo</button></div>`).join('')}
        <button type="button" class="btn ghost block" id="pk-add">${ic('plus')} Añadir prenda</button>`;
      box.querySelectorAll('[data-pks]').forEach(s => s.onchange = () => { st.slots[+s.dataset.pks][+s.dataset.j] = s.value ? +s.value : null; });
      box.querySelectorAll('[data-pkx]').forEach(b => b.onclick = () => { st.slots.splice(+b.dataset.pkx, 1); drawPk(); });
      box.querySelectorAll('[data-pko]').forEach(b => b.onclick = () => { st.slots[+b.dataset.pko].splice(+b.dataset.j, 1); drawPk(); });
      box.querySelectorAll('[data-pkm]').forEach(b => b.onclick = () => { st.slots[+b.dataset.pkm].push(null); drawPk(); });
      $('#pk-add').onclick = () => { st.slots.push([null]); drawPk(); };
    };
    if (st.pack) drawPk();
    if ($('#prk')) $('#prk').onclick = () => {
      st.pack = !st.pack; $('#prk').setAttribute('aria-checked', st.pack);
      $('#prt-w').hidden = st.pack; $('#pk-ed').hidden = !st.pack; if ($('#prmc')) $('#prmc').hidden = st.pack; if ($('#prcl-w')) $('#prcl-w').hidden = st.pack; if ($('#prfc')) $('#prfc').hidden = st.pack; drawFc();
      if (st.pack) { if (!st.slots.length) st.slots = [[null]]; drawPk(); }
    };
    /* Una foto por color (opcional): al elegir el color en la tienda, sale su foto */
    const drawFc = () => {
      const box = $('#prfc'); if (!box) return;
      const cols = $('#prcl') ? parseColores($('#prcl').value) : [];
      /* Con varios colores, cada color lleva su foto y la foto general sobra */
      m.el.querySelector('.pr-ph').hidden = cols.length > 1 && !st.pack;
      if (cols.length < 2) { box.innerHTML = ''; return; }
      if (st.fc === undefined) { box.innerHTML = '<p class="muted" style="margin:0">Cargando las fotos de cada color…</p>'; return; }
      box.innerHTML = `<div><b>Foto de cada color</b><small class="muted">La familia elige el color y ve su foto</small></div>
        <div class="pr-fcl">${cols.map((c, i) => `<label class="pr-fct" for="prfc${i}">${st.fc[c] ? `<span class="pr-f"><img src="${st.fc[c]}" alt=""></span>` : `<span class="pr-f">${ic('camera')}</span>`}<span>${esc(c)}</span>
          <input type="file" id="prfc${i}" accept="image/*" class="sr" data-fc="${esc(c)}" aria-label="${st.fc[c] ? 'Cambiar' : 'Añadir'} foto del color ${esc(c)}"></label>`).join('')}</div>`;
      box.querySelectorAll('[data-fc]').forEach(inp => inp.onchange = async () => {
        const fl = inp.files[0]; if (!fl) return;
        try { st.fc[inp.dataset.fc] = await readImage(fl, 640); st.fcCambiada = true; } catch (_) { return say('No se ha podido leer esa foto. Prueba con otra.'); }
        drawFc();
      });
    };
    if ($('#prcl')) $('#prcl').oninput = drawFc;
    drawFc();
    if (st.fc === undefined) traerFotosColor().then(() => { st.fc = { ...(fotosColorDe(p) || {}) }; drawFc(); });
    else st.fc = { ...st.fc };
    $('#prfo').onchange = async () => { const fl = $('#prfo').files[0]; if (!fl) return;
      try { st.foto = await readImage(fl, 640); st.cambiada = true; } catch (_) { return say('No se ha podido leer esa foto. Prueba con otra.'); }
      m.el.querySelector('.pr-ph .pr-f').innerHTML = `<img src="${st.foto}" alt="">`; $('#prfo-t').textContent = 'Foto añadida · toca para cambiarla'; };
    if ($('#prx')) $('#prx').onclick = async () => {
      const dentro = (S.products || []).find(y => y.componentes && y.componentes.some(sl => sl.includes(p.id)));
      if (dentro) return say(`Esta prenda está dentro de “${dentro.nombre}”. Quítala antes de ese pack.`);
      if (!(await ask(`¿Borrar “${p.nombre}”?`, 'Desaparecerá de la tienda. Los pedidos ya hechos no cambian. No se puede deshacer.', 'Sí, borrar'))) return;
      try { await API().borrarProducto(p.id); } catch (_) { return say('No se ha podido borrar. Revisa la conexión.'); }
      S.products = S.products.filter(y => y !== p); m.close(); render(); say('Producto borrado.');
    };
    $('#prf').onsubmit = async e => {
      e.preventDefault();
      const err = t => { $('#pre').textContent = t; $('#pre').hidden = false; };
      const nombre = $('#prn').value.trim(), precio = Number($('#prp').value.replace(/\s|€/g, '').replace(',', '.'));
      if (!nombre) return err('Escribe el nombre del producto.');
      if (!$('#prp').value.trim() || isNaN(precio) || precio < 0) return err('Escribe el precio. Por ejemplo: 35,00');
      let tallas = [...new Set($('#prt').value.split(',').map(t => t.trim()).filter(Boolean))], componentes = [];
      /* Un solo color: es el color del producto (para el proveedor). Varios: la familia elige uno */
      const cls = !st.pack && $('#prcl') ? parseColores($('#prcl').value) : [];
      let colores = cls.length > 1 ? cls : [];
      const color = st.pack ? '' : $('#prcl') ? (cls.length === 1 ? cls[0] : '') : $('#prco') ? $('#prco').value.trim() : '';
      /* Si todos los colores tienen su foto, no hace falta la foto general */
      const fotoGen = colores.length && st.fc && colores.every(c => st.fc[c]) ? null : st.foto || null;
      if (st.pack) {
        if (!st.slots.length) return err('Añade al menos una prenda al pack.');
        if (st.slots.some(sl => sl.some(id => !id))) return err('Elige el producto de cada prenda, o quita las que sobren.');
        if (st.slots.some(sl => new Set(sl).size !== sl.length)) return err('Hay un modelo repetido dentro de la misma prenda.');
        componentes = st.slots.map(sl => sl.slice()); tallas = []; colores = [];
      }
      const fila = { id: p && p.id, nombre, descripcion: $('#prd').value.trim(), precio: Math.round(precio * 100) / 100, tallas, componentes, activo: x.activo, obligatorio: !!x.obligatorio, colores, ...(st.fc && (st.fcCambiada || Object.keys(st.fc).some(c => !colores.includes(c))) ? { fotos_color: Object.fromEntries(colores.filter(c => st.fc[c]).map(c => [c, st.fc[c]])) } : {}), foto: fotoGen, categoria: catNorm($('#prc') ? $('#prc').value : ''),
        modelo: !st.pack && $('#prmo') ? $('#prmo').value.trim() : '', color };
      try { await API().producto(fila); } catch (_) { return err(S.shopOff ? 'Falta un paso en Supabase para poder guardar productos.' : 'No se ha podido guardar. Revisa la conexión.'); }
      await window.cargarTienda(); m.close(); render(); say(p ? 'Producto guardado.' : 'Producto añadido a la tienda.');
    };
  }

  /* ---------- Exportar pedidos a Excel (.xlsx hecho aquí mismo, sin librerías) ---------- */
  async function exportar(modo) {
    const correo = modo === 'correo';
    const os = S.orders || [], nuevos = os.filter(o => o.estado === 0), abiertos = os.filter(o => o.estado < 3);
    const v = await choose(correo ? 'Copiar el pedido para el correo' : 'Exportar pedidos a Excel', correo ? 'Elige qué pedidos van en la tabla' : 'Elige qué pedidos van en el archivo', [
      ['0', `Solo los nuevos (Recibido) · ${nuevos.length}`, 'box', 'blue'], ['1', `Todos los que faltan por entregar · ${abiertos.length}`, 'list'], ['2', `Todos · ${os.length}`, 'list']]);
    if (v === undefined) return;
    const sel = v === '0' ? nuevos : v === '1' ? abiertos : os;
    if (!sel.length) return say('No hay pedidos de ese tipo.');
    const lin = sel.flatMap(o => (o.lineas || []).map(l => ({ o, l })));
    /* Modelo y color: los de la ficha del producto (si la prenda ya no existe, se dejan en blanco) */
    const mc = id => { const pr = prodId(id); return [pr ? pr.modelo || '' : '', pr ? pr.color || '' : '']; };
    /* Para el proveedor: una fila por prenda (con su modelo y color) y una columna por talla.
       Un pack cuenta como sus prendas: una unidad de cada una */
    const filas = new Map(), tallasDe = new Map();
    for (const { l } of lin) for (const z of l.piezas || [l]) {
      /* Se agrupa por producto (con su nombre de ahora); si ya no existe, por el nombre que tenía en el pedido */
      const pr = prodId(z.producto), mo = mc(z.producto)[0], co = z.color || mc(z.producto)[1], k = (pr ? 'p' + pr.id : ['n', z.nombre, mo].join('\u0000')) + '\u0000' + co, t = z.talla || 'Única';
      if (!filas.has(k)) filas.set(k, { nombre: pr ? pr.nombre : z.nombre, mo, co, pid: pr ? pr.id : null, n: {} });
      const f = filas.get(k); f.n[t] = (f.n[t] || 0) + l.cantidad;
    }
    /* Columnas de tallas, ordenadas: números (8, 10, 12… y 31-34, 35-38…), luego letras (XS, S, M, L, XL…), y la talla única al final */
    const LET = ['XXXS', '3XS', 'XXS', '2XS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', 'XXXL', '3XL', '4XL'];
    const rank = t => { const n = parseFloat(t); if (t === 'Única') return [3, 0, t]; if (!isNaN(n)) return [0, n, t];
      const i = LET.indexOf(String(t).toUpperCase()); return i >= 0 ? [1, i, t] : [2, 0, t]; };
    const cols = [...new Set([...filas.values()].flatMap(f => Object.keys(f.n)))].sort((a, b) => { const x = rank(a), y = rank(b); return x[0] - y[0] || x[1] - y[1] || String(x[2]).localeCompare(String(y[2]), 'es'); });
    const lista = [...filas.values()].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es') || a.mo.localeCompare(b.mo, 'es') || a.co.localeCompare(b.co, 'es'));
    const total = f => Object.values(f.n).reduce((a, b) => a + b, 0);
    /* Hoja para el proveedor (versión 2 elegida por la junta): una tabla por tipo de talla
       (ropa, tallas de pie y talla única), así cada tabla solo tiene las columnas que usa */
    const pie = t => /^\d+(?:[.,]\d+)?\s*-\s*\d+(?:[.,]\d+)?$/.test(String(t).trim());
    const tipo = f => { const ts = Object.keys(f.n); return ts.every(t => t === 'Única') ? 'u' : ts.every(t => pie(t) || t === 'Única') ? 'p' : 'r'; };
    const SECC = [['r', 'Ropa · tallas de niño y de adulto'], ['p', 'Medias y calzado · tallas de pie'], ['u', 'Talla única']];
    const X = (v, s, span) => ({ v, s, span: span || 1 });
    const prendas = lista.reduce((a, f) => a + total(f), 0), hoy = new Date();
    if (correo) {
      const secs = SECC.map(([k, tit]) => { const fs = lista.filter(f => tipo(f) === k); return { tit, fs, ts: cols.filter(t => fs.some(f => f.n[t])) }; }).filter(x => x.fs.length);
      return correoModal(sel, secs, prendas, total);
    }
    const hoja1 = [[X('C.D. Aznalcóllar Fútbol Base · Pedido al proveedor', 'title')],
      [X(`${sel.length === 1 ? '1 pedido' : sel.length + ' pedidos'} de familias · ${prendas === 1 ? '1 prenda' : prendas + ' prendas'} en total · ${hoy.getDate()}/${hoy.getMonth() + 1}/${hoy.getFullYear()}`, 'sub')], []];
    for (const [k, tit] of SECC) {
      const fs = lista.filter(f => tipo(f) === k);
      if (!fs.length) continue;
      const ts = cols.filter(t => fs.some(f => f.n[t]));
      hoja1.push([X(tit, 'sec', 4 + ts.length)],
        [X('Prenda', 'hl'), X('Modelo', 'h'), X('Color', 'h'), ...ts.map(t => X(t === 'Única' ? 'Talla única' : 'Talla ' + t, 'h')), X('Total', 'h')],
        ...fs.map(f => [X(f.nombre, 'lb'), X(f.mo, 'l'), X(f.co, 'l'), ...ts.map(t => X(f.n[t] || '', 'n')), X(total(f), 'nb')]),
        [X('Total', 'tl'), X('', 'tl'), X('', 'tl'), ...ts.map(t => X(fs.reduce((a, f) => a + (f.n[t] || 0), 0) || '', 't')), X(fs.reduce((a, f) => a + total(f), 0), 't')], []);
    }
    hoja1.push([X('Total de prendas', 'tl', 3), X(prendas, 't')]);
    const hoja2 = [['Pedido', 'Fecha', 'Familia', 'Teléfono', 'Jugador', 'Equipo', 'Producto', 'Modelo', 'Color', 'Talla', 'Cantidad', 'Precio', 'Importe', 'Estado', 'Nota'],
      ...lin.map(({ o, l }) => { const [nom, tel] = (o.contacto || '').split(' · '); const d = new Date(o.creado);
        const fila = [o.id, `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`, nom || '', tel || '', o.jugador, o.equipo, l.nombre, ...(l.piezas ? ['', ''] : [mc(l.producto)[0], l.color || mc(l.producto)[1]]), l.piezas ? 'Pack' : l.talla || 'Única', l.cantidad, { m: +l.precio }, { m: Math.round(l.cantidad * l.precio * 100) / 100 }, ESTADOS_PED[o.estado], o.nota || ''];
        return [fila, ...(l.piezas || []).map(z => [o.id, '', '', '', '', '', '   · ' + z.nombre, mc(z.producto)[0], z.color || mc(z.producto)[1], z.talla || 'Única', l.cantidad, '', '', '', ''])]; }).flat(),
      [], ['', '', '', '', '', '', '', '', '', '', '', 'Total', { m: sel.reduce((a, o) => a + o.total, 0) }]];
    const blob = xlsx([['Para el proveedor', hoja1, { estilo: true }], ['Pedidos', hoja2]]);
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `pedidos-cd-aznalcollar-${TODAY}.xlsx`;
    document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    marcarPedidos(sel, 'Excel descargado.');
  }
  /* Después de mandar el pedido al proveedor: ¿marcar los nuevos como "Pedido al proveedor"? */
  async function marcarPedidos(sel, hecho) {
    const n0 = sel.filter(o => o.estado === 0);
    if (n0.length && await confirmar(`¿Marcar ${n0.length === 1 ? 'el pedido' : `los ${n0.length} pedidos`} como “Pedido al proveedor”?`, 'Así las familias saben que ya se ha pedido su ropa.', 'Sí, marcar')) {
      try { await API().estadoPedidos(n0.map(o => o.id), 1); n0.forEach(o => { o.estado = 1; }); render(); say('Pedidos marcados como “Pedido al proveedor”.'); } catch (_) { say('No se ha podido guardar. Revisa la conexión.'); }
    } else say(hecho);
  }
  /* Miniatura cuadrada (fondo blanco) para el correo: pesa poco y se ve igual en todos los correos */
  function miniatura(src, lado = 96) {
    return new Promise(res => {
      if (!src) return res('');
      const im = new Image();
      im.onload = () => { try {
        const c = document.createElement('canvas'); c.width = c.height = lado; const g = c.getContext('2d');
        g.fillStyle = '#fff'; g.fillRect(0, 0, lado, lado);
        const k = Math.min(lado / im.width, lado / im.height), w = im.width * k, h = im.height * k;
        g.drawImage(im, (lado - w) / 2, (lado - h) / 2, w, h); res(c.toDataURL('image/jpeg', .82)); } catch (_) { res(''); } };
      im.onerror = () => res(''); im.src = src;
    });
  }
  /* Tabla para pegar en el cuerpo del correo: la misma que la hoja del Excel, con estilos dentro
     de cada celda (los correos no leen hojas de estilo) y una foto pequeña de cada prenda */
  async function correoModal(sel, secs, prendas, total) {
    say('Preparando la tabla…');
    try { await traerFotos(); await traerFotosColor(); } catch (_) {}
    const fotoFila = f => { const pr = f.pid && prodId(f.pid); if (!pr) return ''; return ((fotosColorDe(pr) || {})[f.co]) || fotoDe(pr) || fotoPrincipal(pr) || ''; };
    const minis = new Map();
    for (const x of secs) for (const f of x.fs) minis.set(f, await miniatura(fotoFila(f)));
    const conFoto = [...minis.values()].some(Boolean), hoy = new Date();
    const FT = 'font-family:Calibri,Arial,Helvetica,sans-serif;font-size:14px;';
    const B = 'border:1px solid #D5DCE8;padding:6px 10px;' + FT;
    const st = {
      h: B + 'background:#0034DF;color:#FFFFFF;font-weight:bold;text-align:center;white-space:nowrap;',
      hl: B + 'background:#0034DF;color:#FFFFFF;font-weight:bold;text-align:left;',
      sec: B + 'background:#111111;color:#FFFFFF;font-weight:bold;font-size:15px;text-align:left;',
      t: B + 'background:#FFC72C;color:#111111;font-weight:bold;text-align:center;',
      tl: B + 'background:#FFC72C;color:#111111;font-weight:bold;text-align:left;',
      n: B + 'color:#111111;text-align:center;', nb: B + 'color:#111111;text-align:center;font-weight:bold;',
      l: B + 'color:#111111;text-align:left;', lb: B + 'color:#111111;text-align:left;font-weight:bold;', foto: 'border:1px solid #D5DCE8;padding:4px;background:#FFFFFF;text-align:center;width:56px;'
    };
    const bg = { h: '#0034DF', hl: '#0034DF', sec: '#111111', t: '#FFC72C', tl: '#FFC72C' };
    const td = (v, s, span) => `<td${span > 1 ? ` colspan="${span}"` : ''}${bg[s] ? ` bgcolor="${bg[s]}"` : ''} style="${st[s]}">${v === '' || v == null ? '&nbsp;' : esc(String(v))}</td>`;
    const tabla = x => {
      const fc = conFoto ? 1 : 0, ancho = fc + 4 + x.ts.length;
      return `<table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin:0 0 18px 0;">
<tr>${td(x.tit, 'sec', ancho)}</tr>
<tr>${conFoto ? td('Foto', 'h') : ''}${td('Prenda', 'hl')}${td('Modelo', 'h')}${td('Color', 'h')}${x.ts.map(t => td(t === 'Única' ? 'Talla única' : 'Talla ' + t, 'h')).join('')}${td('Total', 'h')}</tr>
${x.fs.map(f => `<tr>${conFoto ? `<td style="${st.foto}">${minis.get(f) ? `<img src="${minis.get(f)}" width="48" height="48" alt="${esc(f.nombre)}" style="display:block;width:48px;height:48px;border:0;margin:0 auto;">` : '&nbsp;'}</td>` : ''}${td(f.nombre, 'lb')}${td(f.mo, 'l')}${td(f.co, 'l')}${x.ts.map(t => td(f.n[t] || '', 'n')).join('')}${td(total(f), 'nb')}</tr>`).join('')}
<tr>${td('Total', 'tl', fc + 3)}${x.ts.map(t => td(x.fs.reduce((a, f) => a + (f.n[t] || 0), 0) || '', 't')).join('')}${td(x.fs.reduce((a, f) => a + total(f), 0), 't')}</tr>
</table>`;
    };
    const html = `<div style="${FT}color:#111111;">
<p style="margin:0 0 2px 0;font-family:Calibri,Arial,Helvetica,sans-serif;font-size:20px;font-weight:bold;color:#0034DF;">C.D. Aznalcóllar Fútbol Base · Pedido al proveedor</p>
<p style="margin:0 0 14px 0;font-family:Calibri,Arial,Helvetica,sans-serif;font-size:14px;font-style:italic;color:#555555;">${sel.length === 1 ? '1 pedido' : sel.length + ' pedidos'} de familias · ${prendas === 1 ? '1 prenda' : prendas + ' prendas'} en total · ${hoy.getDate()}/${hoy.getMonth() + 1}/${hoy.getFullYear()}</p>
${secs.map(tabla).join('')}
<table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;"><tr>${td('Total de prendas', 'tl')}${td(prendas, 't')}</tr></table></div>`;
    /* Texto sin formato, por si el correo no admite tablas */
    const txt = ['C.D. Aznalcóllar Fútbol Base · Pedido al proveedor', ''].concat(...secs.map(x => [x.tit.toUpperCase(),
      ...x.fs.map(f => `${f.nombre}${f.mo ? ' · ' + f.mo : ''}${f.co ? ' · ' + f.co : ''}: ${x.ts.filter(t => f.n[t]).map(t => (t === 'Única' ? 'talla única' : 'talla ' + t) + ' × ' + f.n[t]).join(', ')} (total ${total(f)})`), ''])).concat('Total de prendas: ' + prendas).join('\n');
    const m = modal(`<h2 id="mdl-t">Copiar para el correo</h2>
      <p class="muted" style="margin:0">Toca “Copiar tabla” y pégala en el cuerpo del correo para el proveedor. Así se verá:</p>
      <div class="mail-prev" id="mailp">${html}</div>
      <button type="button" class="btn blue block" id="mail-copy">${ic('check')} Copiar tabla</button>`, 'dialog', () => {});
    m.el.classList.add('rqd');
    m.el.querySelector('#mail-copy').onclick = async () => {
      let ok = false;
      try {
        if (!window.ClipboardItem || !navigator.clipboard || !navigator.clipboard.write) throw 0;
        await navigator.clipboard.write([new ClipboardItem({ 'text/html': new Blob([html], { type: 'text/html' }), 'text/plain': new Blob([txt], { type: 'text/plain' }) })]); ok = true;
      } catch (_) {
        /* Si el navegador no deja escribir en el portapapeles, se selecciona la tabla y se copia */
        try { const box = m.el.querySelector('#mailp'), r = document.createRange(); r.selectNodeContents(box); const sl = getSelection(); sl.removeAllRanges(); sl.addRange(r); ok = document.execCommand('copy'); sl.removeAllRanges(); } catch (_) {}
      }
      if (!ok) return say('No se ha podido copiar. Mantén el dedo sobre la tabla, elige “Seleccionar todo” y luego “Copiar”.');
      m.close(false);
      marcarPedidos(sel, 'Tabla copiada. Pégala en el correo.');
    };
  }
  const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  const crc32 = b => { let c = 0xFFFFFFFF; for (let i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
  function zip(files) {
    const enc = new TextEncoder(), parts = [], cen = []; let off = 0;
    for (const [name, text] of files) {
      const nb = enc.encode(name), data = enc.encode(text), crc = crc32(data);
      const h = new DataView(new ArrayBuffer(30)); h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(6, 0x0800, true); h.setUint32(14, crc, true); h.setUint32(18, data.length, true); h.setUint32(22, data.length, true); h.setUint16(26, nb.length, true);
      const c = new DataView(new ArrayBuffer(46)); c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true); c.setUint16(8, 0x0800, true); c.setUint32(16, crc, true); c.setUint32(20, data.length, true); c.setUint32(24, data.length, true); c.setUint16(28, nb.length, true); c.setUint32(42, off, true);
      parts.push(h, nb, data); cen.push(c, nb); off += 30 + nb.length + data.length;
    }
    const size = cen.reduce((a, x) => a + (x.byteLength || x.length), 0), e = new DataView(new ArrayBuffer(22));
    e.setUint32(0, 0x06054b50, true); e.setUint16(8, files.length, true); e.setUint16(10, files.length, true); e.setUint32(12, size, true); e.setUint32(16, off, true);
    return new Blob([...parts, ...cen, e], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }
  const xe = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
  const col = i => { let s = ''; i++; while (i) { const m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = Math.floor((i - 1) / 26); } return s; };
  /* Estilos de la hoja con formato: índice del estilo (cellXfs) de cada tipo de celda */
  const XS = { h: 3, hl: 4, sec: 5, t: 6, tl: 7, n: 8, nb: 9, l: 10, lb: 11, title: 12, sub: 13 };
  /* Hoja con formato: celdas { v, s, span }. Los títulos y subtítulos no cuentan para el ancho de las columnas */
  function sheetXmlEstilo(rows) {
    const w = [], merges = [];
    rows.forEach(r => { let c = 0; r.forEach(x => { if (x.span === 1 && !['title', 'sub'].includes(x.s)) w[c] = Math.max(w[c] || 9, Math.min(40, String(x.v).length + 3)); c += x.span; }); });
    for (let i = 0; i < w.length; i++) w[i] = w[i] || 9;
    const body = rows.map((r, ri) => {
      let c = 0;
      const cells = r.map(x => {
        const ref = col(c) + (ri + 1), st = ` s="${XS[x.s] || 0}"`;
        let out = x.v === '' || x.v == null ? `<c r="${ref}"${st}/>` : typeof x.v === 'number' ? `<c r="${ref}"${st}><v>${x.v}</v></c>` : `<c r="${ref}" t="inlineStr"${st}><is><t xml:space="preserve">${xe(x.v)}</t></is></c>`;
        for (let k = 1; k < x.span; k++) out += `<c r="${col(c + k) + (ri + 1)}"${st}/>`;
        if (x.span > 1) merges.push(`${ref}:${col(c + x.span - 1) + (ri + 1)}`);
        c += x.span; return out;
      }).join('');
      const alto = r[0] && r[0].s === 'title' ? ' ht="26" customHeight="1"' : r[0] && ['sec', 'h', 'hl'].includes(r[0].s) ? ' ht="22" customHeight="1"' : '';
      return `<row r="${ri + 1}"${alto}>${cells}</row>`;
    }).join('');
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<sheetPr><pageSetUpPr fitToPage="1"/></sheetPr><sheetViews><sheetView workbookViewId="0" showGridLines="0"/></sheetViews>
<cols>${w.map((x, i) => `<col min="${i + 1}" max="${i + 1}" width="${x}" customWidth="1"/>`).join('')}</cols><sheetData>${body}</sheetData>
${merges.length ? `<mergeCells count="${merges.length}">${merges.map(m => `<mergeCell ref="${m}"/>`).join('')}</mergeCells>` : ''}
<pageMargins left="0.5" right="0.5" top="0.6" bottom="0.6" header="0.3" footer="0.3"/><pageSetup orientation="landscape" fitToWidth="1" fitToHeight="0"/></worksheet>`;
  }
  function xlsx(sheets) {
    const sheetXml = rows => {
      const txt = v => v && typeof v === 'object' ? String(v.m) + '  €' : String(v == null ? '' : v);
      const w = rows.reduce((a, r) => r.map((v, i) => Math.max(a[i] || 8, Math.min(50, txt(v).length + 2))), []);
      return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>
<cols>${w.map((x, i) => `<col min="${i + 1}" max="${i + 1}" width="${x}" customWidth="1"/>`).join('')}</cols><sheetData>${rows.map((r, ri) => `<row r="${ri + 1}">${r.map((v, ci) => {
        const ref = col(ci) + (ri + 1), money = v && typeof v === 'object', s = ri === 0 ? ' s="1"' : money ? ' s="2"' : '';
        if (money) v = v.m;
        return v === '' || v == null ? '' : typeof v === 'number' ? `<c r="${ref}"${s}><v>${v}</v></c>` : `<c r="${ref}" t="inlineStr"${s}><is><t xml:space="preserve">${xe(v)}</t></is></c>`; }).join('')}</row>`).join('')}</sheetData></worksheet>`;
    };
    return zip([
      ['[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>${sheets.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('')}</Types>`],
      ['_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`],
      ['xl/workbook.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${sheets.map(([n], i) => `<sheet name="${xe(n)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join('')}</sheets></workbook>`],
      ['xl/_rels/workbook.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sheets.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join('')}<Relationship Id="rId${sheets.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`],
      ['xl/styles.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><numFmts count="1"><numFmt numFmtId="164" formatCode="#,##0.00\\ &quot;€&quot;"/></numFmts>`
        + `<fonts count="6"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font>`
        + `<font><b/><sz val="12"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font><font><b/><sz val="16"/><color rgb="FF0034DF"/><name val="Calibri"/></font><font><i/><sz val="11"/><color rgb="FF555555"/><name val="Calibri"/></font></fonts>`
        + `<fills count="5"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF0034DF"/></patternFill></fill>`
        + `<fill><patternFill patternType="solid"><fgColor rgb="FF111111"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFFFC72C"/></patternFill></fill></fills>`
        + `<borders count="2"><border/><border><left style="thin"><color rgb="FFD5DCE8"/></left><right style="thin"><color rgb="FFD5DCE8"/></right><top style="thin"><color rgb="FFD5DCE8"/></top><bottom style="thin"><color rgb="FFD5DCE8"/></bottom><diagonal/></border></borders>`
        + `<cellStyleXfs count="1"><xf/></cellStyleXfs><cellXfs count="14"><xf/><xf fontId="1" fillId="2" applyFont="1" applyFill="1"/><xf numFmtId="164" applyNumberFormat="1"/>`
        + [[1, 2, 'center'], [1, 2, 'left'], [3, 3, 'left'], [2, 4, 'center'], [2, 4, 'left'], [0, 0, 'center'], [2, 0, 'center'], [0, 0, 'left'], [2, 0, 'left']]
          .map(([f, fi, al]) => `<xf fontId="${f}" fillId="${fi}" borderId="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="${al}" vertical="center"/></xf>`).join('')
        + `<xf fontId="4" applyFont="1"/><xf fontId="5" applyFont="1"/></cellXfs></styleSheet>`],
      ...sheets.map(([, rows, o], i) => [`xl/worksheets/sheet${i + 1}.xml`, o && o.estilo ? sheetXmlEstilo(rows) : sheetXml(rows)])
    ]);
  }

  window.FAMILY = FAMILY;
  window.inboxSeg = inboxSeg;
  window.bindInboxSeg = bindInboxSeg;
  window.boardInbox = boardInbox;
  window.famXlsx = xlsx;
  window.famInboxCount = () => famPend().length + pedNuevos().length;
})();
