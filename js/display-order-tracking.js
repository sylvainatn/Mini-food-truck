import { Order } from './order.js';

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
   const orderTrackingElement = document.getElementById('order-tracking'); if (!lastOrder) {
      noOrderElement.classList.remove('hidden');
      orderTrackingElement.parentElement.classList.add('hidden');
      return;
   }

   noOrderElement.classList.add('hidden');
   orderTrackingElement.parentElement.classList.remove('hidden');

   // Afficher les détails de la commande
   displayOrderDetails(lastOrder);

   // Simuler la progression de la commande
   const creationTime = new Date(lastOrder.date).getTime();
   const now = Date.now();
   const timeDiff = now - creationTime;

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
   setInterval(() => {
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
      }
   }, 1000);
}

// Initialiser la page
document.addEventListener('DOMContentLoaded', initOrderTracking);
