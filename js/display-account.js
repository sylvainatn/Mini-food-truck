import { wallet } from './wallet.js';

// Formater la carte bancaire pendant la saisie
document.getElementById('card-number').addEventListener('input', (e) => {
   let value = e.target.value.replace(/\D/g, '');
   let formattedValue = '';
   for (let i = 0; i < value.length; i++) {
      if (i > 0 && i % 4 === 0) {
         formattedValue += ' ';
      }
      formattedValue += value[i];
   }
   e.target.value = formattedValue.slice(0, 19);
});

// Formater la date d'expiration
document.getElementById('card-expiry').addEventListener('input', (e) => {
   let value = e.target.value.replace(/\D/g, '');
   if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2);
   }
   e.target.value = value.slice(0, 5);
});

// Limiter le CVC à 3 chiffres
document.getElementById('card-cvc').addEventListener('input', (e) => {
   e.target.value = e.target.value.replace(/\D/g, '').slice(0, 3);
});

// Gérer le formulaire d'ajout de fonds
document.getElementById('add-funds-form').addEventListener('submit', async (e) => {
   e.preventDefault();

   const amount = parseFloat(document.getElementById('amount').value);
   const cardNumber = document.getElementById('card-number').value;
   const cardExpiry = document.getElementById('card-expiry').value;
   const cardCvc = document.getElementById('card-cvc').value;

   // Validation basique
   if (!cardNumber || cardNumber.replace(/\s/g, '').length !== 16) {
      alert('Numéro de carte invalide');
      return;
   }
   if (!cardExpiry || !cardExpiry.match(/^\d{2}\/\d{2}$/)) {
      alert('Date d\'expiration invalide');
      return;
   }
   if (!cardCvc || cardCvc.length !== 3) {
      alert('CVC invalide');
      return;
   }

   // Simuler un chargement
   const submitButton = e.target.querySelector('button[type="submit"]');
   const originalText = submitButton.textContent;
   submitButton.disabled = true;
   submitButton.textContent = 'Traitement en cours...';

   try {
      // Simuler une requête API
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Ajouter les fonds
      wallet.deposit(amount);

      // Ajouter la transaction à l'historique
      addTransactionToHistory({
         type: 'deposit',
         amount: amount,
         date: new Date(),
         card: '****' + cardNumber.slice(-4)
      });

      // Réinitialiser le formulaire
      e.target.reset();

      alert('Fonds ajoutés avec succès !');

   } catch (error) {
      alert('Une erreur est survenue. Veuillez réessayer.');

   } finally {
      submitButton.disabled = false;
      submitButton.textContent = originalText;
   }
});

// Mettre à jour l'affichage du solde
function updateBalanceDisplay() {
   const balanceElement = document.getElementById('account-balance');
   balanceElement.textContent = wallet.getBalance().toFixed(2) + ' €';
}

// Ajouter une transaction à l'historique
function addTransactionToHistory(transaction) {
   const container = document.getElementById('transactions-list');
   const transactionElement = document.createElement('div');
   transactionElement.className = 'py-4 flex justify-between items-center';

   const date = new Date(transaction.date).toLocaleString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
   });

   transactionElement.innerHTML = `
        <div>
            <p class="font-semibold">${transaction.type === 'deposit' ? 'Dépôt' : 'Paiement'}</p>
            <p class="text-sm text-gray-400">${date}</p>
            ${transaction.card ? `<p class="text-sm text-gray-400">Carte: ${transaction.card}</p>` : ''}
        </div>
        <div class="text-right">
            <p class="font-semibold ${transaction.type === 'deposit' ? 'text-green-400' : 'text-red-400'}">
                ${transaction.type === 'deposit' ? '+' : '-'}${transaction.amount.toFixed(2)} €
            </p>
        </div>
    `;

   container.insertBefore(transactionElement, container.firstChild);
}

// Initialiser l'affichage
updateBalanceDisplay();

// Charger l'historique des transactions (simulation)
const historicTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
historicTransactions.forEach(transaction => addTransactionToHistory(transaction));
