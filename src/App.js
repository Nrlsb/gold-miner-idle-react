import React from 'react';

// --- Definitions ---
const SAVE_KEY = 'goldMinerIdleSave_React_v9'; // Incremented save key for QoL features
const PRESTIGE_REQUIREMENT = 1000000;
const ASCENSION_REQUIREMENT = 1000;

// --- NEW FEATURE: Game Data for Achievements & Active Skills ---
const GOLD_RUSH = {
    DURATION: 15, // seconds
    COOLDOWN: 300, // 5 minutes
    MULTIPLIER: 10,
};

const achievementTypes = {
    'click_1': { name: 'Principiante del Clic', description: 'Haz clic 100 veces.', rewardDescription: '+1% Oro por Clic', condition: (state) => state.stats.totalClicks >= 100, reward: { type: 'gpc_multiplier', value: 1.01 } },
    'click_2': { name: 'Rey del Clic', description: 'Haz clic 10,000 veces.', rewardDescription: '+5% Oro por Clic', condition: (state) => state.stats.totalClicks >= 10000, reward: { type: 'gpc_multiplier', value: 1.05 } },
    'miner_1': { name: 'Magnate Minero', description: 'Compra 200 Mineros.', rewardDescription: '+5% a la producción de Mineros', condition: (state) => (state.generators.miner || 0) >= 200, reward: { type: 'generator_multiplier', target: 'miner', value: 1.05 } },
    'prestige_1': { name: 'Primer Prestigio', description: 'Haz prestigio por primera vez.', rewardDescription: '+1 Gema de Prestigio', condition: (state) => state.stats.prestiges > 0, reward: { type: 'flat_gems', value: 1 } },
    'ascend_1': { name: 'Primer Ascenso', description: 'Asciende por primera vez.', rewardDescription: '+1 Reliquia Celestial', condition: (state) => state.stats.ascensions > 0, reward: { type: 'flat_relics', value: 1 } },
};


// --- Game Data ---

const generatorTypes = [
    { 
        id: 'miner', 
        name: 'Minero Automático', 
        description: 'Genera una pequeña cantidad de oro.', 
        baseCost: 10, 
        baseGps: 0.1, 
        costMultiplier: 1.15,
        specializations: {
            milestone: 25,
            options: {
                'elite_miners': { name: 'Mineros de Élite', description: 'Producen un 50% más de oro, pero su costo aumenta más rápido.' },
                'iron_miners': { name: 'Mineros de Hierro', description: 'Producen un 25% menos de oro, pero también generan 0.1 de Hierro por segundo.' }
            }
        }
    },
    { id: 'cart', name: 'Carreta de Mina', description: 'Transporta más oro. Recibe un bono de los mineros.', baseCost: 100, baseGps: 1, costMultiplier: 1.20 },
    { id: 'excavator', name: 'Excavadora', description: 'Extrae enormes cantidades de oro. Mejora la búsqueda de recursos.', baseCost: 1200, baseGps: 8, costMultiplier: 1.25 },
    { id: 'geologist', name: 'Geólogo', description: 'Busca recursos automáticamente.', baseCost: 5000, costMultiplier: 1.30, baseRps: { iron: 0.1, coal: 0.05, diamond: 0.001 } }
];

const upgradeTypes = [
    { id: 'miner_gloves', name: 'Guantes de Minero', description: '+1 al oro por clic base.', cost: 50, type: 'click_add', value: 1 },
    { id: 'reinforced_pick', name: 'Pico Reforzado', description: '+4 al oro por clic base.', cost: 250, type: 'click_add', value: 4 },
    { id: 'quality_gears', name: 'Engranajes de Calidad', description: '+10% a la producción de todos los generadores.', cost: 500, type: 'gps_multiplier', value: 1.10 },
    { id: 'bigger_carts', name: 'Carretas más Grandes', description: 'Duplica la producción de las Carretas de Mina.', cost: 1000, type: 'generator_multiplier', target: 'cart', value: 2 },
    { id: 'smart_investments', name: 'Inversiones Inteligentes', description: '+25% a la producción de todos los generadores.', cost: 5000, type: 'gps_multiplier', value: 1.25 },
    { id: 'diamond_drills', name: 'Taladros de Diamante', description: 'Duplica la producción de las Excavadoras.', cost: 12000, type: 'generator_multiplier', target: 'excavator', value: 2 }
];

const skillTypes = {
    'powerful_clicks_1': { name: 'Clics Potenciados I', description: 'Aumenta el oro por clic en un 25%.', cost: 1, type: 'click_bonus', value: 1.25, branch: 'clicking', tier: 1, requires: [] },
    'critical_click': { name: 'Golpe Crítico', description: 'Tus clics tienen un 2% de probabilidad de generar 10 veces más oro.', cost: 3, type: 'critical_click_chance', value: 0.02, multiplier: 10, branch: 'clicking', tier: 2, requires: ['powerful_clicks_1'] },
    'powerful_clicks_2': { name: 'Clics Potenciados II', description: 'Aumenta el oro por clic en otro 50%.', cost: 8, type: 'click_bonus', value: 1.5, branch: 'clicking', tier: 3, requires: ['critical_click'] },
    'efficient_miners_1': { name: 'Minería Eficiente I', description: 'Los Mineros Automáticos producen un 25% más.', cost: 1, type: 'generator_bonus', target: 'miner', value: 1.25, branch: 'automation', tier: 1, requires: [] },
    'cart_optimization': { name: 'Optimización de Carretas', description: 'Las Carretas de Mina producen un 25% más.', cost: 4, type: 'generator_bonus', target: 'cart', value: 1.25, branch: 'automation', tier: 2, requires: ['efficient_miners_1'] },
    'compound_interest': { name: 'Interés Compuesto', description: 'Gana un 0.01% de tu oro actual por segundo.', cost: 10, type: 'interest_bonus', value: 0.0001, branch: 'automation', tier: 3, requires: ['cart_optimization'] },
    'gem_hoarder_1': { name: 'Acumulador de Gemas I', description: 'Gana 1 gema de prestigio extra cada vez que haces prestigio.', cost: 2, type: 'prestige_bonus', value: 1, branch: 'prestige', tier: 1, requires: [] },
    'science_surplus': { name: 'Excedente Científico', description: 'Gana un 10% más de Puntos de Ciencia al hacer prestigio.', cost: 5, type: 'science_bonus', value: 1.1, branch: 'prestige', tier: 2, requires: ['gem_hoarder_1'] },
    'geology_grants': { name: 'Subsidios Geológicos', description: 'Los Geólogos cuestan un 10% menos.', cost: 8, type: 'cost_reduction', target: 'geologist', value: 0.9, branch: 'prestige', tier: 3, requires: ['science_surplus'] },
};

