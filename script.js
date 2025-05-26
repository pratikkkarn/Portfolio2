'use strict';

// Helper function to check if it's a small device based on a media query breakpoint
const isSmallDevice = () => window.matchMedia("(max-width: 767px)").matches;

// element toggle function
const elementToggleFunc = function (elem) {
    elem.classList.toggle("active");
}

// sidebar variables
const sidebar = document.querySelector("[data-sidebar]");
const sidebarBtn = document.querySelector("[data-sidebar-btn]");

// sidebar toggle functionality for mobile
if (sidebar && sidebarBtn) {
    sidebarBtn.addEventListener("click", function () {
        elementToggleFunc(sidebar);
    });
}

// testimonials variables (only if modal elements exist)
const testimonialsItem = document.querySelectorAll("[data-testimonials-item]");
const modalContainer = document.querySelector("[data-modal-container]");
const modalCloseBtn = document.querySelector("[data-modal-close-btn]");
const overlay = document.querySelector("[data-overlay]");

// Check if modal elements exist before proceeding with testimonials logic
if (modalContainer && modalCloseBtn && overlay) {
    const modalImg = document.querySelector("[data-modal-img]");
    const modalTitle = document.querySelector("[data-modal-title]");
    const modalText = document.querySelector("[data-modal-text]");

    // modal toggle function
    const testimonialsModalFunc = function () {
        modalContainer.classList.toggle("active");
        overlay.classList.toggle("active");
    }

    // add click event to all modal items
    for (let i = 0; i < testimonialsItem.length; i++) {
        testimonialsItem[i].addEventListener("click", function () {
            if (modalImg && modalTitle && modalText) {
                modalImg.src = this.querySelector("[data-testimonials-avatar]").src;
                modalImg.alt = this.querySelector("[data-testimonials-avatar]").alt;
                modalTitle.innerHTML = this.querySelector("[data-testimonials-title]").innerHTML;
                modalText.innerHTML = this.querySelector("[data-testimonials-text]").innerHTML;
            }
            testimonialsModalFunc();
        });
    }

    // add click event to modal close button
    modalCloseBtn.addEventListener("click", testimonialsModalFunc);
    overlay.addEventListener("click", testimonialsModalFunc);
}


// custom select variables
const select = document.querySelector("[data-select]");
const selectItems = document.querySelectorAll("[data-select-item]");
const selectValue = document.querySelector("[data-selecct-value]");
const filterBtn = document.querySelectorAll("[data-filter-btn]");

if (select) {
    select.addEventListener("click", function () {
        elementToggleFunc(this);
    });
}

// add event in all select items
for (let i = 0; i < selectItems.length; i++) {
    selectItems[i].addEventListener("click", function () {
        let selectedValue = this.innerText.toLowerCase();
        if (selectValue) {
            selectValue.innerText = this.innerText;
        }
        if (select) {
            elementToggleFunc(select);
        }
        filterFunc(selectedValue);
    });
}

// filter variables
const filterItems = document.querySelectorAll("[data-filter-item]");

// NEW: Intersection Observer for portfolio items
let portfolioItemObserver; // Declare globally

const initPortfolioItemObserver = () => {
    // Disconnect existing observer if it's already observing
    if (portfolioItemObserver) {
        portfolioItemObserver.disconnect();
    }

    portfolioItemObserver = new IntersectionObserver((entries, observer) => {
        let visibleCount = 0; // To track index for staggered animation among currently intersecting items
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                // Ensure element is ready for animation by resetting its state
                entry.target.classList.remove("animate-fade-in-left", "animate-fade-in-right", "fade-in-up", "scale-in");
                entry.target.style.animation = 'none'; // Temporarily disable animation
                entry.target.style.animationDelay = '';
                entry.target.style.opacity = '0';
                entry.target.style.transform = 'translateX(-50px)';
                void entry.target.offsetWidth; // Force reflow

                // Apply animation with staggered delay using requestAnimationFrame for smoothness
                requestAnimationFrame(() => {
                    entry.target.style.animation = ''; // Re-enable animation
                    entry.target.classList.add('animate-fade-in-left'); // Always animate from left for consistency
                    entry.target.style.animationDelay = `${visibleCount * 150}ms`; // Staggered delay (150ms per item)
                    entry.target.style.opacity = '1'; // Ensure opacity is set
                    entry.target.style.transform = ''; // Reset transform to animate to
                    visibleCount++;
                });

                observer.unobserve(entry.target); // Stop observing once animated
            }
        });
    }, { threshold: 0.2 }); // Trigger when 20% of the item is visible
};


