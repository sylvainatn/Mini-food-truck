import { panier } from './panier.js';

// Fonction pour calculer les montants
function calculerMontants() {
   const totalHT = panier.getTotal() / 1.10; // Le prix affiché est TTC, on calcule le HT
   const tva = panier.getTotal() - totalHT;
   const totalTTC = panier.getTotal();

   return { totalHT, tva, totalTTC };
}

// Afficher le panier
function afficherPanier() {
   const container = document.getElementById('panier-items');
   const totalElement = document.getElementById('panier-total');

   // Vider le conteneur
   container.innerHTML = '';

   if (panier.items.length === 0) {
      container.innerHTML = `
            <div class="py-8 text-center text-gray-400">
                Votre panier est vide
            </div>
        `;
      totalElement.textContent = '0.00 €';
      return;
   }

   // Afficher chaque item
   panier.items.forEach(item => {
      const itemElement = document.createElement('div');
      itemElement.className = 'py-4 flex items-center justify-between';

      itemElement.innerHTML = `
            <div class="flex items-center gap-4 flex-grow">
                <img src="${item.image || 'https://via.placeholder.com/100x100'}" 
                     alt="${item.nom}" 
                     class="w-16 h-16 object-cover rounded"
                     onerror="this.src='https://via.placeholder.com/100x100?text=Image+non+disponible'">
                <div>
                    <h3 class="font-semibold">${item.nom}</h3>
                    <p class="text-gray-400">${item.prix.toFixed(2)} €</p>
                </div>
            </div>
            <div class="flex items-center gap-4">
                <div class="flex items-center">
                    <button class="btn-decrease px-3 py-1 bg-gray-700 rounded-l hover:bg-gray-600 transition-colors">-</button>
                    <input type="number" value="${item.quantite}" min="0" 
                           class="w-16 px-3 py-1 bg-gray-700 text-center focus:outline-none" 
                           data-id="${item.id}">
                    <button class="btn-increase px-3 py-1 bg-gray-700 rounded-r hover:bg-gray-600 transition-colors">+</button>
                </div>
                <button class="btn-delete text-red-500 hover:text-red-400">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        `;

      // Gestion des événements pour chaque item
      const quantityInput = itemElement.querySelector('input');
      const decreaseBtn = itemElement.querySelector('.btn-decrease');
      const increaseBtn = itemElement.querySelector('.btn-increase');
      const deleteBtn = itemElement.querySelector('.btn-delete');

      quantityInput.addEventListener('change', (e) => {
         panier.updateQuantite(item.id, e.target.value);
      });

      decreaseBtn.addEventListener('click', () => {
         const newQuantity = Math.max(0, item.quantite - 1);
         panier.updateQuantite(item.id, newQuantity);
      });

      increaseBtn.addEventListener('click', () => {
         panier.updateQuantite(item.id, item.quantite + 1);
      });

      deleteBtn.addEventListener('click', () => {
         panier.supprimerPlat(item.id);
      });

      container.appendChild(itemElement);
   });

   // Mettre à jour le total
   totalElement.textContent = `${panier.getTotal().toFixed(2)} €`;
}

// Afficher le récapitulatif dans la modale
function afficherRecapitulatif() {
   const container = document.getElementById('recap-items');
   container.innerHTML = '';

   // Afficher les articles
   panier.items.forEach(item => {
      const itemElement = document.createElement('div');
      itemElement.className = 'py-4 flex items-center justify-between';

      itemElement.innerHTML = `
            <div class="flex items-center gap-4">
                <img src="${item.image || 'https://via.placeholder.com/50x50'}" 
                     alt="${item.nom}" 
                     class="w-12 h-12 object-cover rounded"
                     onerror="this.src='https://via.placeholder.com/50x50?text=Image+non+disponible'">
                <div>
                    <h3 class="font-semibold">${item.nom}</h3>
                    <p class="text-sm text-gray-400">${item.quantite}x ${item.prix.toFixed(2)} €</p>
                </div>
            </div>
            <div class="text-right">
                <p class="font-semibold">${(item.prix * item.quantite).toFixed(2)} €</p>
            </div>
        `;

      container.appendChild(itemElement);
   });

   // Calculer et afficher les montants
   const { totalHT, tva, totalTTC } = calculerMontants();
   document.getElementById('recap-total-ht').textContent = `${totalHT.toFixed(2)} €`;
   document.getElementById('recap-tva').textContent = `${tva.toFixed(2)} €`;
   document.getElementById('recap-total-ttc').textContent = `${totalTTC.toFixed(2)} €`;

   // Afficher la modale
   const modal = document.getElementById('modal-recap');
   modal.classList.remove('hidden');
   modal.classList.add('flex');
}

// Gérer le bouton "Vider le panier"
document.getElementById('btn-vider').addEventListener('click', () => {
   if (confirm('Voulez-vous vraiment vider votre panier ?')) {
      panier.viderPanier();
   }
});

// Gérer le bouton "Commander"
document.getElementById('btn-commander').addEventListener('click', () => {
   if (panier.items.length === 0) {
      alert('Votre panier est vide');
      return;
   }
   afficherRecapitulatif();
});

// Gérer le bouton "Valider" de la modale
document.getElementById('btn-valider').addEventListener('click', () => {
   // Fermer la modale
   const modal = document.getElementById('modal-recap');
   modal.classList.add('hidden');
   modal.classList.remove('flex');

   // Rediriger vers la page de commande
   window.location.href = 'commande.html';
});

// Gérer le bouton "Annuler" de la modale
document.getElementById('btn-annuler').addEventListener('click', () => {
   const modal = document.getElementById('modal-recap');
   modal.classList.add('hidden');
   modal.classList.remove('flex');
});

// Écouter les changements du panier
window.addEventListener('panierUpdate', afficherPanier);

// Afficher le panier au chargement
afficherPanier();
