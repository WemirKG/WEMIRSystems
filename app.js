/* WEMIR SOLUTIONS — app.js (no external deps) */

(function () {
  const $ = (q, el=document) => el.querySelector(q);
  const $$ = (q, el=document) => Array.from(el.querySelectorAll(q));

  // Year
  const year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());

  // Theme
  const themeBtn = $("#toggleTheme");
  const storedTheme = localStorage.getItem("wemir_theme");
  if (storedTheme) document.documentElement.setAttribute("data-theme", storedTheme);
  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const cur = document.documentElement.getAttribute("data-theme");
      const next = cur === "light" ? "" : "light";
      if (next) document.documentElement.setAttribute("data-theme", next);
      else document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("wemir_theme", next);
    });
  }

  // FX toggle (matrix rain)
  const fxBtn = $("#toggleFx");
  let fxEnabled = localStorage.getItem("wemir_fx") !== "off";
  if (fxBtn) {
    fxBtn.setAttribute("aria-pressed", String(fxEnabled));
    fxBtn.addEventListener("click", () => {
      fxEnabled = !fxEnabled;
      fxBtn.setAttribute("aria-pressed", String(fxEnabled));
      localStorage.setItem("wemir_fx", fxEnabled ? "on" : "off");
      const c = $("#matrixRain");
      if (c) c.style.display = fxEnabled ? "block" : "none";
    });
  }

  /* ---------------------------
     Matrix Rain (Hero Canvas)
  ----------------------------*/
  const canvas = $("#matrixRain");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    let w = 0, h = 0;
    let cols = 0;
    let drops = [];
    const chars = "アイウエオカキクケコサシスセソ0123456789WEMIR⟡SOLUTIONS";

    function resize() {
      const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      cols = Math.floor(w / 16);
      drops = new Array(cols).fill(0).map(() => Math.random() * h);
    }

    function step() {
      if (!fxEnabled) return requestAnimationFrame(step);

      ctx.fillStyle = "rgba(0,0,0,0.10)";
      ctx.fillRect(0, 0, w, h);

      for (let i = 0; i < cols; i++) {
        const x = i * 16;
        const y = drops[i];

        const ch = chars[Math.floor(Math.random() * chars.length)];
        // neon blend
        const g = 180 + Math.floor(Math.random() * 70);
        ctx.fillStyle = `rgba(0,${g},120,0.92)`;
        ctx.font = "14px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
        ctx.fillText(ch, x, y);

        drops[i] += 14 + Math.random() * 12;
        if (drops[i] > h && Math.random() > 0.975) drops[i] = 0;
      }

      requestAnimationFrame(step);
    }

    window.addEventListener("resize", resize);
    resize();
    if (!fxEnabled) canvas.style.display = "none";
    requestAnimationFrame(step);
  }

  /* ---------------------------
     Modal (Quick start)
  ----------------------------*/
  const modal = $("#modal");
  const closeModalBtn = $("#closeModal");
  const tierPreset = $("#tierPreset");
  const quickForm = $("#quickForm");

  function openModal(preset) {
    if (!modal) return;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    if (tierPreset) tierPreset.value = preset || "Standard Automation";
    const urlInput = quickForm?.elements?.url;
    if (urlInput) urlInput.focus();
  }
  function closeModal() {
    if (!modal) return;
    modal.hidden = true;
    document.body.style.overflow = "";
  }

  $$(".js-openModal").forEach(btn => {
    btn.addEventListener("click", () => openModal(btn.getAttribute("data-preset")));
  });

  if (closeModalBtn) closeModalBtn.addEventListener("click", closeModal);
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
    window.addEventListener("keydown", (e) => {
      if (!modal.hidden && e.key === "Escape") closeModal();
    });
  }

  if (quickForm) {
    quickForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(quickForm);
      const brief = makeBrief({
        brand: "Quick Start",
        url: String(data.get("url") || ""),
        contact: "",
        tier: String(data.get("tier") || ""),
        goal: String(data.get("goal") || ""),
        ai: "",
        tools: "",
        notes: ""
      });
      downloadText("WEMIR_QuickStart_Brief.txt", brief);
      closeModal();
    });
  }

  /* ---------------------------
     FAQ accordion
  ----------------------------*/
  const faq = $("#faq");
  if (faq) {
    $$(".faq__q", faq).forEach(btn => {
      btn.addEventListener("click", () => {
        const expanded = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", String(!expanded));
        const ans = btn.nextElementSibling;
        if (ans) ans.hidden = expanded;
      });
    });
  }

  /* ---------------------------
     Upgrade Builder
  ----------------------------*/
  const toolCount = $("#toolCount");
  const toolCountLabel = $("#toolCountLabel");
  const buildPlan = $("#buildPlan");
  const recTier = $("#recTier");
  const recWhy = $("#recWhy");
  const recSteps = $("#recSteps");

  const segState = { crm: "yes", fulfill: "no" };
  $$(".seg__btn").forEach(b => {
    b.addEventListener("click", () => {
      const seg = b.getAttribute("data-seg");
      const val = b.getAttribute("data-val");
      if (!seg || !val) return;
      segState[seg] = val;
      $$(`.seg__btn[data-seg="${seg}"]`).forEach(x => x.classList.remove("is-on"));
      b.classList.add("is-on");
    });
  });

  if (toolCount && toolCountLabel) {
    toolCountLabel.textContent = toolCount.value;
    toolCount.addEventListener("input", () => toolCountLabel.textContent = toolCount.value);
  }

  if (buildPlan) {
    buildPlan.addEventListener("click", () => {
      const goal = $("#goal") ? $("#goal").value : "leads";
      const n = toolCount ? parseInt(toolCount.value, 10) : 2;
      const wantsCrm = segState.crm === "yes";
      const wantsFulfill = segState.fulfill === "yes";

      // Scoring
      let score = 0;
      score += n >= 6 ? 3 : n >= 4 ? 2 : 1;
      score += wantsCrm ? 2 : 0;
      score += wantsFulfill ? 3 : 0;
      score += goal === "all" ? 3 : goal === "sales" ? 2 : 1;

      let tier = "Standard Automation";
      let why = "Balanced upgrades that automate lead flow and customer follow-up.";
      let steps = [
        "Audit your current site and conversion flow.",
        "Integrate AI tools for lead capture and routing.",
        "Add automation hooks for follow-up and tracking."
      ];

      if (score <= 4) {
        tier = "Basic Automation";
        why = "Start fast with 1–2 integrations that immediately improve lead capture and support.";
        steps = [
          "Baseline audit: pages, forms, and user journey.",
          "Integrate 1–2 AI tools (assistant and/or smart form).",
          "Connect basic tracking and handoff."
        ];
      } else if (score <= 7) {
        tier = "Standard Automation";
        why = "Strong ROI tier: CRM + follow-up automation with a clean conversion experience.";
        steps = [
          "Map your lead journey and friction points.",
          "Integrate 2–4 tools (forms + assistant + CRM hooks).",
          "Launch follow-up triggers and analytics events."
        ];
      } else if (score <= 10) {
        tier = "Advanced Automation";
        why = "Scaling tier: multi-step funnels, segmentation, dashboards, and richer workflows.";
        steps = [
          "Design funnel stages and segmentation logic.",
          "Integrate 4–7 tools + content/response pipelines.",
          "Ship tracking dashboard + optimization checklist."
        ];
      } else {
        tier = "Fully Automated";
        why = "End-to-end system: intake → workflow → delivery with a tuned AI assistant and hardening.";
        steps = [
          "Define your operations and automated handoffs.",
          "Implement secure automation architecture (upgrade-ready).",
          "Deliver documentation + training + continuous improvement plan."
        ];
      }

      if (recTier) recTier.textContent = tier;
      if (recWhy) recWhy.textContent = why;

      if (recSteps) {
        recSteps.innerHTML = "";
        steps.forEach(s => {
          const li = document.createElement("li");
          li.textContent = s;
          recSteps.appendChild(li);
        });
      }
    });
  }

  /* ---------------------------
     DEMOS: Skills Matrix
  ----------------------------*/
  const skillsTable = $("#skillsTable");
  const skillsApp = $("#skillsApp");
  if (skillsTable && skillsApp) {
    let employees = ["Avery", "Jordan", "Riley"];
    let skills = ["Customer Support", "SEO", "Automation", "Analytics"];
    let grid = {}; // key: emp|skill -> level 0..3

    const lvlLabel = (n) => ["0", "1", "2", "3"][n] || "0";
    const lvlChip = (n) => n === 0 ? "—" : n === 1 ? "Basic" : n === 2 ? "Strong" : "Expert";

    function render() {
      const thead = document.createElement("thead");
      const trh = document.createElement("tr");
      trh.innerHTML = `<th>Skill \\ Employee</th>` + employees.map(e => `<th>${escapeHtml(e)}</th>`).join("");
      thead.appendChild(trh);

      const tbody = document.createElement("tbody");
      skills.forEach(sk => {
        const tr = document.createElement("tr");
        const tds = employees.map(emp => {
          const key = `${emp}||${sk}`;
          const lvl = grid[key] ?? 0;
          const badge = `<span class="muted" style="font-weight:900">${lvlLabel(lvl)}</span> <span class="muted" style="font-size:12px">(${lvlChip(lvl)})</span>`;
          return `<td data-emp="${escapeHtml(emp)}" data-skill="${escapeHtml(sk)}" style="cursor:pointer">${badge}</td>`;
        }).join("");
        tr.innerHTML = `<td><strong>${escapeHtml(sk)}</strong></td>` + tds;
        tbody.appendChild(tr);
      });

      skillsTable.innerHTML = "";
      skillsTable.appendChild(thead);
      skillsTable.appendChild(tbody);
    }

    function cycle(emp, sk) {
      const key = `${emp}||${sk}`;
      const cur = grid[key] ?? 0;
      grid[key] = (cur + 1) % 4;
      render();
    }

    skillsTable.addEventListener("click", (e) => {
      const td = e.target.closest("td");
      if (!td) return;
      const emp = td.getAttribute("data-emp");
      const sk = td.getAttribute("data-skill");
      if (!emp || !sk) return;
      cycle(emp, sk);
    });

    $("#addSkill")?.addEventListener("click", () => {
      const name = prompt("New skill name?");
      if (name && name.trim()) { skills.push(name.trim()); render(); }
    });
    $("#addEmp")?.addEventListener("click", () => {
      const name = prompt("New employee name?");
      if (name && name.trim()) { employees.push(name.trim()); render(); }
    });
    $("#resetSkills")?.addEventListener("click", () => {
      employees = ["Avery", "Jordan", "Riley"];
      skills = ["Customer Support", "SEO", "Automation", "Analytics"];
      grid = {};
      render();
    });

    render();
  }

  /* ---------------------------
     DEMOS: Journey Flow (drag)
  ----------------------------*/
  const lane = $("#journeyLane");
  if (lane) {
    let stages = [
      { name: "Awareness", desc: "First impression and discovery." },
      { name: "Interest", desc: "Education and proof." },
      { name: "Consideration", desc: "Comparison and confidence." },
      { name: "Purchase", desc: "Decision and checkout." }
    ];

    function render() {
      lane.innerHTML = "";
      stages.forEach((s, idx) => {
        const el = document.createElement("div");
        el.className = "stage";
        el.draggable = true;
        el.dataset.idx = String(idx);
        el.innerHTML = `
          <p class="stage__name" contenteditable="true" spellcheck="false">${escapeHtml(s.name)}</p>
          <p class="stage__desc" contenteditable="true" spellcheck="false">${escapeHtml(s.desc)}</p>
        `;
        lane.appendChild(el);
      });
    }

    let dragIdx = null;
    lane.addEventListener("dragstart", (e) => {
      const st = e.target.closest(".stage");
      if (!st) return;
      dragIdx = parseInt(st.dataset.idx, 10);
      e.dataTransfer.setData("text/plain", st.dataset.idx);
    });

    lane.addEventListener("dragover", (e) => {
      e.preventDefault();
    });

    lane.addEventListener("drop", (e) => {
      e.preventDefault();
      const st = e.target.closest(".stage");
      if (!st) return;
      const dropIdx = parseInt(st.dataset.idx, 10);
      if (dragIdx === null || Number.isNaN(dropIdx)) return;
      const moved = stages.splice(dragIdx, 1)[0];
      stages.splice(dropIdx, 0, moved);
      dragIdx = null;
      render();
    });

    lane.addEventListener("input", () => {
      $$(".stage", lane).forEach((el) => {
        const idx = parseInt(el.dataset.idx, 10);
        const name = el.querySelector(".stage__name")?.textContent?.trim() || "";
        const desc = el.querySelector(".stage__desc")?.textContent?.trim() || "";
        if (stages[idx]) {
          stages[idx].name = name;
          stages[idx].desc = desc;
        }
      });
    });

    $("#addStage")?.addEventListener("click", () => {
      stages.push({ name: "New Stage", desc: "Describe the step..." });
      render();
    });
    $("#resetJourney")?.addEventListener("click", () => {
      stages = [
        { name: "Awareness", desc: "First impression and discovery." },
        { name: "Interest", desc: "Education and proof." },
        { name: "Consideration", desc: "Comparison and confidence." },
        { name: "Purchase", desc: "Decision and checkout." }
      ];
      render();
    });

    render();
  }

  /* ---------------------------
     DEMOS: Cloud Painter
  ----------------------------*/
  const sky = $("#sky");
  if (sky) {
    const ctx = sky.getContext("2d");
    const brushSel = $("#brush");
    const size = $("#bsize");
    const drift = [];

    function fitCanvas() {
      // keep internal resolution crisp
      const rect = sky.getBoundingClientRect();
      const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      sky.width = Math.floor(rect.width * dpr);
      sky.height = Math.floor(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      paintBackground();
    }

    function paintBackground() {
      const w = sky.clientWidth, h = sky.clientHeight;
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "rgba(0,240,255,0.18)");
      g.addColorStop(1, "rgba(57,255,20,0.10)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      // subtle sun glow
      ctx.beginPath();
      ctx.arc(w * 0.82, h * 0.22, 70, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,210,70,0.10)";
      ctx.fill();
    }

    function stamp(x, y, s, type) {
      drift.push({ x, y, s, type, vx: 0.12 + Math.random() * 0.25, a: 0.22 + Math.random() * 0.12 });
      drawCloud(x, y, s, type, 1);
    }

    function drawCloud(x, y, s, type, alpha) {
      ctx.save();
      ctx.globalAlpha = alpha;

      if (type === "flat") {
        ctx.fillStyle = "rgba(255,255,255,0.55)";
        roundRect(ctx, x - s*1.2, y - s*0.35, s*2.4, s*0.7, s*0.28);
        ctx.fill();
      } else if (type === "swirl") {
        ctx.strokeStyle = "rgba(255,255,255,0.52)";
        ctx.lineWidth = Math.max(2, s * 0.08);
        ctx.beginPath();
        ctx.arc(x, y, s*0.55, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x + s*0.65, y - s*0.12, s*0.42, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        // puff
        ctx.fillStyle = "rgba(255,255,255,0.58)";
        puff(x, y, s*0.56);
        puff(x - s*0.50, y + s*0.05, s*0.46);
        puff(x + s*0.50, y + s*0.02, s*0.48);
        puff(x, y + s*0.22, s*0.52);
      }

      ctx.restore();
    }

    function puff(x, y, r) {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    function tick() {
      paintBackground();
      const w = sky.clientWidth, h = sky.clientHeight;

      for (const c of drift) {
        c.x += c.vx;
        if (c.x - c.s * 2.2 > w) c.x = -c.s * 2.2;
        drawCloud(c.x, c.y, c.s, c.type, c.a);
      }

      requestAnimationFrame(tick);
    }

    function posFromEvent(e) {
      const rect = sky.getBoundingClientRect();
      const touch = e.touches?.[0];
      const clientX = touch ? touch.clientX : e.clientX;
      const clientY = touch ? touch.clientY : e.clientY;
      return {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    }

    let drawing = false;

    function down(e) {
      drawing = true;
      const p = posFromEvent(e);
      const s = parseInt(size?.value || "26", 10);
      const type = brushSel?.value || "puff";
      stamp(p.x, p.y, s, type);
      e.preventDefault();
    }

    function move(e) {
      if (!drawing) return;
      const p = posFromEvent(e);
      const s = parseInt(size?.value || "26", 10);
      const type = brushSel?.value || "puff";
      stamp(p.x, p.y, s, type);
      e.preventDefault();
    }

    function up() { drawing = false; }

    sky.addEventListener("mousedown", down);
    sky.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);

    sky.addEventListener("touchstart", down, { passive: false });
    sky.addEventListener("touchmove", move, { passive: false });
    window.addEventListener("touchend", up);

    $("#clearSky")?.addEventListener("click", () => {
      drift.length = 0;
      paintBackground();
    });

    $("#saveSky")?.addEventListener("click", () => {
      const a = document.createElement("a");
      a.download = "cloud_painter.png";
      a.href = sky.toDataURL("image/png");
      a.click();
    });

    window.addEventListener("resize", fitCanvas);
    // canvas is styled responsively; set a fixed CSS size and scale internal buffer
    // ensure initial paint
    paintBackground();
    requestAnimationFrame(tick);
  }

  /* ---------------------------
     DEMOS: Drum Kit (WebAudio)
  ----------------------------*/
  const padsEl = $("#pads");
  if (padsEl) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const ctx = AudioCtx ? new AudioCtx() : null;

    const pads = [
      { key: "A", name: "Kick", type: "kick" },
      { key: "S", name: "Snare", type: "snare" },
      { key: "D", name: "Closed Hat", type: "ch" },
      { key: "F", name: "Open Hat", type: "oh" },
      { key: "J", name: "Clap", type: "clap" },
      { key: "K", name: "Tom", type: "tom" },
      { key: "L", name: "Crash", type: "crash" },
      { key: ";", name: "Ride", type: "ride" }
    ];

    let recording = false;
    let recStart = 0;
    let events = [];

    function makePad(p) {
      const b = document.createElement("button");
      b.className = "pad";
      b.type = "button";
      b.dataset.key = p.key;
      b.dataset.type = p.type;
      b.innerHTML = `<div style="display:grid;gap:4px;place-items:center">
        <strong>${p.name}</strong>
        <span>${p.key}</span>
      </div>`;
      b.addEventListener("click", () => hit(p.type, p.key, b));
      return b;
    }

    pads.forEach(p => padsEl.appendChild(makePad(p)));

    function now() { return ctx ? ctx.currentTime : performance.now() / 1000; }

    function hit(type, key, el) {
      if (ctx && ctx.state === "suspended") ctx.resume();

      if (recording) {
        events.push({ t: (now() - recStart), type, key });
      }

      play(type);
      if (el) {
        el.classList.add("is-hit");
        setTimeout(() => el.classList.remove("is-hit"), 90);
      } else {
        const pEl = $(`.pad[data-key="${cssEscape(key)}"]`);
        if (pEl) {
          pEl.classList.add("is-hit");
          setTimeout(() => pEl.classList.remove("is-hit"), 90);
        }
      }
    }

    function play(type) {
      if (!ctx) return;

      const t0 = ctx.currentTime;
      const out = ctx.createGain();
      out.gain.value = 0.9;
      out.connect(ctx.destination);

      if (type === "kick") {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = "sine";
        o.frequency.setValueAtTime(150, t0);
        o.frequency.exponentialRampToValueAtTime(45, t0 + 0.12);
        g.gain.setValueAtTime(1, t0);
        g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.16);
        o.connect(g); g.connect(out);
        o.start(t0); o.stop(t0 + 0.18);
      }

      if (type === "snare") {
        noise(out, t0, 0.16, 1200);
        tone(out, t0, 190, 0.10, "triangle");
      }

      if (type === "ch") {
        noise(out, t0, 0.06, 6000);
      }

      if (type === "oh") {
        noise(out, t0, 0.22, 7000);
      }

      if (type === "clap") {
        noise(out, t0, 0.08, 2500, [0.0, 0.015, 0.03, 0.045]);
      }

      if (type === "tom") {
        tone(out, t0, 220, 0.16, "sine", true);
      }

      if (type === "crash") {
        noise(out, t0, 0.35, 9000);
      }

      if (type === "ride") {
        noise(out, t0, 0.22, 8000);
        tone(out, t0, 420, 0.08, "square");
      }

      // quick gain tail
      out.gain.setValueAtTime(0.95, t0);
      out.gain.exponentialRampToValueAtTime(0.001, t0 + 0.6);
    }

    function tone(out, t0, freq, dur, type, sweep=false) {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type || "sine";
      o.frequency.setValueAtTime(freq, t0);
      if (sweep) o.frequency.exponentialRampToValueAtTime(freq * 0.72, t0 + dur);
      g.gain.setValueAtTime(0.9, t0);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
      o.connect(g); g.connect(out);
      o.start(t0); o.stop(t0 + dur + 0.02);
    }

    function noise(out, t0, dur, hp=3000, multiHits=null) {
      const bufferSize = Math.floor(ctx.sampleRate * dur);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1);

      const src = ctx.createBufferSource();
      src.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = "highpass";
      filter.frequency.setValueAtTime(hp, t0);

      const g = ctx.createGain();
      g.gain.setValueAtTime(1, t0);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);

      src.connect(filter); filter.connect(g); g.connect(out);

      if (Array.isArray(multiHits)) {
        // layered quick hits for clap feel
        multiHits.forEach((dt) => {
          const s2 = ctx.createBufferSource();
          s2.buffer = buffer;
          const g2 = ctx.createGain();
          g2.gain.setValueAtTime(0.55, t0 + dt);
          g2.gain.exponentialRampToValueAtTime(0.001, t0 + dt + dur);
          s2.connect(filter);
          filter.connect(g2);
          g2.connect(out);
          s2.start(t0 + dt);
        });
      } else {
        src.start(t0);
      }
    }

    window.addEventListener("keydown", (e) => {
      const key = e.key.toUpperCase();
      const map = pads.find(p => p.key === key || (p.key === ";" && e.key === ";"));
      if (!map) return;
      hit(map.type, map.key, null);
    });

    const recBtn = $("#rec");
    const playBtn = $("#play");
    const clearBtn = $("#clearRec");

    if (recBtn) {
      recBtn.addEventListener("click", () => {
        recording = !recording;
        recBtn.textContent = recording ? "Stop" : "Record";
        if (recording) {
          events = [];
          recStart = now();
        }
      });
    }

    if (playBtn) {
      playBtn.addEventListener("click", async () => {
        if (!ctx) return;
        if (ctx.state === "suspended") await ctx.resume();
        if (!events.length) return;

        const tStart = ctx.currentTime + 0.05;
        events.forEach(ev => {
          setTimeout(() => {
            const el = $(`.pad[data-key="${cssEscape(ev.key)}"]`);
            hit(ev.type, ev.key, el);
          }, Math.floor(ev.t * 1000));
        });
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        events = [];
      });
    }
  }

  /* ---------------------------
     Intake brief generator
  ----------------------------*/
  const intakeForm = $("#intakeForm");
  const dlBtn = $("#downloadBrief");
  const emailBtn = $("#emailBrief");
  let lastBriefText = "";

  // prefill tier from query string (?tier=...)
  const tierSelect = $("#tierSelect");
  if (tierSelect) {
    const params = new URLSearchParams(location.search);
    const t = params.get("tier");
    if (t) {
      const opts = Array.from(tierSelect.options);
      const found = opts.find(o => o.textContent.toLowerCase().includes(t.toLowerCase()));
      if (found) tierSelect.value = found.value;
    }
  }

  if (intakeForm) {
    intakeForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(intakeForm);
      const brief = makeBrief({
        brand: String(data.get("brand") || ""),
        url: String(data.get("url") || ""),
        contact: String(data.get("contact") || ""),
        tier: String(data.get("tier") || ""),
        goal: String(data.get("goal") || ""),
        ai: String(data.get("ai") || ""),
        tools: String(data.get("tools") || ""),
        notes: String(data.get("notes") || "")
      });

      lastBriefText = brief;
      if (dlBtn) dlBtn.disabled = false;
      if (emailBtn) {
        emailBtn.setAttribute("aria-disabled", "false");
        emailBtn.href = makeMailto(brief);
      }

      // store draft
      localStorage.setItem("wemir_last_brief", brief);
      alert("Brief generated. Download it or email it now.");
    });
  }

  if (dlBtn) {
    dlBtn.addEventListener("click", () => {
      const brief = lastBriefText || localStorage.getItem("wemir_last_brief") || "";
      if (!brief) return;
      downloadText("WEMIR_Intake_Brief.txt", brief);
    });
  }

  /* ---------------------------
     Helpers
  ----------------------------*/
  function makeMailto(briefText) {
    const subject = encodeURIComponent("WEMIR SOLUTIONS — AI Upgrade Brief");
    const body = encodeURIComponent(briefText.slice(0, 8000)); // mailto limits vary
    return `mailto:?subject=${subject}&body=${body}`;
  }

  function makeBrief({ brand, url, contact, tier, goal, ai, tools, notes }) {
    const date = new Date().toISOString().slice(0, 10);
    return [
      "WEMIR SOLUTIONS — AI WEBSITE UPGRADE BRIEF",
      "=========================================",
      `Date: ${date}`,
      "",
      `Brand: ${brand || "(not provided)"}`,
      `Website: ${url || "(not provided)"}`,
      `Best contact: ${contact || "(not provided)"}`,
      `Desired tier: ${tier || "(not provided)"}`,
      "",
      "GOAL",
      "----",
      `${goal || "(not provided)"}`,
      "",
      "AI ASSISTANCE NEEDS",
      "-------------------",
      `${ai || "(not provided)"}`,
      "",
      "TOOLS / INTEGRATIONS REQUESTED",
      "------------------------------",
      `${tools || "(not provided)"}`,
      "",
      "NOTES / CONSTRAINTS",
      "-------------------",
      `${notes || "(not provided)"}`,
      "",
      "WEMIR RECOMMENDED NEXT STEPS",
      "----------------------------",
      "1) Audit current UX, forms, and conversion path.",
      "2) Confirm tool stack and data routing (CRM, email, analytics).",
      "3) Implement integrations with secure key handling (backend if needed).",
      "4) Test end-to-end: capture → follow-up → reporting.",
      "5) Deliver documentation and handoff instructions.",
      ""
    ].join("\n");
  }

  function downloadText(filename, text) {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function escapeHtml(s) {
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function cssEscape(s) {
    return String(s).replace(/["\\]/g, "\\$&");
  }

  function roundRect(ctx, x, y, w, h, r) {
    const rr = Math.min(r, w/2, h/2);
    ctx.beginPath();
    ctx.moveTo(x+rr, y);
    ctx.arcTo(x+w, y, x+w, y+h, rr);
    ctx.arcTo(x+w, y+h, x, y+h, rr);
    ctx.arcTo(x, y+h, x, y, rr);
    ctx.arcTo(x, y, x+w, y, rr);
    ctx.closePath();
  }
})();
  /* ---------------------------
     EVENT INTAKE (vendor page)
  ----------------------------*/
  const eventForm = $("#eventIntakeForm");
  const dlIntake = $("#downloadIntake");
  const emailIntake = $("#emailIntake");
  const copyIntake = $("#copyIntake");
  const clearDraft = $("#clearDraft");

  function buildEventIntakeText(payload) {
    const date = new Date().toISOString().slice(0, 10);
    const lookingFor = (payload.lookingFor && payload.lookingFor.length)
      ? payload.lookingFor.join(", ")
      : "(not provided)";

    return [
      "WEMIR SOLUTIONS — EVENT INTAKE",
      "===============================",
      `Date: ${date}`,
      "",
      `Name: ${payload.name || "(not provided)"}`,
      `Business: ${payload.business || "(not provided)"}`,
      `Phone: ${payload.phone || "(not provided)"}`,
      `Email: ${payload.email || "(not provided)"}`,
      `Website: ${payload.website || "(not provided)"}`,
      `Location: ${payload.location || "(not provided)"}`,
      "",
      `How they found us: ${payload.source || "(not provided)"}`,
      `Looking for: ${lookingFor}`,
      `Timeline: ${payload.timeline || "(not provided)"}`,
      `Tier interest: ${payload.tier || "(not provided)"}`,
      `Best time to contact: ${payload.bestTime || "(not provided)"}`,
      "",
      "REQUEST DETAILS",
      "---------------",
      `${payload.details || "(not provided)"}`,
      "",
      "NOTES",
      "-----",
      `${payload.notes || "(not provided)"}`,
      "",
      "NEXT STEPS (WEMIR)",
      "------------------",
      "1) Confirm scope + target outcome.",
      "2) Recommend tier + tool stack.",
      "3) Provide timeline + deliverables.",
      ""
    ].join("\n");
  }

  function mailtoForIntake(text) {
    const subject = encodeURIComponent("WEMIR SOLUTIONS — Event Intake");
    const body = encodeURIComponent(text.slice(0, 8000));
    return `mailto:?subject=${subject}&body=${body}`;
  }

  function setIntakeActionsEnabled(enabled, text="") {
    if (dlIntake) dlIntake.disabled = !enabled;
    if (copyIntake) copyIntake.disabled = !enabled;
    if (emailIntake) {
      emailIntake.setAttribute("aria-disabled", enabled ? "false" : "true");
      emailIntake.href = enabled ? mailtoForIntake(text) : "#";
    }
  }

  function readEventFormData(form) {
    const fd = new FormData(form);
    const lookingFor = fd.getAll("lookingFor").map(String);

    return {
      name: String(fd.get("name") || "").trim(),
      business: String(fd.get("business") || "").trim(),
      phone: String(fd.get("phone") || "").trim(),
      email: String(fd.get("email") || "").trim(),
      website: String(fd.get("website") || "").trim(),
      location: String(fd.get("location") || "").trim(),
      source: String(fd.get("source") || "").trim(),
      lookingFor,
      details: String(fd.get("details") || "").trim(),
      timeline: String(fd.get("timeline") || "").trim(),
      tier: String(fd.get("tier") || "").trim(),
      bestTime: String(fd.get("bestTime") || "").trim(),
      notes: String(fd.get("notes") || "").trim(),
    };
  }

  // Restore last draft (device-local)
  const lastEventDraft = localStorage.getItem("wemir_event_intake");
  if (eventForm && lastEventDraft) {
    try {
      const obj = JSON.parse(lastEventDraft);
      // basic fields
      ["name","business","phone","email","website","location","details","notes"].forEach(k => {
        const el = eventForm.elements?.[k];
        if (el && obj[k]) el.value = obj[k];
      });
      ["source","timeline","tier","bestTime"].forEach(k => {
        const el = eventForm.elements?.[k];
        if (el && obj[k]) el.value = obj[k];
      });
      // checkboxes
      if (Array.isArray(obj.lookingFor)) {
        obj.lookingFor.forEach(v => {
          const cb = eventForm.querySelector(`input[type="checkbox"][name="lookingFor"][value="${v.replace(/["\\]/g,'\\$&')}"]`);
          if (cb) cb.checked = true;
        });
      }
    } catch { /* ignore */ }
  }

  // Restore last intake text if it exists
  const lastEventText = localStorage.getItem("wemir_event_intake_text") || "";
  if (lastEventText) setIntakeActionsEnabled(true, lastEventText);

  if (eventForm) {
    eventForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const payload = readEventFormData(eventForm);

      // minimal validation beyond required attrs
      if (!payload.name || !payload.phone || !payload.source || !payload.details) {
        alert("Please complete the required fields: Name, Phone, How you found us, and Describe what you want.");
        return;
      }
      if (!payload.lookingFor.length) {
        alert("Please select at least one option under “What are you looking for?”");
        return;
      }

      const text = buildEventIntakeText(payload);
      localStorage.setItem("wemir_event_intake", JSON.stringify(payload));
      localStorage.setItem("wemir_event_intake_text", text);

      setIntakeActionsEnabled(true, text);
      alert("Intake saved. You can download, email, or copy it now.");
    });
  }

  if (dlIntake) {
    dlIntake.addEventListener("click", () => {
      const text = localStorage.getItem("wemir_event_intake_text") || "";
      if (!text) return;
      downloadText("WEMIR_Event_Intake.txt", text);
    });
  }

  if (copyIntake) {
    copyIntake.addEventListener("click", async () => {
      const text = localStorage.getItem("wemir_event_intake_text") || "";
      if (!text) return;
      try {
        await navigator.clipboard.writeText(text);
        alert("Copied to clipboard.");
      } catch {
        alert("Copy failed. Use Download instead.");
      }
    });
  }

  if (clearDraft) {
    clearDraft.addEventListener("click", () => {
      if (!eventForm) return;
      if (!confirm("Clear this intake draft on this device?")) return;
      eventForm.reset();
      // clear checkboxes manually (reset should handle, but keep safe)
      eventForm.querySelectorAll('input[type="checkbox"][name="lookingFor"]').forEach(cb => cb.checked = false);
      localStorage.removeItem("wemir_event_intake");
      localStorage.removeItem("wemir_event_intake_text");
      setIntakeActionsEnabled(false);
    });
  }
