import React from 'react';

const Footer = () => (
    <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.12)',
        padding: '0.9rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(15,17,26,0.85)',
        marginTop: 'auto',
    }}>
        <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.65)', fontWeight: 500, letterSpacing: '0.02em' }}>
            © 2026 EduFeedback. All rights reserved.
        </span>
    </footer>
);

export default Footer;


