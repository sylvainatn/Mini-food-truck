import { Order } from './order.js';
import { panier } from './panier.js';
import { wallet } from './wallet.js';

let currentStep = 'livraison';
let deliveryInfo = null;
let validatedSteps = new Set(['livraison']); // Garder une trace des étapes validées

// Gérer la navigation entre les étapes
function showStep(step) {
   // Vérifier si l'étape est accessible
   if (!validatedSteps.has(step) && getStepIndex(step) > getStepIndex(currentStep)) {
      return; // Ne pas permettre d'accéder à une étape future non validée
   }

   // Masquer toutes les étapes
   document.querySelectorAll('.step-content').forEach(el => el.classList.add('hidden'));

   // Afficher l'étape demandée
   document.getElementById(`step-${step}`).classList.remove('hidden');

   // Mettre à jour la navigation
   document.querySelectorAll('nav button').forEach(button => {
      const buttonStep = button.dataset.step;
      const stepNumber = button.querySelector('span:first-child');
      const stepText = button.querySelector('span:last-child');
      const stepLock = button.querySelector('.step-lock');

      // Gérer l'affichage du cadenas
      if (stepLock && validatedSteps.has(buttonStep)) {
         stepLock.classList.add('hidden');
      }

      if (buttonStep === step) {
         stepNumber.classList.remove('bg-gray-600');
         stepNumber.classList.add('bg-orange-500');
         stepText.classList.remove('text-gray-400');
         stepText.classList.add('text-white');
         button.classList.add('cursor-pointer');
      } else if (validatedSteps.has(buttonStep)) {
         stepNumber.classList.remove('bg-gray-600', 'bg-orange-500');
         stepNumber.classList.add('bg-green-500');
         stepText.classList.remove('text-gray-400');
         stepText.classList.add('text-white');
         button.classList.add('cursor-pointer');
      } else {
         stepNumber.classList.remove('bg-orange-500', 'bg-green-500');
         stepNumber.classList.add('bg-gray-600');
         stepText.classList.remove('text-white');
         stepText.classList.add('text-gray-400');
         button.classList.remove('cursor-pointer');
      }
   });

   // Mettre à jour la barre de progression
   document.querySelectorAll('nav .h-1').forEach((div, index) => {
      if (index < getStepIndex(step)) {
         div.classList.remove('bg-gray-600');
         div.classList.add('bg-green-500');
      } else {
         div.classList.remove('bg-green-500');
         div.classList.add('bg-gray-600');
      }
   });

   currentStep = step;
}

// Obtenir l'index d'une étape
function getStepIndex(step) {
   const steps = ['livraison', 'paiement', 'recapitulatif'];
   return steps.indexOf(step);
}

// Gérer le formulaire de livraison
document.getElementById('delivery-form').addEventListener('submit', (e) => {
   e.preventDefault();

   deliveryInfo = {
      address: e.target.address.value,
      postalCode: e.target['postal-code'].value,
      city: e.target.city.value
   };

   validatedSteps.add('paiement'); // Marquer l'étape paiement comme accessible
   showStep('paiement');
   updateBalanceDisplay();
   afficherResumePaiement();
});

// Gérer les clics sur la navigation
document.querySelectorAll('.nav-step').forEach(button => {
   button.addEventListener('click', () => {
      const targetStep = button.dataset.step;
      if (validatedSteps.has(targetStep)) {
         showStep(targetStep);
      }
   });
});

// Mettre à jour l'affichage du solde
function updateBalanceDisplay() {
   const balanceElement = document.getElementById('account-balance');
   balanceElement.textContent = wallet.getBalance().toFixed(2) + ' €';

   // Vérifier si le solde est suffisant
   const total = panier.getTotal();
   const soldeMessage = document.getElementById('solde-message');
   const payerButton = document.getElementById('btn-payer');

   if (wallet.hasSufficientFunds(total)) {
      soldeMessage.innerHTML = '<p class="text-green-400">✓ Solde suffisant</p>';
      payerButton.disabled = false;
      payerButton.classList.remove('opacity-50', 'cursor-not-allowed');
   } else {
      const manquant = (total - wallet.getBalance()).toFixed(2);
      soldeMessage.innerHTML = `<p class="text-red-400">Solde insuffisant (il manque ${manquant} €)</p>`;
      payerButton.disabled = true;
      payerButton.classList.add('opacity-50', 'cursor-not-allowed');
   }
   soldeMessage.classList.remove('hidden');
}

// Afficher le résumé du paiement
function afficherResumePaiement() {
   const totalElement = document.getElementById('commande-total');
   totalElement.textContent = `${panier.getTotal().toFixed(2)} €`;
}

// Afficher le récapitulatif
function afficherRecapitulatif() {
   // Afficher l'adresse
   const addressElement = document.getElementById('recap-address');
   addressElement.innerHTML = `
        <p>${deliveryInfo.address}</p>
        <p>${deliveryInfo.postalCode} ${deliveryInfo.city}</p>
    `;

   // Afficher les articles
   const container = document.getElementById('resume-commande');
   const totalElement = document.getElementById('recap-total');

   container.innerHTML = '';
   savedItems.forEach(item => {
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

   const total = savedItems.reduce((sum, item) => sum + (item.prix * item.quantite), 0);
   totalElement.textContent = `${total.toFixed(2)} €`;
}

// Gérer le bouton de paiement
document.getElementById('btn-payer').addEventListener('click', () => {
   const total = panier.getTotal();

   if (!wallet.hasSufficientFunds(total)) {
      alert('Solde insuffisant pour passer la commande.');
      return;
   }

   try {
      // Sauvegarder les items avant de vider le panier
      savedItems = JSON.parse(JSON.stringify(panier.items));

      // Créer une nouvelle commande
      const order = new Order(Date.now(), 'Sylvain ANTON', savedItems);

      // Ajouter les informations de livraison
      order.deliveryInfo = deliveryInfo;

      // Débiter le portefeuille
      wallet.withdraw(total);

      // Sauvegarder la commande
      order.save();

      // Vider le panier
      panier.viderPanier();

      validatedSteps.add('recapitulatif'); // Marquer l'étape récapitulatif comme accessible
      // Afficher le récapitulatif
      showStep('recapitulatif');
      afficherRecapitulatif();

   } catch (error) {
      console.error('Erreur lors de la création de la commande:', error);
      alert('Une erreur est survenue lors de la création de votre commande. Veuillez réessayer.');
   }
});

// Vérifier si le panier est vide
if (panier.items.length === 0) {
   window.location.href = 'panier.html';
}

// Initialiser la première étape
showStep('livraison');
