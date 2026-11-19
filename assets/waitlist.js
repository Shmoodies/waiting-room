(function () {
  var S = Shmoodies;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* >>> PLACEHOLDER: the number on the next ticket. Swap for your real signup count + 1
     (most email tools can give you the list size), or remove the number from the ticket. */
  var NEXT_NUMBER = 48;

  /* ---------- Seats ---------- */
  var CAST = [
    { key: 'monday', say: 'I got here early. Not on purpose.', think: false, zz: true },
    { key: 'fine', say: 'Love a wait! Great wait. Really good wait.', think: false },
    { key: 'overthinking', say: 'Did they call 47? Was I 47? I’m not going to ask.', think: true }
  ];
  var chair = '<svg class="chair" viewBox="0 0 200 214" aria-hidden="true">' +
    '<path d="M28 8 h144 a26 26 0 0 1 26 26 v84 a18 18 0 0 1 -18 18 h-160 a18 18 0 0 1 -18 -18 v-84 a26 26 0 0 1 26 -26 z" fill="var(--seat)"/>' +
    '<path d="M36 18 h128 a18 18 0 0 1 18 18 v20" fill="none" stroke="var(--seat-l)" stroke-width="6" stroke-linecap="round" opacity=".8"/>' +
    '<path d="M10 140 q90 -18 180 0 v22 a14 14 0 0 1 -14 14 h-152 a14 14 0 0 1 -14 -14 z" fill="var(--seat-d)"/>' +
    '<path d="M18 146 q82 -14 164 0" fill="none" stroke="var(--seat)" stroke-width="5" stroke-linecap="round"/>' +
    '<rect x="88" y="176" width="24" height="38" fill="#8A929C"/></svg>';
  document.getElementById('seats').innerHTML = CAST.map(function (o) {
    var c = S.get(o.key);
    return '<div class="seat">' + chair +
      '<button class="pal" type="button" data-pick="' + o.key + '" aria-label="' + c.name + ' says: ' + o.say + '">' +
        '<span class="say' + (o.think ? ' think' : '') + '" aria-hidden="true">' + o.say + '</span>' +
        (o.zz ? '<span class="zz" aria-hidden="true">z</span>' : '') +
        '<img src="' + c.img + '" alt="" width="627" height="627">' +
      '</button>' +
      (o.key === 'fine' ? '<svg class="clip" viewBox="0 0 70 92" aria-hidden="true"><rect x="2" y="6" width="66" height="84" rx="5" fill="#B48D6A"/><rect x="8" y="14" width="54" height="70" rx="2" fill="#FFFDF5"/><rect x="24" y="2" width="22" height="10" rx="3" fill="#8A929C"/><text x="12" y="27" font-family="Nunito, sans-serif" font-weight="800" font-size="6.4" fill="#293A52">FEELINGS FORM</text><g font-family="Caveat, cursive" font-weight="700" font-size="11" fill="#293A52"><text x="12" y="44">☑ fine</text><text x="12" y="58">☑ fine</text><text x="12" y="72">☑ fine!!</text></g></svg>' : '') +
    '</div>';
  }).join('') +
  '<div class="seat">' + chair + '<button class="saved" type="button" data-take>saved for you<small>take a number to sit</small></button></div>';

  /* ---------- Clock: real local time ---------- */
  var hr = document.querySelector('.clock .hr'), mn = document.querySelector('.clock .mn'), sec = document.querySelector('.clock .sec');
  function tick() {
    var d = new Date(), s = d.getSeconds(), m = d.getMinutes() + s / 60, h = (d.getHours() % 12) + m / 60;
    hr.setAttribute('transform', 'rotate(' + h * 30 + ' 60 60)');
    mn.setAttribute('transform', 'rotate(' + m * 6 + ' 60 60)');
    sec.setAttribute('transform', 'rotate(' + s * 6 + ' 60 60)');
  }
  tick(); setInterval(tick, 1000);

  /* ---------- After the wordmark writes itself, each plushie says one thing ---------- */
  var pals = Array.prototype.slice.call(document.querySelectorAll('.pal'));
  if (!reduce) {
    var start = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--wm-end')) * 1000 + 600;
    pals.forEach(function (p, i) {
      setTimeout(function () { p.classList.add('talking'); }, start + i * 1500);
      setTimeout(function () { p.classList.remove('talking'); }, start + i * 1500 + 2300);
    });
  }
  // tap to talk on touch screens
  pals.forEach(function (p) {
    p.addEventListener('click', function () {
      pals.forEach(function (q) { if (q !== p) q.classList.remove('talking'); });
      p.classList.add('talking');
      clearTimeout(p._t); p._t = setTimeout(function () { p.classList.remove('talking'); }, 2600);
    });
  });

  /* ---------- Take a number ---------- */
  var dlg = document.getElementById('ticket-dlg'), ticket = document.getElementById('ticket');
  var num = String(NEXT_NUMBER).padStart(3, '0');
  document.getElementById('t-num').textContent = num;
  document.getElementById('ticket-field').value = num;
  document.getElementById('with').innerHTML = CAST.map(function (o) {
    var c = S.get(o.key), tint = { monday: 'var(--monday)', fine: 'var(--fine)', overthinking: 'var(--over)' }[o.key];
    return '<button type="button" data-pick="' + o.key + '" aria-pressed="false" style="--t:' + tint + '"><img src="' + c.img + '" alt="" width="627" height="627">' + c.name + '</button>';
  }).join('');
  var opener = null;
  function openTicket(from, key) {
    opener = from;
    if (key) S.select(key);
    dlg.showModal();
    if (reduce || !ticket.animate) return;
    var a = from.getBoundingClientRect(), b = ticket.getBoundingClientRect();
    var dx = a.left + a.width / 2 - (b.left + b.width / 2), dy = a.top + a.height / 2 - (b.top + b.height / 2);
    ticket.animate([
      { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(.18) rotate(-18deg)', opacity: .2 },
      { transform: 'translate(' + dx * .3 + 'px,' + (dy * .3 - 40) + 'px) scale(.8) rotate(6deg)', opacity: 1, offset: .6 },
      { transform: 'none', opacity: 1 }
    ], { duration: 620, easing: 'cubic-bezier(.3,.9,.3,1)' });
  }
  // any [data-take] opens the ticket; data-with pre-picks who you're sitting next to
  document.addEventListener('click', function (e) { var b = e.target.closest('[data-take]'); if (b) openTicket(b, b.getAttribute('data-with')); });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });     // click outside the ticket
  dlg.querySelectorAll('[data-close]').forEach(function (b) { b.addEventListener('click', function () { dlg.close(); }); });
  dlg.addEventListener('close', function () { if (opener) opener.focus(); });

  document.querySelector('[data-share]').addEventListener('click', function () {
    var text = 'I’m #' + num + ' in the Shmoodies waiting room. Take a number:';
    if (navigator.share) navigator.share({ title: 'Shmoodies', text: text, url: location.href }).catch(function () {});
    else if (navigator.clipboard) navigator.clipboard.writeText(text + ' ' + location.href).then(function () {
      var b = document.querySelector('[data-share]'); b.textContent = 'Link copied'; setTimeout(function () { b.textContent = 'Tell a friend'; }, 1800);
    });
  });


  var TINTS = { monday: 'var(--monday)', fine: 'var(--fine)', overthinking: 'var(--over)' };
  var KEYS = ['monday', 'fine', 'overthinking'];

  /* ---------- Sign-in sheet + mood files ---------- */
  document.getElementById('sheet-date').textContent = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
  var SHEET = {
    monday: ['6:58am', 'it’s monday'],
    fine: ['9:00 sharp!', 'nothing!! all good!!'],
    overthinking: ['8:12? 8:13?', 'not sure this is the right line']
  };
  var rows = document.getElementById('sheet-rows');
  rows.innerHTML = KEYS.map(function (k, i) {
    var c = S.get(k);
    return '<tr class="row"><td colspan="3"><button type="button" role="tab" id="tab-' + k + '" aria-controls="file" aria-selected="' + (i === 0) + '" tabindex="' + (i === 0 ? 0 : -1) + '" data-key="' + k + '" style="--t:' + TINTS[k] + '">' +
      '<span>' + c.name + '</span><span>' + SHEET[k][0] + '</span><span>' + SHEET[k][1] + '</span></button></td></tr>';
  }).join('') +
  '<tr class="row you"><td colspan="3"><button type="button" data-take><span>you?</span><span>now</span><span>here for the first drop</span></button></td></tr>' +
  '<tr class="blank"><td colspan="3"></td></tr><tr class="blank"><td colspan="3"></td></tr>';
  var fileEl = document.getElementById('file');
  function showFile(k, focus) {
    var c = S.get(k);
    rows.querySelectorAll('[role=tab]').forEach(function (t) {
      var on = t.getAttribute('data-key') === k;
      t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1;
      if (on && focus) t.focus();
    });
    fileEl.setAttribute('aria-labelledby', 'tab-' + k);
    fileEl.style.setProperty('--t', TINTS[k]);
    fileEl.innerHTML =
      '<div class="pic"><span class="tab">MOOD FILE #' + c.file + '</span><img src="' + c.img + '" alt="' + c.name + ' plush" width="627" height="627"></div>' +
      '<div class="body"><h3>' + c.name + '</h3><p class="line">' + c.igLine + '</p><dl>' +
        c.fileNotes.slice(0, 3).map(function (n) { return '<div><dt>' + n[0].toUpperCase() + '</dt><dd>' + n[1] + '</dd></div>'; }).join('') +
        '<div><dt>CURRENTLY</dt><dd class="hand">' + c.currently + '</dd></div></dl>' +
        '<button class="btn" type="button" data-take data-with="' + k + '">Sit next to ' + (k === 'fine' ? 'Fine' : c.name) + '</button></div>';
    fileEl.classList.remove('swap'); void fileEl.offsetWidth; if (!reduce) fileEl.classList.add('swap');
  }
  rows.addEventListener('click', function (e) { var t = e.target.closest('[role=tab]'); if (t) showFile(t.getAttribute('data-key')); });
  rows.addEventListener('keydown', function (e) {
    if (['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft'].indexOf(e.key) < 0) return;
    var cur = KEYS.indexOf(document.activeElement.getAttribute('data-key'));
    if (cur < 0) return;
    e.preventDefault();
    var n = (cur + (e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : -1) + KEYS.length) % KEYS.length;
    showFile(KEYS[n], true);
  });
  showFile('monday');

  /* ---------- Overheard: the group chat plays once when it comes into view ---------- */
  function face(k) { return '<span class="face" style="--t:' + TINTS[k] + '"><img src="' + S.get(k).img + '" alt=""></span>'; }
  document.getElementById('chat-faces').innerHTML = KEYS.map(face).join('');
  var now = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).toLowerCase().replace(/\s/g, '');
  var SCRIPT = [
    ['monday', 'how long have we been here'],
    ['fine', 'it’s only ' + now + '! great time to be anywhere!!'],
    ['overthinking', 'is that the real time or the clock-on-the-wall time'],
    ['overthinking', 'they’re different. i checked twice'],
    ['monday', 'i’ve been here since sunday night'],
    ['fine', 'love that for you'],
    ['overthinking', 'did everyone take a number? should i take another in case mine expires'],
    ['fine', 'i took three 🙂 just in case 🙂'],
    ['monday', 'wake me up when the doors open'],
    ['overthinking', '…', 'typing'],
    ['overthinking', 'nvm'],
    ['sys', 'Monday muted the chat']
  ];
  var msgs = document.getElementById('msgs');
  msgs.innerHTML = SCRIPT.map(function (m, i) {
    if (m[0] === 'sys') return '<div class="msg sys pending">' + m[1] + '</div>';
    var c = S.get(m[0]), same = i > 0 && SCRIPT[i - 1][0] === m[0] && SCRIPT[i - 1][2] !== 'typing';
    var body = m[2] === 'typing' ? '<span class="b" aria-label="Overthinking is typing"><i></i><i></i><i></i></span>' : '<span class="b">' + m[1] + '</span>';
    return '<div class="msg pending' + (same ? ' same' : '') + (m[2] === 'typing' ? ' typing' : '') + '" style="--t:' + TINTS[m[0]] + '">' + face(m[0]) +
      '<span><span class="who">' + (m[0] === 'fine' ? 'Fine' : c.name) + '</span>' + body + '</span></div>';
  }).join('');
  var msgEls = Array.prototype.slice.call(msgs.children);
  function playChat() {
    var t = 0;
    msgEls.forEach(function (el, i) {
      var isTyping = el.classList.contains('typing');
      t += i === 0 ? 0 : (isTyping ? 900 : (msgEls[i - 1].classList.contains('typing') ? 2600 : 950 + Math.min(900, el.textContent.length * 14)));
      setTimeout(function () {
        if (msgEls[i - 1] && msgEls[i - 1].classList.contains('typing')) msgEls[i - 1].remove();
        el.classList.remove('pending'); el.classList.add('pop');
      }, t);
    });
  }
  if (reduce) { msgEls.forEach(function (el) { if (el.classList.contains('typing')) el.remove(); else el.classList.remove('pending'); }); }
  else {
    var chatIO = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { chatIO.disconnect(); playChat(); } }, { threshold: .35 });
    chatIO.observe(document.getElementById('phone'));
  }

  /* ---------- While you wait: the quiz ---------- */
  var QUIZ = [
    ['Your alarm goes off. You…', [['monday', 'Snooze until it becomes a personality.'], ['fine', 'Get up, smile, announce it’s going to be a great day.'], ['overthinking', 'Check whether last night’s text was weird.']]],
    ['Someone texts “hey, can we talk?”', [['overthinking', 'Draft fourteen replies. Send none.'], ['monday', 'Mute it. Tomorrow’s problem.'], ['fine', '“Of course!! 😊” (it is not of course)']]],
    ['Your ideal weekend:', [['fine', 'Said yes to everything. It’s fine.'], ['overthinking', 'Replaying something I said on Thursday.'], ['monday', 'Horizontal.']]],
    ['Your inbox has 214 unread emails.', [['monday', 'Close the laptop. Gently.'], ['overthinking', 'Open one. Spiral. Close the laptop.'], ['fine', 'Inbox zero is a mindset!']]]
  ];
  var RESULT = {
    monday: 'Heavy lids, low battery, deeply committed to the snooze button. You two will get along by not talking until noon.',
    fine: 'Smiling through it, sweating slightly, absolutely holding it together. Mostly. You’ll keep each other going.',
    overthinking: 'Thirty-seven tabs open, all playing audio. You’ll understand each other completely, then worry about it.'
  };
  document.getElementById('questions').innerHTML = QUIZ.map(function (q, qi) {
    return '<fieldset class="q"><legend><span>' + (qi + 1) + '.</span>' + q[0] + '</legend><div class="opts">' +
      q[1].map(function (o, oi) {
        return '<label class="opt"><input type="radio" name="q' + qi + '" value="' + o[0] + '"' + (oi === 0 ? ' required' : '') + '><span class="box" aria-hidden="true"></span><span>' + o[1] + '</span></label>';
      }).join('') + '</div></fieldset>';
  }).join('');
  var quiz = document.getElementById('quiz'), need = document.getElementById('quiz-need'), result = document.getElementById('result');
  var quizKey = null;
  quiz.addEventListener('submit', function (e) {
    e.preventDefault();
    var tally = { monday: 0, fine: 0, overthinking: 0 }, last = null, missing = 0;
    QUIZ.forEach(function (q, qi) {
      var v = quiz.querySelector('input[name=q' + qi + ']:checked');
      if (!v) { missing++; return; }
      tally[v.value]++; last = v.value;
    });
    if (missing) { need.textContent = missing === 1 ? 'One question left. Take your time. Not too much time.' : missing + ' questions left. Take your time.'; return; }
    need.textContent = '';
    var best = KEYS.reduce(function (a, k) { return tally[k] > tally[a] || (tally[k] === tally[a] && k === last) ? k : a; }, KEYS[0]);
    quizKey = best;
    var c = S.get(best);
    result.style.setProperty('--t', TINTS[best]);
    document.getElementById('res-img').src = c.img;
    document.getElementById('res-img').alt = c.name + ' plush';
    document.getElementById('res-title').textContent = c.name + '.';
    document.getElementById('res-text').textContent = RESULT[best];
    document.getElementById('res-take').setAttribute('data-with', best);
    result.hidden = false;
    result.focus({ preventScroll: true });
    result.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
  });
  document.getElementById('res-share').addEventListener('click', function () {
    var c = S.get(quizKey), text = 'I’m sitting next to ' + c.name + ' in the Shmoodies waiting room. Who are you sitting next to?';
    var b = this;
    if (navigator.share) navigator.share({ title: 'Shmoodies', text: text, url: location.href }).catch(function () {});
    else if (navigator.clipboard) navigator.clipboard.writeText(text + ' ' + location.href).then(function () { b.textContent = 'Copied'; setTimeout(function () { b.textContent = 'Share my result'; }, 1800); });
  });

  /* ---------- Peekers: lean in from the edge as their section passes ---------- */
  var peekers = [['overheard', 'monday', 'left'], ['intake', 'overthinking', 'right'], ['notices', 'fine', 'left']].map(function (o) {
    var host = document.getElementById(o[0]), c = S.get(o[1]);
    host.insertAdjacentHTML('beforeend', '<div class="peek ' + o[2] + '" data-pick="' + o[1] + '" aria-hidden="true"><img src="' + c.img + '" alt="" width="627" height="627" loading="lazy"></div>');
    return { el: host.lastElementChild, host: host, dir: o[2] === 'left' ? -1 : 1 };
  });
  function ease(t) { return 1 - Math.pow(1 - t, 3); }
  function layoutPeekers() {
    peekers.forEach(function (pk) {
      var r = pk.host.getBoundingClientRect();
      if (r.bottom < -200 || r.top > innerHeight + 200) return;
      var c = (r.top + r.height * .62 - innerHeight / 2) / (innerHeight * .8);
      var show = ease(Math.max(0, Math.min(1, 1 - Math.abs(c) * 1.4)));
      pk.el.style.transform = 'translateX(' + (pk.dir * (115 - show * 72)).toFixed(2) + '%) rotate(' + (-pk.dir * (8 + show * 14)).toFixed(2) + 'deg)';
    });
  }
  if (!reduce) {
    var pt = false;
    addEventListener('scroll', function () { if (pt) return; pt = true; requestAnimationFrame(function () { layoutPeekers(); pt = false; }); }, { passive: true });
    layoutPeekers();
  }

  S.init();
})();
