// ============================================
// AMEXPERTS & PARTNERS - app.js
// Firebase Firestore + GitHub Pages compatible
// ============================================

// ---- Firebase Config (Replace with your actual config) ----
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase (will gracefully skip if not configured)
let db = null;
function initFirebase() {
  try {
    if (typeof firebase !== 'undefined' && firebaseConfig.apiKey !== "YOUR_API_KEY") {
      firebase.initializeApp(firebaseConfig);
      db = firebase.firestore();
      console.log("Firebase connected.");
    }
  } catch (e) {
    console.warn("Firebase not configured yet:", e.message);
  }
}

// ============================================
// NAVBAR
// ============================================
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');

  // Mobile toggle
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      links.classList.toggle('open');
    });
  }

  // Active link highlight
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });

  // Close mobile menu on link click
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.addEventListener('click', () => {
      if (links) links.classList.remove('open');
    });
  });
}

// ============================================
// SCROLL ANIMATIONS
// ============================================
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
}

// ============================================
// COUNTER ANIMATION
// ============================================
function animateCounters() {
  document.querySelectorAll('.counter').forEach(counter => {
    const target = parseInt(counter.getAttribute('data-target'));
    const suffix = counter.getAttribute('data-suffix') || '';
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;

    const update = () => {
      current = Math.min(current + step, target);
      counter.textContent = Math.floor(current) + suffix;
      if (current < target) requestAnimationFrame(update);
    };

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        update();
        observer.disconnect();
      }
    });
    observer.observe(counter);
  });
}

// ============================================
// CONTACT / CONSULTATION FORM
// ============================================
function initContactForm() {
  const form = document.getElementById('consultationForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('[type="submit"]');
    const originalText = btn.textContent;
    btn.textContent = 'Envoi en cours...';
    btn.disabled = true;

    const data = {
      nom: form.nom?.value || '',
      email: form.email?.value || '',
      telephone: form.telephone?.value || '',
      organisation: form.organisation?.value || '',
      service: form.service?.value || '',
      message: form.message?.value || '',
      date: new Date().toISOString(),
      status: 'nouveau'
    };

    try {
      if (db) {
        await db.collection('consultations').add(data);
      }
      showNotification('✅ Votre demande a été envoyée avec succès. Nous vous contacterons dans les 24h.', 'success');
      form.reset();
    } catch (err) {
      console.error(err);
      showNotification('❌ Une erreur s\'est produite. Veuillez réessayer ou nous contacter directement.', 'error');
    } finally {
      btn.textContent = originalText;
      btn.disabled = false;
    }
  });
}

// ============================================
// NEWSLETTER FORM
// ============================================
function initNewsletterForm() {
  const form = document.getElementById('newsletterForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = form.querySelector('input[type="email"]').value;

    try {
      if (db) {
        await db.collection('newsletter').add({
          email,
          date: new Date().toISOString()
        });
      }
      showNotification('✅ Vous êtes inscrit à notre newsletter !', 'success');
      form.reset();
    } catch (err) {
      showNotification('❌ Erreur lors de l\'inscription. Réessayez.', 'error');
    }
  });
}

// ============================================
// LOAD BLOG ARTICLES FROM FIRESTORE
// ============================================
async function loadBlogArticles() {
  const container = document.getElementById('blogContainer');
  if (!container || !db) return;

  try {
    const snapshot = await db.collection('articles')
      .orderBy('date', 'desc')
      .limit(6)
      .get();

    if (snapshot.empty) {
      renderDefaultBlogCards(container);
      return;
    }

    container.innerHTML = '';
    snapshot.forEach(doc => {
      const art = doc.data();
      container.innerHTML += `
        <article class="blog-card fade-up">
          <div class="card-img">${art.icon || '📰'}</div>
          <div class="card-body">
            <div class="meta"><span>${art.categorie || 'Analyse'}</span> — ${formatDate(art.date)}</div>
            <h3>${art.titre}</h3>
            <p>${art.extrait}</p>
            <a href="blog.html#${doc.id}" class="read-more">Lire la suite →</a>
          </div>
        </article>`;
    });
    initScrollAnimations();
  } catch (e) {
    renderDefaultBlogCards(container);
  }
}

