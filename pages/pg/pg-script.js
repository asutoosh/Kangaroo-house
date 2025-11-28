// Mobile Navigation Toggle
const navToggle = document.getElementById('navToggle');
const navMenu = document.querySelector('.nav-menu');

if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
    });

    const navLinks = navMenu.querySelectorAll('a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        });
    });
}

// Properties Data Array
const properties = [
    {
        id: 1,
        title: 'Kawasaki House',
        location: 'South Campus',
        gender: 'Male',
        distance: '11.5 km away from Delhi Apartments',
        lat: 28.6139,
        lng: 77.2090,
        price: 16899,
        images: [
            'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=400&fit=crop',
            'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=400&fit=crop',
            'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=600&h=400&fit=crop'
        ],
        amenities: ['AC', 'Attached Washroom'],
        roomTypes: ['Single', 'Double'],
        status: 'filling-fast',
        statusText: 'Filling Fast',
        badge: 'Preferred By Students'
    },
    {
        id: 2,
        title: 'Okazaki House',
        location: 'South Campus',
        gender: 'Male',
        distance: '11.5 km away from Delhi Apartments',
        lat: 28.6249,
        lng: 77.2190,
        price: 16299,
        images: [
            'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=600&h=400&fit=crop',
            'https://images.unsplash.com/photo-1560448075-cbc16bb4af90?w=600&h=400&fit=crop',
            'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=400&fit=crop'
        ],
        amenities: ['AC', 'Attached Washroom'],
        roomTypes: ['Single', 'Double'],
        status: 'almost-full',
        statusText: 'Almost Full',
        badge: 'Preferred By Students'
    },
    {
        id: 3,
        title: 'Kobe House',
        location: 'North Campus',
        gender: 'Female',
        distance: '8.5 km away from Delhi Apartments',
        lat: 28.7041,
        lng: 77.1025,
        price: 17500,
        images: [
            'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=600&h=400&fit=crop',
            'https://images.unsplash.com/photo-1560184897-ae75f418493e?w=600&h=400&fit=crop',
            'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=600&h=400&fit=crop'
        ],
        amenities: ['AC', 'Attached Washroom', 'WiFi'],
        roomTypes: ['Single', 'Double'],
        status: 'filling-fast',
        statusText: 'Filling Fast',
        badge: 'Preferred By Students'
    },
    {
        id: 4,
        title: 'Tokyo House',
        location: 'East Campus',
        gender: 'Unisex',
        distance: '9.2 km away from Delhi Apartments',
        lat: 28.5355,
        lng: 77.3910,
        price: 15999,
        images: [
            'https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=600&h=400&fit=crop',
            'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&h=400&fit=crop',
            'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&h=400&fit=crop'
        ],
        amenities: ['AC', 'Attached Washroom'],
        roomTypes: ['Single', 'Double', 'Triple'],
        status: 'filling-fast',
        statusText: 'Filling Fast',
        badge: null
    },
    {
        id: 5,
        title: 'Osaka House',
        location: 'West Campus',
        gender: 'Male',
        distance: '12.3 km away from Delhi Apartments',
        lat: 28.6800,
        lng: 77.0689,
        price: 14899,
        images: [
            'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop',
            'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=400&fit=crop',
            'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=600&h=400&fit=crop'
        ],
        amenities: ['AC', 'Attached Washroom'],
        roomTypes: ['Single', 'Double'],
        status: 'filling-fast',
        statusText: 'Filling Fast',
        badge: null
    }
];

// Initialize Map
let map;
let markers = [];
let currentHighlightedMarker = null;

