/* =========================================================
   Притяжение земли · Плато — скрипты
   ========================================================= */

/* ---------- Прелоадер ---------- */
window.addEventListener("load", () => {
  setTimeout(() => document.getElementById("preloader").classList.add("hide"), 600);
});

/* ---------- Свечение за курсором ---------- */
const glow = document.getElementById("cursor-glow");
window.addEventListener("pointermove", (e) => {
  glow.style.left = e.clientX + "px";
  glow.style.top = e.clientY + "px";
});

/* ---------- Прогресс прокрутки и навигация ---------- */
const progress = document.getElementById("scroll-progress");
const nav = document.getElementById("nav");
window.addEventListener("scroll", () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.width = (scrollY / max) * 100 + "%";
  nav.classList.toggle("scrolled", scrollY > 40);
});

/* ---------- Появление блоков при прокрутке ---------- */
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("visible");
    if (entry.target.classList.contains("idea-card")) startTyping();
    if (entry.target.classList.contains("graph-wrap")) startRunner();
    entry.target.querySelectorAll(".counter").forEach(countUp);
    observer.unobserve(entry.target);
  });
}, { threshold: 0.2 });
document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

/* ---------- Печатающийся текст главной мысли ---------- */
let typingStarted = false;
function startTyping() {
  if (typingStarted) return;
  typingStarted = true;
  const el = document.getElementById("typed");
  const text = el.dataset.text;
  let i = 0;
  const tick = () => {
    el.textContent = text.slice(0, ++i);
    if (i < text.length) setTimeout(tick, text[i - 1] === "." ? 350 : 32);
    else el.classList.add("done");
  };
  tick();
}

/* ---------- Своя версия главной мысли ---------- */
(function myIdeas() {
  const KEY = "plato-ideas";
  const form = document.getElementById("idea-form");
  const input = document.getElementById("idea-input");
  const nameEl = document.getElementById("idea-name");
  const list = document.getElementById("idea-list");
  const count = document.getElementById("idea-count");
  let editingId = null;

  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } };
  const save = (items) => { try { localStorage.setItem(KEY, JSON.stringify(items)); } catch {} };
  let items = load();

  function render() {
    list.innerHTML = "";
    items.forEach((it) => {
      const el = document.createElement("div");
      el.className = "idea-item";
      const p = document.createElement("p");
      p.textContent = "«" + it.text + "»";
      const who = document.createElement("div");
      who.className = "who";
      who.textContent = "— " + (it.name || "Гость") + " · " + new Date(it.id).toLocaleDateString("ru-RU");
      const actions = document.createElement("div");
      actions.className = "idea-actions";
      actions.innerHTML = '<button type="button" title="Изменить">✏️</button><button type="button" title="Удалить">✕</button>';
      const [editBtn, delBtn] = actions.children;
      editBtn.onclick = () => {
        editingId = it.id;
        input.value = it.text;
        nameEl.value = it.name;
        form.querySelector(".btn").textContent = "Сохранить изменения";
        updateCount();
        input.focus();
        form.scrollIntoView({ behavior: "smooth", block: "center" });
      };
      delBtn.onclick = () => {
        el.classList.add("removing");
        setTimeout(() => { items = items.filter((x) => x.id !== it.id); save(items); render(); }, 350);
      };
      el.append(p, who, actions);
      list.appendChild(el);
    });
  }

  function updateCount() { count.textContent = input.value.length + " / 300"; }
  input.addEventListener("input", updateCount);

  document.querySelectorAll(".chip").forEach((chip) =>
    chip.addEventListener("click", () => {
      input.value = chip.textContent;
      updateCount();
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
    })
  );

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (text.length < 3) {
      input.classList.remove("shake"); void input.offsetWidth; input.classList.add("shake");
      return;
    }
    const name = nameEl.value.trim();
    if (editingId) {
      const it = items.find((x) => x.id === editingId);
      if (it) { it.text = text; it.name = name; }
      editingId = null;
      form.querySelector(".btn").textContent = "Добавить мысль";
    } else {
      items.unshift({ id: Date.now(), text, name });
    }
    save(items);
    render();
    input.value = "";
    updateCount();
  });

  render();
})();

