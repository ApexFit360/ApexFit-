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
      head: add(N, hd, LEN.hd), elb: [], wri: [], kne: [], ank: [], toe: [],
      face: [0, -Math.sin(h), Math.cos(h)], axis: hd
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
    for (var k in J) { if (k === "face" || k === "axis") continue; var v = J[k]; if (typeof v[0] === "number") fn(v); else for (var i = 0; i < v.length; i++) fn(v[i]); }
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
  /* ---- realistic mannequin renderer ---- */
  var SKIN = [24, 46, 50], SHIRT = [38, 58, 46], SHORT = [225, 20, 19], SHOE = [40, 12, 88], HAIR = [24, 30, 11], METAL = [220, 8, 42];
  var PR = {
    thigh: [[0, .09], [.3, .083], [.7, .068], [1, .056]], shin: [[0, .056], [.22, .061], [.55, .05], [1, .034]],
    foot: [[0, .046], [1, .03]], uarm: [[0, .054], [.5, .05], [1, .042]], farm: [[0, .042], [.3, .044], [1, .031]],
    hand: [[0, .034], [1, .024]], neck: [[0, .055], [1, .05]], spine: [[0, .1], [.5, .115], [1, .1]], pelv: [[0, .095], [1, .095]], db: [[0, .018], [1, .018]]
  };
  function rad(p, t) { for (var i = 1; i < p.length; i++) if (t <= p[i][0]) { var a = p[i - 1], b = p[i]; return a[1] + (b[1] - a[1]) * (t - a[0]) / (b[0] - a[0]); } return p[p.length - 1][1]; }
  function hsl(c, dl) { return "hsl(" + c[0] + "," + c[1] + "%," + Math.max(4, Math.min(94, c[2] + dl)).toFixed(0) + "%)"; }
  function unit(a, b) { var x = a[0] - b[0], y = a[1] - b[1], z = a[2] - b[2], l = Math.sqrt(x * x + y * y + z * z) || 1; return [x / l, y / l, z / l]; }
  var LX = -.55, LY = -.83;

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

  function draw(ctx, W, H, dpr, J, cam, ext, anim, lite) {
    var i, S = cam.S;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    var P = function (p) { return proj(cam, p); };

    // floor mat
    var hz = ext.span / 2 + .45, mx = .55, mp = [[-mx, 0, ext.cz - hz], [mx, 0, ext.cz - hz], [mx, 0, ext.cz + hz], [-mx, 0, ext.cz + hz]].map(P);
    ctx.beginPath(); mp.forEach(function (p, k) { k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }); ctx.closePath();
    if (lite) ctx.fillStyle = "rgba(217,181,115,.09)";
    else { var mg = ctx.createLinearGradient(mp[0][0], mp[0][1], mp[2][0], mp[2][1]); mg.addColorStop(0, "rgba(217,181,115,.16)"); mg.addColorStop(1, "rgba(217,181,115,.05)"); ctx.fillStyle = mg; }
    ctx.fill(); ctx.strokeStyle = "rgba(217,181,115,.45)"; ctx.lineWidth = 1.5; ctx.stroke();

    // props
    (anim.props || []).forEach(function (pr) {
      if (pr.k === "wall") poly(ctx, cam, [[-.9, 0, pr.z], [.9, 0, pr.z], [.9, 2, pr.z], [-.9, 2, pr.z]], "rgba(255,255,255,.07)", "rgba(255,255,255,.25)");
      if (pr.k === "bench") box(ctx, cam, -.32, .32, 0, pr.h || .45, pr.z - .15, pr.z + .15);
    });

    // soft contact shadows
    var sp = [J.hc, J.ank[0], J.ank[1], J.toe[0], J.toe[1], J.wri[0], J.wri[1], J.head, J.kne[0], J.kne[1], J.neck];
    sp.forEach(function (p) {
      if (p[1] > .45) return;
      var q = P([p[0], 0, p[2]]), r = (.2 + p[1] * .3) * S * q[3], a = Math.max(0, .34 - p[1] * .6);
      if (lite) { ctx.fillStyle = "rgba(0,0,0," + (a * .6).toFixed(2) + ")"; ctx.beginPath(); ctx.arc(q[0], q[1], r * .7, 0, 6.2832); ctx.fill(); return; }
      var g = ctx.createRadialGradient(q[0], q[1], 0, q[0], q[1], r);
      g.addColorStop(0, "rgba(0,0,0," + a.toFixed(2) + ")"); g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(q[0], q[1], r, 0, 6.2832); ctx.fill();
    });

    function shade(z) { return (Math.max(0, Math.min(1, (z + 1) / 2)) - .5) * 16; }
    // tapered, shaded limb between projected points Pp->Qp over [t0,t1]
    function limb(Pp, Qp, prof, t0, t1, base, dl, hi) {
      var dx = Qp[0] - Pp[0], dy = Qp[1] - Pp[1], L = Math.sqrt(dx * dx + dy * dy), ax = L > .5 ? dx / L : 0, ay = L > .5 ? dy / L : 1, nx = -ay, ny = ax;
      var N = 5, left = [], right = [], k, t, x, y, f, r, rmax = 0;
      for (k = 0; k <= N; k++) {
        t = t0 + (t1 - t0) * k / N; x = Pp[0] + dx * t; y = Pp[1] + dy * t; f = Pp[3] + (Qp[3] - Pp[3]) * t; r = rad(prof, t) * S * f;
        if (r > rmax) rmax = r; left.push([x + nx * r, y + ny * r]); right.push([x - nx * r, y - ny * r]);
      }
      var x0 = Pp[0] + dx * t0, y0 = Pp[1] + dy * t0, x1 = Pp[0] + dx * t1, y1 = Pp[1] + dy * t1;
      var r0 = rad(prof, t0) * S * (Pp[3] + (Qp[3] - Pp[3]) * t0), r1 = rad(prof, t1) * S * (Pp[3] + (Qp[3] - Pp[3]) * t1);
      var sg = (nx * LX + ny * LY) >= 0 ? 1 : -1, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
      if (lite) ctx.fillStyle = hsl(base, dl);
      else {
        var g = ctx.createLinearGradient(cx + nx * sg * rmax, cy + ny * sg * rmax, cx - nx * sg * rmax, cy - ny * sg * rmax);
        g.addColorStop(0, hsl(base, dl + 15)); g.addColorStop(.45, hsl(base, dl)); g.addColorStop(1, hsl(base, dl - 22)); ctx.fillStyle = g;
      }
      ctx.beginPath(); ctx.moveTo(left[0][0], left[0][1]);
      for (k = 1; k <= N; k++) ctx.lineTo(left[k][0], left[k][1]);
      for (k = N; k >= 0; k--) ctx.lineTo(right[k][0], right[k][1]);
      ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.arc(x0, y0, r0, 0, 6.2832); ctx.fill();
      ctx.beginPath(); ctx.arc(x1, y1, r1, 0, 6.2832); ctx.fill();
      if (!lite && hi !== false) {
        ctx.strokeStyle = "rgba(255,236,205,.16)"; ctx.lineWidth = Math.max(1, rmax * .3);
        ctx.beginPath(); ctx.moveTo(x0 + nx * sg * rmax * .5, y0 + ny * sg * rmax * .5); ctx.lineTo(x1 + nx * sg * rmax * .5, y1 + ny * sg * rmax * .5); ctx.stroke();
      }
    }

    var items = [];
    function item(z, fn) { items.push({ z: z, f: fn }); }
    var pj = {
      hc: P(J.hc), mid: P(J.mid), neck: P(J.neck), head: P(J.head), hip: [P(J.hip[0]), P(J.hip[1])], sho: [P(J.sho[0]), P(J.sho[1])]
    };

    // torso: shorts pelvis, shirt, spine volume
    item((pj.hc[2] + pj.neck[2]) / 2, function () {
      var z = pj.mid[2], d = shade(z);
      limb(pj.hip[0], pj.hip[1], PR.pelv, 0, 1, SHORT, d, false);
      var ax = unit(J.sho[1], J.sho[0]), hx = unit(J.hip[1], J.hip[0]);
      var e = function (p, u, k) { return [p[0] + u[0] * k, p[1] + u[1] * k, p[2] + u[2] * k]; };
      var s0 = P(e(J.sho[0], ax, -.03)), s1 = P(e(J.sho[1], ax, .03)), h0 = P(e(J.hip[0], hx, -.03)), h1 = P(e(J.hip[1], hx, .03));
      var w0 = P(e(J.mid, ax, -.1)), w1 = P(e(J.mid, ax, .1));
      if (lite) ctx.fillStyle = hsl(SHIRT, d);
      else { var g = ctx.createLinearGradient(s0[0], s0[1], s1[0], s1[1]); g.addColorStop(0, hsl(SHIRT, d + (s0[0] < s1[0] ? 12 : -16))); g.addColorStop(1, hsl(SHIRT, d + (s0[0] < s1[0] ? -16 : 12))); ctx.fillStyle = g; }
      ctx.beginPath(); ctx.moveTo(s0[0], s0[1]); ctx.quadraticCurveTo(w0[0], w0[1], h0[0], h0[1]); ctx.lineTo(h1[0], h1[1]); ctx.quadraticCurveTo(w1[0], w1[1], s1[0], s1[1]); ctx.closePath(); ctx.fill();
      limb(pj.hc, pj.mid, PR.spine, 0, 1, SHIRT, d, false); limb(pj.mid, pj.neck, PR.spine, 0, 1, SHIRT, d, false);
      limb(pj.sho[0], pj.sho[1], [[0, .06], [1, .06]], 0, 1, SHIRT, d, false);
      if (!lite) { ctx.strokeStyle = "rgba(255,236,205,.14)"; ctx.lineWidth = Math.max(1, .02 * S); ctx.beginPath(); ctx.moveTo(w0[0], w0[1]); ctx.lineTo(s0[0], s0[1]); ctx.stroke(); }
    });
    // legs
    for (i = 0; i < 2; i++) (function (i) {
      var hp = pj.hip[i], kn = P(J.kne[i]), an = P(J.ank[i]), tp = P(J.toe[i]);
      item((hp[2] + kn[2]) / 2, function () { var d = shade((hp[2] + kn[2]) / 2); limb(hp, kn, PR.thigh, 0, 1, SKIN, d); limb(hp, kn, [[0, .097], [.55, .086], [1, .08]], 0, .5, SHORT, d); });
      item((kn[2] + an[2]) / 2, function () { limb(kn, an, PR.shin, 0, 1, SKIN, shade((kn[2] + an[2]) / 2)); });
      item((an[2] + tp[2]) / 2 + .02, function () { limb(an, tp, PR.foot, 0, 1, SHOE, shade(an[2]) * .5 + 2); });
    })(i);
    // arms
    for (i = 0; i < 2; i++) (function (i) {
      var sh = pj.sho[i], el = P(J.elb[i]), wr = P(J.wri[i]);
      var fd = unit(J.wri[i], J.elb[i]), hEnd = P([J.wri[i][0] + fd[0] * .085, J.wri[i][1] + fd[1] * .085, J.wri[i][2] + fd[2] * .085]);
      item((sh[2] + el[2]) / 2, function () { limb(sh, el, PR.uarm, 0, 1, SKIN, shade((sh[2] + el[2]) / 2)); });
      item((el[2] + wr[2]) / 2, function () { limb(el, wr, PR.farm, 0, 1, SKIN, shade((el[2] + wr[2]) / 2)); });
      item(wr[2] + .01, function () {
        limb(wr, hEnd, PR.hand, 0, 1, SKIN, shade(wr[2]) + 4);
        if (anim.db) {
          var w = J.wri[i], a = P([w[0] - .08, w[1], w[2]]), b = P([w[0] + .08, w[1], w[2]]);
          limb(a, b, PR.db, 0, 1, METAL, 6, false);
          limb(P([w[0] - .085, w[1], w[2]]), P([w[0] - .065, w[1], w[2]]), [[0, .05], [1, .05]], 0, 1, METAL, -6, false);
          limb(P([w[0] + .065, w[1], w[2]]), P([w[0] + .085, w[1], w[2]]), [[0, .05], [1, .05]], 0, 1, METAL, -6, false);
        }
      });
    })(i);
    // neck + head
    item(pj.neck[2] + .005, function () { limb(pj.neck, pj.head, PR.neck, 0, 1, SKIN, shade(pj.neck[2]) - 4, false); });
    item(pj.head[2] + .03, function () {
      var d = shade(pj.head[2]), f = pj.head[3] * S, ang = Math.atan2(pj.head[1] - pj.neck[1], pj.head[0] - pj.neck[0]);
      if (Math.abs(pj.head[1] - pj.neck[1]) + Math.abs(pj.head[0] - pj.neck[0]) < 2) ang = -Math.PI / 2;
      var rot = ang - Math.PI / 2, rx = .088 * f, ry = .108 * f;
      ctx.fillStyle = hsl(HAIR, d * .4); ctx.beginPath(); ctx.ellipse(pj.head[0], pj.head[1], rx, ry, rot, 0, 6.2832); ctx.fill();
      var fp = [J.head[0] + J.face[0] * .1, J.head[1] + J.face[1] * .1, J.head[2] + J.face[2] * .1], fq = P(fp), vis = Math.max(0, Math.min(1, (fq[2] - pj.head[2]) / .1));
      if (vis > .12) {
        var cp = P([J.head[0] + J.face[0] * .03, J.head[1] + J.face[1] * .03, J.head[2] + J.face[2] * .03]);
        ctx.fillStyle = hsl(SKIN, d + 8); ctx.beginPath(); ctx.ellipse(cp[0], cp[1], rx * (.4 + .5 * vis), ry * .86, rot, 0, 6.2832); ctx.fill();
        if (vis > .5) { ctx.fillStyle = hsl(SKIN, d + 14); ctx.beginPath(); ctx.arc(fq[0], fq[1], .017 * f, 0, 6.2832); ctx.fill(); }
      }
    });
    items.sort(function (a, b) { return a.z - b.z; });
    for (i = 0; i < items.length; i++) items[i].f();
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
      ApexAnim.draw(PS.ctx, PS.W, PS.H, PS.dpr, fr.J, cam, PS.tl.ext, PS.an, lite());
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
