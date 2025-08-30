// src/utils.js
import { missionTypes, generatorTypes } from './gameData';

// --- Función de estado de juego actualizada ---
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
    activeMissions: [], // Nuevo para misiones activas
    temporaryBoosts: {}, // Nuevo para mejoras temporales
    eventCooldowns: {}, // Nuevo para eventos aleatorios
});

// --- Nueva función para inicializar misiones ---
export function initializeMissions() {
    const missions = [];
    
    // Misión de Oro
    const goldMission = missionTypes.gold;
    missions.push({
        id: 'gold_0',
        type: 'gold',
        tier: 0,
        name: goldMission.name,
        target: goldMission.tiers[0],
        progress: 0,
        description: goldMission.description(goldMission.tiers[0]),
        rewardDescription: goldMission.rewardDescription(0),
    });

    // Misiones de Generadores
    generatorTypes.forEach(gen => {
        if (gen.baseGps > 0) { // Solo para generadores de oro
            const genMission = missionTypes.generators;
            missions.push({
                id: `generators_${gen.id}_0`,
                type: 'generators',
                targetGenerator: gen.id,
                tier: 0,
                name: `${genMission.name} (${gen.name})`,
                target: genMission.tiers[0],
                progress: 0,
                description: genMission.description(genMission.tiers[0], gen.name),
                rewardDescription: genMission.rewardDescription(0)
            });
        }
    });

    // Misión de Clics
    const clickMission = missionTypes.clicks;
    missions.push({
        id: 'clicks_0',
        type: 'clicks',
        tier: 0,
        name: clickMission.name,
        target: clickMission.tiers[0],
        progress: 0,
        description: clickMission.description(clickMission.tiers[0]),
        rewardDescription: clickMission.rewardDescription(0),
    });

    return missions;
}


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