const ascensionUpgradeTypes = {
    'relic_power': { name: 'Poder de las Reliquias', description: 'Cada Reliquia Celestial también aumenta la producción de oro en un 100%.', cost: 1, type: 'relic_gold_bonus' },
    'gem_mastery': { name: 'Maestría en Gemas', description: 'Las Gemas de Prestigio son un 25% más efectivas.', cost: 2, type: 'gem_effectiveness_bonus', value: 1.25 },
    'eternal_knowledge': { name: 'Conocimiento Eterno', description: 'Comienza cada prestigio con 1 Punto de Ciencia.', cost: 5, type: 'starting_science', value: 1 },
};

const resourceTypes = [
    { id: 'iron', name: 'Hierro', icon: '🔩' },
    { id: 'coal', name: 'Carbón', icon: '⚫' },
    { id: 'diamond', name: 'Diamante', icon: '💎' }
];

const artifactTypes = [
    { id: 'diamond_pickaxe', name: 'Pico de Diamante', description: 'Aumenta permanentemente el oro por clic en un 25%.', cost: { diamond: 100, iron: 500 }, type: 'click_multiplier', value: 1.25 },
    { id: 'coal_engine', name: 'Motor a Carbón', description: 'Duplica la producción de las Carretas de Mina.', cost: { coal: 1000, iron: 2000 }, type: 'generator_multiplier', target: 'cart', value: 2 },
    { id: 'lucky_geode', name: 'Geoda de la Suerte', description: 'Aumenta la probabilidad de encontrar recursos en un 10%.', cost: { diamond: 500 }, type: 'resource_chance', value: 1.10 }
];


// --- Helper Functions ---
const getNewGameState = () => ({
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
});

// --- NEW FEATURE: Number and Time Formatting ---
const numberFormatter = new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 2
});

function formatNumber(num) {
    if (num < 1000) return Math.floor(num).toLocaleString('es');
    return numberFormatter.format(num);
}

