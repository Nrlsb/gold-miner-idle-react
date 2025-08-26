// src/utils.js

export const getNewGameState = () => ({
    gold: 0,
    generators: {},
    purchasedUpgrades: [],
    prestigeGems: 0,
    sciencePoints: 0,
    purchasedSkills: [],
    resources: { iron: 0, coal: 0, diamond: 0 },
    craftedArtifacts: [],
    celestialRelics: 0,
    purchasedAscensionUpgrades: [],
    generatorSpecializations: {},
    stats: { totalClicks: 0, prestiges: 0, ascensions: 0 },
    unlockedAchievements: [],
    goldRush: { active: false, timeLeft: 0, cooldown: 0 },
    activeClickables: [],
    lastSaveTimestamp: Date.now(),
    autoBuyUpgradesEnabled: false,
});

const numberFormatter = new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 2
});

export function formatNumber(num) {
    if (num < 1000) return Math.floor(num).toLocaleString('es');
    return numberFormatter.format(num);
}

export function formatTime(seconds) {
    if (seconds === Infinity) return 'Nunca';
    if (seconds < 0) seconds = 0;

    const d = Math.floor(seconds / (3600*24));
    const h = Math.floor(seconds % (3600*24) / 3600);
    const m = Math.floor(seconds % 3600 / 60);
    const s = Math.floor(seconds % 60);
    
    let parts = [];
    if (d > 0) parts.push(`${d}d`);
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    if (s > 0 || parts.length === 0) parts.push(`${s}s`);
    
    return parts.slice(0, 2).join(' ');
}
