/* =========================
   1. Dark Mode Toggle Functionality
   ========================= */

   const darkModeToggle = document.getElementById('darkModeToggle');
   const bodyElement = document.body;
   
   window.addEventListener('load', () => {
       const darkMode = localStorage.getItem('darkMode');
       if (darkMode === 'enabled') {
           bodyElement.classList.add('dark-mode');
           if (darkModeToggle) darkModeToggle.checked = true;
           updateToggleIcon(true);
       }
   });
   
   function updateToggleIcon(isDarkMode) {
       const toggleLabelIcon = document.querySelector('.form-check-label i');
       if (isDarkMode) {
           toggleLabelIcon.classList.remove('fa-moon');
           toggleLabelIcon.classList.add('fa-sun');
       } else {
           toggleLabelIcon.classList.remove('fa-sun');
           toggleLabelIcon.classList.add('fa-moon');
       }
   }
   
   if (darkModeToggle) {
       darkModeToggle.addEventListener('change', () => {
           if (darkModeToggle.checked) {
               bodyElement.classList.add('dark-mode');
               localStorage.setItem('darkMode', 'enabled');
               updateToggleIcon(true);
           } else {
               bodyElement.classList.remove('dark-mode');
               localStorage.setItem('darkMode', 'disabled');
               updateToggleIcon(false);
           }
       });
   }
   
   /* =========================
      2. Navbar Scroll Effect
      ========================= */
   
   window.addEventListener('scroll', () => {
       const navbar = document.querySelector('.navbar');
       if (window.scrollY > 50) {
           navbar.classList.add('navbar-scrolled');
       } else {
           navbar.classList.remove('navbar-scrolled');
       }
   });
   
   /* =========================
      3. Initialize Bootstrap Tooltips
      ========================= */
   
   const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
   const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
       return new bootstrap.Tooltip(tooltipTriggerEl);
   });
   
   /* =========================
      4. Confirmation Prompts for Delete Actions
      ========================= */
   
   // Function to confirm deletion
   function confirmDelete() {
       return confirm('Are you sure you want to delete this section? This action cannot be undone.');
   }
   
   /* =========================
      5. Smooth Scroll for Navbar Links
      ========================= */
   
   document.querySelectorAll('.nav-link').forEach(anchor => {
       anchor.addEventListener('click', function (e) {
           // Ignore internal links that start with '/'
           if (this.getAttribute('href').startsWith('/')) return;
   
           e.preventDefault();
           const target = document.querySelector(this.getAttribute('href'));
           if (target) {
               window.scrollTo({
                   top: target.offsetTop,
                   behavior: 'smooth'
               });
           }
       });
   });
   
   /* =========================
      6. Additional Animations and Effects
      ========================= */
   
   const navbarBrand = document.querySelector('.navbar-brand img');
   if (navbarBrand) {
       navbarBrand.addEventListener('mouseover', () => {
           navbarBrand.classList.add('animate__animated', 'animate__bounce');
       });
       navbarBrand.addEventListener('animationend', () => {
           navbarBrand.classList.remove('animate__animated', 'animate__bounce');
       });
   }
   
   const footerIcons = document.querySelectorAll('.footer-icon');
   footerIcons.forEach(icon => {
       icon.addEventListener('click', () => {
           icon.classList.add('animate__animated', 'animate__rubberBand');
           icon.addEventListener('animationend', () => {
               icon.classList.remove('animate__animated', 'animate__rubberBand');
           }, { once: true });
       });
   });
   
   /* =========================
      7. Ticket Options Chart Enhancements
      ========================= */
   
   document.addEventListener('DOMContentLoaded', function () {
       const chartElement = document.getElementById('ticketOptionsChart');
       if (chartElement) {
           const labels = JSON.parse(chartElement.getAttribute('data-labels') || '[]');
           const data = JSON.parse(chartElement.getAttribute('data-data') || '[]');
   
           if(labels.length > 0 && data.length > 0) {
               const ctx = chartElement.getContext('2d');
               const ticketOptionsChart = new Chart(ctx, {
                   type: 'pie',
                   data: {
                       labels: labels,
                       datasets: [{
                           label: 'Ticket Options',
                           data: data,
                           backgroundColor: [
                               '#1abc9c',
                               '#3498db',
                               '#e74c3c',
                               '#f1c40f',
                               '#9b59b6',
                               '#e67e22',
                               '#2ecc71',
                               '#95a5a6',
                               '#34495e',
                               '#16a085'
                           ],
                           hoverOffset: 4
                       }]
                   },
                   options: {
                       responsive: true,
                       plugins: {
                           legend: {
                               position: 'right',
                               labels: {
                                   color: '#dcdde1'
                               }
                           },
                           tooltip: {
                               callbacks: {
                                   label: function(context) {
                                       let label = context.label || '';
                                       if (label) {
                                           label += ': ';
                                       }
                                       if (context.parsed !== null) {
                                           label += context.parsed;
                                       }
                                       return label;
                                   }
                               },
                               backgroundColor: '#2c3e50',
                               titleColor: '#dcdde1',
                               bodyColor: '#dcdde1'
                           }
                       },
                       animation: {
                           animateScale: true,
                           animateRotate: true
                       }
                   }
               });
   
               /* =========================
                  Additional Chart Enhancements
                  ========================= */
   
               if(ticketOptionsChart){
                   ticketOptionsChart.options.animation = {
                       animateScale: true,
                       animateRotate: true
                   };
               }
           }
       }
   });
   