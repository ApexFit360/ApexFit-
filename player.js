/* ApexFit 3D engine – pure math + canvas drawing (no dependencies) */
var ApexAnim = (function () {
  "use strict";
  var D = Math.PI / 180;
  var LEN = { t: .52, ua: .28, fa: .26, th: .43, sh: .42, ft: .17, hd: .17, sw: .19, pw: .09 };
  var RAD = { toe: .04, ank: .05, kne: .07, hip: .1, neck: .07, sho: .08, elb: .05, wri: .045, head: .1 };
  var HANDZ = .3;
  var SD = ["ua", "uab", "fa", "fab", "ul", "ulab", "ll", "llab", "ft"];
  var BASE = { t: 0, tl: 0, sp: 0, tw: 0, lift: 0, ua: 180, uab: 7, fa: 180, ul: 180, ulab: 3, ll: 180, ft: 90 };

  function pick(v, i) { return Array.isArray(v) ? v[i] : v; }
  // author-friendly pose -> flat number array
  function norm(p) {
    var m = {}, k;
    for (k in BASE) m[k] = BASE[k];
    for (k in p) m[k] = p[k];
    var src = { ua: m.ua, uab: m.uab, fa: m.fa, fab: m.fab !== undefined ? m.fab : m.uab, ul: m.ul, ulab: m.ulab, ll: m.ll, llab: m.llab !== undefined ? m.llab : m.ulab, ft: m.ft };
    var o = [m.t, m.tl, m.h !== undefined ? m.h : m.t, m.sp, m.tw, m.lift];
    for (var j = 0; j < SD.length; j++) { o.push(pick(src[SD[j]], 0)); o.push(pick(src[SD[j]], 1)); }
    return o;
  }
  function mirrorQ(q) {
    var o = q.slice(); o[1] = -q[1]; o[4] = -q[4];
    for (var j = 0; j < SD.length; j++) { var i = 6 + 2 * j; o[i] = q[i + 1]; o[i + 1] = q[i]; }
    return o;
  }
  function mirrorA(a) { return a === "ank0" ? "ank1" : a === "ank1" ? "ank0" : a; }

  function dirv(a, b, sg) { a *= D; b *= D; return [sg * Math.sin(b), Math.cos(b) * Math.cos(a), Math.cos(b) * Math.sin(a)]; }
  function add(p, v, l) { return [p[0] + v[0] * l, p[1] + v[1] * l, p[2] + v[2] * l]; }
  function ix(name, side) { return 6 + 2 * SD.indexOf(name) + side; }

  function fk(q) {
    var t = q[0] * D, tl = q[1] * D, h = q[2] * D, sp = q[3], tw = q[4] * D;
    var u = [Math.sin(tl), Math.cos(tl) * Math.cos(t), Math.cos(tl) * Math.sin(t)];
    var N = [u[0] * LEN.t, u[1] * LEN.t, u[2] * LEN.t];
    var M = [N[0] / 2, N[1] / 2 + Math.sin(t) * sp, N[2] / 2 - Math.cos(t) * sp];
    var cT = Math.cos(t), sT = Math.sin(t), cL = Math.cos(tl), sL = Math.sin(tl);
    var s0 = [cL, -sL * cT, -sL * sT];
    var cr = [u[1] * s0[2] - u[2] * s0[1], u[2] * s0[0] - u[0] * s0[2], u[0] * s0[1] - u[1] * s0[0]];
    var s = [Math.cos(tw) * s0[0] + Math.sin(tw) * cr[0], Math.cos(tw) * s0[1] + Math.sin(tw) * cr[1], Math.cos(tw) * s0[2] + Math.sin(tw) * cr[2]];
    var hd = [Math.sin(tl), Math.cos(tl) * Math.cos(h), Math.cos(tl) * Math.sin(h)];
    var J = {
      hc: [0, 0, 0], hip: [[-LEN.pw, 0, 0], [LEN.pw, 0, 0]], mid: M, neck: N,
      sho: [[N[0] - s[0] * LEN.sw, N[1] - s[1] * LEN.sw, N[2] - s[2] * LEN.sw], [N[0] + s[0] * LEN.sw, N[1] + s[1] * LEN.sw, N[2] + s[2] * LEN.sw]],
      head: add(N, hd, LEN.hd), elb: [], wri: [], kne: [], ank: [], toe: []
    };
    for (var i = 0; i < 2; i++) {
      var sg = i ? 1 : -1;
      var E = add(J.sho[i], dirv(q[ix("ua", i)], q[ix("uab", i)], sg), LEN.ua);
      var W = add(E, dirv(q[ix("fa", i)], q[ix("fab", i)], sg), LEN.fa);
      var K = add(J.hip[i], dirv(q[ix("ul", i)], q[ix("ulab", i)], sg), LEN.th);
      var A = add(K, dirv(q[ix("ll", i)], q[ix("llab", i)], sg), LEN.sh);
      var f = q[ix("ft", i)] * D;
      J.elb.push(E); J.wri.push(W); J.kne.push(K); J.ank.push(A);
      J.toe.push([A[0], A[1] + Math.cos(f) * LEN.ft, A[2] + Math.sin(f) * LEN.ft]);
    }
    return J;
  }
  function az(J, a) {
    switch (a) {
      case "ank0": return J.ank[0][2];
      case "ank1": return J.ank[1][2];
      case "hands": return (J.wri[0][2] + J.wri[1][2]) / 2 - HANDZ;
      case "hip": return 0;
      case "none": return 0;
      default: return (J.ank[0][2] + J.ank[1][2]) / 2;
    }
  }
  function each(J, fn) {
    for (var k in J) { var v = J[k]; if (typeof v[0] === "number") fn(v); else for (var i = 0; i < v.length; i++) fn(v[i]); }
  }
  function lerpQ(a, b, e) { var q = new Array(a.length); for (var i = 0; i < a.length; i++) q[i] = a[i] + (b[i] - a[i]) * e; return q; }
  function solve(qa, aa, qb, ab, e) {
    var q = lerpQ(qa, qb, e), J = fk(q);
    var dz = -((1 - e) * az(J, aa) + e * az(J, ab));
    var m = 1e9, v, i;
    function chk(p, r) { v = p[1] - r; if (v < m) m = v; }
    chk(J.head, RAD.head); chk(J.neck, RAD.neck); chk(J.hc, RAD.hip);
    for (i = 0; i < 2; i++) { chk(J.hip[i], RAD.hip); chk(J.sho[i], RAD.sho); chk(J.elb[i], RAD.elb); chk(J.wri[i], RAD.wri); chk(J.kne[i], RAD.kne); chk(J.ank[i], RAD.ank); chk(J.toe[i], RAD.toe); }
    var dy = -m + q[5];
    each(J, function (p) { p[1] += dy; p[2] += dz; });
    return J;
  }

  function ease(x) { return .5 - .5 * Math.cos(Math.PI * x); }
  function build(anim) {
    var steps = anim.steps.map(function (s, i) { return { c: s[0], q: norm(s[1]), a: s[1].anc || anim.anc || "feet", d: s[2], h: s[3], i: i }; });
    var seq = steps.slice();
    if (anim.alt) seq = seq.concat(steps.map(function (s) { return { c: s.c, q: mirrorQ(s.q), a: mirrorA(s.a), d: s.d, h: s.h, i: s.i }; }));
    var T = 0;
    seq.forEach(function (s) { s.t0 = T; T += s.d + s.h; });
    var tl = { seq: seq, T: T, anim: anim, n: steps.length };
    tl.ext = extents(tl);
    return tl;
  }
  function frame(tl, time) {
    var tau = time % tl.T, seq = tl.seq, n = seq.length, i = 0;
    while (i < n - 1 && tau >= seq[i + 1].t0) i++;
    var s = seq[i], prev = seq[(i + n - 1) % n], loc = tau - s.t0, J, e;
    if (loc < s.d) { e = ease(loc / s.d); J = solve(prev.q, prev.a, s.q, s.a, e); }
    else J = solve(s.q, s.a, s.q, s.a, 0);
    return { J: J, i: s.i };
  }
  function extents(tl) {
    var N = 64, maxY = 0, minZ = 1e9, maxZ = -1e9, pts = [], k;
    for (k = 0; k < N; k++) {
      var J = frame(tl, tl.T * k / N).J;
      each(J, function (p) { if (p[1] > maxY) maxY = p[1]; if (p[2] < minZ) minZ = p[2]; if (p[2] > maxZ) maxZ = p[2]; pts.push(p); });
    }
    var cz = (minZ + maxZ) / 2, r = 0;
    pts.forEach(function (p) { var d = Math.sqrt(p[0] * p[0] + (p[2] - cz) * (p[2] - cz)); if (d > r) r = d; });
    var A = tl.anim, props = A.props || [];
    props.forEach(function (pr) { if (pr.k === "bench") { r = Math.max(r, Math.abs(pr.z) + .3); } });
    return { maxY: Math.max(maxY + .12, .5), cz: cz, r: r + .1, span: maxZ - minZ };
  }

  /* ---------- drawing ---------- */
  function makeCam(ext, W, H, yaw) {
    var y = yaw * D, p = 13 * D;
    var S = Math.min(W * .47 / ext.r, H * .86 / ext.maxY) * .8;
    return { cyw: Math.cos(y), syw: Math.sin(y), cp: Math.cos(p), sp: Math.sin(p), D: 4, tx: 0, ty: ext.maxY / 2, tz: ext.cz, S: S, ox: W / 2, oy: H * .47 };
  }
  function proj(c, p) {
    var dx = p[0] - c.tx, dy = p[1] - c.ty, dz = p[2] - c.tz;
    var x1 = dx * c.cyw + dz * c.syw, z1 = -dx * c.syw + dz * c.cyw;
    var y2 = dy * c.cp - z1 * c.sp, z2 = dy * c.sp + z1 * c.cp, f = c.D / (c.D - z2);
    return [c.ox + x1 * f * c.S, c.oy - y2 * f * c.S, z2, f];
  }
  function col(k, z) {
    var t = Math.max(0, Math.min(1, (z + 1) / 2));
    if (k === "t") return "hsl(268,22%," + (30 + 22 * t).toFixed(0) + "%)";
    if (k === "m") return "hsl(220,8%," + (30 + 28 * t).toFixed(0) + "%)";
    if (k === "h") return "hsl(38,55%," + (62 + 18 * t).toFixed(0) + "%)";
    return "hsl(38,50%," + (46 + 30 * t).toFixed(0) + "%)";
  }
  function poly(ctx, c, pts, fill, stroke) {
    ctx.beginPath();
    pts.forEach(function (p, i) { var q = proj(c, p); if (i) ctx.lineTo(q[0], q[1]); else ctx.moveTo(q[0], q[1]); });
    ctx.closePath(); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1.2; ctx.stroke(); }
  }
  function box(ctx, c, x0, x1, y0, y1, z0, z1) {
    var faces = [
      [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0]], [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]],
      [[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]], [[x1, y0, z0], [x1, y0, z1], [x1, y1, z1], [x1, y1, z0]],
      [[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]]
    ];
    faces.forEach(function (f) { poly(ctx, c, f, "rgba(217,181,115,.10)", "rgba(217,181,115,.45)"); });
  }
  function draw(ctx, W, H, dpr, J, cam, ext, anim) {
    var i, S = cam.S;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    // mat
    var hz = ext.span / 2 + .45, mx = .55;
    poly(ctx, cam, [[-mx, 0, ext.cz - hz], [mx, 0, ext.cz - hz], [mx, 0, ext.cz + hz], [-mx, 0, ext.cz + hz]], "rgba(217,181,115,.07)", "rgba(217,181,115,.38)");
    // props
    (anim.props || []).forEach(function (pr) {
      if (pr.k === "wall") poly(ctx, cam, [[-.9, 0, pr.z], [.9, 0, pr.z], [.9, 2, pr.z], [-.9, 2, pr.z]], "rgba(255,255,255,.07)", "rgba(255,255,255,.25)");
      if (pr.k === "bench") box(ctx, cam, -.32, .32, 0, pr.h || .45, pr.z - .15, pr.z + .15);
    });
    // contact shadow
    ctx.beginPath();
    function sh(a, b) { var p = proj(cam, [a[0], 0, a[2]]), q = proj(cam, [b[0], 0, b[2]]); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); }
    sh(J.hc, J.neck);
    for (i = 0; i < 2; i++) { sh(J.hip[i], J.kne[i]); sh(J.kne[i], J.ank[i]); sh(J.sho[i], J.elb[i]); sh(J.elb[i], J.wri[i]); }
    ctx.strokeStyle = "rgba(0,0,0,.28)"; ctx.lineWidth = Math.max(4, .12 * S); ctx.stroke();
    // body segments
    var segs = [];
    function seg(a, b, r, k, dot) { var p = proj(cam, a), q = dot ? p : proj(cam, b); segs.push({ p: p, q: q, r: r, k: k, z: (p[2] + q[2]) / 2, dot: dot }); }
    for (i = 0; i < 2; i++) {
      seg(J.hip[i], J.kne[i], .078, "l"); seg(J.kne[i], J.ank[i], .057, "l"); seg(J.ank[i], J.toe[i], .036, "l");
      seg(J.sho[i], J.elb[i], .048, "a"); seg(J.elb[i], J.wri[i], .04, "a"); seg(J.wri[i], 0, .046, "h", true);
      if (anim.db) {
        var w = J.wri[i];
        seg([w[0] - .07, w[1], w[2]], [w[0] + .07, w[1], w[2]], .02, "m");
        seg([w[0] - .08, w[1], w[2]], [w[0] - .065, w[1], w[2]], .05, "m"); seg([w[0] + .065, w[1], w[2]], [w[0] + .08, w[1], w[2]], .05, "m");
      }
    }
    seg(J.hc, J.mid, .105, "t"); seg(J.mid, J.neck, .1, "t"); seg(J.hip[0], J.hip[1], .09, "t"); seg(J.sho[0], J.sho[1], .072, "t");
    seg(J.neck, J.head, .04, "a"); seg(J.head, 0, .105, "h", true);
    segs.sort(function (a, b) { return a.z - b.z; });
    for (i = 0; i < segs.length; i++) {
      var s = segs[i], f = (s.p[3] + s.q[3]) / 2, w2 = Math.max(2, 2 * s.r * S * f);
      if (s.dot) {
        ctx.beginPath(); ctx.arc(s.p[0], s.p[1], w2 / 2 + 1, 0, 6.2832); ctx.fillStyle = "rgba(0,0,0,.35)"; ctx.fill();
        ctx.beginPath(); ctx.arc(s.p[0], s.p[1], w2 / 2, 0, 6.2832); ctx.fillStyle = col(s.k, s.z); ctx.fill();
      } else {
        ctx.beginPath(); ctx.moveTo(s.p[0], s.p[1]); ctx.lineTo(s.q[0], s.q[1]);
        ctx.lineWidth = w2 + 2.5; ctx.strokeStyle = "rgba(0,0,0,.35)"; ctx.stroke();
        ctx.lineWidth = w2; ctx.strokeStyle = col(s.k, s.z); ctx.stroke();
      }
    }
  }

  return { norm: norm, mirrorQ: mirrorQ, fk: fk, solve: solve, build: build, frame: frame, makeCam: makeCam, draw: draw, LEN: LEN, RAD: RAD, SD: SD, HANDZ: HANDZ, BASE: BASE, each: each };
})();
if (typeof module !== "undefined") module.exports = ApexAnim;