function initMap() {
    // Center on New Delhi
    map = L.map('map', {
        zoomControl: true,
        scrollWheelZoom: true
    }).setView([28.6139, 77.2090], 12);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);

    // Create custom green marker icon
    const createCustomIcon = (isHighlighted = false) => {
        const iconClass = isHighlighted ? 'custom-marker highlighted' : 'custom-marker';
        return L.divIcon({
            className: 'custom-leaflet-icon',
            html: `<div class="${iconClass}"></div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32]
        });
    };

    // Add markers for each property
    properties.forEach((property, index) => {
        const icon = createCustomIcon(false);
        const marker = L.marker([property.lat, property.lng], { icon })
            .addTo(map)
            .bindPopup(`
                <div style="padding: 0.5rem;">
                    <h3 style="margin: 0 0 0.5rem 0; font-size: 1rem; font-weight: 700;">${property.title}</h3>
                    <p style="margin: 0 0 0.25rem 0; font-size: 0.875rem; color: #666;">${property.location}</p>
                    <p style="margin: 0; font-size: 0.875rem; font-weight: 600; color: #333;">₹${property.price.toLocaleString('en-IN')}/mo*</p>
                </div>
            `);

        markers.push({
            marker,
            property,
            index
        });
    });
}

// Render PG Cards
function renderPGCards() {
    const listingsContainer = document.getElementById('pgListings');
    let html = '';

    properties.forEach((property, index) => {
        // Add ad banner after first card
        if (index === 1) {
            html += `
                <div class="ad-banner">
                    <h3>Booking a house tour will take the 'wait' off your mind</h3>
                    <p>Schedule your property visit and we give you a 100% guarantee that you will get: Expert assistance, Dedicated property tour, Zero waiting time.</p>
                    <a href="#contact" class="btn btn-primary">BOOK NOW</a>
                </div>
            `;
        }

        // Generate images HTML
        const imagesHTML = property.images.map((img, imgIndex) => 
            `<img src="${img}" alt="${property.title} - Image ${imgIndex + 1}" class="pg-carousel-image" onerror="this.src='https://via.placeholder.com/600x400/E0E0E0/999999?text=PG+Image'" />`
        ).join('');

        // Generate amenities HTML
        const amenitiesHTML = property.amenities.map(amenity => {
            const icon = amenity === 'AC' ? '❄️' : amenity === 'Attached Washroom' ? '🚿' : '📶';
            return `<div class="pg-amenity"><span class="pg-amenity-icon">${icon}</span><span>${amenity}</span></div>`;
        }).join('');

        // Generate room types HTML
        const roomTypesHTML = property.roomTypes.map(type => {
            const icon = type === 'Single' ? '🛏️' : type === 'Double' ? '🛏️🛏️' : '🛏️🛏️🛏️';
            return `<div class="pg-amenity"><span class="pg-amenity-icon">${icon}</span><span>${type}</span></div>`;
        }).join('');

        // Status banner class
        const statusClass = property.status === 'filling-fast' ? 'filling-fast' : 'almost-full';
        const statusIcon = property.status === 'filling-fast' ? '⏰' : '→';

        html += `
            <div class="pg-card" data-property-id="${property.id}">
                <div class="pg-card-content">
                    <div class="pg-image-container">
                        <div class="pg-image-badges">
                            ${property.badge ? `<div class="pg-badge">${property.badge}</div>` : ''}
                        </div>
                        <div class="pg-image-carousel">
                            ${imagesHTML}
                        </div>
                        <div class="pg-status-banner ${statusClass}">
                            <span>${statusIcon}</span>
                            <span>${property.statusText}</span>
                        </div>
                    </div>
                    <div class="pg-details">
                        <div class="pg-header-row">
                            <div class="pg-title-section">
                                <h2 class="pg-title">${property.title}</h2>
                                <div class="pg-location">
                                    <span>📍</span>
                                    <span>${property.location}</span>
                                </div>
                            </div>
                            <div class="pg-gender-tag">
                                ${property.gender === 'Male' ? '♂️' : property.gender === 'Female' ? '♀️' : '⚥'}
                                ${property.gender}
                            </div>
                        </div>
                        <div class="pg-distance">
                            <span>📍</span>
                            <span>${property.distance}</span>
                        </div>
                        <a href="#" class="pg-directions">
                            <span>🧭</span>
                            <span>View Directions</span>
                        </a>
                        <div class="pg-amenities">
                            ${amenitiesHTML}
                            ${roomTypesHTML}
                        </div>
                        <div class="pg-price">
                            Starts from ₹${property.price.toLocaleString('en-IN')}/mo*
                        </div>
                        <div class="pg-actions">
                            <button class="btn btn-primary" onclick="window.location.href='kawasaki-house.html'">Take a look</button>
                            <button class="btn btn-outline">REQUEST A CALLBACK</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    listingsContainer.innerHTML = html;

    // Add hover event listeners to cards
    const cards = document.querySelectorAll('.pg-card');
    cards.forEach((card, index) => {
        const propertyId = parseInt(card.dataset.propertyId);
        const markerData = markers.find(m => m.property.id === propertyId);

        if (markerData) {
            card.addEventListener('mouseenter', () => {
                highlightMarker(markerData.index);
            });

            card.addEventListener('mouseleave', () => {
                unhighlightMarker(markerData.index);
            });

            card.addEventListener('click', () => {
                // Smooth pan to marker location
                map.flyTo([markerData.property.lat, markerData.property.lng], 15, {
                    duration: 1.5
                });
                // Open popup
                setTimeout(() => {
                    markerData.marker.openPopup();
                }, 1500);
            });
        }
    });
}

// Highlight marker on hover
function highlightMarker(index) {
    if (currentHighlightedMarker !== null && currentHighlightedMarker !== index) {
        unhighlightMarker(currentHighlightedMarker);
    }

    const markerData = markers[index];
    if (markerData) {
        // Remove old marker
        map.removeLayer(markerData.marker);

        // Create highlighted icon
        const highlightedIcon = L.divIcon({
            className: 'custom-leaflet-icon',
            html: '<div class="custom-marker highlighted"></div>',
            iconSize: [38, 38],
            iconAnchor: [19, 38],
            popupAnchor: [0, -38]
        });

        // Add new marker with highlighted icon
        const newMarker = L.marker([markerData.property.lat, markerData.property.lng], { icon: highlightedIcon })
            .addTo(map)
            .bindPopup(`
                <div style="padding: 0.5rem;">
                    <h3 style="margin: 0 0 0.5rem 0; font-size: 1rem; font-weight: 700;">${markerData.property.title}</h3>
                    <p style="margin: 0 0 0.25rem 0; font-size: 0.875rem; color: #666;">${markerData.property.location}</p>
                    <p style="margin: 0; font-size: 0.875rem; font-weight: 600; color: #333;">₹${markerData.property.price.toLocaleString('en-IN')}/mo*</p>
                </div>
            `);

        markerData.marker = newMarker;
        currentHighlightedMarker = index;

        // Smooth pan to marker
        map.flyTo([markerData.property.lat, markerData.property.lng], 14, {
            duration: 1,
            animate: true
        });
    }
}

// Unhighlight marker
function unhighlightMarker(index) {
    const markerData = markers[index];
    if (markerData && currentHighlightedMarker === index) {
        // Remove highlighted marker
        map.removeLayer(markerData.marker);

        // Create normal icon
        const normalIcon = L.divIcon({
            className: 'custom-leaflet-icon',
            html: '<div class="custom-marker"></div>',
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32]
        });

        // Add normal marker
        const newMarker = L.marker([markerData.property.lat, markerData.property.lng], { icon: normalIcon })
            .addTo(map)
            .bindPopup(`
                <div style="padding: 0.5rem;">
                    <h3 style="margin: 0 0 0.5rem 0; font-size: 1rem; font-weight: 700;">${markerData.property.title}</h3>
                    <p style="margin: 0 0 0.25rem 0; font-size: 0.875rem; color: #666;">${markerData.property.location}</p>
                    <p style="margin: 0; font-size: 0.875rem; font-weight: 600; color: #333;">₹${markerData.property.price.toLocaleString('en-IN')}/mo*</p>
                </div>
            `);

        markerData.marker = newMarker;
        currentHighlightedMarker = null;
    }
}

// Hero Carousel Functionality
function initHeroCarousel() {
    const dots = document.querySelectorAll('.carousel-dot');
    const slides = document.querySelectorAll('.hero-carousel-slide');
    let currentSlide = 0;
    let carouselInterval;

    function showSlide(index) {
        // Hide all slides
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));

        // Show current slide
        if (slides[index]) {
            slides[index].classList.add('active');
        }
        if (dots[index]) {
            dots[index].classList.add('active');
        }
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }

    function goToSlide(index) {
        currentSlide = index;
        showSlide(currentSlide);
        resetCarousel();
    }

    function resetCarousel() {
        clearInterval(carouselInterval);
        carouselInterval = setInterval(nextSlide, 5000); // Auto-rotate every 5 seconds
    }

    // Add click handlers to dots
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => goToSlide(index));
    });

    // Start auto-rotation
    if (slides.length > 1) {
        resetCarousel();
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initHeroCarousel();
    initMap();
    renderPGCards();
});

