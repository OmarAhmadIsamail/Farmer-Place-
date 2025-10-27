class ComponentLoader {
    constructor() {
        this.components = {};
    }

    // Load component and insert into specified element
    async loadComponent(componentName, targetElementId) {
        try {
            const response = await fetch(`components/${componentName}.html`);
            if (!response.ok) {
                throw new Error(`Failed to load ${componentName}`);
            }
            
            const html = await response.text();
            const targetElement = document.getElementById(targetElementId);
            
            if (targetElement) {
                targetElement.innerHTML = html;
                this.components[componentName] = html;
                
                // Initialize component-specific functionality
                this.initComponent(componentName);
                
                console.log(`${componentName} loaded successfully`);
            } else {
                console.error(`Target element #${targetElementId} not found`);
            }
        } catch (error) {
            console.error(`Error loading ${componentName}:`, error);
        }
    }

    // Initialize component-specific functionality
    initComponent(componentName) {
        switch (componentName) {
            case 'header':
                this.initHeader();
                break;
            // Add more cases for other components
        }
    }

    // Initialize header functionality
    initHeader() {
        // Update active link based on current page
        this.updateActiveLink();
        
        // Initialize mobile navigation toggle
        this.initMobileNav();
        
        // Initialize dropdown functionality
        this.initDropdowns();
    }

    // Update active navigation link
    updateActiveLink() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const navLinks = document.querySelectorAll('.navmenu a');
        
        navLinks.forEach(link => {
            const linkHref = link.getAttribute('href');
            if (linkHref === currentPage) {
                // Remove active class from all links
                navLinks.forEach(l => l.classList.remove('active'));
                // Add active class to current link
                link.classList.add('active');
            }
        });
    }

    // Initialize mobile navigation toggle
    initMobileNav() {
        const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
        const navmenu = document.querySelector('#navmenu');
        
        if (mobileNavToggle && navmenu) {
            mobileNavToggle.addEventListener('click', function() {
                navmenu.classList.toggle('mobile-nav-active');
                this.classList.toggle('bi-list');
                this.classList.toggle('bi-x');
            });
        }
    }

    // Initialize dropdown functionality
    initDropdowns() {
        const dropdownToggles = document.querySelectorAll('.toggle-dropdown');
        
        dropdownToggles.forEach(toggle => {
            toggle.addEventListener('click', function(e) {
                e.preventDefault();
                const dropdown = this.closest('.dropdown');
                dropdown.classList.toggle('dropdown-active');
            });
        });

        // Close dropdowns when clicking outside
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.dropdown')) {
                document.querySelectorAll('.dropdown').forEach(dropdown => {
                    dropdown.classList.remove('dropdown-active');
                });
            }
        });
    }

    // Load multiple components
    async loadComponents(components) {
        const loadPromises = components.map(component => 
            this.loadComponent(component.name, component.target)
        );
        await Promise.all(loadPromises);
    }
}

// Create global instance
window.componentLoader = new ComponentLoader();

// Auto-load components when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Load header into element with id 'header-container'
    componentLoader.loadComponent('header', 'header-container');
});