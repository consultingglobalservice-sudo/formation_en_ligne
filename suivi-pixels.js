/* =====================================================================
   GSC Business Center — Suivi publicitaire (Pixel Meta + Pixel TikTok)
   Un seul endroit à modifier : les lignes de CONFIGURATION ci-dessous.
   ===================================================================== */

/* ---------- CONFIGURATION ---------- */
var GSC_CONFIG = {
  // Un ou plusieurs pixels Meta (un par compte publicitaire). Chaque événement est envoyé à TOUS.
  // Pour un 2e compte : remplacez VOTRE_ID_META_2 par son identifiant. Tant que ce n'est pas fait, il est ignoré.
  META_PIXEL_IDS:  ['980041125122959', '1568371944489330'],
  TIKTOK_PIXEL_ID: 'VOTRE_ID_TIKTOK',  // ex. 'CQ1ABCDEFGHIJKLMNOPQ' (TikTok Ads Manager > Événements)
  DEVISE:          'XOF'               // 'XOF' (FCFA). Si Meta/TikTok refusent le XOF, mettez 'EUR' : conversion auto.
};
/* ----------------------------------- */

(function (c) {
  function idValide(id) { return id && !/^VOTRE_/.test(id); }
  var metaIds = (c.META_PIXEL_IDS || (c.META_PIXEL_ID ? [c.META_PIXEL_ID] : [])).filter(function (id, i, a) {
    return idValide(id) && a.indexOf(id) === i;     // ignore les ID vides et les doublons
  });
  var metaActif = metaIds.length > 0;
  var tiktokActif = idValide(c.TIKTOK_PIXEL_ID);

  /* Code de base Meta (Facebook / Instagram) */
  if (metaActif) {
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
    document,'script','https://connect.facebook.net/en_US/fbevents.js');
    metaIds.forEach(function (id) { fbq('init', id); });   // un init par compte publicitaire
    fbq('track', 'PageView');                       // VISITE (envoyée à tous les pixels)
  }

  /* Code de base TikTok */
  if (tiktokActif) {
    !function (w, d, t) {
      w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script");n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
      ttq.load(c.TIKTOK_PIXEL_ID);
      ttq.page();                                   // VISITE
    }(window, document, 'ttq');
  }

  function montant(fcfa) {
    return c.DEVISE === 'EUR' ? Math.round(fcfa / 655.957 * 100) / 100 : fcfa;
  }

  /* Envoi d'un événement aux deux pixels.
     nom : 'ViewContent' | 'InitiateCheckout' | 'Purchase'
     f   : { id, nom, prix }  (prix en FCFA) */
  window.gscEvent = function (nom, f, options) {
    if (!f) return;
    var valeur = montant(f.prix || 0);
    var eventId = (options && options.eventId) || (nom + '-' + f.id + '-' + Date.now());

    if (metaActif && window.fbq) {
      fbq('track', nom, {
        content_ids: [f.id], content_name: f.nom, content_type: 'product',
        num_items: 1, value: valeur, currency: c.DEVISE
      }, { eventID: eventId });
    }
    if (tiktokActif && window.ttq) {
      var nomTikTok = { ViewContent: 'ViewContent', InitiateCheckout: 'InitiateCheckout', Purchase: 'CompletePayment' }[nom] || nom;
      ttq.track(nomTikTok, {
        contents: [{ content_id: f.id, content_name: f.nom, content_type: 'product', quantity: 1, price: valeur }],
        value: valeur, currency: c.DEVISE
      }, { event_id: eventId });
    }
  };
})(GSC_CONFIG);
