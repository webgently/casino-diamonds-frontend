function range(start, end, increment = 1) {
  const count = Math.floor((end - start + increment) / increment);
  return Array(count)
    .fill(0)
    .map((_, idx) => start + idx * increment);
}

const minFontSize = 5;
const maxFontSize = 80;

const minFontWeight = 100;
const maxFontWeight = 1000;

const minSpacingPixel = 0;
const maxSpacingPixel = 800;
const spacingPixelIncrement = 5;

const vhs = ['10vh', '20vh', '30vh', '40vh', '50vh', '60vh', '70vh', '80vh', '90vh', '100vh'];

module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    screens: {
      '4xs': '280px',
      '3xs': '320px',
      '2xs': '380px',
      xs: '480px',
      sm: '640px',
      md: '768px',
      slg: '964px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
      '3xl': '1780px'
    },
    // Extend default configurations
    extend: {
      colors: {
        red: '#ff1c44',
        green: '#17d118',
        blue: '#1e6eef',
        cyan: '#03bfc7',
        pink: '#ff4fb6',
        purple: '#7633fa',
        yellow: '#fec916',
        'thick-red': '#991029',
        'thick-green': '#006b01',
        'thick-blue': '#0e3d8c',
        'thick-cyan': '#02858b',
        'thick-pink': '#ab186f',
        'thick-purple': '#430bb0',
        'thick-yellow': '#81670e'
      },
      container: {
        center: true
      }
    },
    // Override default configurations
    fontWeight: {
      ...range(minFontWeight, maxFontWeight).reduce((merged, f) => ({ ...merged, [f]: `${f}px` }), {})
    },
    fontSize: {
      ...range(minFontSize, maxFontSize).reduce((merged, f) => ({ ...merged, [f]: `${f}px` }), {})
    },
    spacing: {
      ...range(minSpacingPixel, maxSpacingPixel, spacingPixelIncrement).reduce(
        (merged, f) => ({ ...merged, [f]: `${f}px` }),
        {}
      )
    },
    maxWidth: {
      ...range(minSpacingPixel, maxSpacingPixel, spacingPixelIncrement).reduce(
        (merged, f) => ({ ...merged, [f]: `${f}px` }),
        {}
      )
    },
    minWidth: {
      ...range(minSpacingPixel, maxSpacingPixel, spacingPixelIncrement).reduce(
        (merged, f) => ({ ...merged, [f]: `${f}px` }),
        {}
      )
    },
    maxHeight: {
      ...range(minSpacingPixel, maxSpacingPixel, spacingPixelIncrement).reduce(
        (merged, f) => ({ ...merged, [f]: `${f}px` }),
        {}
      ),
      ...vhs.reduce((merged, vh) => ({ ...merged, [vh]: vh }), {})
    },
    minHeight: {
      ...range(minSpacingPixel, maxSpacingPixel, spacingPixelIncrement).reduce(
        (merged, f) => ({ ...merged, [f]: `${f}px` }),
        {}
      ),
      ...vhs.reduce((merged, vh) => ({ ...merged, [vh]: vh }), {})
    }
  },
  plugins: []
};
