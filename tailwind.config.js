/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // SnaggedIt color palette from prototype
        primary: '#FFD44D',
        'primary-hover': '#F2C94C',
        accent: '#f0f9ff',
        background: '#ffffff',
        foreground: '#333333',
        gray: {
          light: '#f3f4f6',
          DEFAULT: '#9ca3af',
          dark: '#4b5563',
        },
        // Additional colors for UI elements
        success: '#43B681',
        'success-hover': '#41D590',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6',
        highlight: {
          pink: '#FACECE',
          yellow: '#FFEDB4',
          green: '#BBF2D8',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        heading: ['var(--font-poppins)', 'Poppins', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '8px',
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        'pill': '20px',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      maxWidth: {
        'container': '1200px',
      },
      animation: {
        'fadeIn': 'fadeIn 0.8s ease-out',
        'slideIn': 'slideIn 0.6s ease-out forwards',
        'slideInRight': 'slideInRight 0.6s ease-out forwards',
        'ripple': 'ripple 0.6s linear',
      },
      keyframes: {
        fadeIn: {
          'from': { opacity: '0', transform: 'translateY(20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          'from': { opacity: '0', transform: 'translateX(-20px)' },
          'to': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          'from': { opacity: '0', transform: 'translateX(20px)' },
          'to': { opacity: '1', transform: 'translateX(0)' },
        },
        ripple: {
          '0%': { boxShadow: '0 0 0 0 rgba(255, 212, 77, 0.3)' },
          '100%': { boxShadow: '0 0 0 20px rgba(255, 212, 77, 0)' },
        },
      },
    },
  },
  plugins: [],
}
