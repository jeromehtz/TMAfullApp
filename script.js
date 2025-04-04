document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('congeForm');
    const historique = document.getElementById('historique');
    const demandesValidation = document.getElementById('demandesValidation');

    const raisonSelect = document.getElementById('raison');
    const autreRaison = document.getElementById('autreRaison');

    if (raisonSelect) {
        raisonSelect.addEventListener('change', function () {
            if (raisonSelect.value === 'autre') {
                autreRaison.style.display = 'block';
            } else {
                autreRaison.style.display = 'none';
            }
        });
    }


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
            if (document.getElementById('autreRaison')) {
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