const filterFunc = function (selectedValue) {
    // Stop observing all items before re-evaluating and re-observing
    filterItems.forEach(item => {
        if (portfolioItemObserver) {
            portfolioItemObserver.unobserve(item);
        }
        // Step 1: Immediately hide and reset the animation state for all items
        item.classList.remove("active", "animate-fade-in-left", "animate-fade-in-right", "animate-fade-in-bottom", "fade-in-up", "scale-in");
        item.style.animation = 'none'; // Crucial: Temporarily disable animation
        item.style.animationDelay = ''; // Clear any previous inline animation delay
        item.style.opacity = '0'; // Ensure it starts hidden
        item.style.transform = 'translateX(-50px)'; // Initial state for animate-fade-in-left
        item.style.display = 'none'; // Hide all items initially

        // Force a reflow (important!) to ensure the browser registers the "reset" state
        // This makes the browser re-render before we apply new styles/animations
        void item.offsetWidth;
    });

    // Use requestAnimationFrame to ensure all items are hidden before showing new ones
    // This allows the browser to apply the 'display: none' and reset styles before applying animations.
    requestAnimationFrame(() => {
        let visibleIndex = 0; // To stagger animation for currently visible items
        filterItems.forEach(item => {
            if (selectedValue === "all" || item.dataset.category === selectedValue) {
                item.style.display = 'block'; // Make the item visible
                item.classList.add('active'); // Keep active class for display

                // Step 2: Re-enable animation and apply it with a staggered delay
                // Clear any previous inline animation to ensure it restarts
                item.style.animation = ''; // Re-enable animation (clears 'none')
                item.style.animationDelay = `${visibleIndex * 150}ms`; // Apply staggered delay
                item.classList.add('animate-fade-in-left'); // Re-apply the animation class
                // The animation itself (fadeInLeft) will handle opacity and transform

                visibleIndex++;

                // If on a small device, re-observe for potential future scroll-triggered animations
                if (isSmallDevice() && portfolioItemObserver) {
                    portfolioItemObserver.observe(item);
                }
            }
        });
    });
}

// add event in all filter button items for large screen
let lastClickedBtn = filterBtn.length > 0 ? filterBtn[0] : null;

for (let i = 0; i < filterBtn.length; i++) {
    filterBtn[i].addEventListener("click", function () {
        let selectedValue = this.innerText.toLowerCase();
        if (selectValue) {
            selectValue.innerText = this.innerText;
        }
        filterFunc(selectedValue);

        if (lastClickedBtn) {
            lastClickedBtn.classList.remove("active");
        }
        this.classList.add("active");
        lastClickedBtn = this;
    });
}

// contact form variables
const form = document.querySelector("[data-form]");
const formInputs = document.querySelectorAll("[data-form-input]");
const formBtn = document.querySelector("[data-form-btn]");

// add event to all form input field
for (let i = 0; i < formInputs.length; i++) {
    formInputs[i].addEventListener("input", function () {
        // check form validation
        if (form && formBtn) {
            if (form.checkValidity()) {
                formBtn.removeAttribute("disabled");
            } else {
                formBtn.setAttribute("disabled", "");
            }
        }
    });
}

// page navigation variables
const navigationLinks = document.querySelectorAll("[data-nav-link]");
const pages = document.querySelectorAll("[data-page]");
const skillProgressFills = document.querySelectorAll(".skill-progress-fill"); // Get all skill progress bars
const articleTitles = document.querySelectorAll(".article-title"); // Get all article titles for typewriter effect

// Store original texts of h2 titles
const originalTitles = new Map();
articleTitles.forEach(title => {
    originalTitles.set(title.id, title.textContent); // Store the original text
});


// Intersection Observer for skill bars
let skillObserver; // Declare globally to manage lifecycle

