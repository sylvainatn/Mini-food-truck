import { fetchMenus } from './menu.js';
import { panier } from './panier.js';

fetchMenus().then(menus => {

   const menuContainer = document.getElementById("menu-container");

   menus.forEach(menu => {

      const menuItem = document.createElement("div");
      menuItem.className = "bg-gray-800 shadow-lg p-8 rounded-lg";

      menu.categories.forEach(category => {

         const categoryElement = document.createElement("div");
         categoryElement.className = "mb-8 pb-4 border-b border-gray-700";

         const categoryTitle = document.createElement("h4");
         categoryTitle.className = "text-2xl font-bold text-white mb-4 pb-2 border-b-2 border-orange-500 inline-block";
         categoryTitle.textContent = category.nom;

         categoryElement.appendChild(categoryTitle);

         const dishesContainer = document.createElement("div");
         dishesContainer.className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6";

         category.plats.forEach(plat => {
            const platElement = document.createElement("div");
            const addButton = document.createElement("button");
            const imageElement = document.createElement("img");

            // Image
            imageElement.src = plat.image || 'placeholder.jpg'; // Image par défaut si pas d'image
            imageElement.className = "w-full h-48 object-cover rounded-t-lg mb-4";
            imageElement.alt = plat.nom;
            imageElement.onerror = function () {
               this.src = 'https://via.placeholder.com/300x200?text=Image+non+disponible';
            };

            addButton.className = "px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors duration-200";
            addButton.textContent = "Ajouter";

            addButton.addEventListener('click', () => {
               panier.ajouterPlat({
                  id: plat.id || `${menu.nom}-${category.nom}-${plat.nom}`,
                  nom: plat.nom,
                  prix: plat.prix,
                  image: plat.image
               });

               const originalText = addButton.textContent;
               const originalClass = addButton.className;
               addButton.textContent = "Ajouté !";
               addButton.className = "px-4 py-2 bg-green-500 text-white rounded-lg transition-colors duration-200";
               setTimeout(() => {
                  addButton.textContent = originalText;
                  addButton.className = originalClass;
               }, 1000);
            });
            platElement.className = "bg-gray-900 rounded-lg p-4 shadow hover:shadow-orange-500/20 transform hover:-translate-y-1 transition-all duration-200 border border-gray-700";

            // Créer les éléments pour le contenu
            const nomElement = document.createElement("h5");
            nomElement.className = "text-xl font-semibold text-white mb-2";
            nomElement.textContent = plat.nom;

            const descElement = document.createElement("p");
            descElement.className = "text-gray-400 mb-3 min-h-[40px]";
            descElement.textContent = plat.description || '';

            const prixElement = document.createElement("p");
            prixElement.className = "text-right font-bold text-orange-400";
            prixElement.textContent = `${plat.prix}€`;

            // Ajouter les éléments dans le bon ordre
            platElement.appendChild(imageElement);
            platElement.appendChild(nomElement);
            platElement.appendChild(descElement);
            platElement.appendChild(prixElement);
            platElement.appendChild(addButton);

            dishesContainer.appendChild(platElement);
         });

         categoryElement.appendChild(dishesContainer);
         menuItem.appendChild(categoryElement);
      });

      menuContainer.appendChild(menuItem);
   });
}).catch(error => {
   console.error("Erreur lors de la récupération des menus:", error.message);
   const menuContainer = document.getElementById("menu-container");
   if (menuContainer) {
      menuContainer.innerHTML = `<p>Erreur lors du chargement des menus: ${error.message}</p>`;
   }
});