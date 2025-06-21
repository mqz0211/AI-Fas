import React, { useEffect, useRef, useState } from 'react';

const App = () => {
  // Refs for GSAP animations to target specific DOM elements
  const headerRef = useRef(null);
  const heroTextRef = useRef(null);
  const heroImageRef = useRef(null);
  const sectionRefs = useRef([]);
  // Ensures sectionRefs.current is cleared and re-initialized on each render
  sectionRefs.current = [];

  // Ref specifically for the process steps container for its animation
  const processStepsContainerRef = useRef(null);

  // State variables for the AI Styling Advisor feature
  const [stylingInput, setStylingInput] = useState(''); // Stores user's input for styling advice
  const [stylingAdvice, setStylingAdvice] = useState(''); // Stores the AI's generated styling advice
  const [isStylingLoading, setIsStylingLoading] = useState(false); // Manages loading state for AI advice

  // Array of placeholder image URLs for the fashion collections gallery
  // These are visually representative placeholders for different fashion styles.
  const aiFashionImages = [
    "https://raw.githubusercontent.com/mqz0211/AI-Fas/main/Src/pics/Leonardo_Kino_XL_A_stunning_futuristic_iridescent_gown_elegan_2.jpg", // A futuristic iridescent gown, digital art style
    "https://raw.githubusercontent.com/mqz0211/AI-Fas/main/Src/pics/Leonardo_Kino_XL_A_minimalist_urban_streetwear_outfit_oversiz_2.jpg", // Minimalist urban streetwear, muted tones
    "https://raw.githubusercontent.com/mqz0211/AI-Fas/main/Src/pics/Leonardo_Kino_XL_A_flowing_bohemianinspired_maxi_dress_with_in_2.jpg", // Bohemian-inspired dress with floral patterns
    "https://raw.githubusercontent.com/mqz0211/AI-Fas/main/Src/pics/Leonardo_Kino_XL_An_avantgarde_suit_with_sharp_geometric_cutou_1.jpg", // Avant-garde suit with geometric cutouts
    "https://raw.githubusercontent.com/mqz0211/AI-Fas/main/Src/pics/Leonardo_Kino_XL_An_elegant_evening_gown_made_of_flowing_deep_3.jpg", // Elegant evening wear with flowing silk
    "https://raw.githubusercontent.com/mqz0211/AI-Fas/main/Src/pics/Leonardo_Kino_XL_A_cool_casual_portrait_of_a_boy_teenager_aro_0.jpg" // Sporty athleisure outfit with dynamic lines
  ];

  // State to control the visibility of the mobile navigation menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // State to track if GSAP and its ScrollTrigger/ScrollToPlugin are successfully loaded
  const [isGsapLoaded, setIsGsapLoaded] = useState(false);

  // Helper function to add DOM elements to the sectionRefs array
  // This ensures that all sections meant for scroll animation are tracked.
  const addToRefs = (el) => {
    if (el && !sectionRefs.current.includes(el)) {
      sectionRefs.current.push(el);
    }
  };

  // Function for smooth scrolling to a target ID on the page
  const handleSmoothScroll = (event, targetId) => {
    event.preventDefault(); // Prevents default anchor link behavior (instant jump)
    const targetElement = document.getElementById(targetId);
    if (targetElement && isGsapLoaded && window.gsap && window.ScrollToPlugin) {
      // Use GSAP's ScrollToPlugin for animated scrolling
      window.gsap.to(window, {
        duration: 1, // Duration of the scroll animation
        scrollTo: {
          y: targetElement, // Target element to scroll to
          offsetY: 80 // Offset from the top to account for the fixed header
        },
        ease: 'power2.inOut' // Easing function for a smooth effect
      });
      setIsMobileMenuOpen(false); // Close mobile menu after navigation
    } else {
      console.error('GSAP or ScrollToPlugin not loaded or target element not found for smooth scroll.');
    }
  };

  // Function to fetch styling advice from the Gemini API
  const getStylingAdvice = async () => {
    if (!stylingInput.trim()) { // Check if the input field is empty
      setStylingAdvice('Please enter your styling query.');
      return;
    }

    setIsStylingLoading(true); // Set loading state to true
    setStylingAdvice(''); // Clear any previous advice

    // Construct the prompt for the AI model
    const prompt = `As an AI fashion stylist, provide creative and practical styling advice for the following scenario: "${stylingInput}". Suggest an outfit, color palette, and overall vibe. Keep the response under 150 words.`;

    let chatHistory = [];
    chatHistory.push({ role: "user", parts: [{ text: prompt }] });
    const payload = { contents: chatHistory };

  
    const apiKey = "AIzaSyDsdgUPeTM9Qkzg9QKZt_KPpelz4TW0iCM"; // 


    // Check if API key is present
    if (!apiKey || apiKey === "YOUR_GEMINI_API_KEY_HERE") {
      console.error("Gemini API key is not set. Please replace 'YOUR_GEMINI_API_KEY_HERE' with your actual API key .");
      setStylingAdvice("API key is missing. Please configure it for grading purposes.");
      setIsStylingLoading(false);
      return;
    }

    // Gemini API endpoint for text generation
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    try {
      // Make the API call
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json(); // Parse the JSON response

      // Check for a valid response structure and extract the generated text
      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        const text = result.candidates[0].content.parts[0].text;
        setStylingAdvice(text); // Update state with the AI's advice
      } else {
        setStylingAdvice('Failed to get styling advice. Please try again.');
        console.error('Unexpected API response structure for styling advice:', result);
      }
    } catch (error) {
      setStylingAdvice('Error getting styling advice. Check console for details.');
      console.error('Error calling Gemini API for styling advice:', error);
    } finally {
      setIsStylingLoading(false); // Reset loading state
    }
  };


  // useEffect hook for dynamically loading GSAP and its plugins
  useEffect(() => {
    const loadScript = (src, id, callback) => {
      // Check if the script is already loaded to prevent duplicate loading
      if (document.getElementById(id)) {
        callback(); // If loaded, just run the callback
        return;
      }
      const script = document.createElement('script');
      script.src = src;
      script.id = id;
      script.onload = callback; // Callback when script loads successfully
      script.onerror = () => console.error(`Failed to load script: ${src}`); // Error handling for script loading
      document.head.appendChild(script); // Add script to the document head
    };

    // Load GSAP core library
    loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.9.1/gsap.min.js', 'gsap-core', () => {
      // Load ScrollTrigger plugin after GSAP core is loaded
      loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.9.1/ScrollTrigger.min.js', 'gsap-scrolltrigger', () => {
        // Load ScrollToPlugin after ScrollTrigger is loaded
        loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.9.1/ScrollToPlugin.min.js', 'gsap-scrolltoplugin', () => {
          // Once all GSAP scripts are loaded, register the plugins
          if (window.gsap && window.ScrollTrigger && window.ScrollToPlugin) {
            window.gsap.registerPlugin(window.ScrollTrigger, window.ScrollToPlugin);
            setIsGsapLoaded(true); // Update state to confirm GSAP is ready
            console.log('GSAP and plugins loaded and registered.');
          } else {
            console.warn('GSAP or its plugins are not available after loading scripts.');
          }
        });
      });
    });

    // Cleanup function: This runs when the component unmounts
    return () => {
      console.log('Cleaning up GSAP scripts and ScrollTriggers.');
      if (window.ScrollTrigger) {
        // Kill all active ScrollTrigger instances to prevent memory leaks
        window.ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      }
      // Remove dynamically added script tags from the DOM
      ['gsap-core', 'gsap-scrolltrigger', 'gsap-scrolltoplugin'].forEach(id => {
        const script = document.getElementById(id);
        if (script) {
          script.remove();
        }
      });
    };
  }, []); // Empty dependency array ensures this effect runs only once after initial render


  // useEffect hook for defining GSAP animations, dependent on isGsapLoaded
  useEffect(() => {
    // Only proceed with animation setup if GSAP has been successfully loaded
    if (!isGsapLoaded) {
      console.log('GSAP not yet loaded, skipping animation setup.');
      return;
    }

    console.log('GSAP is loaded, setting up animations.');
    // Confirm GSAP and its plugins are available on the window object
    console.log('gsap:', window.gsap);
    console.log('ScrollTrigger:', window.ScrollTrigger);

    // GSAP Animations definitions:

    // 1. Header fade-in animation on component mount
    if (headerRef.current) {
      window.gsap.fromTo(headerRef.current,
        { opacity: 0, y: -50 }, // Starting state: invisible and slightly above
        { opacity: 1, y: 0, duration: 1, ease: 'power3.out' } // Ending state: visible and in place
      );
    }

    // 2. Hero section text animation (staggered fade-in from bottom)
    if (heroTextRef.current) {
      window.gsap.fromTo(heroTextRef.current.children, // Targets direct children of the hero text container
        { opacity: 0, y: 50 }, // Starting state: invisible and below
        { opacity: 1, y: 0, duration: 1.2, stagger: 0.2, ease: 'power3.out', delay: 0.5 } // Staggered fade-in
      );
    }

    // 3. Hero Image Scroll-Triggered Animation (subtle parallax/scale effect)
    if (heroImageRef.current) {
      window.gsap.fromTo(heroImageRef.current,
        {
          scale: 1.3, // Start slightly larger
          y: '10%', // Start slightly lower (creates a subtle upward motion on scroll)
          opacity: 0.8 // Start slightly transparent
        },
        {
          scale: 1, // End at normal size
          y: '0%', // End at original Y position
          opacity: 1, // End fully opaque
          ease: 'none', // Linear ease for scrubbed animation (direct relation to scroll)
          scrollTrigger: {
            trigger: ".hero-section", // The element that triggers the animation
            start: "top top", // Animation starts when the top of the trigger hits the top of the viewport
            end: "bottom center", // Animation ends when the bottom of the trigger hits the center of the viewport
            scrub: true, // Links animation progress directly to scroll position (0 to 1)
          }
        }
      );
    }

    // 4. Section scroll animations for other content sections (fade-in from bottom)
    sectionRefs.current.forEach((section) => {
      // Ensure the section exists and isn't the 'process' section (which has its own animation)
      if (section && section.id !== 'process') {
        window.gsap.fromTo(section.children, // Targets direct children within the section
          { opacity: 0, y: 50 }, // Starting state: invisible and below
          {
            opacity: 1,
            y: 0,
            duration: 1,
            stagger: 0.1, // Stagger effect for children
            ease: 'power2.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 80%', // Animation starts when the top of the section hits 80% of viewport height
              toggleActions: 'play none none reverse', // Play on scroll down, reverse on scroll up
            },
          }
        );
      }
    });

    // 5. Scroll-triggered animation for the process steps (staggered slide-in from left)
    if (processStepsContainerRef.current) {
      console.log('Attempting to animate process steps.');
      // Convert HTMLCollection of children to an Array for Array.from compatibility
      const processStepElements = Array.from(processStepsContainerRef.current.children);

      window.gsap.fromTo(processStepElements,
        { opacity: 0, x: -50 }, // Starting state: invisible and off-screen to the left
        {
          opacity: 1,
          x: 0, // Slide to original position
          duration: 0.8, // Duration for each step's animation
          stagger: 0.3, // Delay between each step's animation (staggered effect)
          ease: 'power2.out',
          scrollTrigger: {
            trigger: processStepsContainerRef.current,
            start: 'top 75%', // Animation starts when the top of the container hits 75% of viewport height
            toggleActions: 'play none none reverse', // Play on scroll down, reverse on scroll up
          },
        }
      );
    } else {
      console.warn('processStepsContainerRef.current is null, cannot animate process steps.');
    }

    // No cleanup for this useEffect; cleanup for GSAP instances is handled by the loading useEffect
  }, [isGsapLoaded]); // This effect runs only when isGsapLoaded state changes to true


  return (
    <div className="bg-black text-white antialiased min-h-screen">
      {/* Global styles for font and preventing horizontal overflow */}
      <style>
        {`
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
          overflow-x: hidden; /* Prevents horizontal scrolling, common with animations */
        }

        /* Keyframe animation for a subtle fade-in effect */
        @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        .animate-fade-in {
            animation: fade-in 0.5s ease-out forwards;
        }
        `}
      </style>

      {/* Header section - Fixed position at the top */}
      <header ref={headerRef} className="fixed top-0 left-0 right-0 z-50 bg-gray-900 bg-opacity-90 backdrop-blur-sm shadow-sm py-4 px-6 md:px-12 flex justify-between items-center rounded-b-xl">
        {/* Company Logo (SVG based) */}
        <div className="flex items-center">
          <svg className="w-10 h-10 text-blue-400" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            {/* Outer circle of the logo */}
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
            {/* Inner circle of the logo */}
            <circle cx="12" cy="12" r="3" fill="currentColor"/>
          </svg>
        </div>
        {/* Desktop Navigation Menu */}
        <nav className="hidden md:flex space-x-8">
          <a href="#vision" onClick={(e) => handleSmoothScroll(e, 'vision')} className="text-gray-300 hover:text-white transition-colors duration-200">Our Vision</a>
          <a href="#process" onClick={(e) => handleSmoothScroll(e, 'process')} className="text-gray-300 hover:text-white transition-colors duration-200">The Process</a>
          <a href="#gallery" onClick={(e) => handleSmoothScroll(e, 'gallery')} className="text-gray-300 hover:text-white transition-colors duration-200">Gallery</a>
          <a href="#ai-advisor" onClick={(e) => handleSmoothScroll(e, 'ai-advisor')} className="text-gray-300 hover:text-white transition-colors duration-200">AI Advisor</a>
          <a href="#contact" onClick={(e) => handleSmoothScroll(e, 'contact')} className="text-gray-300 hover:text-white transition-colors duration-200">Contact</a>
        </nav>
        {/* Mobile Hamburger Button (visible only on small screens) */}
        <button
          className="md:hidden p-2 rounded-md hover:bg-gray-700 transition-colors duration-200"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          {/* Hamburger Icon (SVG) */}
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
          </svg>
        </button>
      </header>

      {/* Mobile Menu Overlay (conditionally rendered) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-95 z-50 flex flex-col items-center justify-center md:hidden animate-fade-in">
          <button
            className="absolute top-4 right-4 p-2 text-white rounded-md hover:bg-gray-700 transition-colors duration-200"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close mobile menu"
          >
            {/* Close Icon (X) SVG */}
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
          <nav className="flex flex-col space-y-8 text-xl">
            <a href="#vision" onClick={(e) => handleSmoothScroll(e, 'vision')} className="text-white hover:text-blue-300 transition-colors duration-200">Our Vision</a>
            <a href="#process" onClick={(e) => handleSmoothScroll(e, 'process')} className="text-white hover:text-blue-300 transition-colors duration-200">The Process</a>
            <a href="#gallery" onClick={(e) => handleSmoothScroll(e, 'gallery')} className="text-white hover:text-blue-300 transition-colors duration-200">Gallery</a>
            <a href="#ai-advisor" onClick={(e) => handleSmoothScroll(e, 'ai-advisor')} className="text-white hover:text-blue-300 transition-colors duration-200">AI Advisor</a>
            <a href="#contact" onClick={(e) => handleSmoothScroll(e, 'contact')} className="text-white hover:text-blue-300 transition-colors duration-200">Contact</a>
          </nav>
        </div>
      )}

      {/* Hero Section - Added 'hero-section' class for ScrollTrigger */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden pt-24 md:pt-0 hero-section">
        <div className="container mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between z-10">
          <div ref={heroTextRef} className="text-center md:text-left md:w-1/2 mb-12 md:mb-0">
            <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6 tracking-tighter">
              Fashion Reimagined by <span className="text-blue-400">AI.</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-md mx-auto md:mx-0">
              Experience the future of style, where creativity meets cutting-edge artificial intelligence.
            </p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-full shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              Explore Collections
            </button>
          </div>
          <div ref={heroImageRef} className="md:w-1/2 flex justify-center">
            <img
              src="https://placehold.co/600x400/2C3E50/FFFFFF?text=AI+Fashion+Design"
              alt="AI Generated Fashion Design"
              className="rounded-3xl shadow-2xl w-full max-w-md md:max-w-lg object-cover transform hover:scale-105 transition-transform duration-500"
              onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/600x400/2C3E50/FFFFFF?text=Image+Unavailable'; }}
            />
          </div>
        </div>
        {/* Subtle background gradient for dark theme */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black opacity-70"></div>
      </section>

      {/* Our Vision Section */}
      <section id="vision" ref={addToRefs} className="py-20 md:py-32 bg-gray-900">
        <div className="container mx-auto px-6 md:px-12 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8 tracking-tight">Our Vision</h2>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-12">
            We believe in a future where fashion is more accessible, sustainable, and uniquely personal. AI empowers designers to push boundaries, reduce waste, and create truly bespoke garments.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="bg-gray-800 p-8 rounded-2xl shadow-lg flex flex-col items-center transform hover:-translate-y-2 transition-transform duration-300">
              <div className="text-blue-400 mb-4">
                {/* Updated SVG for Unleashed Creativity (Lightning Bolt) */}
                <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
              </div>
              <h3 className="text-2xl font-semibold mb-4">Unleashed Creativity</h3>
              <p className="text-gray-300">AI provides endless design possibilities, inspiring new forms and aesthetics.</p>
            </div>
            <div className="bg-gray-800 p-8 rounded-2xl shadow-lg flex flex-col items-center transform hover:-translate-y-2 transition-transform duration-300">
              <div className="text-blue-400 mb-4">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684L10.5 9l2.592-5.28a1 1 0 01.948-.684H19a2 2 0 012 2v10a2 2 0 01-2 2h-3.28a1 1 0 01-.948-.684L13.5 15l-2.592 5.28a1 1 0 01-.948.684H5a2 2 0 01-2-2V5z"></path></svg>
              </div>
              <h3 className="text-2xl font-semibold mb-4">Sustainable Practices</h3>
              <p className="text-gray-300">Optimize material use and reduce waste with AI-driven design and production.</p>
            </div>
            <div className="bg-gray-800 p-8 rounded-2xl shadow-lg flex flex-col items-center transform hover:-translate-y-2 transition-transform duration-300">
              <div className="text-blue-400 mb-4">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
              </div>
              <h3 className="text-2xl font-semibold mb-4">Personalized Style</h3>
              <p className="text-gray-300">Craft unique garments tailored to individual preferences and body types.</p>
            </div>
          </div>
        </div>
      </section>

      {/* The Process Section */}
      <section id="process" ref={addToRefs} className="py-20 md:py-32 bg-black">
        <div className="container mx-auto px-6 md:px-12">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 tracking-tight">The Process</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div ref={processStepsContainerRef} className="space-y-10">
              <div className="flex items-start opacity-0"> {/* Re-added opacity-0 */}
                <div className="flex-shrink-0 w-12 h-12 bg-blue-700 text-white rounded-full flex items-center justify-center text-xl font-bold mr-6 shadow-md">1</div>
                <div>
                  <h3 className="text-2xl font-semibold mb-2">Concept Generation</h3>
                  <p className="text-gray-300">AI analyzes trends, inspirations, and user inputs to generate novel design concepts.</p>
                </div>
              </div>
              <div className="flex items-start opacity-0"> {/* Re-added opacity-0 */}
                <div className="flex-shrink-0 w-12 h-12 bg-blue-700 text-white rounded-full flex items-center justify-center text-xl font-bold mr-6 shadow-md">2</div>
                <div>
                  <h3 className="text-2xl font-semibold mb-2">Design Refinement</h3>
                  <p className="text-300">Designers collaborate with AI, refining details and exploring variations with unparalleled speed.</p>
                </div>
              </div>
              <div className="flex items-start opacity-0"> {/* Re-added opacity-0 */}
                <div className="flex-shrink-0 w-12 h-12 bg-blue-700 text-white rounded-full flex items-center justify-center text-xl font-bold mr-6 shadow-md">3</div>
                <div>
                  <h3 className="text-2xl font-semibold mb-2">Virtual Prototyping</h3>
                  <p className="text-gray-300">Realistic 3D simulations allow for virtual try-ons and adjustments before physical production.</p>
                </div>
              </div>
              <div className="flex items-start opacity-0"> {/* Re-added opacity-0 */}
                <div className="flex-shrink-0 w-12 h-12 bg-blue-700 text-white rounded-full flex items-center justify-center text-xl font-bold mr-6 shadow-md">4</div>
                <div>
                  <h3 className="text-2xl font-semibold mb-2">Ethical Production</h3>
                  <p className="text-gray-300">AI assists in optimizing manufacturing, ensuring responsible and efficient production.</p>
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <img
                src="https://placehold.co/600x600/1C2833/FFFFFF?text=AI+Design+Process"
                alt="AI Design Process Flow"
                className="rounded-3xl shadow-2xl w-full max-w-lg object-cover transform hover:scale-105 transition-transform duration-500"
                onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/600x600/1C2833/FFFFFF?text=Image+Unavailable'; }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" ref={addToRefs} className="py-20 md:py-32 bg-gray-900">
        <div className="container mx-auto px-6 md:px-12 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-16 tracking-tight">Gallery of Innovation</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {aiFashionImages.map((imageUrl, index) => (
              <div key={index} className="bg-gray-800 p-8 rounded-2xl shadow-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300">
                <img
                  src={imageUrl}
                  alt={`AI Fashion Design ${index + 1}`}
                  className="w-full h-80 object-cover rounded-lg"
                  onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x500/2C3E50/FFFFFF?text=Image+Unavailable'; }}
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">Collection {index + 1}</h3>
                  {/* Static description instead of generated one */}
                  <p className="text-gray-300 text-sm">A unique blend of algorithms and artistic vision.</p>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-16 bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-8 rounded-full shadow-md transition-all duration-300 transform hover:-translate-y-1">
            View All Collections
          </button>
        </div>
      </section>

      {/* AI Styling Advisor Section */}
      <section id="ai-advisor" ref={addToRefs} className="py-20 md:py-32 bg-black">
        <div className="container mx-auto px-6 md:px-12 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8 tracking-tight">AI Styling Advisor</h2>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-12">
            Describe your fashion needs, and our AI will provide personalized styling advice.
          </p>
          <div className="max-w-2xl mx-auto bg-gray-900 p-8 rounded-2xl shadow-lg">
            <textarea
              className="w-full p-4 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 resize-y min-h-[100px] bg-gray-800 text-white placeholder-gray-400"
              placeholder="e.g., 'I need an outfit for a casual outdoor wedding in summer.', 'Suggest a chic work-from-home look.'"
              value={stylingInput}
              onChange={(e) => setStylingInput(e.target.value)}
              rows="4"
            ></textarea>
            <button
              onClick={getStylingAdvice}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-full shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              disabled={isStylingLoading}
            >
              {isStylingLoading ? (
                <svg className="animate-spin h-5 w-5 text-white inline-block mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                '✨ Get AI Styling Advice'
              )}
            </button>
            {stylingAdvice && (
              <div className="mt-8 p-6 bg-gray-800 rounded-xl shadow-md text-left text-gray-100">
                <h3 className="text-xl font-semibold mb-3">Your AI Styling Advice:</h3>
                <p className="whitespace-pre-wrap">{stylingAdvice}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Call to Action / Contact Section */}
      <section id="contact" ref={addToRefs} className="py-20 md:py-32 bg-blue-600 text-white">
        <div className="container mx-auto px-6 md:px-12 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8 tracking-tight">Ready to Reimagine Fashion?</h2>
          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-12 opacity-90">
            Join us on this journey to innovate and shape the future of style with artificial intelligence.
          </p>
          <a href="#" className="bg-white hover:bg-gray-100 text-blue-600 font-medium py-3 px-8 rounded-full shadow-lg transition-all duration-300 transform hover:-translate-y-1 inline-block">
            Get in Touch
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 py-12 px-6 md:px-12 text-center">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
            <div className="text-lg font-semibold">AI Fashion</div>
            <nav className="flex space-x-6">
              <a href="#" className="hover:text-white transition-colors duration-200">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors duration-200">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors duration-200">Careers</a>
            </nav>
            {/* Social Media Links */}
            <div className="flex space-x-6">
              <a href="https://github.com/mqz0211" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors duration-200 flex items-center justify-center">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 0C5.372 0 0 5.372 0 12c0 5.303 3.438 9.795 8.205 11.385.6.11 1.02-.26 1.02-.577 0-.285-.01-1.04-.015-2.04-3.338.725-4.042-1.61-4.042-1.61-.546-1.387-1.332-1.758-1.332-1.758-1.088-.745.083-.73.083-.73 1.205.085 1.838 1.238 1.838 1.238 1.07 1.833 2.809 1.304 3.492 1.002.108-.78.42-1.304.762-1.605-2.665-.303-5.466-1.332-5.466-5.93 0-1.31.465-2.385 1.238-3.225-.125-.303-.538-1.52.117-3.175 0 0 1.008-.325 3.301 1.23.957-.265 1.98-.397 3.003-.402 1.023.005 2.046.137 3.003.402 2.293-1.555 3.3-1.23 3.3-1.23.655 1.655.242 2.872.117 3.175.773.84 1.238 1.915 1.238 3.225 0 4.609-2.805 5.624-5.483 5.92.43.37.818 1.102.818 2.222 0 1.605-.015 2.898-.015 3.28 0 .318.41.692 1.02.577C20.562 21.795 24 17.303 24 12 24 5.372 18.628 0 12 0Z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors duration-200 flex items-center justify-center">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.505 1.492-3.89 3.776-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33V22C18.343 21.128 22 16.991 22 12Z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors duration-200 flex items-center justify-center">
                {/* Instagram SVG Icon (proper) */}
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 0C8.74 0 8.333.014 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.715-2.118 1.374L.63 4.14c-.297.765-.499 1.635-.558 2.913-.058 1.28-.072 1.67-.072 4.999s.014 3.72.072 4.999c.06 1.278.261 2.148.558 2.913.306.789.715 1.459 1.374 2.118l1.374 1.374c.765.297 1.635.499 2.913.558 1.28.058 1.67.072 4.999.072s3.72-.014 4.999-.072c1.278-.06 2.148-.261 2.913-.558.789-.306 1.459-.715 2.118-1.374l1.374-1.374c.297-.765.499-1.635.558-2.913.058-1.28.072-1.67.072-4.999s-.014-3.72-.072-4.999c-.06-1.278-.261-2.148-.558-2.913-.306-.789-.715-1.459-1.374-2.118L19.86 2.63c-.765-.297-1.635-.499-2.913-.558C15.607.014 15.217 0 12 0Zm0 2.163c3.204 0 3.584.012 4.85.071 1.17.055 1.8.249 2.222.418.572.22.957.472 1.374.889.417.418.67.803.889 1.374.169.422.363 1.052.418 2.222.059 1.266.071 1.646.071 4.85s-.012 3.584-.071 4.85c-.055 1.17-.249 1.8-.418 2.222-.22.572-.472.957-.889 1.374-.418-.417-.803-.67-1.374-.889-.422-.169-1.052-.363-2.222-.418-1.266.059-1.646.071-4.85.071s-3.584-.012-4.85-.071c-1.17-.055-1.8-.249-2.222-.418-.572-.22-.957-.472-1.374-.889-.417-.418-.803-.67-1.374-.889-.422-.169-1.052-.363-2.222-.418C8.74 2.163 9.13 2.163 12 2.163Zm0 3.635a6.202 6.202 0 1 0 0 12.404 6.202 6.202 0 0 0 0-12.404ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm6.825-10.422a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4Z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
          <div className="text-sm mt-8">
            &copy; {new Date().getFullYear()} AI Fashion. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
