// My Photo Space - frontend logic (vanilla JS)
const $ = (sel, ctx=document) => ctx.querySelector(sel);
const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));

const state = {
  allPhotos: [],
  filtered: [],
  tags: new Set(),
  activeTag: null
};

const yearEl = $("#year");
yearEl.textContent = new Date().getFullYear();

// Install PWA
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const installBtn = $("#installBtn");
  installBtn.style.display = "inline-flex";
  installBtn.addEventListener("click", async () => {
    installBtn.style.display = "none";
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
    }
  });
});

// Theme toggle
$("#themeToggle").addEventListener("click", () => {
  document.documentElement.classList.toggle("light");
});

// Lightbox
const lb = $("#lightbox");
$(".close", lb).addEventListener("click", () => lb.close());
lb.addEventListener("click", (e) => { if (e.target === lb) lb.close(); });

function openLightbox(src, caption){
  $("#lbImg").src = src;
  $("#lbCap").textContent = caption || "";
  lb.showModal();
}

// Build tags chips
function renderTags(){
  const el = $("#tags");
  el.innerHTML = "";
  const allTags = ["All", ...Array.from(state.tags).sort((a,b)=>a.localeCompare(b))];
  for(const t of allTags){
    const chip = document.createElement("button");
    chip.className = "chip" + (t === (state.activeTag || "All") ? " active" : "");
    chip.textContent = t;
    chip.addEventListener("click", () => {
      state.activeTag = t === "All" ? null : t;
      renderTags();
      applyFilters();
      renderGallery();
    });
    el.appendChild(chip);
  }
}

// Render gallery
function renderGallery(){
  const gallery = $("#gallery");
  gallery.innerHTML = "";
  const tmpl = $("#photoCardTmpl");
  for(const p of state.filtered){
    const node = tmpl.content.cloneNode(true);
    const img = $("img", node);
    const cap = $(".caption", node);
    const taglist = $(".taglist", node);
    img.src = p.url;
    img.alt = p.caption || p.filename;
    cap.textContent = p.caption || p.filename;
    if (Array.isArray(p.tags)){
      p.tags.forEach(t => {
        const span = document.createElement("span");
        span.textContent = `#${t}`;
        taglist.appendChild(span);
      });
    }
    img.addEventListener("click", () => openLightbox(p.url, p.caption));
    gallery.appendChild(node);
  }
}

// Search filter
$("#search").addEventListener("input", (e) => {
  applyFilters();
  renderGallery();
});

function applyFilters(){
  const q = $("#search").value.trim().toLowerCase();
  const tag = state.activeTag;
  state.filtered = state.allPhotos.filter(p => {
    const str = (p.caption || p.filename || "") + " " + (Array.isArray(p.tags) ? p.tags.join(" ") : "");
    const matchesQ = !q || str.toLowerCase().includes(q);
    const matchesTag = !tag || (Array.isArray(p.tags) && p.tags.includes(tag));
    return matchesQ && matchesTag;
  });
}

// Load photos from backend if available, else from local json
async function loadPhotos(){
  const sources = ["/api/photos", "photos.json"];
  let data = [];
  for (const src of sources){
    try {
      const res = await fetch(src, { cache: "no-store" });
      if (res.ok) { data = await res.json(); if (Array.isArray(data)) break; }
    } catch (e){ /* ignore and try next */ }
  }
  // Normalize to {url, caption, tags}
  state.allPhotos = (data || []).map(p => ({
    url: p.url || p.path || p.src || p.filename || "",
    caption: p.caption || p.title || "",
    tags: p.tags || []
  })).filter(p => !!p.url);
  state.tags = new Set(state.allPhotos.flatMap(p => p.tags || []));
  renderTags();
  applyFilters();
  renderGallery();
}

if ("serviceWorker" in navigator){
  window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(()=>{}));
}

loadPhotos();
