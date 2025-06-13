export async function fetchMenus() {
   try {
      const reponse = await fetch("http://127.0.0.1:5500/menu.json");
      if (!reponse.ok) {
         throw new Error(`Erreur HTTP: ${reponse.status}`);
      }
      const data = await reponse.json();
      const menus = Object.values(data);
      console.log("Menus récupérés:", menus);

      if (!menus.length) {
         throw new Error("Aucun menu trouvé");
      }
      return menus;

   } catch (error) {
      throw new Error(`Erreur de récupération: ${error.message}`);
   }
}