const initSkillObserver = () => {
    // Disconnect existing observer if it's already observing
    if (skillObserver) {
        skillObserver.disconnect();
    }

    const skillsSection = document.querySelector('.skill');
    if (skillsSection) {
        skillObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateSkillBars();
                    observer.unobserve(entry.target); // Stop observing once animated
                }
            });
        }, { threshold: 0.5 }); // Trigger when 50% of the section is visible

        skillObserver.observe(skillsSection);
    }
};


// Function to animate skill bars (called by Intersection Observer)
const animateSkillBars = () => {
    skillProgressFills.forEach((bar, index) => {
        // Set width to 0 first to ensure the transition plays every time
        bar.style.width = '0%';
        // Force a reflow to make the browser render the 0% width before setting the final width
        void bar.offsetWidth;
        setTimeout(() => {
            const value = bar.parentElement.previousElementSibling.querySelector('data').value;
            bar.style.width = value + '%';
        }, 200 * index + 100); // Slower, more staggered animation for each bar
    });
};

// Reset skill bars (set to 0%)
const resetSkillBars = () => {
    if (skillObserver) {
        skillObserver.disconnect(); // Disconnect observer when resetting
    }
    skillProgressFills.forEach(bar => {
        bar.style.width = '0%';
    });
};

// Function to start typewriter animation for a given element ID
const startTypewriterAnimation = (elementId) => {
    const typewriterElement = document.getElementById(elementId);
    if (typewriterElement) {
        const originalText = originalTitles.get(elementId); // Get original text from the map
        if (!originalText) return; // Exit if no original text

        typewriterElement.textContent = ''; // Clear current text to start typing
        typewriterElement.classList.remove('typewriter-active'); // Remove class to reset animation and cursor

        let charIndex = 0;
        const typingSpeed = 80; // Adjust typing speed (ms per character, slower)

        const typeChar = () => {
            if (charIndex < originalText.length) {
                typewriterElement.textContent += originalText.charAt(charIndex);
                charIndex++;
                setTimeout(typeChar, typingSpeed);
            } else {
                // Text is fully typed, now add the class to show the blinking cursor
                typewriterElement.classList.add('typewriter-active');
            }
        };

        setTimeout(typeChar, 100); // Small delay before starting typing characters
    }
};

// Function to apply fade-in-up animation to a list of elements with staggered delay
const applyStaggeredFadeInUp = (elements, baseDelay = 100) => {
    elements.forEach((element, index) => {
        element.classList.remove('fade-in-up'); // Ensure class is removed first
        element.style.animationDelay = ''; // Clear previous delay
        void element.offsetWidth; // Force reflow (important for re-triggering CSS animations)
        setTimeout(() => {
            element.classList.add('fade-in-up');
            element.style.animationDelay = `${baseDelay * index}ms`; // Apply staggered delay
        }, 10); // Very small delay to ensure removal registers before re-applying
    });
};

// Function to apply scale-in animation to a list of elements with staggered delay
const applyStaggeredScaleIn = (elements, baseDelay = 100) => {
    elements.forEach((element, index) => {
        element.classList.remove('scale-in'); // Ensure class is removed first
        element.style.animationDelay = ''; // Clear previous delay
        void element.offsetWidth; // Force reflow
        setTimeout(() => {
            element.classList.add('scale-in');
            element.style.animationDelay = `${baseDelay * index}ms`; // Apply staggered delay
        }, 10); // Very small delay
    });
};

// Function to reset all dynamic animations and content on a page
const resetAnimations = (pageElement) => {
    // Reset all fade-in-up animations
    pageElement.querySelectorAll('.fade-in-up').forEach(el => {
        el.classList.remove('fade-in-up');
        el.style.animationDelay = ''; // Clear inline delay
    });
    // Reset all scale-in animations
    pageElement.querySelectorAll('.scale-in').forEach(el => {
        el.classList.remove('scale-in');
        el.style.animationDelay = ''; // Clear inline delay
    });
    // Reset typewriter titles
    pageElement.querySelectorAll('.article-title').forEach(title => {
        title.classList.remove('typewriter-active');
        // Set text back to its original (full) form before typing
        title.textContent = originalTitles.get(title.id) || '';
    });
    resetSkillBars(); // Always reset skill bars when page changes
};