/* ---------- Галерея и просмотр на весь экран ---------- */
(function gallery() {
  const shots = [...document.querySelectorAll(".shot")];
  // если кадра kadr-N.jpg ещё нет — показываем заставку
  shots.forEach((s) => {
    const img = s.querySelector("img");
    const useFallback = () => {
      if (!img.dataset.fallback || img.src.endsWith(img.dataset.fallback)) return;
      img.src = img.dataset.fallback;
      if ("wide" in img.dataset) img.classList.add("wide"); // узкую картинку не обрезаем
    };
    img.addEventListener("error", useFallback);
    if (img.complete && img.naturalWidth === 0) useFallback();
  });

  const lb = document.getElementById("lightbox");
  const lbImg = document.getElementById("lb-img");
  const lbCap = document.getElementById("lb-cap");
  let index = 0;

  function show(i) {
    index = (i + shots.length) % shots.length;
    lbImg.src = shots[index].querySelector("img").src;
    lbCap.textContent = shots[index].querySelector("figcaption").textContent;
  }
  const open = (i) => { show(i); lb.classList.add("open"); lb.setAttribute("aria-hidden", "false"); };
  const close = () => { lb.classList.remove("open"); lb.setAttribute("aria-hidden", "true"); };

  shots.forEach((s, i) => s.addEventListener("click", () => open(i)));
  lb.querySelector(".lb-close").onclick = close;
  lb.querySelector(".lb-prev").onclick = (e) => { e.stopPropagation(); show(index - 1); };
  lb.querySelector(".lb-next").onclick = (e) => { e.stopPropagation(); show(index + 1); };
  lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
  document.addEventListener("keydown", (e) => {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") show(index - 1);
    if (e.key === "ArrowRight") show(index + 1);
  });
  // свайпы на телефоне
  let sx = 0;
  lb.addEventListener("touchstart", (e) => (sx = e.touches[0].clientX), { passive: true });
  lb.addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
  });
})();

/* ---------- Счётчик ---------- */
function countUp(el) {
  const to = +el.dataset.to;
  let n = 0;
  const step = () => {
    el.textContent = n;
    if (n++ < to) setTimeout(step, 400);
  };
  step();
}

/* ---------- Наклон карточек за мышкой (3D-эффект) ---------- */
document.querySelectorAll(".card").forEach((card) => {
  card.addEventListener("pointermove", (e) => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    card.style.transform = `perspective(700px) rotateY(${x * 18}deg) rotateX(${-y * 18}deg) translateZ(10px)`;
  });
  card.addEventListener("pointerleave", () => (card.style.transform = ""));
});

/* ---------- Флип-карточки по нажатию (для телефонов) ---------- */
document.querySelectorAll(".flip").forEach((f) =>
  f.addEventListener("click", () => f.classList.toggle("flipped"))
);

/* ---------- Шарик бежит по графику ---------- */
function startRunner() {
  const path = document.getElementById("curve");
  const runner = document.getElementById("runner");
  const len = path.getTotalLength();
  let t = 0;
  const loop = () => {
    t = (t + 0.0025) % 1;
    // на плато шарик "буксует" — замедляемся в середине
    const slow = t > 0.32 && t < 0.62 ? 0.35 : 1;
    t += 0.0025 * (slow - 1) * 0.9;
    const p = path.getPointAtLength(len * t);
    runner.setAttribute("cx", p.x);
    runner.setAttribute("cy", p.y);
    requestAnimationFrame(loop);
  };
  setTimeout(loop, 3500);
}

/* =========================================================
   3D №1 — главный экран: штанга и "гравитация"
   ========================================================= */
