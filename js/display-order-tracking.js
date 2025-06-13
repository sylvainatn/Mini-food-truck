import { Order } from './order.js';

// État global pour suivre la vue active
let currentView = 'current-order'; // 'current-order' ou 'history'
let trackingInterval = null;

// Formater la date
function formatDate(dateString) {
   const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
   };
   return new Date(dateString).toLocaleDateString('fr-FR', options);
}

// Obtenir la dernière commande
function getLastOrder() {
   const orders = Order.getAllOrders();
   return orders.length > 0 ? orders[orders.length - 1] : null;
}

// Afficher les détails de la commande
function displayOrderDetails(order) {
   // Afficher les informations de livraison
   const deliveryInfoElement = document.getElementById('delivery-info');
   if (order.deliveryInfo) {
      deliveryInfoElement.innerHTML = `
            <p>${order.deliveryInfo.address}</p>
            <p>${order.deliveryInfo.postalCode} ${order.deliveryInfo.city}</p>
        `;
   }

   // Afficher les articles
   const orderItemsElement = document.getElementById('order-items');
   orderItemsElement.innerHTML = '';

   order.items.forEach(item => {
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

      orderItemsElement.appendChild(itemElement);
   });

   // Afficher le total
   const total = order.items.reduce((sum, item) => sum + (item.prix * item.quantite), 0);
   document.getElementById('order-total').textContent = `${total.toFixed(2)} €`;
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

// Initialiser le suivi
function initOrderTracking() {
   const lastOrder = getLastOrder();
   const noOrderElement = document.getElementById('no-order');
   const orderTrackingElement = document.getElementById('order-tracking');

   if (!lastOrder) {
      noOrderElement.classList.remove('hidden');
      orderTrackingElement.parentElement.classList.add('hidden');
      return;
   }

   noOrderElement.classList.add('hidden');
   orderTrackingElement.parentElement.classList.remove('hidden');

   // Afficher les détails de la commande
   displayOrderDetails(lastOrder);

   // Réinitialiser toutes les étapes
   ['preparation', 'delivery', 'delivered'].forEach(stepId => {
      const step = document.getElementById(`step-${stepId}`);
      const statusElement = document.getElementById(`${stepId}-status`);

      step.classList.add('opacity-50');
      step.querySelector('.rounded-full').classList.remove('bg-green-500', 'bg-yellow-500');
      step.querySelector('.rounded-full').classList.add('bg-gray-600');
      statusElement.classList.remove('text-green-400', 'text-yellow-500');
      statusElement.classList.add('text-gray-400');
      statusElement.textContent = 'En attente';
   });

   // Simuler la progression de la commande
   const creationTime = new Date(lastOrder.date).getTime();
   const now = Date.now();
   const timeDiff = now - creationTime;

   // Nettoyer l'ancien intervalle s'il existe
   if (trackingInterval) {
      clearInterval(trackingInterval);
   }

   // Simuler les étapes en fonction du temps écoulé
   if (timeDiff < 3000) {
      updateStepStatus('preparation', 'in-progress', 'En cours...');
   } else if (timeDiff < 7000) {
      updateStepStatus('preparation', 'complete');
      updateStepStatus('delivery', 'in-progress', 'En route...');
   } else if (timeDiff < 9000) {
      updateStepStatus('preparation', 'complete');
      updateStepStatus('delivery', 'complete');
      updateStepStatus('delivered', 'in-progress', 'Presque terminé...');
   } else {
      updateStepStatus('preparation', 'complete');
      updateStepStatus('delivery', 'complete');
      updateStepStatus('delivered', 'complete');
   }

   // Mettre à jour le statut régulièrement
   trackingInterval = setInterval(() => {
      if (currentView === 'current-order') {
         const now = Date.now();
         const timeDiff = now - creationTime;

         if (timeDiff < 3000) {
            updateStepStatus('preparation', 'in-progress', 'En cours...');
         } else if (timeDiff < 7000) {
            updateStepStatus('preparation', 'complete');
            updateStepStatus('delivery', 'in-progress', 'En route...');
         } else if (timeDiff < 9000) {
            updateStepStatus('preparation', 'complete');
            updateStepStatus('delivery', 'complete');
            updateStepStatus('delivered', 'in-progress', 'Presque terminé...');
         } else {
            updateStepStatus('preparation', 'complete');
            updateStepStatus('delivery', 'complete');
            updateStepStatus('delivered', 'complete');

            // Arrêter l'intervalle quand la commande est terminée
            clearInterval(trackingInterval);
            trackingInterval = null;
         }
      }
   }, 1000);
}

// Afficher l'historique des commandes
function displayOrderHistory() {
   const orders = Order.getAllOrders().reverse(); // Plus récent en premier
   const historyList = document.getElementById('history-list');
   historyList.innerHTML = '';

   if (orders.length === 0) {
      historyList.innerHTML = '<p class="text-gray-400 text-center">Aucune commande dans l\'historique.</p>';
      return;
   }

   orders.forEach(order => {
      const orderElement = document.createElement('div');
      orderElement.className = 'bg-gray-700 rounded-lg p-4 space-y-3';

      const total = order.items.reduce((sum, item) => sum + (item.prix * item.quantite), 0);

      orderElement.innerHTML = `
         <div class="flex justify-between items-start">
            <div>
               <p class="font-semibold">${formatDate(order.date)}</p>
               <p class="text-sm text-gray-400">${order.items.length} article(s)</p>
            </div>
            <p class="font-bold">${total.toFixed(2)} €</p>
         </div>
         <div class="border-t border-gray-600 pt-3">
            <div class="text-sm text-gray-400">
               <p>${order.deliveryInfo.address}</p>
               <p>${order.deliveryInfo.postalCode} ${order.deliveryInfo.city}</p>
            </div>
         </div>
      `;

      historyList.appendChild(orderElement);
   });
}

// Gérer la navigation
function initNavigation() {
   const currentOrderBtn = document.getElementById('current-order-btn');
   const orderHistoryBtn = document.getElementById('order-history-btn');
   const orderTrackingSection = document.getElementById('order-tracking').parentElement;
   const orderHistorySection = document.getElementById('order-history');

   currentOrderBtn.addEventListener('click', () => {
      if (currentView === 'history') {
         currentView = 'current-order';
         currentOrderBtn.classList.replace('bg-gray-800', 'bg-orange-500');
         currentOrderBtn.classList.replace('border-gray-600', 'border-orange-600');
         orderHistoryBtn.classList.replace('bg-orange-500', 'bg-gray-800');
         orderHistoryBtn.classList.replace('border-orange-600', 'border-gray-600');
         orderTrackingSection.classList.remove('hidden');
         orderHistorySection.classList.add('hidden');
         initOrderTracking(); // Réinitialiser le suivi
      }
   });

   orderHistoryBtn.addEventListener('click', () => {
      if (currentView === 'current-order') {
         currentView = 'history';
         orderHistoryBtn.classList.replace('bg-gray-800', 'bg-orange-500');
         orderHistoryBtn.classList.replace('border-gray-600', 'border-orange-600');
         currentOrderBtn.classList.replace('bg-orange-500', 'bg-gray-800');
         currentOrderBtn.classList.replace('border-orange-600', 'border-gray-600');
         orderTrackingSection.classList.add('hidden');
         orderHistorySection.classList.remove('hidden');
         displayOrderHistory();

         // Arrêter le suivi lorsqu'on passe à l'historique
         if (trackingInterval) {
            clearInterval(trackingInterval);
            trackingInterval = null;
         }
      }
   });
}

// Initialiser la page
document.addEventListener('DOMContentLoaded', () => {
   initOrderTracking();
   initNavigation();
});
