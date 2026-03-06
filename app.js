const header = document.querySelector('.header');
const burger = document.querySelector('.burger');
const mobileMenu = document.querySelector('#mobileMenu');

function setScrolled() {
  if (!header) return;
  header.classList.toggle('is-scrolled', window.scrollY > 6);
}

setScrolled();
window.addEventListener('scroll', setScrolled, { passive: true });

function setMenu(open) {
  if (!burger || !mobileMenu) return;
  burger.setAttribute('aria-expanded', String(open));
  mobileMenu.classList.toggle('is-open', open);
  mobileMenu.setAttribute('aria-hidden', String(!open));
  document.body.style.overflow = open ? 'hidden' : '';
}

if (burger && mobileMenu) {
  burger.addEventListener('click', () => {
    const open = burger.getAttribute('aria-expanded') !== 'true';
    setMenu(open);
  });

  mobileMenu.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a) return;
    setMenu(false);
  });
}

// reveal on scroll
const revealEls = Array.from(document.querySelectorAll('[data-animate], [data-stagger]'));
const io = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      const el = entry.target;
      const isIn = entry.isIntersecting;
      if (el.hasAttribute('data-animate')) {
        el.classList.toggle('is-in', isIn);
      }

      if (el.hasAttribute('data-stagger')) {
        const step = Number(el.getAttribute('data-stagger-step'));
        const ms = Number.isFinite(step) ? step : 90;
        const kids = Array.from(el.children);
        kids.forEach((kid, i) => {
          kid.style.setProperty('--stagger-delay', `${i * ms}ms`);
        });
      }
    }
  },
  { threshold: 0.22 }
);

revealEls.forEach((el) => io.observe(el));

const heightAutoEls = Array.from(document.querySelectorAll('[data-height-auto]'));
heightAutoEls.forEach((el) => {
  const inner = el.firstElementChild;
  if (!inner) return;
  el.style.overflow = 'hidden';
  el.style.maxHeight = '0px';
  const open = el.getAttribute('data-height-auto') === 'open';
  if (open) {
    el.style.maxHeight = `${inner.scrollHeight}px`;
    el.classList.add('is-open');
  }
});

// counters
function animateCounter(el) {
  const rawTarget = el.getAttribute('data-counter');
  if (!rawTarget) return;
  const target = Number(rawTarget);
  if (!Number.isFinite(target)) return;

  const hasPlus = el.textContent.includes('+');
  const hasComma = el.textContent.includes(',');

  const duration = 1000;
  const start = performance.now();

  function format(n) {
    if (hasComma) {
      return Math.round(n).toLocaleString('en-US');
    }
    return String(Math.round(n));
  }

  function tick(now) {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    const value = target * eased;
    el.textContent = `${format(value)}${hasPlus ? '+' : ''}`;
    if (t < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

const counterEls = Array.from(document.querySelectorAll('[data-counter]'));
const countersIO = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        countersIO.unobserve(entry.target);
      }
    }
  },
  { threshold: 0.5 }
);

counterEls.forEach((el) => countersIO.observe(el));

const bottomNavLinks = Array.from(document.querySelectorAll('.bottom-nav a'));

function normalizeHref(href) {
  if (!href) return '';
  return href.split('#')[0].split('?')[0];
}

function getCurrentFile() {
  const path = window.location.pathname || '';
  const file = path.split('/').pop() || '';
  return file || 'index.html';
}

function setBottomActiveByHref(targetHref) {
  const normalizedTarget = normalizeHref(targetHref);
  for (const link of bottomNavLinks) {
    const href = link.getAttribute('href') || '';
    const normalized = normalizeHref(href);
    const active = normalized && normalized === normalizedTarget;
    link.classList.toggle('is-active', active);
  }
}

const hashBottomLinks = bottomNavLinks.filter((a) => (a.getAttribute('href') || '').startsWith('#'));
const sectionById = new Map();

for (const link of hashBottomLinks) {
  const hash = link.getAttribute('href');
  if (!hash || hash.length < 2) continue;
  const id = hash.slice(1);
  const section = document.getElementById(id);
  if (!section) continue;
  sectionById.set(id, section);
}

function setBottomActiveById(id) {
  for (const link of hashBottomLinks) {
    const hash = link.getAttribute('href');
    const active = hash === `#${id}`;
    link.classList.toggle('is-active', active);
  }
}