function initHero() {
  if (typeof THREE === "undefined") return; // нет интернета — сайт работает без 3D
  const canvas = document.getElementById("hero-canvas");
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 200);
  camera.position.set(0, 1, 14);

  scene.add(new THREE.AmbientLight(0xffffff, 0.45));
  const key = new THREE.PointLight(0xffb347, 1.4, 60);
  key.position.set(6, 8, 8);
  scene.add(key);
  const rim = new THREE.PointLight(0x7cf0c4, 1, 60);
  rim.position.set(-8, -4, 4);
  scene.add(rim);

  // Штанга
  const barbell = new THREE.Group();
  const metal = new THREE.MeshStandardMaterial({ color: 0xdddddd, metalness: 0.9, roughness: 0.25 });
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 9, 24), metal);
  bar.rotation.z = Math.PI / 2;
  barbell.add(bar);
  const plateColors = [0xff5e62, 0xffb347, 0x7cf0c4];
  [-1, 1].forEach((side) => {
    plateColors.forEach((c, i) => {
      const r = 1.5 - i * 0.3;
      const plate = new THREE.Mesh(
        new THREE.CylinderGeometry(r, r, 0.35, 40),
        new THREE.MeshStandardMaterial({ color: c, metalness: 0.3, roughness: 0.4 })
      );
      plate.rotation.z = Math.PI / 2;
      plate.position.x = side * (3.2 + i * 0.4);
      barbell.add(plate);
    });
    const lock = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.3, 20), metal);
    lock.rotation.z = Math.PI / 2;
    lock.position.x = side * 4.4;
    barbell.add(lock);
  });
  barbell.position.y = -1;
  scene.add(barbell);

  // Ступенчатое плато под штангой
  const steps = new THREE.Group();
  [[10, 0x2a1f5c], [7, 0x3a2b7a], [4.5, 0x4c3a99]].forEach(([w, c], i) => {
    const m = new THREE.Mesh(
      new THREE.CylinderGeometry(w, w + 0.4, 0.6, 8),
      new THREE.MeshStandardMaterial({ color: c, flatShading: true, roughness: 0.9 })
    );
    m.position.y = -4.3 + i * 0.6;
    steps.add(m);
  });
  scene.add(steps);

  // Частицы, которые падают — "притяжение земли"
  const COUNT = 900;
  const pos = new Float32Array(COUNT * 3);
  const speed = new Float32Array(COUNT);
  for (let i = 0; i < COUNT; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 40;
    pos[i * 3 + 1] = Math.random() * 30 - 10;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 30 - 5;
    speed[i] = 0.01 + Math.random() * 0.04;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({ color: 0xffd9a0, size: 0.08, transparent: true, opacity: 0.8 }));
  scene.add(particles);

  // Кольца вокруг
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(6.5, 0.04, 8, 120),
    new THREE.MeshBasicMaterial({ color: 0xff5e62, transparent: true, opacity: 0.5 })
  );
  ring.rotation.x = Math.PI / 2.3;
  scene.add(ring);

  let mx = 0, my = 0;
  window.addEventListener("pointermove", (e) => {
    mx = e.clientX / innerWidth - 0.5;
    my = e.clientY / innerHeight - 0.5;
  });

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.position.z = w < 700 ? 20 : 14;
    camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", resize);
  resize();

  const clock = new THREE.Clock();
  (function animate() {
    const t = clock.getElapsedTime();
    // Подъём: рывок вверх, зависание на "плато", дрожание и падение
    const cycle = t % 4;
    let y;
    if (cycle < 1) y = -1 + easeOut(cycle) * 3;               // подъём
    else if (cycle < 2.6) y = 2 + Math.sin(t * 30) * 0.04;   // плато — дрожит
    else y = 2 - easeIn((cycle - 2.6) / 1.4) * 3;            // опускание
    barbell.position.y = y;
    barbell.rotation.y = Math.sin(t * 0.5) * 0.4;
    barbell.rotation.z = cycle > 1 && cycle < 2.6 ? Math.sin(t * 9) * 0.03 : 0;

    const p = pGeo.attributes.position.array;
    for (let i = 0; i < COUNT; i++) {
      p[i * 3 + 1] -= speed[i];
      if (p[i * 3 + 1] < -12) p[i * 3 + 1] = 18;
    }
    pGeo.attributes.position.needsUpdate = true;

    ring.rotation.z = t * 0.3;
    steps.rotation.y = t * 0.1;
    camera.position.x += (mx * 4 - camera.position.x) * 0.05;
    camera.position.y += (1 - my * 3 - camera.position.y) * 0.05;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  })();
}
const easeOut = (x) => 1 - Math.pow(1 - x, 3);
const easeIn = (x) => x * x * x;

/* =========================================================
   3D №2 — мир плато: многоуровневая гора и шар
   ========================================================= */
