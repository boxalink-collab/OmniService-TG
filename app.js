import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDtDK7-iDRy1E-kjZubjyjkPW7Th33BMyU",
  authDomain: "omniservicetg-59df3.firebaseapp.com",
  projectId: "omniservicetg-59df3",
  storageBucket: "omniservicetg-59df3.firebasestorage.app",
  messagingSenderId: "196278567761",
  appId: "1:196278567761:web:4f6416acaab58b67bf4970"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- COMPOSANTS DE PAGES ---
const Pages = {
    accueil: () => `
        <div class="promo-banner">
            <h2>Simplifiez votre quotidien</h2>
            <p>Appelez, on s’en charge</p>
        </div>
        <div style="padding: 15px;"><h3 style="color:var(--blue)">Services Prioritaires</h3></div>
        <div class="service-card" onclick="loadPage('form_maintenance')">
            <div class="icon-box bg-orange"><i class="fas fa-wrench"></i></div>
            <div><strong>Maintenance Technique</strong><br><small>Électricité, Plomberie...</small></div>
        </div>
        <div class="service-card" onclick="loadPage('services')">
            <div class="icon-box bg-blue"><i class="fas fa-shield-alt"></i></div>
            <div><strong>Sécurité & Gardiennage</strong><br><small>Boutique, Bureau, Résidence</small></div>
        </div>
    `,
    services: () => `
        <div style="padding: 20px;">
            <h2 style="color:var(--blue)">Tous nos services</h2>
            <div class="service-card" onclick="loadPage('form_alim')">
                <div class="icon-box bg-blue"><i class="fas fa-utensils"></i></div>
                <div><strong>Alimentation</strong><br><small>Kits, Produits frais, Vin de palme</small></div>
            </div>
            <div class="service-card">
                <div class="icon-box bg-orange"><i class="fas fa-broom"></i></div>
                <div><strong>Nettoyage Pro</strong><br><small>Résidentiel et Bureaux</small></div>
            </div>
        </div>
    `,
    form_maintenance: () => `
        <div class="form-container">
            <h3>Demande de Maintenance</h3>
            <p>Intervention prévue à partir du 16 Mars</p>
            <div class="form-group">
                <label>Type de panne</label>
                <input type="text" id="panne" placeholder="Ex: Fuite d'eau, Court-circuit">
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea id="desc" rows="3"></textarea>
            </div>
            <button class="btn-submit" onclick="submitOrder('Maintenance')">Envoyer la demande</button>
        </div>
    `,
    apropos: () => `
        <div style="padding: 20px;">
            <h2 style="color:var(--blue)">À Propos</h2>
            <p>OmniService TG est une entreprise togolaise de services multisectoriels dédiée aux ménages et aux entreprises.</p>
            <p><strong>Notre Mission :</strong> Offrir des services professionnels, accessibles et structurés.</p>
        </div>
    `
};

// --- LOGIQUE DE NAVIGATION ---
window.loadPage = function(pageId) {
    const content = document.getElementById('app-content');
    
    // Contenu dynamique
    content.innerHTML = Pages[pageId] ? Pages[pageId]() : Pages.accueil();

    // Update Nav bar
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    const activeNav = document.querySelector(\`.nav-item[onclick*="\${pageId}"]\`);
    if(activeNav) activeNav.classList.add('active');
    
    window.scrollTo(0,0);
};

// --- ENVOI VERS FIRESTORE ---
window.submitOrder = async function(serviceType) {
    const valPanne = document.getElementById('panne')?.value || "N/A";
    const valDesc = document.getElementById('desc')?.value || "N/A";

    try {
        await addDoc(collection(db, "commandes"), {
            service: serviceType,
            details: valPanne,
            description: valDesc,
            date: new Date().toISOString(),
            statut: "En attente"
        });
        alert("Commande enregistrée avec succès !");
        loadPage('accueil');
    } catch (e) {
        alert("Erreur lors de l'envoi.");
    }
};

// Démarrage
document.addEventListener('DOMContentLoaded', () => loadPage('accueil'));