// Add event to all nav link
for (let i = 0; i < navigationLinks.length; i++) {
    navigationLinks[i].addEventListener("click", function () {
        const targetPageName = this.dataset.pageName;

        // Deactivate all pages and reset their animations first
        pages.forEach(page => {
            page.classList.remove("active");
            resetAnimations(page); // Fully reset animations on the old page
        });
        navigationLinks.forEach(link => link.classList.remove("active"));

        // Activate the clicked page and its link
        const activePage = document.querySelector(`[data-page="${targetPageName}"]`);
        if (activePage) {
            activePage.classList.add("active");
            this.classList.add("active");
            window.scrollTo({ top: 0, behavior: 'smooth' }); // Smooth scroll to top

            // Start typewriter animation for the active page's title
            const titleId = `typewriter-${targetPageName}`;
            startTypewriterAnimation(titleId);

            // Apply specific animations based on the active page
            if (targetPageName === 'resume') {
                // Skill bars will be animated by IntersectionObserver when scrolled into view
                initSkillObserver(); // Initialize observer for resume page
                // Observe timeline items for fade-in-up animation on scroll
                observeFadeInOnScroll(".timeline-item", "fade-in-up", 150);
            } else if (targetPageName === 'about') {
                // Observe service items and testimonials for fade-in-up animation on scroll
                observeFadeInOnScroll(".service-item", "fade-in-up", 150);
                observeFadeInOnScroll(".testimonials-item", "fade-in-up", 150);
                observeFadeInOnScroll(".clients-item", "scale-in", 100);
            } else if (targetPageName === 'portfolio') {
                // For portfolio, ensure all projects are visible and animated by default
                // This ensures projects appear when navigating to the portfolio page
                filterFunc("all"); // This will now handle the animation for portfolio items
            } else if (targetPageName === 'contact') {
                // Observe contact items for fade-in-left animation on scroll
                observeFadeInOnScroll(".contact-item", "animate-fade-in-left", 150);
            }
        }
    });
}

// Initial setup on page load
document.addEventListener("DOMContentLoaded", function() {
    // Cache original texts for all h2 titles
    articleTitles.forEach(title => {
        originalTitles.set(title.id, title.textContent); // Store the original text
        title.textContent = ''; // Clear content to prepare for typing effect
    });

    // Trigger typewriter for the default active page ('about')
    startTypewriterAnimation('typewriter-about');

    // Initialize the portfolio item observer
    initPortfolioItemObserver(); // IMPORTANT: Initialize the observer on DOMContentLoaded

    // Apply scroll animations to initial visible elements on page load
    observeFadeInOnScroll(".service-item", "fade-in-up", 150); // Services on About page
    observeFadeInOnScroll(".testimonials-item", "fade-in-up", 150); // Testimonials on About page
    observeFadeInOnScroll(".clients-item", "scale-in", 100); // Clients on About page
    observeFadeInOnScroll(".blog-post-item > a", "fade-in-up", 150); // For blog page items
    observeFadeInOnScroll(".contact-item", "animate-fade-in-left", 150); // Sidebar contacts

    // Ensure skill bars are initially at 0%
    resetSkillBars(); // This will also disconnect any old observer

    // If the initial active page is 'portfolio' on load, trigger the filter function
    const initialActivePage = document.querySelector('.main-content article.active');
    if (initialActivePage && initialActivePage.dataset.page === 'portfolio') {
        filterFunc("all");
    }
});