function renderDefaultBlogCards(container) {
  const articles = [
    { icon: '📊', cat: 'Finance', titre: 'Structuration financière des PME en Afrique de l\'Ouest', extrait: 'Analyse des mécanismes de financement adaptés aux PME africaines dans un contexte de rareté de capital.', date: '2026-02-15' },
    { icon: '🏗️', cat: 'Investissement', titre: 'Opportunités immobilières au Togo en 2026', extrait: 'Tour d\'horizon des secteurs porteurs et des zones à fort potentiel de valorisation dans l\'immobilier togolais.', date: '2026-01-28' },
    { icon: '🤝', cat: 'Partenariat', titre: 'PPP : levier de développement pour les collectivités', extrait: 'Comment les partenariats public-privé peuvent accélérer la mise en place d\'infrastructures structurantes.', date: '2026-01-10' },
  ];
  container.innerHTML = '';
  articles.forEach((a, i) => {
    container.innerHTML += `
      <article class="blog-card fade-up">
        <div class="card-img">${a.icon}</div>
        <div class="card-body">
          <div class="meta"><span>${a.cat}</span> — ${formatDate(a.date)}</div>
          <h3>${a.titre}</h3>
          <p>${a.extrait}</p>
          <a href="blog.html" class="read-more">Lire la suite →</a>
        </div>
      </article>`;
  });
}

// ============================================
// LOAD PROJETS FINANCES FROM FIRESTORE
// ============================================
async function loadProjetsFinances() {
  const tbody = document.getElementById('projetsTableBody');
  if (!tbody) return;

  const defaultProjets = [
    { ref: 'AM-2025-001', titre: 'Complexe agro-industriel', secteur: 'Agro-industrie', montant: '2,5 M€', pays: 'Togo', statut: 'open' },
    { ref: 'AM-2025-002', titre: 'Résidence haut standing', secteur: 'Immobilier', montant: '5 M€', pays: 'Côte d\'Ivoire', statut: 'progress' },
    { ref: 'AM-2024-003', titre: 'Parc solaire 10 MW', secteur: 'Énergie', montant: '12 M€', pays: 'Sénégal', statut: 'closed' },
    { ref: 'AM-2025-004', titre: 'Plateforme logistique', secteur: 'Transport', montant: '8 M€', pays: 'Bénin', statut: 'open' },
  ];

  let projets = defaultProjets;

  if (db) {
    try {
      const snapshot = await db.collection('projets_financement').orderBy('date', 'desc').get();
      if (!snapshot.empty) {
        projets = snapshot.docs.map(d => d.data());
      }
    } catch (e) { /* use defaults */ }
  }

  const statusLabels = { open: 'Ouvert', progress: 'En cours', closed: 'Clôturé' };
  tbody.innerHTML = projets.map(p => `
    <tr>
      <td><strong>${p.ref}</strong></td>
      <td>${p.titre}</td>
      <td>${p.secteur}</td>
      <td><strong>${p.montant}</strong></td>
      <td>${p.pays}</td>
      <td><span class="badge-status ${p.statut}">${statusLabels[p.statut] || p.statut}</span></td>
      <td><a href="mailto:amexpertspartners20@gmail.com?subject=Intérêt projet ${p.ref}" class="btn-purple-outline" style="padding:0.4rem 0.9rem;font-size:0.78rem;">Exprimer intérêt</a></td>
    </tr>`).join('');
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function showNotification(message, type = 'success') {
  let notif = document.getElementById('notification');
  if (!notif) {
    notif = document.createElement('div');
    notif.id = 'notification';
    notif.style.cssText = `
      position: fixed; top: 100px; right: 2rem; z-index: 9999;
      padding: 1rem 1.5rem; border-radius: 4px; max-width: 400px;
      font-family: 'Barlow', sans-serif; font-size: 0.9rem;
      box-shadow: 0 8px 32px rgba(0,0,0,0.15);
      transition: all 0.3s ease;
    `;
    document.body.appendChild(notif);
  }
  notif.textContent = message;
  notif.style.background = type === 'success' ? '#7B2D8B' : '#c62828';
  notif.style.color = '#fff';
  notif.style.opacity = '1';
  setTimeout(() => { notif.style.opacity = '0'; }, 4000);
}

// ============================================
// LANGUAGE TOGGLE (FR/EN)
// ============================================
const translations = {
  fr: {
    nav_home: 'Accueil',
    nav_about: 'À propos',
    nav_services: 'Nos Services',
    nav_realisations: 'Réalisations',
    nav_blog: 'Actualités',
    nav_contact: 'Contact',
    cta_consult: 'Demander une consultation',
  },
  en: {
    nav_home: 'Home',
    nav_about: 'About',
    nav_services: 'Our Services',
    nav_realisations: 'Projects',
    nav_blog: 'News',
    nav_contact: 'Contact',
    cta_consult: 'Request a Consultation',
  }
};

let currentLang = localStorage.getItem('lang') || 'fr';

function switchLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('lang', lang);
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[lang] && translations[lang][key]) {
      el.textContent = translations[lang][key];
    }
  });
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
}

function initLanguage() {
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => switchLanguage(btn.dataset.lang));
  });
  switchLanguage(currentLang);
}

// ============================================
// INIT ALL
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  initFirebase();
  initNavbar();
  initScrollAnimations();
  animateCounters();
  initContactForm();
  initNewsletterForm();
  loadBlogArticles();
  loadProjetsFinances();
  initLanguage();
});
