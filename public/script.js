const toggleDropdown = (dropdown, menu, isOpen) => {
  dropdown.classList.toggle("open", isOpen);
  menu.style.height = isOpen ? `${menu.scrollHeight}px` : 0;
};

const closeAllDropdowns = () => {
  document.querySelectorAll(".dropdown-container.open").forEach((openDropdown) => {
    toggleDropdown(openDropdown, openDropdown.querySelector(".dropdown-menu"), false);
  });
};

document.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.querySelector('.sidebar');
  const menuButton = document.querySelector('.sidebar-menu-button');
  const main = document.querySelector('main');

  // Gestion du menu mobile
  menuButton?.addEventListener('click', () => {
    sidebar.classList.toggle('active');
  });

  // Fermer le menu au clic en dehors sur mobile
  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768) {
      if (!sidebar.contains(e.target) && !menuButton.contains(e.target)) {
        sidebar.classList.remove('active');
      }
    }
  });

  // Gestion du redimensionnement de la fenêtre
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      sidebar.classList.remove('active');
    }
  });
});