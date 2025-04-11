// ==================== SYSTÈME D'AUTHENTIFICATION ====================
const users = [
    { id: 1, username: "admin", password: "admin123", role: "admin" },
    { id: 2, username: "employe", password: "employe123", role: "user" }
];

// Vérifie si l'utilisateur est authentifié
function checkAuth(requiredRole = null) {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    const currentPage = window.location.pathname.split('/').pop();
    
    // Pages accessibles sans connexion
    const publicPages = ['login.html'];
    
    if (!currentUser && !publicPages.includes(currentPage)) {
        window.location.href = 'login.html';
        return false;
    }
    
    if (currentUser && requiredRole && currentUser.role !== requiredRole) {
        window.location.href = currentUser.role === 'admin' ? 'validation.html' : 'index.html';
        return false;
    }
    
    return true;
}

// Gère la déconnexion
window.logout = function() {
    sessionStorage.removeItem('currentUser');
    window.location.href = 'login.html';
};

// Gère le formulaire de connexion
function setupLoginForm() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorMessage = document.getElementById('errorMessage');
        
        const user = users.find(u => u.username === username && u.password === password);
        
        if (user) {
            sessionStorage.setItem('currentUser', JSON.stringify(user));
            window.location.href = user.role === 'admin' ? 'validation.html' : 'index.html';
        } else {
            errorMessage.textContent = "Identifiant ou mot de passe incorrect";
            errorMessage.classList.remove('hidden');
        }
    });
}

// Affiche le nom d'utilisateur dans le header
function displayUserInfo() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (currentUser && document.getElementById('usernameDisplay')) {
        document.getElementById('usernameDisplay').textContent = currentUser.username;
    }
}

