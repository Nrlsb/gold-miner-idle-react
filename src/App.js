import React from 'react';

// --- Definitions ---
const OLD_SAVE_KEY_V3 = 'goldMinerIdleSave_React_v3';
const SAVE_KEY = 'goldMinerIdleSave_React_v5'; // Incremented save key for the new system
const PRESTIGE_REQUIREMENT = 1000000;
const ASCENSION_REQUIREMENT = 1000; // Requirement in Prestige Gems

// --- Game Data ---

const generatorTypes = [
    { id: 'miner', name: 'Minero Automático', description: 'Genera una pequeña cantidad de oro.', baseCost: 10, baseGps: 0.1, costMultiplier: 1.15 },
    { id: 'cart', name: 'Carreta de Mina', description: 'Transporta más oro desde la mina.', baseCost: 100, baseGps: 1, costMultiplier: 1.20 },
    { id: 'excavator', name: 'Excavadora', description: 'Extrae enormes cantidades de oro.', baseCost: 1200, baseGps: 8, costMultiplier: 1.25 },
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

// --- NEW: Ascension Upgrades ---
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
    celestialRelics: 0, // NEW
    purchasedAscensionUpgrades: [], // NEW
    lastSaveTimestamp: Date.now(),
});

// --- Main App Component ---
export default function App() {
    // --- State Management ---
    const [gameState, setGameState] = React.useState(getNewGameState());
    const [floatingNumbers, setFloatingNumbers] = React.useState([]);
    const [offlineEarnings, setOfflineEarnings] = React.useState(null);

    // --- REFACTORED: Centralized calculation logic ---
    const recalculateValues = React.useCallback((currentState) => {
        // --- Ascension Bonuses ---
        let gemEffectiveness = 1.0;
        if (currentState.purchasedAscensionUpgrades.includes('gem_mastery')) {
            gemEffectiveness = ascensionUpgradeTypes['gem_mastery'].value;
        }
        let totalGoldMultiplier = 1.0;
        if (currentState.purchasedAscensionUpgrades.includes('relic_power')) {
            totalGoldMultiplier *= (1 + currentState.celestialRelics);
        }

        const currentPrestigeBonus = 1 + (currentState.prestigeGems * 0.05 * gemEffectiveness);

        // --- Gold Per Click Calculation ---
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
        
        const goldPerClick = baseGpc * gpcMultiplier * currentPrestigeBonus * totalGoldMultiplier;

        // --- Gold Per Second Calculation ---
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

                baseGps += generatorProduction * generatorMultiplier;
            }
        }
        
        let goldPerSecond = (baseGps * totalGpsMultiplier * currentPrestigeBonus) * totalGoldMultiplier;
        
        if (currentState.purchasedSkills.includes('compound_interest')) goldPerSecond += currentState.gold * skillTypes['compound_interest'].value;

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
    
    const resourcesPerSecond = React.useMemo(() => {
        const rps = { iron: 0, coal: 0, diamond: 0 };
        const geologistCount = gameState.generators.geologist || 0;
        if (geologistCount > 0) {
            const geologistDef = generatorTypes.find(g => g.id === 'geologist');
            for (const resourceId in geologistDef.baseRps) {
                rps[resourceId] = geologistCount * geologistDef.baseRps[resourceId];
            }
        }
        return rps;
    }, [gameState.generators]);


    // --- Game Logic Functions ---
    const handleManualClick = (e) => {
        let clickValue = goldPerClick;
        if (gameState.purchasedSkills.includes('critical_click')) {
            const skill = skillTypes['critical_click'];
            if (Math.random() < skill.value) clickValue *= skill.multiplier;
        }
        
        const newResources = { ...gameState.resources };
        let resourceChanceMultiplier = 1.0;
        if (gameState.craftedArtifacts.includes('lucky_geode')) {
            resourceChanceMultiplier = artifactTypes.find(a => a.id === 'lucky_geode').value;
        }

        if (Math.random() < 0.10 * resourceChanceMultiplier) newResources.iron += 1;
        if (Math.random() < 0.08 * resourceChanceMultiplier) newResources.coal += 1;
        if (Math.random() < 0.01 * resourceChanceMultiplier) newResources.diamond += 1;

        setGameState(prev => ({ ...prev, gold: prev.gold + clickValue, resources: newResources }));

        const newFloatingNumber = { id: Date.now() + Math.random(), value: `+${Math.round(clickValue)}`, x: e.clientX, y: e.clientY };
        setFloatingNumbers(current => [...current, newFloatingNumber]);
        setTimeout(() => setFloatingNumbers(current => current.filter(n => n.id !== newFloatingNumber.id)), 1000);
    };

    const buyGenerator = (generatorId) => {
        const generator = generatorTypes.find(g => g.id === generatorId);
        let count = gameState.generators[generatorId] || 0;
        let costMultiplier = generator.costMultiplier;
        if (gameState.purchasedSkills.includes('geology_grants') && generatorId === 'geologist') {
            costMultiplier *= skillTypes['geology_grants'].value;
        }
        const cost = generator.baseCost * Math.pow(costMultiplier, count);
        if (gameState.gold >= cost) {
            setGameState(prev => ({ ...prev, gold: prev.gold - cost, generators: { ...prev.generators, [generatorId]: (prev.generators[generatorId] || 0) + 1 } }));
        }
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

    // --- NEW: Ascension Logic ---
    const buyAscensionUpgrade = (upgradeId) => {
        const upgrade = ascensionUpgradeTypes[upgradeId];
        if (!upgrade || gameState.purchasedAscensionUpgrades.includes(upgradeId) || gameState.celestialRelics < upgrade.cost) return;
        setGameState(prev => ({
            ...prev,
            celestialRelics: prev.celestialRelics - upgrade.cost,
            purchasedAscensionUpgrades: [...prev.purchasedAscensionUpgrades, upgradeId],
        }));
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
                return newState;
            });
        }
    };

    const hardReset = () => {
        if (window.confirm("¿Estás seguro de que quieres reiniciar TODO tu progreso? Se perderán incluso las gemas, la ciencia y las reliquias.")) {
            localStorage.removeItem(SAVE_KEY);
            localStorage.removeItem(OLD_SAVE_KEY_V3);
            setGameState(getNewGameState());
        }
    };

    // --- Effects ---
    
    React.useEffect(() => {
        let loadedState = getNewGameState();
        try {
            const savedData = localStorage.getItem(SAVE_KEY);
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                delete parsedData.goldPerClick;
                delete parsedData.goldPerSecond;
                delete parsedData.gpsMultiplier;
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
            for(const resId in geologistDef.baseRps) {
                earnedResources[resId] = timeDifferenceSeconds * (geologistDef.baseRps[resId] * geologistCount);
            }
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
                 return { ...prev, gold: prev.gold + goldPerSecond / 10, resources: newResources };
            });
        }, 100);
        return () => clearInterval(gameTick);
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
        const branches = {
            clicking: { name: 'Clics', skills: [] },
            automation: { name: 'Automatización', skills: [] },
            prestige: { name: 'Prestigio', skills: [] },
        };
        for (const skillId in skillTypes) {
            const skill = { ...skillTypes[skillId], id: skillId };
            if (branches[skill.branch]) {
                branches[skill.branch].skills.push(skill);
            }
        }
        for (const branch in branches) {
            branches[branch].skills.sort((a, b) => a.tier - b.tier);
        }
        return branches;
    }, []);

    return (
        <>
            <style>{`.floating-number { position: fixed; pointer-events: none; animation: float-up 1s ease-out forwards; font-weight: bold; font-size: 1.5rem; color: #FBBF24; text-shadow: 1px 1px 2px black; } .modal-backdrop { animation: fade-in 0.3s ease-out forwards; }`}</style>
            {floatingNumbers.map(num => (<div key={num.id} className="floating-number" style={{ left: num.x, top: num.y }}>{num.value}</div>))}
            {offlineEarnings && (<div className="modal-backdrop fixed inset-0 bg-black/60 flex items-center justify-center z-50"><div className="bg-gray-800 rounded-xl p-8 text-center space-y-4 border border-yellow-400 shadow-lg"><h2 className="text-2xl font-bold text-yellow-400">¡Bienvenido de vuelta!</h2><p className="text-gray-300">Mientras no estabas ({Math.round(offlineEarnings.time)} segundos), has producido:</p><p className="text-4xl font-bold text-white">{Math.floor(offlineEarnings.gold).toLocaleString('es')} Oro</p><div>{Object.entries(offlineEarnings.resources).map(([id, val]) => val > 0 && (<p key={id} className="text-lg text-gray-300">{`+${Math.floor(val).toLocaleString('es')} ${resourceTypes.find(r=>r.id===id).name}`}</p>))}</div><button onClick={() => setOfflineEarnings(null)} className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-2 px-6 rounded-lg text-lg transition transform active:scale-95">¡Genial!</button></div></div>)}
            <div className="bg-gradient-to-b from-gray-900 to-gray-800 text-white flex items-start justify-center min-h-screen py-8 font-sans">
                <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 p-4">
                    <div className="lg:col-span-2 bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-2xl p-6 space-y-6 border border-gray-700">
                        <div className="text-center"><h1 className="text-3xl font-bold text-yellow-400">Gold Miner Idle (React)</h1><p className="text-gray-400">¡Conviértete en un magnate del oro!</p></div>
                        <div className="bg-gray-900 p-6 rounded-xl border border-gray-700 sticky top-4 z-10 shadow-lg">
                            <div className="flex justify-around items-center flex-wrap gap-4">
                                <div><h2 className="text-lg font-medium text-gray-400">Oro</h2><p className="text-2xl md:text-3xl font-bold text-white">{Math.floor(gameState.gold).toLocaleString('es')}</p></div>
                                <div><h2 className="text-lg font-medium text-gray-400">Gemas</h2><p className="text-2xl md:text-3xl font-bold text-purple-400">{gameState.prestigeGems}</p></div>
                                <div><h2 className="text-lg font-medium text-gray-400">Ciencia</h2><p className="text-2xl md:text-3xl font-bold text-cyan-400">{Math.floor(gameState.sciencePoints)}</p></div>
                                {/* --- NEW: Relics Display --- */}
                                <div><h2 className="text-lg font-medium text-gray-400">Reliquias</h2><p className="text-2xl md:text-3xl font-bold text-amber-300">{gameState.celestialRelics} 🌟</p></div>
                            </div>
                            <p className="text-sm text-yellow-500 mt-2 text-center">{goldPerSecond.toFixed(1)} oro por segundo</p>
                            <p className="text-sm text-purple-300 mt-1 text-center">Bono de prestigio: +{((prestigeBonus - 1) * 100).toFixed(0)}%</p>
                        </div>
                        <button onClick={handleManualClick} className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-4 px-6 rounded-lg text-xl transition transform active:scale-95 shadow-lg shadow-yellow-500/20">Picar Oro (+{Math.round(goldPerClick)})</button>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2"><h2 className="text-2xl font-bold text-center text-gray-300 border-b-2 border-gray-700 pb-2 mb-4">Mejoras</h2>{upgradeTypes.map(upgrade => { const isPurchased = gameState.purchasedUpgrades.includes(upgrade.id); const canAfford = gameState.gold >= upgrade.cost; return ( <div key={upgrade.id} className="bg-green-900/40 p-3 rounded-lg border border-green-700/60 flex justify-between items-center"><div><h4 className="font-semibold">{upgrade.name}</h4><p className="text-xs text-gray-400">{upgrade.description}</p></div><button onClick={() => buyUpgrade(upgrade.id)} disabled={isPurchased || !canAfford} className={`bg-green-600 font-bold py-2 px-4 rounded-lg text-sm transition ${isPurchased ? 'bg-gray-600 opacity-70 cursor-not-allowed' : canAfford ? 'hover:bg-green-700 active:scale-95' : 'opacity-50 cursor-not-allowed'}`}>{isPurchased ? 'Comprado' : `${upgrade.cost.toLocaleString('es')} Oro`}</button></div>); })}</div>
                            <div className="space-y-2"><h2 className="text-2xl font-bold text-center text-gray-300 border-b-2 border-gray-700 pb-2 mb-4">Generadores</h2>{generatorTypes.map(gen => { const count = gameState.generators[gen.id] || 0; const cost = gen.baseCost * Math.pow(gen.costMultiplier, count); const canAfford = gameState.gold >= cost; const isResourceGen = !!gen.baseRps; return (<div key={gen.id} className="bg-gray-700/50 p-4 rounded-xl space-y-3 border border-gray-600"><div className="flex justify-between items-center"><div><h3 className="text-lg font-semibold">{gen.name}</h3><p className="text-gray-400 text-xs">{gen.description}</p><p className="text-xs text-gray-300">Posees: <span className="font-bold">{count}</span></p></div><button onClick={() => buyGenerator(gen.id)} disabled={!canAfford} className={`text-white font-bold py-2 px-4 rounded-lg text-sm transition ${isResourceGen ? 'bg-teal-600' : 'bg-blue-600'} ${canAfford ? `${isResourceGen ? 'hover:bg-teal-700' : 'hover:bg-blue-700'} active:scale-95` : 'opacity-50 cursor-not-allowed'}`}>Comprar</button></div><div className="text-center bg-gray-800 p-1 rounded-md"><p className="text-gray-400 text-sm">Costo: <span className="font-semibold text-white">{Math.ceil(cost).toLocaleString('es')}</span> Oro</p></div></div>); })}</div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-gray-700">
                            <div className="space-y-2"><h2 className="text-2xl font-bold text-center text-gray-300">Prestigio</h2><div className="bg-purple-900/40 p-4 rounded-lg text-center space-y-2"><p className="text-gray-300 text-sm">Reinicia para obtener Gemas y Puntos de Ciencia.</p><p className="text-gray-400 text-sm">Requisito: <span className="font-bold text-white">{PRESTIGE_REQUIREMENT.toLocaleString('es')}</span> Oro</p><button onClick={prestige} disabled={gemsToGain <= 0} className={`w-full bg-purple-600 text-white font-bold py-3 px-5 rounded-lg transition ${gemsToGain > 0 ? 'hover:bg-purple-700 active:scale-95' : 'opacity-50 cursor-not-allowed'}`}>Prestigio por +{gemsToGain} Gemas y +{scienceToGain} Ciencia</button></div></div>
                            {/* --- NEW: Ascension Section --- */}
                            <div className="space-y-2"><h2 className="text-2xl font-bold text-center text-amber-300">Ascensión</h2><div className="bg-amber-900/40 p-4 rounded-lg text-center space-y-2"><p className="text-gray-300 text-sm">Reinicia todo (incl. gemas) para obtener Reliquias Celestiales.</p><p className="text-gray-400 text-sm">Requisito: <span className="font-bold text-white">{ASCENSION_REQUIREMENT.toLocaleString('es')}</span> Gemas</p><button onClick={ascend} disabled={relicsToGain <= 0} className={`w-full bg-amber-500 text-black font-bold py-3 px-5 rounded-lg transition ${relicsToGain > 0 ? 'hover:bg-amber-600 active:scale-95' : 'opacity-50 cursor-not-allowed'}`}>Ascender por +{relicsToGain} Reliquias 🌟</button></div></div>
                        </div>
                        <div className="pt-4 border-t border-gray-700"><button onClick={hardReset} className="w-full bg-red-700 hover:bg-red-800 text-white font-bold py-2 px-4 rounded-lg transition active:scale-95">Reiniciar Partida (Hard Reset)</button></div>
                    </div>
                    <div className="lg:col-span-1 space-y-6 h-fit sticky top-4">
                        <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-2xl p-6 space-y-4 border border-gray-700">
                            <h2 className="text-2xl font-bold text-center text-cyan-400 border-b-2 border-gray-700 pb-2 mb-4">Investigación</h2>
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
                                                <button onClick={() => buySkill(skill.id)} disabled={isPurchased || isLocked || !canAfford} className={`w-full mt-3 font-bold py-2 px-4 rounded-lg text-sm transition ${isPurchased ? 'bg-gray-600 opacity-70 cursor-not-allowed' : (canAfford && !isLocked) ? 'bg-cyan-600 hover:bg-cyan-700 active:scale-95' : 'bg-cyan-800/50 opacity-50 cursor-not-allowed'}`}>{isPurchased ? 'Comprado' : `Costo: ${skill.cost} Ciencia`}</button>
                                            </div>);
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* --- NEW: Ascension Upgrades Panel --- */}
                        <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-2xl p-6 space-y-4 border border-amber-500/50">
                            <h2 className="text-2xl font-bold text-center text-amber-300 border-b-2 border-gray-700 pb-2 mb-4">Mejoras Celestiales</h2>
                            <div className="space-y-3">
                                {Object.entries(ascensionUpgradeTypes).map(([id, upgrade]) => {
                                    const isPurchased = gameState.purchasedAscensionUpgrades.includes(id);
                                    const canAfford = gameState.celestialRelics >= upgrade.cost;
                                    return (
                                        <div key={id} className={`p-3 rounded-lg border flex flex-col transition-all ${isPurchased ? 'bg-amber-900/50 border-amber-700/80' : 'bg-gray-700/50 border-gray-600'}`}>
                                            <div className="flex-grow"><h4 className="font-semibold text-amber-200">{upgrade.name}</h4><p className="text-xs text-gray-400 mt-1">{upgrade.description}</p></div>
                                            <button onClick={() => buyAscensionUpgrade(id)} disabled={isPurchased || !canAfford} className={`w-full mt-3 font-bold py-2 px-4 rounded-lg text-sm transition ${isPurchased ? 'bg-gray-600 opacity-70 cursor-not-allowed' : canAfford ? 'bg-amber-500 text-black hover:bg-amber-600 active:scale-95' : 'opacity-50 cursor-not-allowed'}`}>{isPurchased ? 'Comprado' : `Costo: ${upgrade.cost} Reliquias`}</button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-2xl p-6 space-y-4 border border-gray-700"><h2 className="text-2xl font-bold text-center text-orange-400 border-b-2 border-gray-700 pb-2 mb-4">Fabricación</h2><div className="grid grid-cols-3 gap-4 text-center mb-4">{resourceTypes.map(res => (<div key={res.id} className="bg-gray-900 p-2 rounded-lg"><div className="text-2xl">{res.icon}</div><div className="text-sm font-bold">{Math.floor(gameState.resources[res.id] || 0)}</div></div>))}</div><div className="space-y-3">{artifactTypes.map(artifact => { const isCrafted = gameState.craftedArtifacts.includes(artifact.id); const canAfford = Object.entries(artifact.cost).every(([resId, cost]) => gameState.resources[resId] >= cost); return (<div key={artifact.id} className={`p-3 rounded-lg border flex flex-col transition-all ${isCrafted ? 'bg-orange-900/50 border-orange-700/80' : 'bg-gray-700/50 border-gray-600'}`}><div className="flex-grow"><h4 className="font-semibold text-orange-300">{artifact.name}</h4><p className="text-xs text-gray-400 mt-1">{artifact.description}</p></div><div className="text-xs text-gray-400 mt-2">Costo: {Object.entries(artifact.cost).map(([resId, cost]) => `${cost} ${resourceTypes.find(r=>r.id===resId).name}`).join(', ')}</div><button onClick={() => craftArtifact(artifact.id)} disabled={isCrafted || !canAfford} className={`w-full mt-3 bg-orange-600 font-bold py-2 px-4 rounded-lg text-sm transition ${isCrafted ? 'bg-gray-600 opacity-70 cursor-not-allowed' : canAfford ? 'hover:bg-orange-700 active:scale-95' : 'opacity-50 cursor-not-allowed'}`}>{isCrafted ? 'Fabricado' : 'Fabricar'}</button></div>);})}</div></div>
                    </div>
                </div>
            </div>
        </>
    );
}
