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

// ========================================
// Portfolio Infinite Carousel
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    const carouselTrack = document.getElementById('carouselTrack');
    
    if (carouselTrack) {
        // Get all original items
        const originalItems = carouselTrack.querySelectorAll('.carousel-item');
        
        // Clone items multiple times for seamless infinite scroll
        // We need enough clones so that when scrolling, there's always content visible
        const cloneSets = 3; // Number of times to duplicate the entire set
        
        for (let i = 0; i < cloneSets; i++) {
            originalItems.forEach(item => {
                const clone = item.cloneNode(true);
                carouselTrack.appendChild(clone);
            });
        }
        
        // Add drag functionality for desktop
        let isDragging = false;
        let startX;
        let scrollLeft;
        let animationPaused = false;
        
        const carousel = document.getElementById('portfolioCarousel');
        
        if (carousel) {
            // Mouse events for drag scrolling
            carousel.addEventListener('mousedown', (e) => {
                isDragging = true;
                carousel.style.cursor = 'grabbing';
                startX = e.pageX - carousel.offsetLeft;
                scrollLeft = carousel.scrollLeft;
                
                // Pause animation while dragging
                carouselTrack.style.animationPlayState = 'paused';
                animationPaused = true;
            });
            
            carousel.addEventListener('mouseleave', () => {
                if (isDragging) {
                    isDragging = false;
                    carousel.style.cursor = 'grab';
                    
                    // Resume animation after a delay
                    setTimeout(() => {
                        if (!isDragging) {
                            carouselTrack.style.animationPlayState = 'running';
                            animationPaused = false;
                        }
                    }, 1000);
                }
            });
            
            carousel.addEventListener('mouseup', () => {
                isDragging = false;
                carousel.style.cursor = 'grab';
                
                // Resume animation after a delay
                setTimeout(() => {
                    if (!isDragging) {
                        carouselTrack.style.animationPlayState = 'running';
                        animationPaused = false;
                    }
                }, 1000);
            });
            
            carousel.addEventListener('mousemove', (e) => {
                if (!isDragging) return;
                e.preventDefault();
                const x = e.pageX - carousel.offsetLeft;
                const walk = (x - startX) * 2; // Scroll speed multiplier
                carousel.scrollLeft = scrollLeft - walk;
            });
            
            // Touch events for mobile
            carousel.addEventListener('touchstart', (e) => {
                isDragging = true;
                startX = e.touches[0].pageX - carousel.offsetLeft;
                scrollLeft = carousel.scrollLeft;
                carouselTrack.style.animationPlayState = 'paused';
            }, { passive: true });
            
            carousel.addEventListener('touchend', () => {
                isDragging = false;
                setTimeout(() => {
                    if (!isDragging) {
                        carouselTrack.style.animationPlayState = 'running';
                    }
                }, 1000);
            });
            
            carousel.addEventListener('touchmove', (e) => {
                if (!isDragging) return;
                const x = e.touches[0].pageX - carousel.offsetLeft;
                const walk = (x - startX) * 1.5;
                carousel.scrollLeft = scrollLeft - walk;
            }, { passive: true });
            
            // Set initial cursor style
            carousel.style.cursor = 'grab';
        }
        
        // Apply 3D perspective effect to items based on their position
        function apply3DEffect() {
            const items = carouselTrack.querySelectorAll('.carousel-item');
            const carouselRect = carousel.getBoundingClientRect();
            const centerX = carouselRect.left + carouselRect.width / 2;
            
            items.forEach(item => {
                const itemRect = item.getBoundingClientRect();
                const itemCenterX = itemRect.left + itemRect.width / 2;
                const distanceFromCenter = (itemCenterX - centerX) / (carouselRect.width / 2);
                
                // Calculate rotation and scale based on distance from center
                const rotateY = distanceFromCenter * 25; // Max 25 degrees rotation
                const scale = 1 - Math.abs(distanceFromCenter) * 0.15; // Scale down items further from center
                const translateZ = -Math.abs(distanceFromCenter) * 50; // Push back items further from center
                
                item.style.transform = `
                    perspective(1000px) 
                    rotateY(${rotateY}deg) 
                    scale(${Math.max(0.75, scale)}) 
                    translateZ(${translateZ}px)
                `;
                item.style.opacity = 1 - Math.abs(distanceFromCenter) * 0.3;
            });
        }
        
        // Apply 3D effect on scroll and animation
        let rafId;
        function updateCarousel() {
            apply3DEffect();
            rafId = requestAnimationFrame(updateCarousel);
        }
        
        // Start the 3D effect loop
        updateCarousel();
        
        // Pause animation when page is not visible
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                carouselTrack.style.animationPlayState = 'paused';
                cancelAnimationFrame(rafId);
            } else {
                carouselTrack.style.animationPlayState = 'running';
                updateCarousel();
            }
        });
    }
});

// ========================================
// FAQ Accordion
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all other items
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                    otherItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
                }
            });
            
            // Toggle current item
            item.classList.toggle('active');
            question.setAttribute('aria-expanded', !isActive);
        });
    });
});

// ========================================
// Scroll Reveal Animation (Unblur Effect)
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    
    if (revealElements.length > 0) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal-visible');
                }
            });
        }, {
            root: null,
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px'
        });
        
        revealElements.forEach(el => {
            revealObserver.observe(el);
        });
    }
});

// ========================================
// Grid Background Reveal Effect
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('.hostel-services, .hero');
    
    sections.forEach(section => {
        section.addEventListener('mousemove', (e) => {
            const rect = section.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            section.style.setProperty('--mouse-x', `${x}px`);
            section.style.setProperty('--mouse-y', `${y}px`);
        });
    });
});