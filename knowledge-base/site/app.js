// Knowledge base: single-page navigation, progress tracking, search, copy buttons.
(function () {
  const STORAGE_KEY = "kb-progress";
  const THEME_KEY = "kb-theme";
  const articles = Array.from(document.querySelectorAll("article[data-title]"));
  const groups = { learn: "Learn Kubernetes", repo: "This Repo" };

  // ---------- storage (may be unavailable, so never let it throw) ----------
  function load(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
  }
  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
  }
  let done = new Set(load(STORAGE_KEY, []));

  // ---------- theme ----------
  const savedTheme = load(THEME_KEY, null);
  if (savedTheme) document.documentElement.dataset.theme = savedTheme;
  document.getElementById("theme-toggle").addEventListener("click", () => {
    const isDark = document.documentElement.dataset.theme
      ? document.documentElement.dataset.theme === "dark"
      : matchMedia("(prefers-color-scheme: dark)").matches;
    const next = isDark ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    save(THEME_KEY, next);
  });

  // ---------- build sidebar ----------
  const nav = document.getElementById("nav");
  const links = {};
  for (const [groupId, groupName] of Object.entries(groups)) {
    const section = document.createElement("div");
    section.className = "nav-group";
    section.innerHTML = `<h2>${groupName}</h2>`;
    for (const a of articles.filter((x) => x.dataset.group === groupId)) {
      const link = document.createElement("a");
      link.href = "#/" + a.id;
      link.innerHTML = `<span>${a.dataset.title}</span><span class="check">✓</span>`;
      section.appendChild(link);
      links[a.id] = link;
    }
    nav.appendChild(section);
  }

  // ---------- per-page footer: complete button + prev/next ----------
  articles.forEach((a, i) => {
    const footer = document.createElement("div");
    footer.className = "page-footer";
    const prev = articles[i - 1];
    const next = articles[i + 1];
    footer.innerHTML = `
      <button class="btn complete-btn" data-id="${a.id}"></button>
      <div class="nav-btns">
        ${prev ? `<a class="btn" href="#/${prev.id}">← ${prev.dataset.title}</a>` : ""}
        ${next ? `<a class="btn primary" href="#/${next.id}">${next.dataset.title} →</a>` : ""}
      </div>`;
    a.appendChild(footer);
  });
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".complete-btn");
    if (!btn) return;
    const id = btn.dataset.id;
    done.has(id) ? done.delete(id) : done.add(id);
    save(STORAGE_KEY, [...done]);
    renderProgress();
  });

  function renderProgress() {
    const learn = articles.filter((a) => a.dataset.group === "learn");
    const count = learn.filter((a) => done.has(a.id)).length;
    document.getElementById("progress-text").textContent = `${count} of ${learn.length} lessons complete`;
    document.getElementById("progress-fill").style.width = `${(count / learn.length) * 100}%`;
    for (const a of articles) links[a.id].classList.toggle("done", done.has(a.id));
    document.querySelectorAll(".complete-btn").forEach((b) => {
      const isDone = done.has(b.dataset.id);
      b.textContent = isDone ? "✓ Completed (click to undo)" : "Mark as complete";
      b.classList.toggle("primary", !isDone);
    });
  }

  // ---------- routing ----------
  function show() {
    const id = location.hash.replace(/^#\/?/, "") || articles[0].id;
    const target = document.getElementById(id) && document.getElementById(id).matches("article")
      ? id : articles[0].id;
    articles.forEach((a) => a.classList.toggle("active", a.id === target));
    Object.entries(links).forEach(([k, l]) => l.classList.toggle("active", k === target));
    const a = document.getElementById(target);
    document.title = `${a.dataset.title} · Kube Homelab KB`;
    document.body.classList.remove("nav-open");
    window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", show);

  // ---------- search: filters the sidebar by page text ----------
  document.getElementById("search").addEventListener("input", (e) => {
    const q = e.target.value.trim().toLowerCase();
    for (const a of articles) {
      const hit = !q || a.textContent.toLowerCase().includes(q);
      links[a.id].classList.toggle("hidden", !hit);
    }
  });

  // ---------- copy buttons on code blocks (skip diagrams) ----------
  document.querySelectorAll("pre:not(.diagram)").forEach((pre) => {
    const btn = document.createElement("button");
    btn.className = "copy-btn";
    btn.textContent = "Copy";
    btn.addEventListener("click", async () => {
      // copy without comment lines so pasted commands run cleanly
      const text = pre.querySelector("code").innerText
        .split("\n").filter((l) => !l.trim().startsWith("#")).join("\n").trim();
      try {
        await navigator.clipboard.writeText(text);
        btn.textContent = "Copied";
      } catch {
        btn.textContent = "Select & copy manually";
      }
      setTimeout(() => (btn.textContent = "Copy"), 1500);
    });
    pre.appendChild(btn);
  });

  // ---------- mobile menu ----------
  document.getElementById("menu-toggle").addEventListener("click", () => {
    document.body.classList.toggle("nav-open");
  });

  renderProgress();
  show();
})();
