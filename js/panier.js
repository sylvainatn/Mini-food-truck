// Gestion du panier avec localStorage
export class Panier {
   constructor() {
      this.items = JSON.parse(localStorage.getItem('panier')) || [];
   }

   // Ajouter un plat au panier
   ajouterPlat(plat) {
      const existingItem = this.items.find(item => item.id === plat.id);
      if (existingItem) {
         existingItem.quantite += 1;
      } else {
         this.items.push({
            ...plat,
            quantite: 1
         });
      }
      this.sauvegarder();
   }

   // Mettre à jour la quantité d'un plat
   updateQuantite(platId, quantite) {
      const item = this.items.find(item => item.id === platId);
      if (item) {
         item.quantite = parseInt(quantite);
         if (item.quantite <= 0) {
            this.supprimerPlat(platId);
         } else {
            this.sauvegarder();
         }
      }
   }

   // Supprimer un plat du panier
   supprimerPlat(platId) {
      this.items = this.items.filter(item => item.id !== platId);
      this.sauvegarder();
   }

   // Calculer le total du panier
   getTotal() {
      return this.items.reduce((total, item) => total + (item.prix * item.quantite), 0);
   }

   // Vider le panier
   viderPanier() {
      this.items = [];
      this.sauvegarder();
   }

   // Sauvegarder le panier dans localStorage
   sauvegarder() {
      localStorage.setItem('panier', JSON.stringify(this.items));
      // Déclencher un événement pour notifier les changements
      window.dispatchEvent(new CustomEvent('panierUpdate'));
   }
}

export const panier = new Panier();