function initPlateau() {
  if (typeof THREE === "undefined") return;
  const canvas = document.getElementById("plateau-canvas");
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x1a1440, 30, 70);
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 200);

  scene.add(new THREE.HemisphereLight(0xbfd8ff, 0x2a1f5c, 0.7));
  const sun = new THREE.DirectionalLight(0xffd29a, 1.1);
  sun.position.set(10, 20, 10);
  scene.add(sun);

  // Высота рельефа: три плоские ступени-плато, соединённые склонами
  const levels = [{ r: 14, h: 2 }, { r: 9, h: 5 }, { r: 4.5, h: 8.5 }];
  function heightAt(x, z) {
    const d = Math.hypot(x, z);
    let h = 0;
    levels.forEach(({ r, h: lh }, i) => {
      const prev = i === 0 ? 0 : levels[i - 1].h;
      const k = 1 - smooth((d - (r - 1.6)) / 1.6);
      h = Math.max(h, prev + (lh - prev) * k);
    });
    // немного неровностей у подножия
    if (d > 15) h += Math.sin(x * 0.6) * Math.cos(z * 0.5) * 0.4;
    return h;
  }
  const smooth = (x) => { x = Math.min(Math.max(x, 0), 1); return x * x * (3 - 2 * x); };

  const geo = new THREE.PlaneGeometry(50, 50, 120, 120);
  geo.rotateX(-Math.PI / 2);
  const v = geo.attributes.position;
  const colors = [];
  const c = new THREE.Color();
  for (let i = 0; i < v.count; i++) {
    const x = v.getX(i), z = v.getZ(i);
    const h = heightAt(x, z);
    v.setY(i, h);
    if (h > 8) c.set(0xfff1d6);       // вершина
    else if (h > 4.6) c.set(0xffb347); // второе плато
    else if (h > 1.8) c.set(0xff7a62); // первое плато
    else c.set(0x4c3a99);              // долина
    colors.push(c.r, c.g, c.b);
  }
  geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  const land = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.85 }));
  scene.add(land);

  // Флаг на вершине
  const flag = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.4), new THREE.MeshStandardMaterial({ color: 0xffffff }));
  pole.position.y = 1.2;
  const cloth = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.7, 10, 1), new THREE.MeshStandardMaterial({ color: 0x7cf0c4, side: THREE.DoubleSide }));
  cloth.position.set(0.55, 2, 0);
  flag.add(pole, cloth);
  flag.position.set(0, 8.5, 0);
  scene.add(flag);

  // Шар-путешественник
  const ball = new THREE.Mesh(
    new THREE.SphereGeometry(0.6, 32, 32),
    new THREE.MeshStandardMaterial({ color: 0x7cf0c4, emissive: 0x1f6b55, roughness: 0.3, metalness: 0.2 })
  );
  scene.add(ball);
  const ballLight = new THREE.PointLight(0x7cf0c4, 1, 8);
  scene.add(ballLight);

  // Звёзды
  const sGeo = new THREE.BufferGeometry();
  const sp = [];
  for (let i = 0; i < 600; i++) sp.push((Math.random() - 0.5) * 140, 15 + Math.random() * 40, (Math.random() - 0.5) * 140);
  sGeo.setAttribute("position", new THREE.Float32BufferAttribute(sp, 3));
  scene.add(new THREE.Points(sGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.25 })));

  // Управление камерой мышкой/пальцем
  let yaw = 0.6, pitch = 0.5, dragging = false, lx = 0, ly = 0, auto = true;
  canvas.addEventListener("pointerdown", (e) => { dragging = true; auto = false; lx = e.clientX; ly = e.clientY; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    yaw -= (e.clientX - lx) * 0.008;
    pitch = Math.min(Math.max(pitch + (e.clientY - ly) * 0.005, 0.15), 1.3);
    lx = e.clientX; ly = e.clientY;
  });
  canvas.addEventListener("pointerup", () => { dragging = false; setTimeout(() => (auto = true), 3000); });

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", resize);
  resize();

  // Маршрут шара: склон → плато (пауза) → склон → плато → вершина
  const levelEl = document.getElementById("level");
  const route = [
    { d: 22, dur: 0 }, { d: 15.5, dur: 2.2 },  // к первому склону
    { d: 12, dur: 1.4 }, { d: 9, dur: 2.5, plateau: 1 }, // подъём, плато 1
    { d: 7, dur: 1.4 }, { d: 4.6, dur: 2.5, plateau: 2 }, // подъём, плато 2
    { d: 2.6, dur: 1.4 }, { d: 0.8, dur: 2, plateau: 3 }, // вершина
  ];
  const total = route.reduce((s, r) => s + r.dur, 0) + 2;

  const clock = new THREE.Clock();
  (function animate() {
    const t = clock.getElapsedTime();
    let local = t % total, d = route[0].d, lvl = 1, onPlateau = false;
    for (let i = 1; i < route.length; i++) {
      const seg = route[i];
      if (local <= seg.dur) {
        const k = route[i].plateau ? local / seg.dur : smooth(local / seg.dur);
        d = route[i - 1].d + (seg.d - route[i - 1].d) * k;
        onPlateau = !!seg.plateau;
        lvl = seg.plateau || lvl;
        break;
      }
      local -= seg.dur;
      d = seg.d;
      lvl = seg.plateau || lvl;
    }
    const angle = t * 0.05;
    const bx = Math.cos(angle) * d, bz = Math.sin(angle) * d;
    const jitter = onPlateau ? Math.abs(Math.sin(t * 10)) * 0.3 : 0; // "буксует" на плато
    ball.position.set(bx, heightAt(bx, bz) + 0.6 + jitter, bz);
    ball.rotation.x -= 0.08;
    ballLight.position.copy(ball.position).y += 1;
    if (levelEl.textContent != lvl) levelEl.textContent = lvl;

    // флаг развевается
    const cp = cloth.geometry.attributes.position;
    for (let i = 0; i < cp.count; i++) cp.setZ(i, Math.sin(cp.getX(i) * 5 + t * 6) * 0.1 * (cp.getX(i) + 0.55));
    cp.needsUpdate = true;

    if (auto) yaw += 0.002;
    const R = 34;
    camera.position.set(Math.cos(yaw) * Math.cos(pitch) * R, Math.sin(pitch) * R + 2, Math.sin(yaw) * Math.cos(pitch) * R);
    camera.lookAt(0, 3, 0);
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  })();
}

