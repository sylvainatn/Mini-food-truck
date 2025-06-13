export class Wallet {
   constructor() {
      this.balance = parseFloat(localStorage.getItem('wallet_balance')) || 100.00; // Solde initial de 100€
      this.transactions = JSON.parse(localStorage.getItem('transactions')) || [];
   }

   // Obtenir le solde actuel
   getBalance() {
      return this.balance;
   }

   // Ajouter de l'argent
   deposit(amount) {
      amount = parseFloat(amount);
      if (amount > 0) {
         this.balance += amount;
         this.addTransaction('deposit', amount);
         this.save();
         return true;
      }
      return false;
   }

   // Retirer de l'argent
   withdraw(amount) {
      amount = parseFloat(amount);
      if (amount > 0 && this.balance >= amount) {
         this.balance -= amount;
         this.addTransaction('withdraw', amount);
         this.save();
         return true;
      }
      return false;
   }

   // Vérifier si le solde est suffisant
   hasSufficientFunds(amount) {
      return this.balance >= amount;
   }

   // Ajouter une transaction à l'historique
   addTransaction(type, amount, details = {}) {
      const transaction = {
         id: Date.now(),
         type,
         amount,
         date: new Date().toISOString(),
         ...details
      };

      this.transactions.push(transaction);
      this.saveTransactions();

      return transaction;
   }

   // Obtenir l'historique des transactions
   getTransactions() {
      return this.transactions;
   }

   // Sauvegarder le solde
   save() {
      localStorage.setItem('wallet_balance', this.balance.toString());
      this.notifyUpdate();
   }

   // Sauvegarder les transactions
   saveTransactions() {
      localStorage.setItem('transactions', JSON.stringify(this.transactions));
   }

   // Notifier les changements
   notifyUpdate() {
      window.dispatchEvent(new CustomEvent('walletUpdate', {
         detail: {
            balance: this.balance,
            lastTransaction: this.transactions[this.transactions.length - 1]
         }
      }));
   }
}

export const wallet = new Wallet();
