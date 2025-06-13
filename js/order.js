class Order {
   constructor(orderId, customerName, items) {
      this.orderId = orderId;
      this.customerName = customerName;
      this.items = items; // Array of item objects
      this.status = 'En attente'; // Statut par défaut
      this.date = new Date().toISOString();
      this.total = this.calculateTotal();
      this.deliveryInfo = null; // Information de livraison
   }

   // Calculer le total de la commande
   calculateTotal() {
      return this.items.reduce((total, item) => total + (item.prix * item.quantite), 0);
   }

   // Sauvegarder la commande
   save() {
      const orders = Order.getAllOrders();
      orders.push({
         orderId: this.orderId,
         customerName: this.customerName,
         items: this.items,
         status: this.status,
         date: this.date,
         total: this.total,
         deliveryInfo: this.deliveryInfo
      });
      localStorage.setItem('orders', JSON.stringify(orders));
   }

   // Obtenir toutes les commandes
   static getAllOrders() {
      return JSON.parse(localStorage.getItem('orders')) || [];
   }

   // Obtenir une commande spécifique
   static getOrder(orderId) {
      const orders = Order.getAllOrders();
      const orderData = orders.find(order => order.orderId === orderId);

      if (orderData) {
         const order = new Order(orderData.orderId, orderData.customerName, orderData.items);
         order.status = orderData.status;
         order.date = orderData.date;
         order.deliveryInfo = orderData.deliveryInfo;
         return order;
      }
      return null;
   }

   // Mettre à jour le statut d'une commande
   updateStatus(newStatus) {
      this.status = newStatus;
      const orders = Order.getAllOrders();
      const index = orders.findIndex(order => order.orderId === this.orderId);
      if (index !== -1) {
         orders[index].status = newStatus;
         localStorage.setItem('orders', JSON.stringify(orders));
      }
   }

   // Formater la date pour l'affichage
   getFormattedDate() {
      return new Date(this.date).toLocaleString('fr-FR', {
         year: 'numeric',
         month: 'long',
         day: 'numeric',
         hour: '2-digit',
         minute: '2-digit'
      });
   }

   // Formater le prix pour l'affichage
   getFormattedTotal() {
      return `${this.total.toFixed(2)} €`;
   }
}

export { Order };