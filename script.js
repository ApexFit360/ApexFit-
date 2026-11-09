/* ApexFit – script.js */
var $ = function (i) { return document.getElementById(i); };
var DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
var CATS = { workout: "🏋️", yoga: "🧘", meal: "🍽️", water: "💧", sleep: "😴", other: "⏰" };
function ld(k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
function sv(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
function pad(n) { return (n < 10 ? "0" : "") + n; }

/* ---------- state ---------- */
var todayStr = new Date().toDateString();
var DEFREM = [
  { id: 1, c: "water", t: "06:30", l: "Wake up and drink water", d: [0, 1, 2, 3, 4, 5, 6], on: 1 },
  { id: 2, c: "workout", t: "07:00", l: "Workout time", d: [0, 1, 2, 3, 4, 5, 6], on: 1 },
  { id: 3, c: "meal", t: "09:00", l: "Healthy breakfast", d: [0, 1, 2, 3, 4, 5, 6], on: 1 },
  { id: 4, c: "meal", t: "13:00", l: "Protein-rich lunch", d: [0, 1, 2, 3, 4, 5, 6], on: 1 },
  { id: 5, c: "yoga", t: "17:30", l: "Evening yoga", d: [0, 1, 2, 3, 4, 5, 6], on: 1 },
  { id: 6, c: "sleep", t: "22:30", l: "Wind down for sleep", d: [0, 1, 2, 3, 4, 5, 6], on: 1 }
];
var REM = ld("apexfit3_rem", null);
if (!REM || !REM.items) REM = { items: DEFREM, day: todayStr, done: {}, fired: {} };
if (REM.day !== todayStr) { REM.day = todayStr; REM.done = {}; REM.fired = {}; }
var PL = ld("apexfit3_plate", { day: todayStr, items: [] });
if (PL.day !== todayStr) PL = { day: todayStr, items: [] };
var GOAL = ld("apexfit3_goal", 2000), PROG = ld("apexfit3_prog", 0);
if (!PROGRAMS[PROG]) PROG = 0;
var WD = (new Date().getDay() + 6) % 7, wsel = WD;
var fcat = "All", fq = "", yr = -1, newDays = [0, 1, 2, 3, 4, 5, 6];
var dp = null, installed = false;
function saveRem() { sv("apexfit3_rem", REM); }
function savePl() { sv("apexfit3_plate", PL); }
function plateTotal() { return PL.items.reduce(function (a, i) { return a + DISHES[i][3]; }, 0); }
function todayItems() { var wd = new Date().getDay(); return REM.items.filter(function (x) { return x.on && x.d.indexOf(wd) > -1; }); }

/* ---------- ui helpers ---------- */
function toast(m) { var t = $("toast"); t.textContent = m; t.classList.add("on"); clearTimeout(toast.h); toast.h = setTimeout(function () { t.classList.remove("on"); }, 2200); }
function closeM() { if (typeof stopPlayer === "function") stopPlayer(); $("modal").classList.remove("on"); }
function go(v) {
  document.querySelectorAll(".view").forEach(function (s) { s.classList.toggle("active", s.id === v); });
  document.querySelectorAll("#nav button").forEach(function (b) { b.classList.toggle("on", b.dataset.v === v); });
  window.scrollTo(0, 0);
  if (v === "home") renderHome();
}
function ring(p, big, small) {
  var c = 2 * Math.PI * 34, o = c * (1 - Math.min(1, p));
  return '<div class="ring"><svg viewBox="0 0 80 80"><circle cx="40" cy="40" r="34" class="rb"/><circle cx="40" cy="40" r="34" class="rf" stroke-dasharray="' + c.toFixed(1) + '" stroke-dashoffset="' + o.toFixed(1) + '"/></svg><div class="rt"><b>' + big + '</b><small>' + small + '</small></div></div>';
}

/* ---------- home ---------- */
function renderHome() {
  var h = new Date().getHours(), g = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  var ti = todayItems(), dn = ti.filter(function (x) { return REM.done[x.id]; }).length;
  var kc = plateTotal(), pr = PROGRAMS[PROG], dy = pr.days[WD];
  var tip = TIPS[new Date().getDate() % TIPS.length];
  var html = '<p class="eyebrow">' + g + '</p>' +
    '<h1 class="hero">Elevate your<br><em>strength.</em></h1>' +
    '<p class="sub">' + new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" }) + '</p>' +
    '<div class="glass stats">' + ring(ti.length ? dn / ti.length : 0, dn + "/" + ti.length, "reminders") + ring(kc / GOAL, kc, "kcal today") + '</div>' +
    '<div class="glass"><div class="eyebrow">Today’s workout</div><h3 class="serif" style="font-size:24px;margin:6px 0 2px">' + esc(dy[1]) + '</h3>' +
    '<div class="mut small" style="margin-bottom:12px">' + esc(pr.n) + ' · ' + (dy[2].length ? dy[2].length + ' exercises' : 'Recovery') + '</div>' +
    '<button class="btn" data-act="go" data-v="work">Open workout</button></div>' +
    '<div class="tiles">' +
    '<button class="tile" data-act="go" data-v="food"><span>🍛</span><b>Calories</b></button>' +
    '<button class="tile" data-act="go" data-v="work"><span>🏋️</span><b>Workouts</b></button>' +
    '<button class="tile" data-act="go" data-v="yoga"><span>🧘</span><b>Yoga</b></button>' +
    '<button class="tile" data-act="go" data-v="remind"><span>⏰</span><b>Reminders</b></button></div>' +
    '<div class="glass"><div class="eyebrow">Daily tip</div><p style="margin:6px 0 0">' + esc(tip) + '</p></div>';
  var standalone = window.matchMedia && matchMedia("(display-mode: standalone)").matches;
  if (!installed && !standalone) {
    html += '<div class="glass"><b>📲 Install ApexFit</b><p class="mut small" style="margin:4px 0 10px">Add the app icon to your home screen.</p>' +
      '<button class="btn full" data-act="install">Install App</button>' +
      '<p class="mut small" id="ih" style="display:none;margin:10px 0 0">Tap the ⋮ menu in Chrome, then choose “Add to Home screen” and tap Install.</p></div>';
  }
  $("homeBox").innerHTML = html;
}

/* ---------- food ---------- */
function renderFood() {
  var kc = plateTotal(), pct = Math.min(100, Math.round(kc * 100 / GOAL));
  $("fsum").innerHTML = '<div class="row"><div><div class="mut small">Today</div><div class="big">' + kc + ' <small>/ ' + GOAL + ' kcal</small></div></div>' +
    '<label class="goal">Daily goal<input id="goal" class="in sm" type="number" min="800" max="6000" value="' + GOAL + '"></label></div><div class="bar"><i style="width:' + pct + '%"></i></div>';
  var cats = ["All", "Breakfast", "Main", "Snacks", "Sweets", "Drinks"];
  $("fcats").innerHTML = cats.map(function (c) { return '<button class="chip' + (c === fcat ? ' on' : '') + '" data-act="fcat" data-c="' + c + '">' + c + '</button>'; }).join("");
  renderFoodList(); renderPlate();
}
function renderFoodList() {
  var q = fq.toLowerCase().trim(), h = "";
  DISHES.forEach(function (d, i) {
    if ((fcat === "All" || d[1] === fcat) && d[0].toLowerCase().indexOf(q) > -1)
      h += '<button class="dish glass" data-act="dish" data-i="' + i + '"><span><b>' + esc(d[0]) + '</b><small>' + esc(d[2]) + '</small></span><span class="kc">' + d[3] + '<small> kcal</small></span></button>';
  });
  $("flist").innerHTML = h || '<p class="mut">No dish found.</p>';
}
function renderPlate() {
  var p = PL.items.map(function (i, n) { return '<div class="prow"><span>' + esc(DISHES[i][0]) + ' <small class="mut">· ' + DISHES[i][3] + ' kcal</small></span><button class="x" data-act="prm" data-i="' + n + '">✕</button></div>'; }).join("");
  $("plate").innerHTML = p ? p + '<button class="btn ghost full" style="margin-top:10px" data-act="pclr">Clear plate</button>' : '<p class="mut small" style="margin:0">Nothing added yet. Open a dish and tap “Add to today’s plate”.</p>';
}
function macro(n, g, t) { return '<div class="mac"><span>' + n + '</span><div class="bar sm"><i style="width:' + Math.round(g * 100 / t) + '%"></i></div><b>' + g + ' g</b></div>'; }
function openDish(i) {
  var d = DISHES[i], t = (d[4] + d[5] + d[6]) || 1;
  $("sheet").innerHTML = '<div class="row"><h2 class="serif" style="margin:0;font-size:26px">' + esc(d[0]) + '</h2><button class="x" data-act="close">✕</button></div>' +
    '<div class="mut small">' + esc(d[1]) + ' · ' + esc(d[2]) + '</div>' +
    '<div class="kbig">' + d[3] + '<small> kcal</small></div>' +
    '<div class="mut small">' + Math.round(d[3] * 100 / GOAL) + '% of your daily goal</div>' +
    macro("Protein", d[4], t) + macro("Carbs", d[5], t) + macro("Fat", d[6], t) +
    '<button class="btn full" style="margin-top:20px" data-act="padd" data-i="' + i + '">Add to today’s plate</button>';
  $("modal").classList.add("on");
}

/* ---------- workout ---------- */
function renderWork() {
  $("wprog").innerHTML = PROGRAMS.map(function (p, i) { return '<button class="chip' + (i === PROG ? ' on' : '') + '" data-act="prog" data-i="' + i + '">' + esc(p.n) + '</button>'; }).join("");
  var pr = PROGRAMS[PROG];
  $("wdays").innerHTML = pr.days.map(function (d, i) { return '<button class="chip' + (i === wsel ? ' on' : '') + (i === WD ? ' now' : '') + '" data-act="wday" data-i="' + i + '">' + d[0] + '</button>'; }).join("");
  var d = pr.days[wsel], h = '<div class="glass"><div class="eyebrow">' + esc(pr.n) + ' · ' + esc(pr.d) + '</div><h3 class="serif" style="font-size:24px;margin:6px 0 10px">' + esc(d[1]) + '</h3>';
  if (!d[2].length) h += '<p class="mut">Rest and recovery. Take a 20–30 minute walk, stretch, or try a gentle yoga routine.</p>';
  else {
    h += '<p class="mut small">Warm up for 5 minutes. Rest 30–60 seconds between sets.</p>';
    d[2].forEach(function (x, n) { var e = EX[x[0]]; h += '<details class="ex"><summary><span>' + (n + 1) + '. ' + esc(e.n) + '</span><button class="wb" data-pa="watch" data-ty="ex" data-k="' + x[0] + '" data-ctx="day">▶ 3D</button><b>' + esc(x[1]) + '</b></summary><p class="mut small"><em>' + esc(e.m) + '</em> — ' + esc(e.h) + '</p></details>'; });
  }
  $("wlist").innerHTML = h + '</div>';
}
function renderLib() {
  var h = '<div class="glass">';
  Object.keys(EX).forEach(function (k) { var e = EX[k]; h += '<details class="ex"><summary><span>' + esc(e.n) + '</span><button class="wb" data-pa="watch" data-ty="ex" data-k="' + k + '" data-ctx="lib">▶ 3D</button><b>' + esc(e.m) + '</b></summary><p class="mut small">' + esc(e.h) + '</p></details>'; });
  $("wlib").innerHTML = h + '</div>';
}
var tmr = null;
function stopTimer() { clearInterval(tmr); tmr = null; $("tdisp").textContent = "00:00"; }
function beep() { try { var C = window.AudioContext || window.webkitAudioContext, c = new C(), o = c.createOscillator(), g = c.createGain(); o.connect(g); g.connect(c.destination); o.frequency.value = 880; g.gain.value = 0.15; o.start(); setTimeout(function () { o.stop(); c.close(); }, 350); } catch (e) {} }
function startTimer(s) {
  clearInterval(tmr);
  var end = Date.now() + s * 1000;
  function u() {
    var r = Math.max(0, Math.round((end - Date.now()) / 1000));
    $("tdisp").textContent = pad(Math.floor(r / 60)) + ":" + pad(r % 60);
    if (r <= 0) { clearInterval(tmr); tmr = null; $("tdisp").textContent = "Go!"; beep(); try { navigator.vibrate && navigator.vibrate([300, 100, 300]); } catch (e) {} }
  }
  u(); tmr = setInterval(u, 250);
}

/* ---------- yoga ---------- */
function renderYoga() {
  var chips = '<button class="chip' + (yr < 0 ? ' on' : '') + '" data-act="yr" data-i="-1">All poses</button>';
  ROUTINES.forEach(function (r, i) { chips += '<button class="chip' + (yr === i ? ' on' : '') + '" data-act="yr" data-i="' + i + '">' + esc(r.n) + '</button>'; });
  $("yr").innerHTML = chips;
  var keys = yr < 0 ? Object.keys(POSES) : ROUTINES[yr].p, h = "";
  if (yr >= 0) h += '<div class="glass"><div class="eyebrow">' + esc(ROUTINES[yr].t) + ' routine</div><p style="margin:6px 0 0">' + esc(ROUTINES[yr].d) + ' Follow the poses in order.</p></div>';
  keys.forEach(function (k, n) {
    var p = POSES[k];
    h += '<details class="pose glass"><summary><span>' + (yr >= 0 ? (n + 1) + '. ' : '') + esc(p.e) + '<small>' + esc(p.n) + ' · ' + esc(p.t) + '</small></span><button class="wb" data-pa="watch" data-ty="yoga" data-k="' + k + '" data-ctx="yoga">▶ 3D</button></summary>' +
      '<p class="mut small" style="margin:0 0 8px"><b style="color:var(--gold2)">Benefits:</b> ' + esc(p.b) + '</p><ol>' + p.s.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join("") + '</ol></details>';
  });
  $("ylist").innerHTML = h;
}

/* ---------- reminders ---------- */
function renderRem() {
  REM.items.sort(function (a, b) { return a.t < b.t ? -1 : a.t > b.t ? 1 : 0; });
  var wd = new Date().getDay();
  var h = REM.items.map(function (x) {
    var tod = x.d.indexOf(wd) > -1, dn = REM.done[x.id];
    var days = x.d.length === 7 ? "Daily" : x.d.map(function (d) { return DAYS[d]; }).join(" ");
    return '<div class="rrow' + (dn ? ' done' : '') + '"><span class="e">' + CATS[x.c] + '</span><span class="tm">' + x.t + '</span><span class="lb"><b>' + esc(x.l) + '</b><small>' + days + '</small></span>' +
      (tod && x.on ? '<input type="checkbox" data-act="rdone" data-id="' + x.id + '"' + (dn ? ' checked' : '') + '>' : '') +
      '<button class="sw' + (x.on ? ' on' : '') + '" data-act="rtog" data-id="' + x.id + '" aria-label="Toggle"></button><button class="x" data-act="rdel" data-id="' + x.id + '">✕</button></div>';
  }).join("");
  $("rlist").innerHTML = h || '<p class="mut" style="margin:0">No reminders yet.</p>';
  $("dow").innerHTML = DAYS.map(function (d, i) { return '<button class="chip' + (newDays.indexOf(i) > -1 ? ' on' : '') + '" data-act="dow" data-i="' + i + '">' + d + '</button>'; }).join("");
}
function addRem() {
  var t = $("rt").value, l = $("rl").value.trim(), c = $("rc").value;
  if (!t || !l || !newDays.length) { toast("Enter a time, a name and at least one day"); return; }
  REM.items.push({ id: Date.now(), c: c, t: t, l: l, d: newDays.slice().sort(function (a, b) { return a - b; }), on: 1 });
  saveRem(); $("rl").value = ""; renderRem(); toast("Reminder added ✓");
}
function askNotif() {
  if (!("Notification" in window)) { toast("Notifications are not supported on this device"); return; }
  Notification.requestPermission().then(function (p) { toast(p === "granted" ? "Notifications enabled ✓" : "Permission denied"); });
}
function fire(x) {
  var b = $("ban"); b.textContent = CATS[x.c] + "  " + x.t + " · " + x.l; b.classList.add("on");
  try { navigator.vibrate && navigator.vibrate([200, 100, 200]); } catch (e) {}
  try {
    if ("Notification" in window && Notification.permission === "granted") {
      if (navigator.serviceWorker && navigator.serviceWorker.ready)
        navigator.serviceWorker.ready.then(function (r) { r.showNotification("ApexFit", { body: x.l, icon: "icon-192.png", badge: "icon-192.png", vibrate: [200, 100, 200] }); });
      else new Notification("ApexFit", { body: x.l });
    }
  } catch (e) {}
}
function tick() {
  var n = new Date(), hm = pad(n.getHours()) + ":" + pad(n.getMinutes());
  if (n.toDateString() !== REM.day) {
    todayStr = n.toDateString(); REM.day = todayStr; REM.done = {}; REM.fired = {}; PL = { day: todayStr, items: [] };
    saveRem(); savePl(); WD = (n.getDay() + 6) % 7; renderAll();
  }
  REM.items.forEach(function (x) {
    if (x.on && x.t === hm && x.d.indexOf(n.getDay()) > -1 && !REM.fired[x.id]) { REM.fired[x.id] = 1; saveRem(); fire(x); }
  });
}

/* ---------- about ---------- */
function calc() {
  var h = +$("ch").value, w = +$("cw").value, a = +$("ca").value, g = $("cg").value, act = +$("cact").value, o = $("cout");
  if (!h || !w || !a || h < 90 || h > 250 || w < 20 || w > 300) { o.textContent = "Please enter a valid height, weight and age."; return; }
  var m = h / 100, bmi = w / (m * m);
  var cat = bmi < 18.5 ? "Underweight" : bmi < 25 ? "Healthy range" : bmi < 30 ? "Overweight" : "Obese";
  var bmr = 10 * w + 6.25 * h - 5 * a + (g === "m" ? 5 : -161), tdee = Math.round(bmr * act);
  o.innerHTML = 'BMI: <b>' + bmi.toFixed(1) + '</b> (' + cat + ')<br>Healthy weight for your height: <b>' + (18.5 * m * m).toFixed(0) + '–' + (24.9 * m * m).toFixed(0) + ' kg</b><br>' +
    'Maintain weight: <b>' + tdee + ' kcal/day</b><br>Lose weight gently: <b>' + (tdee - 400) + ' kcal/day</b><br>Build muscle: <b>' + (tdee + 300) + ' kcal/day</b>' +
    '<br><span class="mut small">These are estimates, not medical advice.</span>';
}

/* ---------- events ---------- */
document.addEventListener("click", function (e) {
  if (e.target.id === "modal") { closeM(); return; }
  if (e.target.id === "ban") { e.target.classList.remove("on"); return; }
  var el = e.target.closest("[data-act]"); if (!el) return;
  var a = el.dataset.act, i = +el.dataset.i, id = el.dataset.id;
  switch (a) {
    case "go": go(el.dataset.v); break;
    case "dish": openDish(i); break;
    case "padd": PL.items.push(i); savePl(); closeM(); renderFood(); toast("Added to your plate ✓"); break;
    case "prm": PL.items.splice(i, 1); savePl(); renderFood(); break;
    case "pclr": PL.items = []; savePl(); renderFood(); break;
    case "fcat": fcat = el.dataset.c; renderFood(); break;
    case "prog": PROG = i; sv("apexfit3_prog", i); renderWork(); break;
    case "wday": wsel = i; renderWork(); break;
    case "timer": startTimer(+el.dataset.s); break;
    case "tstop": stopTimer(); break;
    case "yr": yr = i; renderYoga(); break;
    case "close": closeM(); break;
    case "rdone": REM.done[id] = el.checked; saveRem(); renderRem(); break;
    case "rtog": REM.items.forEach(function (x) { if (String(x.id) === id) x.on = x.on ? 0 : 1; }); saveRem(); renderRem(); break;
    case "rdel": REM.items = REM.items.filter(function (x) { return String(x.id) !== id; }); saveRem(); renderRem(); break;
    case "dow": var p = newDays.indexOf(i); if (p > -1) newDays.splice(p, 1); else newDays.push(i); renderRem(); break;
    case "radd": addRem(); break;
    case "notif": askNotif(); break;
    case "calc": calc(); break;
    case "install":
      if (dp) { dp.prompt(); dp = null; } else { var ih = $("ih"); if (ih) ih.style.display = "block"; }
      break;
  }
});
var sh;
$("fq").addEventListener("input", function () { fq = this.value; clearTimeout(sh); sh = setTimeout(renderFoodList, 120); });
document.addEventListener("change", function (e) {
  if (e.target.id === "goal") { var v = +e.target.value; if (v >= 800 && v <= 6000) { GOAL = v; sv("apexfit3_goal", v); } renderFood(); }
});
window.addEventListener("beforeinstallprompt", function (e) { e.preventDefault(); dp = e; });
window.addEventListener("appinstalled", function () { installed = true; renderHome(); });

/* ---------- start ---------- */
function renderAll() { renderHome(); renderFood(); renderWork(); renderLib(); renderYoga(); renderRem(); }
renderHome();
setTimeout(function () { renderFood(); renderWork(); renderLib(); renderYoga(); renderRem(); }, 30);
tick(); setInterval(tick, 15000);
function hideIntro() { var i = $("intro"); if (!i || i.classList.contains("out")) return; i.classList.add("out"); setTimeout(function () { i.remove(); }, 1000); }
$("intro").addEventListener("click", hideIntro);
setTimeout(hideIntro, 3000);
if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(function () {});
