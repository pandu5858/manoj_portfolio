document.addEventListener('DOMContentLoaded', () => {
    console.log('main.js loaded successfully'); // Debug: Confirm script loads

    // Dynamically load EmailJS SDK
    function loadEmailJSSDK() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.emailjs.com/dist/email.min.js';
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load EmailJS SDK'));
            document.head.appendChild(script);
        });
    }

    // Inject CSS for notification animation
    function injectNotificationStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .notification {
                position: fixed;
                bottom: 20px;
                right: -300px;
                background-color: #FBBF24;
                color: #121A2D;
                padding: 15px 20px;
                border-radius: 5px;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
                z-index: 1000;
                font-family: 'Inter', sans-serif;
                font-size: 16px;
                max-width: 300px;
                transition: right 0.5s ease-in-out;
            }
            .notification.error {
                background-color: #f44336;
                color: #FFFFFF;
            }
            .notification.show {
                right: 20px;
            }
        `;
        document.head.appendChild(style);
    }

    // Create and show notification
    function showNotification(message, isError = false) {
        const notification = document.createElement('div');
        notification.className = `notification ${isError ? 'error' : ''}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 500);
        }, 4000);
    }

    // Run once to inject styles
    injectNotificationStyles();

    // Navigation
    const header = document.querySelector('.header');
    const navMenu = document.querySelector('.nav__menu');
    const navToggle = document.querySelector('.nav__toggle');
    const navClose = document.querySelector('.nav__close');
    const navLinks = document.querySelectorAll('.nav__link');

    // Debug: Log if elements are found
    if (!navToggle) console.error('Nav toggle not found');
    if (!navMenu) console.error('Nav menu not found');
    if (!navClose) console.error('Nav close not found');

    // Show/Hide Navigation Menu
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.add('show');
            navMenu.querySelector('.nav__link')?.focus();
            console.log('Menu opened');
        });
    }

    if (navClose && navMenu) {
        navClose.addEventListener('click', () => {
            navMenu.classList.remove('show');
            navToggle?.focus();
            console.log('Menu closed');
        });
    }

    // Keyboard support for navigation toggle and close
    if (navToggle) {
        navToggle.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navMenu?.classList.add('show');
                navMenu?.querySelector('.nav__link')?.focus();
            }
        });
    }

    if (navClose) {
        navClose.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navMenu?.classList.remove('show');
                navToggle?.focus();
            }
        });
    }

    // Smooth scrolling and close menu when clicking a nav link
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href')?.substring(1);
            if (targetId) {
                document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
                navMenu?.classList.remove('show');
            }
        });
    });

    // Change header background on scroll
    if (header) {
        window.addEventListener('scroll', () => {
            header.classList.toggle('scrolled', window.scrollY > 50);
        });
    }

    // Active link on scroll
    const sections = document.querySelectorAll('section[id]');

    function scrollActive() {
        const scrollY = window.pageYOffset;

        sections.forEach(current => {
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop - 50;
            const sectionId = current.getAttribute('id');
            const navLink = document.querySelector(`.nav__link[href*="${sectionId}"]`);
            
            if (navLink && scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navLink.classList.add('active');
            } else if (navLink) {
                navLink.classList.remove('active');
            }
        });
    }

    window.addEventListener('scroll', scrollActive);

    // Skills Animation
    const skillsSection = document.querySelector('.skills-section');
    const skillBars = document.querySelectorAll('.skill__progress');

    if (skillsSection && skillBars.length > 0) {
        console.log('Skills section and bars found'); // Debug
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        console.log('Skills section in view, animating'); // Debug
                        skillBars.forEach((bar, index) => {
                            const width = bar.dataset.width || 0;
                            if (width) {
                                bar.style.width = `${width}%`;
                                bar.style.transitionDelay = `${index * 0.1}s`; // Staggered animation
                            } else {
                                console.warn(`Missing data-width for element:`, bar);
                            }
                        });
                        observer.unobserve(skillsSection); // Run animation once
                    }
                });
            },
            { threshold: 0.2 } // Trigger when 20% of section is visible
        );
        observer.observe(skillsSection);
    } else {
        console.error('Skills section or bars not found');
    }

    // Image Error Handling
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('error', () => {
            img.src = 'https://via.placeholder.com/300x200?text=Image+Not+Found';
            img.alt = 'Image not available';
        });
    });

    // Contact Form with EmailJS
    const contactForm = document.getElementById('contact-form');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData);
            
            try {
                if (typeof emailjs === 'undefined') {
                    await loadEmailJSSDK();
                    emailjs.init('G0iq-bLzqAU94-4zW'); // Replace with your EmailJS Public Key
                }
                
                const response = await emailjs.sendForm('service_85m638d', 'template_i0uv1gm', contactForm);
                console.log('Form submitted successfully:', data, response);
                showNotification('Message Sent Successfully! I will reach u soon 📧🚀');
                contactForm.reset();
            } catch (error) {
                console.error('Form submission error:', error);
                showNotification('Failed to send message. Please try again. 😔', true);
            }
        });
    }
});