/**
 * @typedef {object} ChartPalette
 * @property {string} text
 * @property {string} muted
 * @property {string} grid
 * @property {string} tooltipBg
 * @property {string} tooltipBorder
 * @property {string} brass
 * @property {string} moon
 * @property {string} jade
 * @property {string} rose
 * @property {{ a_voir: string, en_cours: string, termine: string, pause: string, abandonne: string }} status
 */

/**
 * @param {'dark' | 'light'} theme
 * @returns {ChartPalette}
 */
export function chartPalette(theme) {
  if (theme === 'light') {
    return {
      text: '#1f2430',
      muted: '#5c6371',
      grid: 'rgba(45, 39, 29, 0.09)',
      tooltipBg: '#fffdf8',
      tooltipBorder: 'rgba(45, 39, 29, 0.16)',
      brass: '#8a5b20',
      moon: '#2f57aa',
      jade: '#226f4e',
      rose: '#9d2f45',
      status: {
        a_voir: '#506078',
        en_cours: '#2a529e',
        termine: '#1e6949',
        pause: '#845310',
        abandonne: '#97283f',
      },
    };
  }
  return {
    text: '#f4f0e7',
    muted: '#a6aec0',
    grid: 'rgba(236, 225, 205, 0.08)',
    tooltipBg: '#161e2f',
    tooltipBorder: 'rgba(236, 225, 205, 0.16)',
    brass: '#e8b86d',
    moon: '#7fa9ff',
    jade: '#7cc7a2',
    rose: '#d97a8a',
    status: {
      a_voir: '#9faec6',
      en_cours: '#7fa9ff',
      termine: '#7cc7a2',
      pause: '#e8b86d',
      abandonne: '#d97a8a',
    },
  };
}

/**
 * @param {ChartPalette} palette
 */
export function tooltipOptions(palette) {
  return {
    backgroundColor: palette.tooltipBg,
    borderColor: palette.tooltipBorder,
    borderWidth: 1,
    titleColor: palette.text,
    bodyColor: palette.muted,
    padding: 12,
    cornerRadius: 12,
    displayColors: false,
    titleFont: { family: 'Outfit Variable', size: 12, weight: 600 },
    bodyFont: { family: 'Outfit Variable', size: 12 },
  };
}