if (sectionById.size) {
  const sections = Array.from(sectionById.values());
  const bottomIO = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      if (!visible.target || !visible.target.id) return;
      setBottomActiveById(visible.target.id);
    },
    { threshold: [0.2, 0.35, 0.5, 0.65] }
  );

  sections.forEach((s) => bottomIO.observe(s));
} else if (bottomNavLinks.length) {
  setBottomActiveByHref(getCurrentFile());
}

window.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  setMenu(false);
});

const coverageCountry = document.getElementById('coverageCountry');
const coverageText = document.getElementById('coverageText');
const coverageChips = Array.from(document.querySelectorAll('.chip[data-country]'));

const coverageData = {
  "Côte d'Ivoire": "Hub principal: Abidjan (port & aéroport). Opérations import/export, express et distribution nationale.",
  "Burkina Faso": "Transit via corridors Abidjan → Ouagadougou. Coordination frontière, suivi des points de passage et reporting.",
  Mali: "Corridor Abidjan → Bamako. Gestion documentaire, conformité et solutions alternatives en cas d'aléas.",
  Niger: "Transit vers Niamey. Sécurisation des étapes, communication proactive et suivi renforcé.",
  Togo: "Solutions régionales selon flux: coordination et suivi opérationnel (sur demande).",
  Ghana: "Expansion réseau et partenaires. Options corridors et solutions sur mesure.",
  Bénin: "Corridors et solutions régionales (selon projet)."
};

function setCoverageCountry(name) {
  if (coverageCountry) coverageCountry.textContent = name;
  if (coverageText) coverageText.textContent = coverageData[name] || coverageData["Côte d'Ivoire"];
  coverageChips.forEach((btn) => btn.classList.toggle('is-active', btn.getAttribute('data-country') === name));
}

if (coverageChips.length) {
  coverageChips.forEach((btn) => {
    btn.addEventListener('click', () => {
      const name = btn.getAttribute('data-country');
      if (!name) return;
      setCoverageCountry(name);
    });
  });
}

const testimonialPhoto = document.getElementById('testimonialPhoto');
const testimonialQuote = document.getElementById('testimonialQuote');
const testimonialAuthor = document.getElementById('testimonialAuthor');
const testimonialStars = document.getElementById('testimonialStars');
const testimonialPrev = document.getElementById('testimonialPrev');
const testimonialNext = document.getElementById('testimonialNext');

const testimonials = [
  {
    quote: '"TTL a réduit nos délais de dédouanement de 40%. Un partenaire fiable et réactif."',
    author: '— Direction SOGENA',
    stars: 5,
    photo: 'images/img.jpg'
  },
  {
    quote: '"Suivi clair, process rigoureux et communication proactive. Nos opérations sont plus prévisibles."',
    author: '— Responsable Supply Chain',
    stars: 5,
    photo: 'images/img1.jpg'
  },
  {
    quote: '"Exécution terrain solide sur corridor régional. Nous avons gagné en délai et en conformité."',
    author: '— Direction Logistique',
    stars: 5,
    photo: 'images/img.jpg'
  }
];

let testimonialIndex = 0;
let testimonialTimer = null;

function renderStars(n) {
  const count = Math.max(0, Math.min(5, Number(n) || 0));
  return '★★★★★'.slice(0, count) + '☆☆☆☆☆'.slice(0, 5 - count);
}

function setTestimonial(i) {
  if (!testimonialQuote || !testimonialAuthor) return;
  const idx = ((i % testimonials.length) + testimonials.length) % testimonials.length;
  testimonialIndex = idx;
  const t = testimonials[idx];
  testimonialQuote.textContent = t.quote;
  testimonialAuthor.textContent = t.author;
  if (testimonialStars) testimonialStars.textContent = renderStars(t.stars);
  if (testimonialPhoto) testimonialPhoto.style.backgroundImage = t.photo ? `url("${t.photo}")` : '';
}

function startTestimonialAutoplay() {
  if (!testimonials.length) return;
  if (testimonialTimer) window.clearInterval(testimonialTimer);
  testimonialTimer = window.setInterval(() => {
    setTestimonial(testimonialIndex + 1);
  }, 4500);
}

if (testimonialQuote && testimonialAuthor && testimonials.length) {
  setTestimonial(0);
  startTestimonialAutoplay();

  if (testimonialPrev) {
    testimonialPrev.addEventListener('click', () => {
      setTestimonial(testimonialIndex - 1);
      startTestimonialAutoplay();
    });
  }

  if (testimonialNext) {
    testimonialNext.addEventListener('click', () => {
      setTestimonial(testimonialIndex + 1);
      startTestimonialAutoplay();
    });
  }
}
