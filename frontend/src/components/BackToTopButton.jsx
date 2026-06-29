import React, { useState, useEffect } from 'react';

const BackToTopButton = () => {
    const [isVisible, setIsVisible] = useState(false);
    const lastScrollY = React.useRef(0);

    useEffect(() => {
        const toggleVisibility = () => {
            const currentScrollY = window.scrollY;
            
            if (currentScrollY > 400) {
                // If scrolling up, show it. If scrolling down, hide it.
                if (currentScrollY < lastScrollY.current) {
                    setIsVisible(true);
                } else {
                    setIsVisible(false);
                }
            } else {
                // Hide if near the top
                setIsVisible(false);
            }
            
            lastScrollY.current = currentScrollY;
        };

        window.addEventListener('scroll', toggleVisibility);
        // Initial check
        toggleVisibility();

        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    if (!isVisible) {
        return null;
    }

    return (
        <button
            onClick={scrollToTop}
            style={{
                position: 'fixed',
                top: '25px',
                left: '50%',
                backgroundColor: '#ff7800', /* Vibrant orange that pops */
                color: 'white',
                border: 'none',
                borderRadius: '25px',
                padding: '10px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: 'bold',
                fontSize: '14px',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(255, 120, 0, 0.4)', /* Matching glowing shadow */
                zIndex: 9999,
                transition: 'opacity 0.3s ease, transform 0.3s ease, background-color 0.2s, box-shadow 0.2s',
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(-20px)'
            }}
            onMouseOver={(e) => { 
                e.currentTarget.style.backgroundColor = '#e66a00'; 
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 120, 0, 0.6)';
            }}
            onMouseOut={(e) => { 
                e.currentTarget.style.backgroundColor = '#ff7800'; 
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 120, 0, 0.4)';
            }}
            aria-label="Back to top"
        >
            <i className="fa-solid fa-arrow-up"></i> Back to top
        </button>
    );
};

export default BackToTopButton;