initHero();
initPlateau();

/* =========================================================
   Мини-игра «Тренировка»
   ========================================================= */
(function game() {
  const kgEl = document.getElementById("kg");
  const fill = document.getElementById("meter-fill");
  const msg = document.getElementById("game-msg");
  const liftBtn = document.getElementById("lift");
  const changeBtn = document.getElementById("change");
  const barbell = document.getElementById("game-barbell");

  let kg = 20, limit = 60, fails = 0, breakthroughs = 0;
  const MAX = 200;

  function setKg(v) {
    kg = v;
    kgEl.textContent = kg;
    kgEl.classList.remove("bump"); void kgEl.offsetWidth; kgEl.classList.add("bump");
    fill.style.width = (kg / MAX) * 100 + "%";
  }

  liftBtn.addEventListener("click", () => {
    barbell.classList.remove("up", "fail");
    void barbell.offsetWidth;
    if (kg >= MAX) {
      msg.textContent = "Ты прошёл все плато! Земля отпустила штангу. 🌍✨";
      liftBtn.disabled = true;
      return;
    }
    if (kg < limit) {
      barbell.classList.add("up");
      setTimeout(() => barbell.classList.remove("up"), 700);
      setKg(kg + 10);
      msg.textContent = kg < limit ? "Отлично! Добавляем вес." : "Тяжело… Кажется, дальше будет сложнее.";
    } else {
      barbell.classList.add("fail");
      fails++;
      const phrases = ["Не идёт… Это и есть плато.", "Опять не вышло. Тянет к земле!", "Стоим на месте. Может, сменить подход?"];
      msg.textContent = phrases[Math.min(fails - 1, 2)];
      if (fails >= 3) changeBtn.disabled = false;
    }
  });

  changeBtn.addEventListener("click", () => {
    breakthroughs++;
    fails = 0;
    changeBtn.disabled = true;
    limit = Math.min(limit + 40, MAX);
    const ideas = ["Отдохнули и сменили технику — плато пройдено! 🎉", "Новая программа тренировок — снова растём! 🚀", "Учили друга и сами поняли ошибку — рывок! 🏆"];
    msg.textContent = ideas[(breakthroughs - 1) % ideas.length];
  });
})();