/* ---------- 3D player UI ---------- */
(function () {
  if (typeof document === "undefined") return;
  var PS = { on: false };
  function lite() { return document.documentElement.classList.contains("lite"); }
  function listFor(ctx) {
    if (ctx === "day") return PROGRAMS[PROG].days[wsel][2].map(function (x) { return x[0]; });
    if (ctx === "lib") return Object.keys(EX);
    if (ctx === "yoga") return yr < 0 ? Object.keys(POSES) : ROUTINES[yr].p;
    return [];
  }
  function metaFor(ctx, key) {
    if (ctx !== "day") return "";
    var r = PROGRAMS[PROG].days[wsel][2].filter(function (x) { return x[0] === key; })[0];
    return r ? r[1] : "";
  }
  function setupCanvas() {
    var cv = $("cv"); if (!cv) return;
    var dpr = Math.min(window.devicePixelRatio || 1, lite() ? 1.5 : 2);
    PS.W = cv.clientWidth || 320; PS.H = cv.clientHeight || 300; PS.dpr = dpr;
    cv.width = Math.round(PS.W * dpr); cv.height = Math.round(PS.H * dpr);
    PS.ctx = cv.getContext("2d");
  }
  function show(type, key, list, ctx) {
    var A = (type === "ex" ? MOTIONS.ex : MOTIONS.yoga)[key];
    if (!A) { toast("Animation not available"); return; }
    stop();
    PS.type = type; PS.key = key; PS.list = list.length ? list : [key]; PS.ctx = ctx;
    PS.i = Math.max(0, PS.list.indexOf(key));
    PS.an = A; PS.tl = ApexAnim.build(A);
    PS.time = 0; PS.clock = 0; PS.playing = true; PS.speed = 1; PS.sway = true; PS.yawOff = 0; PS.cap = -1; PS.drag = false;
    var d = type === "ex" ? EX[key] : POSES[key];
    var title = type === "ex" ? d.n : d.e;
    var sub = type === "ex" ? d.m + (metaFor(ctx, key) ? " · " + metaFor(ctx, key) : "") : d.n + " · " + d.t;
    PS.steps = type === "ex" ? (d.h.match(/[^.]+\./g) || [d.h]).map(function (s) { return s.trim(); }) : d.s;
    var pos = PS.list.length > 1 ? " · " + (PS.i + 1) + "/" + PS.list.length : "";
    $("sheet").innerHTML =
      '<div class="row"><div><div class="eyebrow">3D guide' + pos + '</div><h2 class="serif" style="margin:2px 0;font-size:25px">' + esc(title) + '</h2><div class="mut small">' + esc(sub) + '</div></div><button class="x" data-act="close">✕</button></div>' +
      '<div class="stage"><canvas id="cv"></canvas><div class="cap" id="cap"></div><div class="hint">Drag to rotate</div></div>' +
      '<div class="ctl"><button class="cb" data-pa="prev" aria-label="Previous">⏮</button><button class="cb pri" id="pp" data-pa="play" aria-label="Pause">⏸</button><button class="cb" data-pa="next" aria-label="Next">⏭</button>' +
      '<span class="sp"></span><button class="chip" data-pa="spd" data-v=".5">0.5×</button><button class="chip on" data-pa="spd" data-v="1">1×</button><button class="chip" data-pa="spd" data-v="1.5">1.5×</button>' +
      '<button class="chip on" id="prot" data-pa="rot">🔄</button></div>' +
      '<ol class="stl" id="stl">' + PS.steps.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") + '</ol>';
    $("modal").classList.add("on");
    setupCanvas();
    var cv = $("cv");
    cv.addEventListener("pointerdown", function (e) { PS.drag = true; PS.lx = e.clientX; try { cv.setPointerCapture(e.pointerId); } catch (x) {} });
    cv.addEventListener("pointermove", function (e) { if (PS.drag) { PS.yawOff += (e.clientX - PS.lx) * .6; PS.lx = e.clientX; } });
    var up = function () { PS.drag = false; };
    cv.addEventListener("pointerup", up); cv.addEventListener("pointercancel", up);
    PS.on = true; PS.last = 0; PS.raf = requestAnimationFrame(loop);
  }
  function stop() { PS.on = false; if (PS.raf) cancelAnimationFrame(PS.raf); PS.raf = 0; }
  function loop(ts) {
    if (!PS.on) return;
    var dt = Math.min(.05, (ts - (PS.last || ts)) / 1000); PS.last = ts;
    PS.clock += dt; if (PS.playing) PS.time += dt * PS.speed;
    if (!document.hidden && PS.ctx) {
      var fr = ApexAnim.frame(PS.tl, PS.time);
      var yaw = PS.an.yaw + PS.yawOff + (PS.sway && !PS.drag ? 22 * Math.sin(PS.clock * .6) : 0);
      var cam = ApexAnim.makeCam(PS.tl.ext, PS.W, PS.H, yaw);
      ApexAnim.draw(PS.ctx, PS.W, PS.H, PS.dpr, fr.J, cam, PS.tl.ext, PS.an);
      if (fr.i !== PS.cap) {
        PS.cap = fr.i;
        var c = PS.tl.seq[fr.i].c, d = PS.type === "ex" ? null : POSES[PS.key];
        $("cap").textContent = c || (d ? d.s[fr.i] || "" : "");
        if (PS.type === "yoga") { var li = $("stl").children; for (var k = 0; k < li.length; k++) li[k].classList.toggle("on", k === fr.i); }
      }
    }
    PS.raf = requestAnimationFrame(loop);
  }
  function go2(n) { var j = (PS.i + n + PS.list.length) % PS.list.length; show(PS.type, PS.list[j], PS.list, PS.ctx); }
  document.addEventListener("click", function (e) {
    var el = e.target.closest("[data-pa]"); if (!el) return;
    e.preventDefault();
    var a = el.dataset.pa;
    if (a === "watch") { var ctx = el.dataset.ctx; show(el.dataset.ty, el.dataset.k, listFor(ctx), ctx); }
    else if (a === "play") { PS.playing = !PS.playing; el.textContent = PS.playing ? "⏸" : "▶"; }
    else if (a === "prev") go2(-1);
    else if (a === "next") go2(1);
    else if (a === "spd") { PS.speed = +el.dataset.v; document.querySelectorAll("[data-pa=spd]").forEach(function (b) { b.classList.toggle("on", b === el); }); }
    else if (a === "rot") { PS.sway = !PS.sway; el.classList.toggle("on", PS.sway); }
  });
  window.addEventListener("resize", function () { if (PS.on) setupCanvas(); });
  window.stopPlayer = stop;
})();
