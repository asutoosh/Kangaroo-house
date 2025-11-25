// Mobile Navigation Toggle
const navToggle = document.getElementById('navToggle');
const navMenu = document.querySelector('.nav-menu');

if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
    });

    // Close menu when clicking on a link
    const navLinks = navMenu.querySelectorAll('a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        });
    });
}

// Header scroll effect - change background and colors
const header = document.getElementById('header');
const hero = document.getElementById('home');

window.addEventListener('scroll', () => {
    if (hero) {
        const heroBottom = hero.offsetTop + hero.offsetHeight;
        const scrollPosition = window.scrollY + 80; // Account for header height
        
        if (scrollPosition >= heroBottom) {
            header.classList.add('scrolled');
            header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        } else {
            header.classList.remove('scrolled');
            header.style.boxShadow = 'none';
        }
    }
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Typed.js Animation for Location Text
document.addEventListener('DOMContentLoaded', () => {
    const typedLocation = document.getElementById('typed-location');
    if (typedLocation) {
        var typed = new Typed("#typed-location", {
            strings: [
                "Maharaja Agrasen College",
                "Shaheed Rajguru College",
                "Drishti IAS",
                "Noida",
                "and way beyond."
            ],
            typeSpeed: 50,
            backSpeed: 30,
            backDelay: 1200,
            loop: false,
            smartBackspace: true,
            onComplete: function() {
                // Ensure final phrase stays visible with no cursor blinking
                const cursor = document.querySelector('.typed-cursor');
                if (cursor) {
                    cursor.style.display = 'none';
                }
            }
        });
    }
});

// Image Zoom Out and Move Up Effect on Scroll
const servicesImage = document.getElementById('servicesImage');
const servicesHero = document.querySelector('.services-hero');

if (servicesImage && servicesHero) {
    let ticking = false;
    
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const rect = servicesHero.getBoundingClientRect();
                const windowHeight = window.innerHeight;
                const isMobile = window.innerWidth <= 480;
                
                // Calculate when section enters viewport
                if (rect.top < windowHeight && rect.bottom > 0) {
                    // Calculate scroll progress based on section visibility
                    // Start calculating when section top enters viewport
                    const sectionStart = windowHeight;
                    const sectionEnd = -rect.height;
                    const scrollRange = sectionStart - sectionEnd;
                    const currentScroll = sectionStart - rect.top;
                    
                    // Calculate progress (0 to 1) as section scrolls through viewport
                    let scrollProgress = Math.max(0, Math.min(1, currentScroll / scrollRange));
                    
                    // Normalize to reach 1.0 at 50% scroll (0.5)
                    // When scrollProgress is 0.5, normalizedProgress should be 1.0
                    const normalizedProgress = Math.min(1, scrollProgress / 0.5);
                    
                    if (isMobile) {
                        // Mobile: Start at 0.7x zoom, reach 1.0 at 50% scroll
                        const initialScale = 0.7;
                        const scale = initialScale + (normalizedProgress * (1.0 - initialScale));
                        const translateY = normalizedProgress * -15;
                        servicesImage.style.transform = `scale(${scale}) translateY(${translateY}%)`;
                    } else {
                        // Desktop: Start at 0.7x zoom, reach 1.0 at 50% scroll
                        const initialScale = 0.7;
                        const scale = initialScale + (normalizedProgress * (1.0 - initialScale));
                        const translateY = normalizedProgress * -12;
                        servicesImage.style.transform = `scale(${scale}) translateY(${translateY}%)`;
                    }
                }
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
}

