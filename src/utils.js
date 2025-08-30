// src/utils.js

import { missionTypes, generatorTypes } from './gameData';

// Esta función ahora crea las misiones iniciales
export const initializeMissions = () => {
    const missions = [];
    
    // Misión inicial de Oro
    const goldMissionType = missionTypes.reach_gold;
    missions.push({
        id: `reach_gold_0`,
        type: 'reach_gold',
        tier: 0,
        progress: 0,
        target: goldMissionType.tiers[0],
        description: goldMissionType.description(goldMissionType.tiers[0]),
        rewardDescription: goldMissionType.rewardDescription(0),
    });

    // Misión inicial de Clics
    const clicksMissionType = missionTypes.total_clicks;
    missions.push({
        id: `total_clicks_0`,
        type: 'total_clicks',
        tier: 0,
        progress: 0,
        target: clicksMissionType.tiers[0],
        description: clicksMissionType.description(clicksMissionType.tiers[0]),
        rewardDescription: clicksMissionType.rewardDescription(0),
    });
    
    // Misión inicial para el primer generador (Minero)
    const genMissionType = missionTypes.own_generators;
    const firstGenerator = generatorTypes[0];
    missions.push({
        id: `own_generators_${firstGenerator.id}_0`,
        type: 'own_generators',
        targetGenerator: firstGenerator.id,
        tier: 0,
        progress: 0,
        target: genMissionType.tiers[0],
        description: genMissionType.description(genMissionType.tiers[0], firstGenerator.name),
        rewardDescription: genMissionType.rewardDescription(0),
    });

    return missions;
};


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
    stats: { 
        totalClicks: 0, 
        prestiges: 0, 
        ascensions: 0,
        totalGoldMined: 0,
    },
    unlockedAchievements: [],
    goldRush: { active: false, timeLeft: 0, cooldown: 0 },
    activeClickables: [],
    lastSaveTimestamp: Date.now(),
    autoBuyUpgradesEnabled: false,
    infinityPoints: 0,
    purchasedInfinityUpgrades: {},
    currentChallenge: null,
    challengeStartTime: 0,
    completedChallenges: [],
    // Inicializa con misiones activas
    activeMissions: initializeMissions(),
    temporaryBoosts: {},
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
