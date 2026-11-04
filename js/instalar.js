/* Guía para instalar la app (familias). En el móvil, las familias solo usan la app instalada en la pantalla de inicio,
   sin la barra del navegador. Según el móvil y el navegador, enseña los pasos que tocan. En el ordenador se puede seguir. */
(function () {
  const ua = navigator.userAgent;
  const ios = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const android = /Android/i.test(ua);
  const movil = ios || android;
  const instalada = () => matchMedia('(display-mode: standalone)').matches || matchMedia('(display-mode: fullscreen)').matches || navigator.standalone === true;
  /* Navegadores dentro de otras apps (Instagram, Facebook, TikTok…): desde ahí no se puede instalar */
  const dentroDeApp = /FBAN|FBAV|FB_IAB|Instagram|Line\/|Twitter|TikTok|Snapchat|musical_ly|GSA\//i.test(ua);
  const safari = ios && /Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS|GSA\//i.test(ua) && !dentroDeApp;
  const ENLACE = 'https://jmbernalstudio.github.io/gestionazn/?familias';
  let aviso = null;
  addEventListener('beforeinstallprompt', e => { e.preventDefault(); aviso = e; const b = document.getElementById('in-go'); if (b) b.hidden = false; });
  addEventListener('appinstalled', () => { const t = document.getElementById('in-ok'); if (t) t.hidden = false; });

  const ico = { share: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12M8 7l4-4 4 4"/><path d="M6 11H5v10h14V11h-1"/></svg>',
    dots: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="5" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="12" cy="19" r="1.6"/></svg>',
    add: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="4"/><path d="M12 8v8M8 12h8"/></svg>',
    app: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="2.5" width="12" height="19" rx="3"/><path d="M10.5 18.5h3"/></svg>',
    copy: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/></svg>' };
  const paso = (n, icon, txt) => `<li><span class="in-n" aria-hidden="true">${n}</span><span class="in-i" aria-hidden="true">${icon}</span><span>${txt}</span></li>`;

  window.Instalar = {
    instalada, movil, ENLACE,
    puedeSeguir: () => instalada() || !movil,
    pantalla(box, seguir) {
      let pasos, cab;
      if (dentroDeApp || (ios && !safari)) {
        cab = ios ? 'Ábrela en Safari' : 'Ábrela en Chrome';
        pasos = paso(1, ico.copy, 'Toca <b>Copiar enlace</b> (aquí abajo).')
          + paso(2, ico.app, `Abre <b>${ios ? 'Safari' : 'Chrome'}</b>, pega el enlace en la barra de arriba y entra.`)
          + paso(3, ico.add, 'Allí te saldrán los pasos para instalarla.');
      } else if (ios) {
        cab = 'Instala la app en tu iPhone';
        pasos = paso(1, ico.share, 'Toca el botón <b>Compartir</b> (el cuadrado con una flecha).')
          + paso(2, ico.add, 'Baja y toca <b>Añadir a pantalla de inicio</b>.')
          + paso(3, '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>', 'Toca <b>Añadir</b>, arriba a la derecha.')
          + paso(4, ico.app, 'Cierra Safari y abre la app <b>GestiónAZN</b> desde su icono.');
      } else {
        cab = 'Instala la app en tu móvil';
        pasos = paso(1, ico.dots, 'Toca los <b>tres puntos</b> de arriba a la derecha.')
          + paso(2, ico.add, 'Toca <b>Instalar aplicación</b> o <b>Añadir a pantalla de inicio</b>. Si no aparece, toca primero <b>Abrir en Chrome</b>.')
          + paso(3, ico.app, 'Abre la app <b>GestiónAZN</b> desde su icono.');
      }
      box.innerHTML = `<main class="card stack inst" aria-labelledby="in-t">
        <img class="cr crest" src="${crestSm()}" alt="">
        <div><h1 id="in-t">${cab}</h1><p class="sub">Así la tendrás siempre a mano, como cualquier otra app</p></div>
        ${android && !dentroDeApp ? `<button type="button" class="btn blue block" id="in-go" ${aviso ? '' : 'hidden'}><svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg> Instalar la app</button>` : ''}
        <ol class="in-steps">${pasos}</ol>
        ${dentroDeApp || (ios && !safari) ? `<button type="button" class="btn blue block" id="in-copy">${ico.copy} Copiar enlace</button>` : ''}
        <p class="in-ok" id="in-ok" hidden>¡Instalada! Ahora ábrela desde el icono <b>GestiónAZN</b> de tu pantalla de inicio.</p>
        <button type="button" class="btn ghost block" id="in-back">Volver a la entrada</button>
      </main>`;
      const go = document.getElementById('in-go');
      if (go) go.onclick = async () => { if (!aviso) return; aviso.prompt(); const r = await aviso.userChoice.catch(() => ({})); aviso = null; go.hidden = true; if (r.outcome === 'accepted') document.getElementById('in-ok').hidden = false; };
      const cp = document.getElementById('in-copy');
      if (cp) cp.onclick = async () => { try { await navigator.clipboard.writeText(ENLACE); cp.textContent = 'Enlace copiado'; } catch (_) { prompt('Copia este enlace:', ENLACE); } };
      /* "Volver" deja elegir la entrada de entrenadores y junta */
      document.getElementById('in-back').onclick = () => { try { localStorage.setItem('entrada', 'staff'); } catch (_) {} location.href = location.pathname; };
      /* Si se instala y se vuelve aquí ya instalada, seguir */
      matchMedia('(display-mode: standalone)').addEventListener && matchMedia('(display-mode: standalone)').addEventListener('change', () => { if (instalada()) seguir(); });
    }
  };
})();
