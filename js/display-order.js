import { Order } from './order.js';
import { panier } from './panier.js';
import { wallet } from './wallet.js';

let currentStep = 'livraison';
let deliveryInfo = null;
let savedItems = [];
let validatedSteps = new Set(['livraison']);

// Gérer la navigation entre les étapes
function showStep(step) {
   document.querySelectorAll('.step-content').forEach(el => el.classList.add('hidden'));
   document.getElementById(`step-${step}`).classList.remove('hidden');

   document.querySelectorAll('nav button').forEach(button => {
      const buttonStep = button.dataset.step;
      const stepNumber = button.querySelector('span:first-child');
      const stepText = button.querySelector('span:last-child');

      if (buttonStep === step) {
         stepNumber.classList.remove('bg-gray-600', 'bg-green-500');
         stepNumber.classList.add('bg-orange-500');
         stepText.classList.remove('text-gray-400');
         stepText.classList.add('text-white');
      } else if (validatedSteps.has(buttonStep)) {
         stepNumber.classList.remove('bg-gray-600', 'bg-orange-500');
         stepNumber.classList.add('bg-green-500');
         stepText.classList.remove('text-gray-400');
         stepText.classList.add('text-white');
      }

      button.classList.add('cursor-pointer');
      stepText.classList.add('text-white');
      stepText.classList.remove('text-gray-400');
   });

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
   const steps = ['livraison', 'paiement', 'recapitulatif', 'suivi'];
   return steps.indexOf(step);
}

// Afficher le résumé de la commande
function afficherResumeCommande() {
   const container = document.getElementById('resume-commande');
   const totalElement = document.getElementById('commande-total');

   container.innerHTML = '';

   // Rediriger vers le panier si celui-ci est vide
   if (panier.items.length === 0) {
      window.location.href = 'panier.html';
      return;
   }

   // Afficher chaque item
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

   // Mettre à jour le total
   totalElement.textContent = `${panier.getTotal().toFixed(2)} €`;
}

// Gérer le formulaire de livraison
document.getElementById('delivery-form').addEventListener('submit', (e) => {
   e.preventDefault();

   deliveryInfo = {
      address: e.target.address.value,
      postalCode: e.target['postal-code'].value,
      city: e.target.city.value
   };

   validatedSteps.add('paiement');
   showStep('paiement');
   updateBalanceDisplay();
   afficherResumePaiement();
});

// Mettre à jour l'affichage du solde
function updateBalanceDisplay() {
   const balanceElement = document.getElementById('account-balance');
   balanceElement.textContent = wallet.getBalance().toFixed(2) + ' €';

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

// Simuler l'envoi de la commande
async function fakePostCommande() {
   return new Promise(resolve => setTimeout(resolve, 1500));
}

// Mettre à jour l'état d'une étape
function updateStepStatus(stepId, status, message) {
   const step = document.getElementById(`step-${stepId}`);
   const statusElement = document.getElementById(`${stepId}-status`);

   if (status === 'complete') {
      step.classList.remove('opacity-50');
      step.querySelector('.rounded-full').classList.remove('bg-gray-600');
      step.querySelector('.rounded-full').classList.add('bg-green-500');
      statusElement.classList.remove('text-yellow-500', 'text-gray-400');
      statusElement.classList.add('text-green-400');
      statusElement.textContent = '✓ Terminé';
   } else if (status === 'in-progress') {
      step.classList.remove('opacity-50');
      step.querySelector('.rounded-full').classList.remove('bg-gray-600');
      step.querySelector('.rounded-full').classList.add('bg-yellow-500');
      statusElement.classList.remove('text-gray-400');
      statusElement.classList.add('text-yellow-500');
      statusElement.textContent = message || 'En cours...';
   }
}

// Simuler le processus de commande
async function simulateOrderProcess() {
   try {
      await fakePostCommande();

      updateStepStatus('preparation', 'in-progress', 'En cours...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      updateStepStatus('preparation', 'complete');

      updateStepStatus('delivery', 'in-progress', 'En route...');
      await new Promise(resolve => setTimeout(resolve, 4000));
      updateStepStatus('delivery', 'complete');

      updateStepStatus('delivered', 'in-progress', 'Presque terminé...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      updateStepStatus('delivered', 'complete');

      document.getElementById('order-complete').classList.remove('hidden');

   } catch (error) {
      console.error('Erreur lors de la simulation:', error);
      alert('Une erreur est survenue lors du traitement de votre commande.');
   }
}

// Gérer le clic sur le bouton de paiement
document.getElementById('btn-payer').addEventListener('click', () => {
   const total = panier.getTotal();

   if (!wallet.hasSufficientFunds(total)) {
      alert('Solde insuffisant pour passer la commande.');
      return;
   }

   try {
      savedItems = JSON.parse(JSON.stringify(panier.items));
      const order = new Order(Date.now(), 'Sylvain ANTON', savedItems);
      order.deliveryInfo = deliveryInfo;
      wallet.withdraw(total);
      order.save();
      panier.viderPanier();

      validatedSteps.add('recapitulatif');
      showStep('recapitulatif');
      afficherRecapitulatif();
   } catch (error) {
      console.error('Erreur lors de la création de la commande:', error);
      alert('Une erreur est survenue lors de la création de votre commande. Veuillez réessayer.');
   }
});

// Gérer le clic sur le bouton de validation finale
document.getElementById('btn-valider-commande').addEventListener('click', async () => {
   validatedSteps.add('suivi');
   showStep('suivi');
   simulateOrderProcess();
});

// Navigation entre les étapes
document.querySelectorAll('.nav-step').forEach(button => {
   button.addEventListener('click', () => {
      const targetStep = button.dataset.step;
      showStep(targetStep);
   });
});

// Initialiser
if (panier.items.length === 0) {
   window.location.href = 'panier.html';
} else {
   showStep('livraison');
}

// Afficher le récapitulatif
function afficherRecapitulatif() {
   const addressElement = document.getElementById('recap-address');
   addressElement.innerHTML = `
      <p>${deliveryInfo.address}</p>
      <p>${deliveryInfo.postalCode} ${deliveryInfo.city}</p>
   `;

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