function formatTime(seconds) {
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


// --- Main App Component ---
export default function App() {
    // --- State Management ---
    const [gameState, setGameState] = React.useState(getNewGameState());
    const [floatingNumbers, setFloatingNumbers] = React.useState([]);
    const [offlineEarnings, setOfflineEarnings] = React.useState(null);
    const [specializationChoice, setSpecializationChoice] = React.useState(null);
    const [activeTab, setActiveTab] = React.useState('research');
    const [buyAmount, setBuyAmount] = React.useState(1); // NEW: Buy amount state

    // --- Centralized calculation logic ---
    const recalculateValues = React.useCallback((currentState) => {
        let gemEffectiveness = 1.0;
        if (currentState.purchasedAscensionUpgrades.includes('gem_mastery')) {
            gemEffectiveness = ascensionUpgradeTypes['gem_mastery'].value;
        }
        let totalGoldMultiplierFromAscension = 1.0;
        if (currentState.purchasedAscensionUpgrades.includes('relic_power')) {
            totalGoldMultiplierFromAscension *= (1 + currentState.celestialRelics);
        }

        const currentPrestigeBonus = 1 + (currentState.prestigeGems * 0.05 * gemEffectiveness);

        let baseGpc = 1;
        currentState.purchasedUpgrades.forEach(upgradeId => {
            const upgrade = upgradeTypes.find(u => u.id === upgradeId);
            if (upgrade && upgrade.type === 'click_add') baseGpc += upgrade.value;
        });

        let gpcMultiplier = 1.0;
        currentState.purchasedSkills.forEach(skillId => {
            const skill = skillTypes[skillId];
            if(skill && skill.type === 'click_bonus') gpcMultiplier *= skill.value;
        });
        if (currentState.craftedArtifacts.includes('diamond_pickaxe')) gpcMultiplier *= artifactTypes.find(a => a.id === 'diamond_pickaxe').value;
        
        currentState.unlockedAchievements.forEach(achId => {
            const ach = achievementTypes[achId];
            if (ach.reward.type === 'gpc_multiplier') gpcMultiplier *= ach.reward.value;
        });
        
        let goldPerClick = baseGpc * gpcMultiplier * currentPrestigeBonus * totalGoldMultiplierFromAscension;

        let baseGps = 0;
        let totalGpsMultiplier = 1.0;

        currentState.purchasedUpgrades.forEach(upgradeId => {
            const upgrade = upgradeTypes.find(u => u.id === upgradeId);
            if (upgrade && upgrade.type === 'gps_multiplier') totalGpsMultiplier *= upgrade.value;
        });

        for (const type of generatorTypes) {
            if (type.baseGps) {
                let generatorProduction = (currentState.generators[type.id] || 0) * type.baseGps;
                let generatorMultiplier = 1.0;

                currentState.purchasedUpgrades.forEach(upgradeId => {
                    const upgrade = upgradeTypes.find(u => u.id === upgradeId);
                    if (upgrade && upgrade.type === 'generator_multiplier' && upgrade.target === type.id) generatorMultiplier *= upgrade.value;
                });
                
                currentState.purchasedSkills.forEach(skillId => {
                    const skill = skillTypes[skillId];
                    if(skill && skill.type === 'generator_bonus' && skill.target === type.id) generatorMultiplier *= skill.value;
                });
                if (currentState.craftedArtifacts.includes('coal_engine') && type.id === 'cart') generatorMultiplier *= artifactTypes.find(a => a.id === 'coal_engine').value;

                if (type.id === 'cart') {
                    const minerCount = currentState.generators['miner'] || 0;
                    const synergyBonus = 1 + (Math.floor(minerCount / 50) * 0.10);
                    generatorMultiplier *= synergyBonus;
                }
                
                const specialization = currentState.generatorSpecializations[type.id];
                if (specialization === 'elite_miners') generatorMultiplier *= 1.5;
                else if (specialization === 'iron_miners') generatorMultiplier *= 0.75;
                
                currentState.unlockedAchievements.forEach(achId => {
                    const ach = achievementTypes[achId];
                    if (ach.reward.type === 'generator_multiplier' && ach.reward.target === type.id) generatorMultiplier *= ach.reward.value;
                });

                baseGps += generatorProduction * generatorMultiplier;
            }
        }
        
        let goldPerSecond = (baseGps * totalGpsMultiplier * currentPrestigeBonus) * totalGoldMultiplierFromAscension;
        
        if (currentState.purchasedSkills.includes('compound_interest')) goldPerSecond += currentState.gold * skillTypes['compound_interest'].value;

        if (currentState.goldRush.active) {
            goldPerClick *= GOLD_RUSH.MULTIPLIER;
            goldPerSecond *= GOLD_RUSH.MULTIPLIER;
        }

        return { goldPerClick, goldPerSecond };
    }, []);

    // --- Memoized Calculations ---
    const { goldPerClick, goldPerSecond } = React.useMemo(() => recalculateValues(gameState), [gameState, recalculateValues]);
    
    const prestigeBonus = React.useMemo(() => {
        let gemEffectiveness = 1.0;
        if (gameState.purchasedAscensionUpgrades.includes('gem_mastery')) {
            gemEffectiveness = ascensionUpgradeTypes['gem_mastery'].value;
        }
        return 1 + (gameState.prestigeGems * 0.05 * gemEffectiveness);
    }, [gameState.prestigeGems, gameState.purchasedAscensionUpgrades]);
    
    const gemsToGain = React.useMemo(() => {
        if (gameState.gold < PRESTIGE_REQUIREMENT) return 0;
        let gems = Math.floor(Math.sqrt(gameState.gold / PRESTIGE_REQUIREMENT)) * 5;
        if (gameState.purchasedSkills.includes('gem_hoarder_1')) {
            gems += skillTypes['gem_hoarder_1'].value;
        }
        return Math.floor(gems);
    }, [gameState.gold, gameState.purchasedSkills]);

    const relicsToGain = React.useMemo(() => {
        if (gameState.prestigeGems < ASCENSION_REQUIREMENT) return 0;
        return 1 + Math.floor(gameState.prestigeGems / ASCENSION_REQUIREMENT);
    }, [gameState.prestigeGems]);

    const scienceToGain = React.useMemo(() => {
        if (gemsToGain <= 0) return 0;
        let science = Math.floor(gemsToGain / 5);
        if (gameState.purchasedSkills.includes('science_surplus')) {
            science *= skillTypes['science_surplus'].value;
        }
        return Math.floor(science);
    }, [gemsToGain, gameState.purchasedSkills]);
    
    const resourceFindingBonus = React.useMemo(() => {
        const excavatorCount = gameState.generators['excavator'] || 0;
        let bonus = 1 + (Math.floor(excavatorCount / 10) * 0.01);
        if (gameState.craftedArtifacts.includes('lucky_geode')) {
            bonus *= artifactTypes.find(a => a.id === 'lucky_geode').value;
        }
        return bonus;
    }, [gameState.generators, gameState.craftedArtifacts]);

    const resourcesPerSecond = React.useMemo(() => {
        const rps = { iron: 0, coal: 0, diamond: 0 };
        const geologistCount = gameState.generators.geologist || 0;
        if (geologistCount > 0) {
            const geologistDef = generatorTypes.find(g => g.id === 'geologist');
            for (const resourceId in geologistDef.baseRps) {
                rps[resourceId] = geologistCount * geologistDef.baseRps[resourceId] * resourceFindingBonus;
            }
        }
        if (gameState.generatorSpecializations['miner'] === 'iron_miners') {
            const minerCount = gameState.generators['miner'] || 0;
            rps.iron += minerCount * 0.1;
        }
        return rps;
    }, [gameState.generators, gameState.generatorSpecializations, resourceFindingBonus]);


    // --- Game Logic Functions ---
    const handleManualClick = (e) => {
        let clickValue = goldPerClick;
        if (gameState.purchasedSkills.includes('critical_click')) {
            const skill = skillTypes['critical_click'];
            if (Math.random() < skill.value) clickValue *= skill.multiplier;
        }
        
        const newResources = { ...gameState.resources };
        if (Math.random() < 0.10 * resourceFindingBonus) newResources.iron += 1;
        if (Math.random() < 0.08 * resourceFindingBonus) newResources.coal += 1;
        if (Math.random() < 0.01 * resourceFindingBonus) newResources.diamond += 1;

        setGameState(prev => ({ 
            ...prev, 
            gold: prev.gold + clickValue, 
            resources: newResources,
            stats: { ...prev.stats, totalClicks: prev.stats.totalClicks + 1 }
        }));

        const newFloatingNumber = { id: Date.now() + Math.random(), value: `+${formatNumber(clickValue)}`, x: e.clientX, y: e.clientY };
        setFloatingNumbers(current => [...current, newFloatingNumber]);
        setTimeout(() => setFloatingNumbers(current => current.filter(n => n.id !== newFloatingNumber.id)), 1000);
    };

    // --- NEW FEATURE: Multi-buy logic for generators ---
    const calculateGeneratorCost = React.useCallback((generatorId, amount) => {
        const generator = generatorTypes.find(g => g.id === generatorId);
        const count = gameState.generators[generatorId] || 0;
        let costMultiplier = generator.costMultiplier;
        if (gameState.purchasedSkills.includes('geology_grants') && generatorId === 'geologist') {
            costMultiplier *= skillTypes['geology_grants'].value;
        }
        if (gameState.generatorSpecializations[generatorId] === 'elite_miners') {
            costMultiplier *= 1.1;
        }

        let totalCost = 0;
        let canBuyAmount = 0;
        let currentGold = gameState.gold;

        if (amount === 'max') {
            if (costMultiplier === 1) {
                canBuyAmount = Math.floor(currentGold / (generator.baseCost * Math.pow(costMultiplier, count)));
            } else {
                // Derived from geometric series sum formula
                const a = generator.baseCost * Math.pow(costMultiplier, count);
                const r = costMultiplier;
                const affordableAmount = Math.floor(Math.log( (currentGold * (r - 1)) / a + 1 ) / Math.log(r));
                canBuyAmount = affordableAmount > 0 ? affordableAmount : 0;
            }
            amount = canBuyAmount;
        }
        
        if (costMultiplier === 1) {
            totalCost = generator.baseCost * amount;
        } else {
            const a = generator.baseCost * Math.pow(costMultiplier, count);
            const r = costMultiplier;
            totalCost = a * (Math.pow(r, amount) - 1) / (r - 1);
        }

        return { totalCost: Math.ceil(totalCost), amountToBuy: amount };

    }, [gameState.gold, gameState.generators, gameState.purchasedSkills, gameState.generatorSpecializations]);
    
    const buyGenerator = (generatorId, amount) => {
        const { totalCost, amountToBuy } = calculateGeneratorCost(generatorId, amount);

        if (amountToBuy > 0 && gameState.gold >= totalCost) {
            const generator = generatorTypes.find(g => g.id === generatorId);
            const currentCount = gameState.generators[generatorId] || 0;
            const newCount = currentCount + amountToBuy;

            setGameState(prev => ({
                ...prev,
                gold: prev.gold - totalCost,
                generators: { ...prev.generators, [generatorId]: newCount }
            }));
            
            if (generator.specializations && newCount >= generator.specializations.milestone && !gameState.generatorSpecializations[generatorId]) {
                setSpecializationChoice(generatorId);
            }
        }
    };

    const selectSpecialization = (generatorId, specializationId) => {
        setGameState(prev => ({ ...prev, generatorSpecializations: { ...prev.generatorSpecializations, [generatorId]: specializationId } }));
        setSpecializationChoice(null);
    };

    const buyUpgrade = (upgradeId) => {
        const upgrade = upgradeTypes.find(u => u.id === upgradeId);
        if (!upgrade || gameState.purchasedUpgrades.includes(upgradeId) || gameState.gold < upgrade.cost) return;
        setGameState(prev => ({ ...prev, gold: prev.gold - upgrade.cost, purchasedUpgrades: [...prev.purchasedUpgrades, upgradeId] }));
    };
    
    const buySkill = (skillId) => {
        const skill = skillTypes[skillId];
        if (!skill || gameState.purchasedSkills.includes(skillId)) return;
        const canAfford = gameState.sciencePoints >= skill.cost;
        const requirementsMet = skill.requires.every(reqId => gameState.purchasedSkills.includes(reqId));
        if (canAfford && requirementsMet) {
            setGameState(prev => ({ ...prev, sciencePoints: prev.sciencePoints - skill.cost, purchasedSkills: [...prev.purchasedSkills, skillId] }));
        }
    };

    const buyAscensionUpgrade = (upgradeId) => {
        const upgrade = ascensionUpgradeTypes[upgradeId];
        if (!upgrade || gameState.purchasedAscensionUpgrades.includes(upgradeId) || gameState.celestialRelics < upgrade.cost) return;
        setGameState(prev => ({ ...prev, celestialRelics: prev.celestialRelics - upgrade.cost, purchasedAscensionUpgrades: [...prev.purchasedAscensionUpgrades, upgradeId] }));
    };

    const ascend = () => {
        if (relicsToGain > 0 && window.confirm(`¿Quieres ascender por ${relicsToGain} Reliquias Celestiales? Tu progreso de prestigio (gemas, ciencia, habilidades) se reiniciará por completo.`)) {
            setGameState(prev => {
                const newState = getNewGameState();
                newState.celestialRelics = prev.celestialRelics + relicsToGain;
                newState.purchasedAscensionUpgrades = prev.purchasedAscensionUpgrades;
                newState.craftedArtifacts = prev.craftedArtifacts;
                newState.resources = prev.resources;
                if (prev.purchasedAscensionUpgrades.includes('eternal_knowledge')) {
                    newState.sciencePoints = ascensionUpgradeTypes['eternal_knowledge'].value;
                }
                newState.stats.ascensions = prev.stats.ascensions + 1;
                return newState;
            });
        }
    };

    const craftArtifact = (artifactId) => {
        const artifact = artifactTypes.find(a => a.id === artifactId);
        if (!artifact || gameState.craftedArtifacts.includes(artifactId)) return;
        for (const resourceId in artifact.cost) { if (gameState.resources[resourceId] < artifact.cost[resourceId]) return; }
        setGameState(prev => {
            const newResources = { ...prev.resources };
            for (const resourceId in artifact.cost) { newResources[resourceId] -= artifact.cost[resourceId]; }
            return { ...prev, resources: newResources, craftedArtifacts: [...prev.craftedArtifacts, artifactId] };
        });
    };

    const prestige = () => {
        if (gemsToGain > 0 && window.confirm(`¿Quieres hacer prestigio por ${gemsToGain} gemas y ${scienceToGain} Puntos de Ciencia? Tu progreso actual se reiniciará.`)) {
            setGameState(prev => {
                const newState = getNewGameState();
                newState.prestigeGems = prev.prestigeGems + gemsToGain;
                newState.sciencePoints = prev.sciencePoints + scienceToGain;
                if (prev.purchasedAscensionUpgrades.includes('eternal_knowledge')) {
                    newState.sciencePoints += ascensionUpgradeTypes['eternal_knowledge'].value;
                }
                newState.purchasedSkills = prev.purchasedSkills;
                newState.craftedArtifacts = prev.craftedArtifacts;
                newState.resources = prev.resources;
                newState.celestialRelics = prev.celestialRelics;
                newState.purchasedAscensionUpgrades = prev.purchasedAscensionUpgrades;
                newState.generatorSpecializations = prev.generatorSpecializations;
                newState.stats = { ...prev.stats, prestiges: prev.stats.prestiges + 1 };
                return newState;
            });
        }
    };

    const hardReset = () => {
        if (window.confirm("¿Estás seguro de que quieres reiniciar TODO tu progreso? Se perderán incluso las gemas, la ciencia y las reliquias.")) {
            localStorage.removeItem(SAVE_KEY);
            setGameState(getNewGameState());
        }
    };

    const activateGoldRush = () => {
        if (gameState.goldRush.cooldown > 0) return;
        setGameState(prev => ({ ...prev, goldRush: { active: true, timeLeft: GOLD_RUSH.DURATION, cooldown: GOLD_RUSH.COOLDOWN } }));
    };

    const handleClickable = (clickableId) => {
        const clickable = gameState.activeClickables.find(c => c.id === clickableId);
        if (!clickable) return;
        if (clickable.type === 'nugget') {
            const goldReward = goldPerSecond * 15;
            setGameState(prev => ({ ...prev, gold: prev.gold + goldReward }));
        }
        setGameState(prev => ({ ...prev, activeClickables: prev.activeClickables.filter(c => c.id !== clickableId) }));
    };

    // --- Effects ---
    
    React.useEffect(() => {
        let loadedState = getNewGameState();
        try {
            const savedData = localStorage.getItem(SAVE_KEY);
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                loadedState = { ...getNewGameState(), ...parsedData };
            }
        } catch (error) { console.error("Error loading saved game:", error); }

        const { goldPerSecond: loadedGps } = recalculateValues(loadedState);
        const timeNow = Date.now();
        const timeDifferenceSeconds = (timeNow - loadedState.lastSaveTimestamp) / 1000;
        const earnedGold = timeDifferenceSeconds * loadedGps;

        const geologistCount = loadedState.generators.geologist || 0;
        const earnedResources = { iron: 0, coal: 0, diamond: 0 };
        if (geologistCount > 0) {
            const geologistDef = generatorTypes.find(g => g.id === 'geologist');
            const offlineResourceBonus = 1 + (Math.floor((loadedState.generators['excavator'] || 0) / 10) * 0.01);
            for(const resId in geologistDef.baseRps) {
                earnedResources[resId] = timeDifferenceSeconds * (geologistDef.baseRps[resId] * geologistCount * offlineResourceBonus);
            }
        }
        if (loadedState.generatorSpecializations['miner'] === 'iron_miners') {
            const minerCount = loadedState.generators['miner'] || 0;
            earnedResources.iron += timeDifferenceSeconds * minerCount * 0.1;
        }

        if (earnedGold > 1 || Object.values(earnedResources).some(r => r > 1)) {
            loadedState.gold += earnedGold;
            for(const resId in earnedResources) {
                loadedState.resources[resId] = (loadedState.resources[resId] || 0) + earnedResources[resId];
            }
            setOfflineEarnings({ time: timeDifferenceSeconds, gold: earnedGold, resources: earnedResources });
        }
        
        setGameState(loadedState);
    }, [recalculateValues]);
    
    React.useEffect(() => {
        const scriptId = 'tailwind-script';
        if (!document.getElementById(scriptId)) {
            const script = document.createElement('script');
            script.id = scriptId;
            script.src = 'https://cdn.tailwindcss.com';
            script.async = true;
            document.head.appendChild(script);
        }
    }, []);

    React.useEffect(() => {
        const gameTick = setInterval(() => {
            setGameState(prev => {
                 const newResources = { ...prev.resources };
                 const rps = resourcesPerSecond;
                 for (const resId in rps) {
                    newResources[resId] = (newResources[resId] || 0) + rps[resId] / 10;
                 }
                 let newGoldRush = { ...prev.goldRush };
                 if (newGoldRush.active) {
                     newGoldRush.timeLeft -= 0.1;
                     if (newGoldRush.timeLeft <= 0) newGoldRush = { active: false, timeLeft: 0, cooldown: GOLD_RUSH.COOLDOWN };
                 } else if (newGoldRush.cooldown > 0) {
                     newGoldRush.cooldown -= 0.1;
                     if (newGoldRush.cooldown < 0) newGoldRush.cooldown = 0;
                 }
                 
                 const newlyUnlocked = [];
                 for (const achId in achievementTypes) {
                     if (!prev.unlockedAchievements.includes(achId) && achievementTypes[achId].condition(prev)) newlyUnlocked.push(achId);
                 }
                 let newGems = prev.prestigeGems;
                 let newRelics = prev.celestialRelics;
                 if (newlyUnlocked.length > 0) {
                    newlyUnlocked.forEach(achId => {
                        const reward = achievementTypes[achId].reward;
                        if (reward.type === 'flat_gems') newGems += reward.value;
                        if (reward.type === 'flat_relics') newRelics += reward.value;
                    });
                 }
                 return { ...prev, gold: prev.gold + goldPerSecond / 10, resources: newResources, goldRush: newGoldRush, unlockedAchievements: [...prev.unlockedAchievements, ...newlyUnlocked], prestigeGems: newGems, celestialRelics: newRelics };
            });
        }, 100);
        
        const clickableInterval = setInterval(() => {
            if (Math.random() < 0.15) {
                setGameState(prev => {
                    if (prev.activeClickables.length >= 3) return prev;
                    const newClickable = { id: Date.now(), type: 'nugget', x: 10 + Math.random() * 80, y: 20 + Math.random() * 60 };
                    setTimeout(() => { setGameState(current => ({ ...current, activeClickables: current.activeClickables.filter(c => c.id !== newClickable.id) })); }, 8000);
                    return { ...prev, activeClickables: [...prev.activeClickables, newClickable] };
                });
            }
        }, 10000);

        return () => { clearInterval(gameTick); clearInterval(clickableInterval); };
    }, [goldPerSecond, resourcesPerSecond]);

    const gameStateRef = React.useRef(gameState);
    React.useEffect(() => { gameStateRef.current = gameState; }, [gameState]);

    React.useEffect(() => {
        const saveInterval = setInterval(() => {
            localStorage.setItem(SAVE_KEY, JSON.stringify({ ...gameStateRef.current, lastSaveTimestamp: Date.now() }));
        }, 3000);
        return () => clearInterval(saveInterval);
    }, []);

    const skillBranches = React.useMemo(() => {
        const branches = { clicking: { name: 'Clics', skills: [] }, automation: { name: 'Automatización', skills: [] }, prestige: { name: 'Prestigio', skills: [] } };
        for (const skillId in skillTypes) {
            const skill = { ...skillTypes[skillId], id: skillId };
            if (branches[skill.branch]) branches[skill.branch].skills.push(skill);
        }
        for (const branch in branches) branches[branch].skills.sort((a, b) => a.tier - b.tier);
        return branches;
    }, []);

    const SpecializationModal = () => {
        if (!specializationChoice) return null;
        const generator = generatorTypes.find(g => g.id === specializationChoice);
        if (!generator || !generator.specializations) return null;
        return (
            <div className="modal-backdrop fixed inset-0 bg-black/60 flex items-center justify-center z-50"><div className="bg-gray-800 rounded-xl p-8 text-center space-y-4 border border-yellow-400 shadow-lg max-w-lg"><h2 className="text-2xl font-bold text-yellow-400">¡Especialización de {generator.name}!</h2><p className="text-gray-300">Has alcanzado {generator.specializations.milestone} {generator.name}s. ¡Elige una mejora permanente para ellos!</p><div className="space-y-4 pt-4">{Object.entries(generator.specializations.options).map(([specId, specDetails]) => (<button key={specId} onClick={() => selectSpecialization(generator.id, specId)} className="w-full text-left bg-gray-700 hover:bg-gray-600 p-4 rounded-lg transition"><h3 className="font-bold text-lg text-white">{specDetails.name}</h3><p className="text-gray-400">{specDetails.description}</p></button>))}</div></div></div>
        );
    };

    return (
        <>
            <style>{`
                body { font-family: 'Inter', sans-serif; }
                .floating-number { position: fixed; pointer-events: none; animation: float-up 1s ease-out forwards; font-weight: bold; font-size: 1.5rem; color: #FBBF24; text-shadow: 1px 1px 2px black; z-index: 100; } 
                .modal-backdrop { animation: fade-in 0.3s ease-out forwards; }
                .clickable-nugget { position: absolute; cursor: pointer; animation: pulse 2s infinite; }
                .can-afford { animation: glow 1.5s infinite alternate; }
                .tab-scroll::-webkit-scrollbar { display: none; }
                .tab-scroll { -ms-overflow-style: none; scrollbar-width: none; }
                @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                @keyframes float-up { from { transform: translateY(0); opacity: 1; } to { transform: translateY(-50px); opacity: 0; } }
                @keyframes glow { from { box-shadow: 0 0 2px #fff, 0 0 4px #fff, 0 0 6px #fde047, 0 0 8px #fde047; } to { box-shadow: 0 0 4px #fff, 0 0 8px #fff, 0 0 12px #facc15, 0 0 16px #facc15; } }
            `}</style>
            <SpecializationModal />
            {floatingNumbers.map(num => (<div key={num.id} className="floating-number" style={{ left: num.x, top: num.y }}>{num.value}</div>))}
            {offlineEarnings && (<div className="modal-backdrop fixed inset-0 bg-black/60 flex items-center justify-center z-50"><div className="bg-gray-800 rounded-xl p-8 text-center space-y-4 border border-yellow-400 shadow-lg max-w-md mx-4"><h2 className="text-2xl font-bold text-yellow-400">¡Bienvenido de vuelta!</h2><p className="text-gray-300">Mientras no estabas ({formatTime(offlineEarnings.time)}), has producido:</p><p className="text-4xl font-bold text-white">{formatNumber(offlineEarnings.gold)} Oro</p><div>{Object.entries(offlineEarnings.resources).map(([id, val]) => val > 0 && (<p key={id} className="text-lg text-gray-300">{`+${formatNumber(val)} ${resourceTypes.find(r=>r.id===id).name}`}</p>))}</div><button onClick={() => setOfflineEarnings(null)} className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-2 px-6 rounded-lg text-lg transition transform active:scale-95">¡Genial!</button></div></div>)}
            
            <div className="absolute inset-0 pointer-events-none">
                {gameState.activeClickables.map(c => (
                    <div key={c.id} className="clickable-nugget" style={{ left: `${c.x}%`, top: `${c.y}%` }} onClick={() => handleClickable(c.id)}>
                        <span className="text-4xl pointer-events-auto" role="img" aria-label="Pepita de Oro">💰</span>
                    </div>
                ))}
            </div>

            <div className="bg-gradient-to-b from-gray-900 to-gray-800 text-white flex items-start justify-center min-h-screen py-4 sm:py-8 font-sans">
                <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 p-2 sm:p-4">
                    <div className="lg:col-span-2 bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-2xl p-4 sm:p-6 space-y-6 border border-gray-700">
                        <div className="text-center"><h1 className="text-3xl font-bold text-yellow-400">Gold Miner Idle (React)</h1><p className="text-gray-400">¡Conviértete en un magnate del oro!</p></div>
                        <div className="bg-gray-900 p-4 sm:p-6 rounded-xl border border-gray-700 lg:sticky top-4 z-10 shadow-lg">
                            <div className="flex justify-around items-center flex-wrap gap-x-4 gap-y-2">
                                <div><h2 className="text-base sm:text-lg font-medium text-gray-400">Oro</h2><p className="text-xl sm:text-3xl font-bold text-white" title={Math.floor(gameState.gold).toLocaleString('es')}>{formatNumber(gameState.gold)}</p></div>
                                <div><h2 className="text-base sm:text-lg font-medium text-gray-400">Gemas</h2><p className="text-xl sm:text-3xl font-bold text-purple-400">{formatNumber(gameState.prestigeGems)}</p></div>
                                <div><h2 className="text-base sm:text-lg font-medium text-gray-400">Ciencia</h2><p className="text-xl sm:text-3xl font-bold text-cyan-400">{formatNumber(gameState.sciencePoints)}</p></div>
                                <div><h2 className="text-base sm:text-lg font-medium text-gray-400">Reliquias</h2><p className="text-xl sm:text-3xl font-bold text-amber-300">{gameState.celestialRelics} 🌟</p></div>
                            </div>
                            <p className="text-sm text-yellow-500 mt-2 text-center">{formatNumber(goldPerSecond)} oro por segundo</p>
                            <p className="text-sm text-purple-300 mt-1 text-center">Bono de prestigio: +{((prestigeBonus - 1) * 100).toFixed(0)}%</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button onClick={handleManualClick} className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-3 sm:py-4 px-6 rounded-lg text-lg sm:text-xl transition transform active:scale-95 shadow-lg shadow-yellow-500/20">Picar Oro (+{formatNumber(goldPerClick)})</button>
                            <button onClick={activateGoldRush} disabled={gameState.goldRush.cooldown > 0 || gameState.goldRush.active} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 sm:py-4 px-6 rounded-lg text-lg sm:text-xl transition transform active:scale-95 shadow-lg shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed">
                                {gameState.goldRush.active ? `¡Fiebre del Oro! (${Math.ceil(gameState.goldRush.timeLeft)}s)` : gameState.goldRush.cooldown > 0 ? `Enfriamiento (${Math.ceil(gameState.goldRush.cooldown)}s)` : 'Fiebre del Oro'}
                            </button>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2"><h2 className="text-2xl font-bold text-center text-gray-300 border-b-2 border-gray-700 pb-2 mb-4">Mejoras</h2>{upgradeTypes.map(upgrade => { const isPurchased = gameState.purchasedUpgrades.includes(upgrade.id); const canAfford = gameState.gold >= upgrade.cost; return ( <div key={upgrade.id} className="bg-green-900/40 p-3 rounded-lg border border-green-700/60 flex justify-between items-center"><div><h4 className="font-semibold">{upgrade.name}</h4><p className="text-xs text-gray-400">{upgrade.description}</p></div><button onClick={() => buyUpgrade(upgrade.id)} disabled={isPurchased || !canAfford} className={`bg-green-600 font-bold py-2 px-4 rounded-lg text-sm transition ${isPurchased ? 'bg-gray-600 opacity-70 cursor-not-allowed' : canAfford ? 'hover:bg-green-700 active:scale-95 can-afford' : 'opacity-50 cursor-not-allowed'}`}>{isPurchased ? 'Comprado' : `${formatNumber(upgrade.cost)} Oro`}</button></div>); })}</div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center border-b-2 border-gray-700 pb-2 mb-4">
                                    <h2 className="text-2xl font-bold text-gray-300">Generadores</h2>
                                    <div className="flex space-x-1 bg-gray-700 p-1 rounded-lg">{[1, 10, 100, 'max'].map(amount => <button key={amount} onClick={() => setBuyAmount(amount)} className={`px-3 py-1 text-xs font-bold rounded-md ${buyAmount === amount ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-600'}`}>{typeof amount === 'string' ? 'Máx' : `x${amount}`}</button>)}</div>
                                </div>
                                {generatorTypes.map(gen => {
                                const count = gameState.generators[gen.id] || 0;
                                const { totalCost, amountToBuy } = calculateGeneratorCost(gen.id, buyAmount);
                                const canAfford = gameState.gold >= totalCost;
                                const isResourceGen = !!gen.baseRps;
                                const specialization = gameState.generatorSpecializations[gen.id];
                                let synergyBonusText = null;
                                if (gen.id === 'cart') {
                                    const minerCount = gameState.generators['miner'] || 0;
                                    const bonus = Math.floor(minerCount / 50) * 10;
                                    if (bonus > 0) synergyBonusText = <p className="text-xs text-green-400">Bono de Mineros: +{bonus}%</p>;
                                }
                                if (gen.id === 'geologist') {
                                    const bonus = (resourceFindingBonus - 1) * 100;
                                     if (bonus > 0) synergyBonusText = <p className="text-xs text-green-400">Bono de Excavadoras: +{bonus.toFixed(0)}% recursos</p>;
                                }
                                const timeToAfford = (totalCost - gameState.gold) / goldPerSecond;

                                return (
                                <div key={gen.id} className={`p-4 rounded-xl space-y-3 border ${specialization ? 'bg-yellow-900/30 border-yellow-600/50' : 'bg-gray-700/50 border-gray-600'}`}>
                                    <div className="flex justify-between items-center">
                                        <div><h3 className="text-lg font-semibold">{gen.name}</h3><p className="text-gray-400 text-xs">{gen.description}</p><p className="text-xs text-gray-300">Posees: <span className="font-bold">{formatNumber(count)}</span></p>{synergyBonusText}{specialization && <p className="text-xs text-yellow-400 font-semibold mt-1">Especialización: {gen.specializations.options[specialization].name}</p>}</div>
                                        <button onClick={() => buyGenerator(gen.id, buyAmount)} disabled={!canAfford} className={`text-white font-bold py-2 px-4 rounded-lg text-sm transition ${isResourceGen ? 'bg-teal-600' : 'bg-blue-600'} ${canAfford ? `${isResourceGen ? 'hover:bg-teal-700' : 'hover:bg-blue-700'} active:scale-95 can-afford' : 'opacity-50 cursor-not-allowed'}`}>Comprar {amountToBuy > 0 ? formatNumber(amountToBuy) : ''}</button>
                                    </div>
                                    <div className="text-center bg-gray-800 p-1 rounded-md"><p className="text-gray-400 text-sm">Costo: <span className="font-semibold text-white">{formatNumber(totalCost)}</span> Oro</p>{!canAfford && goldPerSecond > 0 && <p className="text-xs text-gray-500">({formatTime(timeToAfford)})</p>}</div>
                                </div>
                                );
                            })}</div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-gray-700">
                            <div className="space-y-2"><h2 className="text-2xl font-bold text-center text-gray-300">Prestigio</h2><div className="bg-purple-900/40 p-4 rounded-lg text-center space-y-2"><p className="text-gray-300 text-sm">Reinicia para obtener Gemas y Puntos de Ciencia.</p><p className="text-gray-400 text-sm">Requisito: <span className="font-bold text-white">{formatNumber(PRESTIGE_REQUIREMENT)}</span> Oro</p><button onClick={prestige} disabled={gemsToGain <= 0} className={`w-full bg-purple-600 text-white font-bold py-3 px-5 rounded-lg transition ${gemsToGain > 0 ? 'hover:bg-purple-700 active:scale-95' : 'opacity-50 cursor-not-allowed'}`}>Prestigio por +{formatNumber(gemsToGain)} Gemas y +{formatNumber(scienceToGain)} Ciencia</button></div></div>
                            <div className="space-y-2"><h2 className="text-2xl font-bold text-center text-amber-300">Ascensión</h2><div className="bg-amber-900/40 p-4 rounded-lg text-center space-y-2"><p className="text-gray-300 text-sm">Reinicia todo (incl. gemas) para obtener Reliquias Celestiales.</p><p className="text-gray-400 text-sm">Requisito: <span className="font-bold text-white">{formatNumber(ASCENSION_REQUIREMENT)}</span> Gemas</p><button onClick={ascend} disabled={relicsToGain <= 0} className={`w-full bg-amber-500 text-black font-bold py-3 px-5 rounded-lg transition ${relicsToGain > 0 ? 'hover:bg-amber-600 active:scale-95' : 'opacity-50 cursor-not-allowed'}`}>Ascender por +{relicsToGain} Reliquias 🌟</button></div></div>
                        </div>
                        <div className="pt-4 border-t border-gray-700"><button onClick={hardReset} className="w-full bg-red-700 hover:bg-red-800 text-white font-bold py-2 px-4 rounded-lg transition active:scale-95">Reiniciar Partida (Hard Reset)</button></div>
                    </div>
                    <div className="lg:col-span-1 space-y-6 lg:h-fit lg:sticky top-4">
                        <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-2xl p-4 sm:p-6 space-y-4 border border-gray-700">
                            <div className="flex border-b border-gray-700 overflow-x-auto tab-scroll">
                                <button onClick={() => setActiveTab('research')} className={`flex-shrink-0 py-2 px-4 font-semibold ${activeTab === 'research' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400'}`}>Investigación</button>
                                <button onClick={() => setActiveTab('ascension')} className={`flex-shrink-0 py-2 px-4 font-semibold ${activeTab === 'ascension' ? 'text-amber-300 border-b-2 border-amber-300' : 'text-gray-400'}`}>Celestiales</button>
                                <button onClick={() => setActiveTab('achievements')} className={`flex-shrink-0 py-2 px-4 font-semibold ${activeTab === 'achievements' ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-gray-400'}`}>Logros</button>
                                <button onClick={() => setActiveTab('crafting')} className={`flex-shrink-0 py-2 px-4 font-semibold ${activeTab === 'crafting' ? 'text-orange-400 border-b-2 border-orange-400' : 'text-gray-400'}`}>Fabricación</button>
                            </div>

                            {activeTab === 'research' && (
                                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3 gap-4">
                                {Object.values(skillBranches).map(branch => (
                                    <div key={branch.name} className="space-y-3">
                                        <h3 className="text-lg font-semibold text-center text-cyan-200">{branch.name}</h3>
                                        {branch.skills.map(skill => {
                                            const isPurchased = gameState.purchasedSkills.includes(skill.id);
                                            const requirementsMet = skill.requires.every(reqId => gameState.purchasedSkills.includes(reqId));
                                            const canAfford = gameState.sciencePoints >= skill.cost;
                                            const isLocked = !requirementsMet;
                                            return (<div key={skill.id} className={`p-3 rounded-lg border flex flex-col transition-all ${isPurchased ? 'bg-cyan-900/50 border-cyan-700/80' : isLocked ? 'bg-gray-800/60 border-gray-700 opacity-60' : 'bg-gray-700/50 border-gray-600'}`}>
                                                <div className="flex-grow"><h4 className={`font-semibold ${isLocked ? 'text-gray-400' : 'text-cyan-300'}`}>{skill.name}</h4><p className="text-xs text-gray-400 mt-1">{skill.description}</p>{isLocked && <p className="text-xs text-red-400 mt-1">Requiere: {skill.requires.map(reqId => skillTypes[reqId].name).join(', ')}</p>}</div>
                                                <button onClick={() => buySkill(skill.id)} disabled={isPurchased || isLocked || !canAfford} className={`w-full mt-3 font-bold py-2 px-4 rounded-lg text-sm transition ${isPurchased ? 'bg-gray-600 opacity-70 cursor-not-allowed' : (canAfford && !isLocked) ? 'bg-cyan-600 hover:bg-cyan-700 active:scale-95' : 'bg-cyan-800/50 opacity-50 cursor-not-allowed'}`}>{isPurchased ? 'Comprado' : `Costo: ${formatNumber(skill.cost)} Ciencia`}</button>
                                            </div>);
                                        })}
                                    </div>
                                ))}
                                </div>
                            )}

                            {activeTab === 'ascension' && (
                                <div className="space-y-3">
                                    {Object.entries(ascensionUpgradeTypes).map(([id, upgrade]) => {
                                        const isPurchased = gameState.purchasedAscensionUpgrades.includes(id);
                                        const canAfford = gameState.celestialRelics >= upgrade.cost;
                                        return (
                                            <div key={id} className={`p-3 rounded-lg border flex flex-col transition-all ${isPurchased ? 'bg-amber-900/50 border-amber-700/80' : 'bg-gray-700/50 border-gray-600'}`}>
                                                <div className="flex-grow"><h4 className="font-semibold text-amber-200">{upgrade.name}</h4><p className="text-xs text-gray-400 mt-1">{upgrade.description}</p></div>
                                                <button onClick={() => buyAscensionUpgrade(id)} disabled={isPurchased || !canAfford} className={`w-full mt-3 font-bold py-2 px-4 rounded-lg text-sm transition ${isPurchased ? 'bg-gray-600 opacity-70 cursor-not-allowed' : canAfford ? 'bg-amber-500 text-black hover:bg-amber-600 active:scale-95 can-afford' : 'opacity-50 cursor-not-allowed'}`}>{isPurchased ? 'Comprado' : `Costo: ${upgrade.cost} Reliquias`}</button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {activeTab === 'achievements' && (
                                <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                                    {Object.entries(achievementTypes).map(([id, ach]) => {
                                        const isUnlocked = gameState.unlockedAchievements.includes(id);
                                        return (
                                            <div key={id} className={`p-3 rounded-lg border transition-all ${isUnlocked ? 'bg-yellow-900/50 border-yellow-700/80' : 'bg-gray-700/50 border-gray-600'}`}>
                                                <h4 className={`font-semibold ${isUnlocked ? 'text-yellow-300' : 'text-gray-400'}`}>{ach.name}</h4>
                                                <p className="text-xs text-gray-400 mt-1">{ach.description}</p>
                                                <p className={`text-xs mt-1 font-bold ${isUnlocked ? 'text-green-400' : 'text-gray-500'}`}>Recompensa: {ach.rewardDescription}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {activeTab === 'crafting' && (
                                <div>
                                    <div className="grid grid-cols-3 gap-4 text-center mb-4">{resourceTypes.map(res => (<div key={res.id} className="bg-gray-900 p-2 rounded-lg"><div className="text-2xl">{res.icon}</div><div className="text-sm font-bold">{formatNumber(gameState.resources[res.id] || 0)}</div></div>))}</div>
                                    <div className="space-y-3">{artifactTypes.map(artifact => { const isCrafted = gameState.craftedArtifacts.includes(artifact.id); const canAfford = Object.entries(artifact.cost).every(([resId, cost]) => gameState.resources[resId] >= cost); return (<div key={artifact.id} className={`p-3 rounded-lg border flex flex-col transition-all ${isCrafted ? 'bg-orange-900/50 border-orange-700/80' : 'bg-gray-700/50 border-gray-600'}`}><div className="flex-grow"><h4 className="font-semibold text-orange-300">{artifact.name}</h4><p className="text-xs text-gray-400 mt-1">{artifact.description}</p></div><div className="text-xs text-gray-400 mt-2">Costo: {Object.entries(artifact.cost).map(([resId, cost]) => `${formatNumber(cost)} ${resourceTypes.find(r=>r.id===resId).name}`).join(', ')}</div><button onClick={() => craftArtifact(artifact.id)} disabled={isCrafted || !canAfford} className={`w-full mt-3 bg-orange-600 font-bold py-2 px-4 rounded-lg text-sm transition ${isCrafted ? 'bg-gray-600 opacity-70 cursor-not-allowed' : canAfford ? 'hover:bg-orange-700 active:scale-95 can-afford' : 'opacity-50 cursor-not-allowed'}`}>{isCrafted ? 'Fabricado' : 'Fabricar'}</button></div>);})}</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
