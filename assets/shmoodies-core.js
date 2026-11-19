/* =====================================================================
   Shmoodies coming-soon page: shared core
   ---------------------------------------------------------------------
   index.html (the waiting room) loads this file. It holds:
     1. CONFIG      form endpoint and social links
     2. CHARACTERS  the three first-drop plushies: names, mood files, IMAGE PATHS
     3. Behaviors   picking who you sit next to, the waitlist form
   Edit copy and settings here and the page picks them up.
   ===================================================================== */
(function () {
  'use strict';

  // Folder this script lives in, so image paths work wherever the page sits
  var BASE = (function () {
    var s = document.currentScript;
    return s && s.src ? s.src.replace(/[^/]*$/, '') : 'assets/';
  })();

  /* -------------------------------------------------------------------
     1. CONFIG
     ------------------------------------------------------------------- */
  var CONFIG = {
    /* >>> CONNECT YOUR FORM ENDPOINT HERE <<<
       Leave empty to run in demo mode (shows success, saves nothing).

       Formspree:  'https://formspree.io/f/your-form-id'
                   Works as-is. Fields sent: email, favorite_character, ticket_number.

       Klaviyo / Mailchimp: point this at your own small webhook
                   (Zapier, Make, a serverless function) that forwards
                   to the list. Never put a private API key in this file.
                   Klaviyo's public client endpoint is an option too:
                   see submitWaitlist() below for where to change the body. */
    FORM_ENDPOINT: '',

    SOCIAL: {
      tiktok: 'https://www.tiktok.com/@shmoodies',      // confirm handle
      instagram: 'https://www.instagram.com/shmoodies.co/' // @shmoodies.co, per the Instagram profile plan
    }
  };

  /* -------------------------------------------------------------------
     2. CHARACTERS (first drop)
     >>> SWAP IN THE REAL IMAGE PATHS HERE <<<
     plush-1.png to plush-3.png in /assets are placeholders cut from the
     turnaround renders. Drop your transparent PNGs into /assets with the
     same names, or change `img` below.
     `file`, `igLine`, `fileNotes` and `currently` fill the mood files on
     the sign-in sheet (same wording as the Instagram mood-file posts).
     ------------------------------------------------------------------- */
  var CHARACTERS = [
    {
      key: 'monday',
      name: 'Monday',
      img: BASE + 'plush-3.png',
      file: '01',
      igLine: 'Already tired of tomorrow.',
      fileNotes: [['Alarm status', 'Snoozed four times. Considering a fifth.'], ['Meeting mode', 'Present. Camera off.'], ['Energy level', 'Ask again after coffee.'], ['Weekend plans', 'Thinking about Friday since Sunday.']],
      currently: 'Saving energy for later.'
    },
    {
      key: 'fine',
      name: 'Fine, I Guess',
      img: BASE + 'plush-2.png',
      file: '02',
      igLine: 'Yep. Totally fine.',
      fileNotes: [['Default reply', '“All good!!”'], ['Smile status', 'Working overtime.'], ['Dead giveaway', 'One very honest sweat drop.'], ['Emergency kit', 'One bandage. Zero backup plans.']],
      currently: 'Holding it together. Mostly.'
    },
    {
      key: 'overthinking',
      name: 'Overthinking',
      img: BASE + 'plush-1.png',
      file: '03',
      igLine: 'Still replaying that conversation.',
      fileNotes: [['Open tabs', '37. All playing audio.'], ['Text drafts', 'Seven versions of “sounds good.”'], ['Eye direction', 'One on what you said. One on what you meant.'], ['Bedtime thought', 'Was that weird in 2019?']],
      currently: 'Rehearsing a conversation that already happened.'
    }
  ];

  var STORE_KEY = 'shmoodies:favorite';
  var state = { favorite: null };

  function byKey(key) {
    for (var i = 0; i < CHARACTERS.length; i++) if (CHARACTERS[i].key === key) return CHARACTERS[i];
    return null;
  }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* -------------------------------------------------------------------
     3a. Squish: replays the page's `.is-squish` CSS animation on a click
     ------------------------------------------------------------------- */
  function squish(el) {
    if (!el || reduceMotion) return;
    el.classList.remove('is-squish');
    void el.offsetWidth; // reflow so the animation can replay
    el.classList.add('is-squish');
  }

  /* -------------------------------------------------------------------
     3b. Picking who you sit next to
     Any element with data-pick="<key>" selects that character.
     Hidden inputs named favorite_character get the character's name, and
     [data-pick] elements with aria-pressed are kept in sync.
     ------------------------------------------------------------------- */
  function select(key) {
    var c = byKey(key);
    if (!c) return;
    state.favorite = key;
    $all('input[name="favorite_character"]').forEach(function (i) { i.value = c.name; });
    $all('[data-pick]').forEach(function (b) {
      var on = b.getAttribute('data-pick') === key;
      if (b.hasAttribute('aria-pressed')) b.setAttribute('aria-pressed', on ? 'true' : 'false');
      b.classList.toggle('is-picked', on);
    });
    try { localStorage.setItem(STORE_KEY, key); } catch (e) { /* storage blocked: fine */ }
    document.dispatchEvent(new CustomEvent('shmoodies:select', { detail: { key: key, character: c } }));
  }

  function bindPickers(root) {
    $all('[data-pick]', root).forEach(function (el) {
      if (el.__shmBound) return;
      el.__shmBound = true;
      el.addEventListener('click', function () {
        squish(el);
        select(el.getAttribute('data-pick'));
      });
    });
  }

  /* -------------------------------------------------------------------
     3c. Waitlist form: form[data-waitlist]
       [data-form-error]    error message slot (role="alert")
       [data-form-success]  hidden block shown after a good submit; its
                            data-success-template gets {name} filled in
     ------------------------------------------------------------------- */
  function submitWaitlist(form) {
    var data = new FormData(form);
    if (!CONFIG.FORM_ENDPOINT) {
      // DEMO MODE: nothing is saved. Set CONFIG.FORM_ENDPOINT above.
      if (window.console) console.info('[Shmoodies] Demo mode, not sent:', Object.fromEntries(data.entries()));
      return new Promise(function (res) { setTimeout(res, 650); });
    }
    /* Formspree and most webhooks accept FormData + Accept: JSON.
       For Klaviyo's client API, replace the body with their JSON:API
       subscription payload and use your 6-character public key. */
    return fetch(CONFIG.FORM_ENDPOINT, {
      method: 'POST',
      body: data,
      headers: { Accept: 'application/json' }
    }).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); });
  }

  function initForms() {
    $all('form[data-waitlist]').forEach(function (form) {
      var email = form.querySelector('input[type="email"]');
      var err = form.querySelector('[data-form-error]');
      var btn = form.querySelector('button[type="submit"]');
      var label = btn ? btn.innerHTML : '';
      form.setAttribute('novalidate', '');

      if (email) email.addEventListener('input', function () {
        if (email.getAttribute('aria-invalid') === 'true' && email.validity.valid) {
          email.removeAttribute('aria-invalid');
          if (err) err.textContent = '';
        }
      });

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var v = email ? email.value.trim() : '';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) {
          if (err) err.textContent = v ? 'That email looks off. Try name@example.com.' : 'Add your email so we can call your number.';
          if (email) { email.setAttribute('aria-invalid', 'true'); email.focus(); }
          return;
        }
        if (err) err.textContent = '';
        if (btn) { btn.disabled = true; btn.textContent = 'Saving your seat…'; }
        form.classList.add('is-sending');

        submitWaitlist(form).then(function () {
          form.classList.remove('is-sending');
          form.classList.add('is-done');
          var done = form.querySelector('[data-form-success]');
          if (done) {
            var c = byKey(state.favorite);
            var tpl = c ? done.getAttribute('data-success-template') : done.getAttribute('data-success-default');
            var msg = done.querySelector('[data-success-text]');
            if (msg && tpl) msg.textContent = c ? tpl.replace(/\{name\}/g, c.name) : tpl;
            done.hidden = false;
            done.setAttribute('tabindex', '-1');
            done.focus({ preventScroll: true });
          }
          document.dispatchEvent(new CustomEvent('shmoodies:joined', { detail: { email: v, favorite: state.favorite } }));
        }).catch(function () {
          form.classList.remove('is-sending');
          if (btn) { btn.disabled = false; btn.innerHTML = label; }
          if (err) err.textContent = 'That didn’t go through. Check your connection and try again.';
        });
      });
    });
  }

  /* -------------------------------------------------------------------
     Init: call Shmoodies.init() after the page has rendered its markup
     ------------------------------------------------------------------- */
  function init() {
    bindPickers(document);
    initForms();
    $all('[data-social="tiktok"]').forEach(function (a) { a.href = CONFIG.SOCIAL.tiktok; });
    $all('[data-social="instagram"]').forEach(function (a) { a.href = CONFIG.SOCIAL.instagram; });
    $all('[data-year]').forEach(function (y) { y.textContent = new Date().getFullYear(); });
    var saved = null;
    try { saved = localStorage.getItem(STORE_KEY); } catch (e) { /* ignore */ }
    if (saved && byKey(saved)) select(saved);
  }

  window.Shmoodies = {
    CONFIG: CONFIG,
    CHARACTERS: CHARACTERS,
    get: byKey,
    select: select,
    squish: squish,
    init: init,
    get favorite() { return state.favorite; }
  };
})();