// ==================== GESTION DES DEMANDES DE CONGÉ ====================
document.addEventListener('DOMContentLoaded', () => {
    // Initialisation de l'authentification
    displayUserInfo();
    
    // Configuration de la page de login
    if (window.location.pathname.split('/').pop() === 'login.html') {
        setupLoginForm();
        return;
    }
    
    // Vérification de l'authentification pour les autres pages
    if (!checkAuth()) return;
    
    // Vérification des rôles pour les pages admin
    if (window.location.pathname.split('/').pop() === 'validation.html') {
        if (!checkAuth('admin')) return;
    }

    // ===== Gestion des formulaires =====
    const form = document.getElementById('congeForm');
    const historique = document.getElementById('historique');
    const demandesValidation = document.getElementById('demandesValidation');

    const raisonSelect = document.getElementById('raison');
    const autreRaison = document.getElementById('autreRaison');
    // Affiche le champ "Autre" si la raison sélectionnée est "autre"
    if (raisonSelect) {
        raisonSelect.addEventListener('change', function () {
            if (raisonSelect.value === 'autre') {
                autreRaison.style.display = 'block';
            } else {
                autreRaison.style.display = 'none';
            }
        });
    }
    // insérer une nouvelle demande
    if (form) {
        form.addEventListener('submit', function(event) {
            event.preventDefault();

            const nom = document.getElementById('nom').value;
            const prenom = document.getElementById('prenom').value;
            const nomusager = document.getElementById('nomusager').value;
            const dateDebut = document.getElementById('dateDebut').value;
            const dateFin = document.getElementById('dateFin').value;
            let raison = document.getElementById('raison').value;
            const autreRaison = document.getElementById('autreRaison');
            if (autreRaison) {
                raison = autreRaison.value;
            }
            const dateDemande = new Date();
            
            
            const demande = {
                nom,
                prenom,
                nomusager,
                dateDebut,
                dateFin,
                raison,
                statut: 'en attente'
            };
            if (new Date(dateDebut) < dateDemande) {
                alert('La date de début doit etre valide.');
                document.getElementById('dateDebut').value="";
                return;
            }
            else if (new Date(dateFin) < dateDemande) {
                document.getElementById('dateFin').value="";
                alert('La date de fin doit etre valide.');
                
                return;
            }
            else if (new Date(dateDebut) > new Date(dateFin)) {
                document.getElementById('dateFin').value="";
                document.getElementById('dateDebut').value="";

                alert('La date de début ne peut pas être après la date de fin.');
                return;
            }
            else if (new Date(dateDebut).getTime() === new Date(dateFin).getTime()) {
                document.getElementById('dateFin').value="";
                document.getElementById('dateDebut').value="";

                alert('La date de début et la date de fin ne peuvent pas être identiques.');
                return;
            }
            else{
                let demandes = JSON.parse(localStorage.getItem('demandes')) || [];
                demandes.push(demande);
                localStorage.setItem('demandes', JSON.stringify(demandes));
                afficherHistorique(demandes);

            }
            form.reset();
        });
    }

    // Affichage de l'historique des demandes
    function afficherHistorique(demandes) {
        if (historique) {
            historique.innerHTML = '';
            demandes.forEach(demande => {
                const li = document.createElement('li');
                li.classList.add('p-4', 'border', 'rounded-lg', 'shadow-sm');
                li.innerHTML = `
                    <strong>Nom:</strong> ${demande.nom}<br>
                    <strong>Prénom:</strong> ${demande.prenom}<br>
                    <strong>Nom d'usage:</strong> ${demande.nomusager}<br>
                    <strong>Date de début:</strong> ${demande.dateDebut}<br>
                    <strong>Date de fin:</strong> ${demande.dateFin}<br>
                    <strong>Raison:</strong> ${demande.raison}<br>
                    <strong>Statut:</strong> <span class="font-semibold ${getStatutClass(demande.statut)}">${demande.statut}</span>
                `;
                historique.appendChild(li);
            });
        }
    }

    // Affichage des demandes de validation
    function afficherDemandesValidation(demandes) {
        if (demandesValidation) {
            demandesValidation.innerHTML = '';
            demandes.forEach((demande, index) => {
                const li = document.createElement('li');
                li.classList.add('p-6', 'border', 'rounded-lg', 'shadow-md', 'bg-white');
                li.innerHTML = `
                    <div class="mb-4">
                        <strong>Nom:</strong> ${demande.nom}<br>
                        <strong>Prénom:</strong> ${demande.prenom}<br>
                        <strong>Nom d'usage:</strong> ${demande.nomusager}<br>
                        <strong>Date de début:</strong> ${demande.dateDebut}<br>
                        <strong>Date de fin:</strong> ${demande.dateFin}<br>
                        <strong>Raison:</strong> ${demande.raison}<br>
                        <strong>Statut:</strong> <span class="font-semibold ${getStatutClass(demande.statut)}">${demande.statut}</span>
                    </div>
                    <div class="flex space-x-2">
                        <button class="flex-1 bg-green-500 text-white py-2 rounded hover:bg-green-600" onclick="changerStatut(${index}, 'approuvé')">Approuver</button>
                        <button class="flex-1 bg-red-500 text-white py-2 rounded hover:bg-red-600" onclick="changerStatut(${index}, 'refusé')">Refuser</button>
                    </div>
                `;
                demandesValidation.appendChild(li);
            });
        }
    }
    // Fonction pour obtenir la classe CSS en fonction du statut

    function getStatutClass(statut) {
        switch (statut) {
            case 'approuvé':
                return 'text-green-600';
            case 'refusé':
                return 'text-red-600';
            default:
                return 'text-yellow-600';
        }
    }
    // Fonction pour changer le statut d'une demande

    window.changerStatut = function(index, statut) {
        let demandes = JSON.parse(localStorage.getItem('demandes')) || [];
        demandes[index].statut = statut;
        localStorage.setItem('demandes', JSON.stringify(demandes));
        afficherDemandesValidation(demandes);
        if (historique) {
            afficherHistorique(demandes);
        }
    };

    const demandes = JSON.parse(localStorage.getItem('demandes')) || [];
    afficherHistorique(demandes);
    afficherDemandesValidation(demandes);
});