// Form submission handling - MODIFIED SECTION
if (form) {
    form.addEventListener('submit', async function(e) { // Make the function async
        e.preventDefault();

        const formData = new FormData(form);
        // Add your Web3Forms access key - REPLACE THIS WITH YOUR ACTUAL KEY
        formData.append("access_key", "b37cf183-ab50-420b-a202-9aa1780ae15b"); // Using the key from your HTML

        console.log('Form submitted (client-side data):', Object.fromEntries(formData));

        try {
            const response = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                console.log('Web3Forms submission successful:', result);
                // Show success message
                showFeedbackMessage("Thank you for your message! I will get back to you soon.", false);
                form.reset(); // Reset form only on success
            } else {
                console.error('Web3Forms submission failed:', result);
                // Show error message
                showFeedbackMessage(`Failed to send message: ${result.message || 'Please try again.'}`, true);
            }
        } catch (error) {
            console.error('Network or API error:', error);
            showFeedbackMessage("There was a problem sending your message. Please try again later.", true);
        }
    });

    // Helper function to show feedback messages
    function showFeedbackMessage(message, isError) {
        const messageBox = document.createElement('div');
        messageBox.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: ${isError ? 'var(--error-red)' : '#333'}; /* Use error color for errors */
            color: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            z-index: 1000;
            text-align: center;
            font-family: 'Poppins', sans-serif;
            opacity: 0; /* Start hidden for fade-in */
            transition: opacity 0.3s ease-in-out;
        `;
        messageBox.innerHTML = `
            <p>${message}</p>
            <button style="background-color: var(--accent-color); color: var(--white-2); padding: 8px 15px; border: none; border-radius: 5px; cursor: pointer; margin-top: 10px;">OK</button>
        `;
        document.body.appendChild(messageBox);

        // Fade in
        setTimeout(() => {
            messageBox.style.opacity = '1';
        }, 10);

        messageBox.querySelector('button').addEventListener('click', () => {
            messageBox.style.opacity = '0'; // Fade out
            setTimeout(() => {
                document.body.removeChild(messageBox);
            }, 300); // Remove after fade out
        });
    }

    if (formBtn) {
        // Initially set disabled if form is not valid on load
        if (!form.checkValidity()) {
            formBtn.setAttribute("disabled", "");
        } else {
            formBtn.removeAttribute('disabled');
        }
    }
}

// Update copyright year
document.addEventListener('DOMContentLoaded', function() {
    const yearElement = document.querySelector('#current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
});

// Generic Intersection Observer for scroll-triggered animations
const observeFadeInOnScroll = (selector, animationClass, stagger = 100, threshold = 0.2) => {
  const elements = document.querySelectorAll(selector);
  // Ensure elements are initially hidden if they are not already by CSS
  elements.forEach(el => {
    // Only apply initial hidden state if it doesn't already have a transform/opacity from base CSS
    if (!el.style.opacity || el.style.opacity === '1') {
      el.style.opacity = '0';
      // Add a base transform if the animation requires it and it's not set
      if (animationClass === "fade-in-up" || animationClass === "animate-fade-in-left" || animationClass === "animate-fade-in-right" || animationClass === "animate-fade-in-bottom") {
          // For left/right, start from -50px, for up/bottom, start from translateY(20px)
          el.style.transform = (animationClass === "animate-fade-in-left" || animationClass === "animate-fade-in-right") ? 'translateX(-50px)' : 'translateY(20px)';
      } else if (animationClass === "scale-in") {
          el.style.transform = 'scale(0.8)';
      }
    }
  });

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // Use a timeout to apply a staggered delay based on the element's position in the original list
        // This makes the animation appear sequentially for multiple elements
        const index = Array.from(elements).indexOf(entry.target);
        setTimeout(() => {
          entry.target.classList.add(animationClass);
          entry.target.style.opacity = '1'; // Ensure opacity is set
          entry.target.style.transform = ''; // Reset transform to animate to
        }, index * stagger); // Apply staggered delay
        obs.unobserve(entry.target); // Stop observing once animated
      }
    });
  }, { threshold: threshold }); // Adjust threshold as needed (e.g., 0.1 means 10% visible)

  elements.forEach(el => observer.observe(el));
};

// Apply animations when DOM is fully loaded and navigation links are clicked
window.addEventListener("DOMContentLoaded", () => {
  // Initial animations for elements on the default 'about' page
  observeFadeInOnScroll(".service-item", "fade-in-up", 150);
  observeFadeInOnScroll(".testimonials-item", "fade-in-up", 150);
  observeFadeInOnScroll(".clients-item", "scale-in", 100);
  observeFadeInOnScroll(".blog-post-item > a", "fade-in-up", 150); // For blog page items
  // Note: Sidebar contact items are observed initially as they are always visible (or within scroll range)
  observeFadeInOnScroll(".contact-item", "animate-fade-in-left", 150);
});
