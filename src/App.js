import React from 'react';

// --- Definitions ---
const OLD_SAVE_KEY = 'goldMinerIdleSave_React'; // Previous save key
const SAVE_KEY = 'goldMinerIdleSave_React_v2'; // New save key for the new version
const PRESTIGE_REQUIREMENT = 1000000;

// --- Game Data ---

const generatorTypes = [
    { id: 'miner', name: 'Minero Automático', description: 'Genera una pequeña cantidad de oro.', baseCost: 10, baseGps: 0.1, costMultiplier: 1.15 },
    { id: 'cart', name: 'Carreta de Mina', description: 'Transporta más oro desde la mina.', baseCost: 100, baseGps: 1, costMultiplier: 1.20 },
    { id: 'excavator', name: 'Excavadora', description: 'Extrae enormes cantidades de oro.', baseCost: 1200, baseGps: 8, costMultiplier: 1.25 }
];

const upgradeTypes = [
    { id: 'reinforced_pick', name: 'Pico Reforzado', description: 'Aumenta el oro por clic a 5.', cost: 200, type: 'click', value: 5 },
    { id: 'quality_gears', name: 'Engranajes de Calidad', description: 'Aumenta la producción de todos los generadores un 10%.', cost: 500, type: 'gps_multiplier', value: 1.10 }
];

const skillTypes = [
    { id: 'efficient_miners', name: 'Minería Eficiente', description: 'Los Mineros Automáticos producen un 25% más de oro.', cost: 1, type: 'generator_bonus', target: 'miner', value: 1.25 },
    { id: 'powerful_clicks', name: 'Clics Potenciados', description: 'Aumenta el oro por clic en un 50%.', cost: 2, type: 'click_bonus', value: 1.5 },
    { id: 'gem_hoarder', name: 'Acumulador de Gemas', description: 'Gana 1 gema de prestigio extra cada vez que haces prestigio.', cost: 5, type: 'prestige_bonus', value: 1 },
    { id: 'compound_interest', name: 'Interés Compuesto', description: 'Gana un 0.01% de tu oro actual por segundo.', cost: 10, type: 'interest_bonus', value: 0.0001 }
];


// --- Helper Functions ---
const getNewGameState = () => ({
    gold: 0,
    goldPerClick: 1,
    goldPerSecond: 0,
    gpsMultiplier: 1.0,
    generators: {},
    purchasedUpgrades: [],
    prestigeGems: 0,
    sciencePoints: 0,
    purchasedSkills: [],
    lastSaveTimestamp: Date.now(),
});

// --- Main App Component ---
export default function App() {
    // --- State Management ---
    const [gameState, setGameState] = React.useState(getNewGameState());
    const [floatingNumbers, setFloatingNumbers] = React.useState([]);
    const [offlineEarnings, setOfflineEarnings] = React.useState(null);

    // --- Memoized Calculations ---
    const prestigeBonus = React.useMemo(() => 1 + (gameState.prestigeGems * 0.05), [gameState.prestigeGems]);
    const gemsToGain = React.useMemo(() => {
        if (gameState.gold < PRESTIGE_REQUIREMENT) return 0;
        let gems = Math.floor(Math.sqrt(gameState.gold / PRESTIGE_REQUIREMENT)) * 5;
        if (gameState.purchasedSkills.includes('gem_hoarder')) {
            gems += skillTypes.find(s => s.id === 'gem_hoarder').value;
        }
        return gems;
    }, [gameState.gold, gameState.purchasedSkills]);
    const scienceToGain = React.useMemo(() => gemsToGain > 0 ? Math.floor(gemsToGain / 5) : 0, [gemsToGain]);

    // --- Game Logic Functions ---
    const recalculateValues = React.useCallback((currentState) => {
        const currentPrestigeBonus = 1 + (currentState.prestigeGems * 0.05);

        // Gold Per Click Calculation
        let baseGpc = currentState.purchasedUpgrades.includes('reinforced_pick') ? upgradeTypes.find(u => u.id === 'reinforced_pick').value : 1;
        if (currentState.purchasedSkills.includes('powerful_clicks')) {
            baseGpc *= skillTypes.find(s => s.id === 'powerful_clicks').value;
        }
        const goldPerClick = baseGpc * currentPrestigeBonus;

        // Gold Per Second Calculation
        let baseGps = 0;
        for (const type of generatorTypes) {
            let generatorProduction = (currentState.generators[type.id] || 0) * type.baseGps;
            // Apply skill bonus if applicable
            if (currentState.purchasedSkills.includes('efficient_miners') && type.id === 'miner') {
                generatorProduction *= skillTypes.find(s => s.id === 'efficient_miners').value;
            }
            baseGps += generatorProduction;
        }
        let goldPerSecond = (baseGps * currentState.gpsMultiplier) * currentPrestigeBonus;
        
        // Apply interest bonus
        if (currentState.purchasedSkills.includes('compound_interest')) {
            goldPerSecond += currentState.gold * skillTypes.find(s => s.id === 'compound_interest').value;
        }

        return { goldPerClick, goldPerSecond };
    }, []);

    const handleManualClick = (e) => {
        const clickValue = gameState.goldPerClick;
        setGameState(prev => ({ ...prev, gold: prev.gold + clickValue }));

        const newFloatingNumber = {
            id: Date.now() + Math.random(),
            value: `+${Math.round(clickValue)}`,
            x: e.clientX,
            y: e.clientY,
        };
        setFloatingNumbers(current => [...current, newFloatingNumber]);

        setTimeout(() => {
            setFloatingNumbers(current => current.filter(n => n.id !== newFloatingNumber.id));
        }, 1000);
    };

    const buyGenerator = (generatorId) => {
        const generator = generatorTypes.find(g => g.id === generatorId);
        const count = gameState.generators[generatorId] || 0;
        const cost = generator.baseCost * Math.pow(generator.costMultiplier, count);
        if (gameState.gold >= cost) {
            setGameState(prev => ({
                ...prev,
                gold: prev.gold - cost,
                generators: { ...prev.generators, [generatorId]: count + 1 }
            }));
        }
    };

    const buyUpgrade = (upgradeId) => {
        const upgrade = upgradeTypes.find(u => u.id === upgradeId);
        if (!upgrade || gameState.purchasedUpgrades.includes(upgradeId) || gameState.gold < upgrade.cost) return;
        setGameState(prev => ({
            ...prev,
            gold: prev.gold - upgrade.cost,
            purchasedUpgrades: [...prev.purchasedUpgrades, upgradeId],
            gpsMultiplier: upgrade.type === 'gps_multiplier' ? prev.gpsMultiplier * upgrade.value : prev.gpsMultiplier,
        }));
    };
    
    const buySkill = (skillId) => {
        const skill = skillTypes.find(s => s.id === skillId);
        if (!skill || gameState.purchasedSkills.includes(skillId) || gameState.sciencePoints < skill.cost) return;
        setGameState(prev => ({
            ...prev,
            sciencePoints: prev.sciencePoints - skill.cost,
            purchasedSkills: [...prev.purchasedSkills, skillId],
        }));
    };

    const prestige = () => {
        if (gemsToGain > 0 && window.confirm(`¿Quieres hacer prestigio por ${gemsToGain} gemas y ${scienceToGain} Puntos de Ciencia? Tu progreso actual se reiniciará.`)) {
            setGameState(prev => {
                const newState = getNewGameState();
                newState.prestigeGems = prev.prestigeGems + gemsToGain;
                newState.sciencePoints = prev.sciencePoints + scienceToGain;
                newState.purchasedSkills = prev.purchasedSkills;
                return newState;
            });
        }
    };

    const hardReset = () => {
        if (window.confirm("¿Estás seguro de que quieres reiniciar TODO tu progreso? Se perderán incluso las gemas y la ciencia.")) {
            localStorage.removeItem(SAVE_KEY);
            localStorage.removeItem(OLD_SAVE_KEY); // Also remove old save file
            setGameState(getNewGameState());
        }
    };

    // --- Effects ---
    
    // Effect for loading game, handling migration, and calculating offline progress
    React.useEffect(() => {
        let loadedState = getNewGameState();
        try {
            // --- MIGRATION LOGIC ---
            // Try to load from the new save key first
            let savedData = localStorage.getItem(SAVE_KEY);
            
            // If no new save, try to load from the old key
            if (!savedData) {
                const oldSavedData = localStorage.getItem(OLD_SAVE_KEY);
                if (oldSavedData) {
                    console.log("Old save file found, migrating...");
                    savedData = oldSavedData;
                    // Important: Remove the old save file to prevent re-migration on next load
                    localStorage.removeItem(OLD_SAVE_KEY);
                }
            }
            
            if (savedData) {
                // Merge saved data with the new game state structure to ensure new fields exist
                loadedState = { ...getNewGameState(), ...JSON.parse(savedData) };
            }
        } catch (error) {
            console.error("Error loading saved game:", error);
        }

        const { goldPerSecond: loadedGps } = recalculateValues(loadedState);
        const timeNow = Date.now();
        const timeDifferenceSeconds = (timeNow - loadedState.lastSaveTimestamp) / 1000;
        const earnedGold = timeDifferenceSeconds * loadedGps;

        if (earnedGold > 1) {
            loadedState.gold += earnedGold;
            setOfflineEarnings({
                time: timeDifferenceSeconds,
                gold: earnedGold,
            });
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
            // Use a functional update to ensure we're always working with the latest state
            setGameState(prev => {
                 const { goldPerSecond } = recalculateValues(prev);
                 return { ...prev, gold: prev.gold + goldPerSecond / 10 };
            });
        }, 100);
        return () => clearInterval(gameTick);
    }, [recalculateValues]); // recalculateValues is stable

    React.useEffect(() => {
        const { goldPerClick, goldPerSecond } = recalculateValues(gameState);
        if (goldPerClick !== gameState.goldPerClick || goldPerSecond !== gameState.goldPerSecond) {
            setGameState(prev => ({ ...prev, goldPerClick, goldPerSecond }));
        }
    }, [gameState.gold, gameState.generators, gameState.purchasedUpgrades, gameState.prestigeGems, gameState.gpsMultiplier, gameState.purchasedSkills, recalculateValues]);

    const gameStateRef = React.useRef(gameState);
    React.useEffect(() => {
        gameStateRef.current = gameState;
    }, [gameState]);

    React.useEffect(() => {
        const saveInterval = setInterval(() => {
            const currentState = gameStateRef.current;
            // Always save to the NEW key
            localStorage.setItem(SAVE_KEY, JSON.stringify({ ...currentState, lastSaveTimestamp: Date.now() }));
        }, 3000);
        return () => clearInterval(saveInterval);
    }, []);


    return (
        <>
            <style>{`
                @keyframes float-up { 0% { transform: translateY(0); opacity: 1; } 100% { transform: translateY(-50px); opacity: 0; } }
                .floating-number { position: fixed; pointer-events: none; animation: float-up 1s ease-out forwards; font-weight: bold; font-size: 1.5rem; color: #FBBF24; text-shadow: 1px 1px 2px black; }
                @keyframes fade-in { 0% { opacity: 0; transform: scale(0.9); } 100% { opacity: 1; transform: scale(1); } }
                .modal-backdrop { animation: fade-in 0.3s ease-out forwards; }
            `}</style>
            
            {floatingNumbers.map(num => (
                <div key={num.id} className="floating-number" style={{ left: num.x, top: num.y }}>{num.value}</div>
            ))}
            
            {offlineEarnings && (
                <div className="modal-backdrop fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-xl p-8 text-center space-y-4 border border-yellow-400 shadow-lg">
                        <h2 className="text-2xl font-bold text-yellow-400">¡Bienvenido de vuelta!</h2>
                        <p className="text-gray-300">Mientras no estabas ({Math.round(offlineEarnings.time)} segundos),<br/>tus generadores han producido:</p>
                        <p className="text-4xl font-bold text-white">{Math.floor(offlineEarnings.gold).toLocaleString('es')} Oro</p>
                        <button onClick={() => setOfflineEarnings(null)} className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-2 px-6 rounded-lg text-lg transition transform active:scale-95">¡Genial!</button>
                    </div>
                </div>
            )}

            <div className="bg-gradient-to-b from-gray-900 to-gray-800 text-white flex items-start justify-center min-h-screen py-8 font-sans">
                <div className="w-full max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 p-4">
                    
                    {/* Left Column (Main Game) */}
                    <div className="lg:col-span-2 bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-2xl p-6 space-y-6 border border-gray-700">
                        <div className="text-center">
                            <h1 className="text-3xl font-bold text-yellow-400">Gold Miner Idle (React)</h1>
                            <p className="text-gray-400">¡Conviértete en un magnate del oro!</p>
                        </div>

                        {/* Stats Display */}
                        <div className="bg-gray-900 p-6 rounded-xl border border-gray-700 sticky top-4 z-10 shadow-lg">
                            <div className="flex justify-around items-center flex-wrap gap-4">
                                {/* Gold */}
                                <div className="flex items-center gap-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" /></svg>
                                    <div>
                                        <h2 className="text-lg font-medium text-gray-400">Oro</h2>
                                        <p className="text-2xl md:text-3xl font-bold text-white">{Math.floor(gameState.gold).toLocaleString('es')}</p>
                                    </div>
                                </div>
                                {/* Gems */}
                                <div className="flex items-center gap-3">
                                     <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-400" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                    <div>
                                        <h2 className="text-lg font-medium text-gray-400">Gemas</h2>
                                        <p className="text-2xl md:text-3xl font-bold text-purple-400">{gameState.prestigeGems}</p>
                                    </div>
                                </div>
                                 {/* Science Points */}
                                <div className="flex items-center gap-3">
                                     <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>
                                    <div>
                                        <h2 className="text-lg font-medium text-gray-400">Ciencia</h2>
                                        <p className="text-2xl md:text-3xl font-bold text-cyan-400">{gameState.sciencePoints}</p>
                                    </div>
                                </div>
                            </div>
                            <p className="text-sm text-yellow-500 mt-2 text-center">{gameState.goldPerSecond.toFixed(1)} oro por segundo</p>
                            <p className="text-sm text-purple-300 mt-1 text-center">Bono de prestigio: +{((prestigeBonus - 1) * 100).toFixed(0)}%</p>
                        </div>

                        <button onClick={handleManualClick} className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-4 px-6 rounded-lg text-xl transition transform active:scale-95 shadow-lg shadow-yellow-500/20">
                            Picar Oro (+{Math.round(gameState.goldPerClick)})
                        </button>

                        {/* Sections */}
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold text-center text-gray-300 border-b-2 border-gray-700 pb-2 mb-4">Mejoras</h2>
                            <div className="space-y-3">
                                {upgradeTypes.map(upgrade => {
                                    const isPurchased = gameState.purchasedUpgrades.includes(upgrade.id);
                                    const canAfford = gameState.gold >= upgrade.cost;
                                    return (
                                        <div key={upgrade.id} className="bg-green-900/40 p-3 rounded-lg border border-green-700/60 flex justify-between items-center">
                                            <div>
                                                <h4 className="font-semibold">{upgrade.name}</h4>
                                                <p className="text-xs text-gray-400">{upgrade.description}</p>
                                            </div>
                                            <button onClick={() => buyUpgrade(upgrade.id)} disabled={isPurchased || !canAfford} className={`bg-green-600 font-bold py-2 px-4 rounded-lg text-sm transition ${isPurchased ? 'bg-gray-600 opacity-70 cursor-not-allowed' : canAfford ? 'hover:bg-green-700 active:scale-95' : 'opacity-50 cursor-not-allowed'}`}>
                                                {isPurchased ? 'Comprado' : `${upgrade.cost.toLocaleString('es')} Oro`}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold text-center text-gray-300 border-b-2 border-gray-700 pb-2 mb-4">Generadores</h2>
                            <div className="space-y-3">
                                {generatorTypes.map(gen => {
                                    const count = gameState.generators[gen.id] || 0;
                                    const cost = gen.baseCost * Math.pow(gen.costMultiplier, count);
                                    const canAfford = gameState.gold >= cost;
                                    return (
                                        <div key={gen.id} className="bg-gray-700/50 p-4 rounded-xl space-y-3 border border-gray-600">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <h3 className="text-lg font-semibold">{gen.name}</h3>
                                                    <p className="text-gray-400 text-xs">{gen.description}</p>
                                                    <p className="text-xs text-gray-300">Posees: <span className="font-bold">{count}</span></p>
                                                </div>
                                                <button onClick={() => buyGenerator(gen.id)} disabled={!canAfford} className={`bg-blue-600 text-white font-bold py-2 px-4 rounded-lg text-sm transition ${canAfford ? 'hover:bg-blue-700 active:scale-95' : 'opacity-50 cursor-not-allowed'}`}>
                                                    Comprar
                                                </button>
                                            </div>
                                            <div className="text-center bg-gray-800 p-1 rounded-md">
                                                <p className="text-gray-400 text-sm">Costo: <span className="font-semibold text-white">{Math.ceil(cost).toLocaleString('es')}</span> Oro</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        
                        {/* Prestige & Reset */}
                        <div className="space-y-2 pt-4 border-t border-gray-700">
                            <h2 className="text-2xl font-bold text-center text-gray-300">Prestigio</h2>
                            <div className="bg-purple-900/40 p-4 rounded-lg text-center space-y-2">
                                <p className="text-gray-300 text-sm">Reinicia para obtener Gemas y Puntos de Ciencia, que mejoran permanentemente tu producción.</p>
                                <p className="text-gray-400 text-sm">Requisito: <span className="font-bold text-white">{PRESTIGE_REQUIREMENT.toLocaleString('es')}</span> Oro</p>
                                <button onClick={prestige} disabled={gemsToGain <= 0} className={`w-full bg-purple-600 text-white font-bold py-3 px-5 rounded-lg transition ${gemsToGain > 0 ? 'hover:bg-purple-700 active:scale-95' : 'opacity-50 cursor-not-allowed'}`}>
                                    Prestigio por +{gemsToGain} Gemas y +{scienceToGain} Ciencia
                                </button>
                            </div>
                        </div>
                        <div className="pt-4 border-t border-gray-700">
                            <button onClick={hardReset} className="w-full bg-red-700 hover:bg-red-800 text-white font-bold py-2 px-4 rounded-lg transition active:scale-95">
                                Reiniciar Partida (Hard Reset)
                            </button>
                        </div>
                    </div>

                    {/* Right Column (Skill Tree) */}
                    <div className="lg:col-span-1 bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-2xl p-6 space-y-4 border border-gray-700 h-fit sticky top-4">
                        <h2 className="text-2xl font-bold text-center text-cyan-400 border-b-2 border-gray-700 pb-2 mb-4">Investigación</h2>
                        <div className="space-y-3">
                            {skillTypes.map(skill => {
                                const isPurchased = gameState.purchasedSkills.includes(skill.id);
                                const canAfford = gameState.sciencePoints >= skill.cost;
                                return (
                                    <div key={skill.id} className={`p-3 rounded-lg border flex flex-col transition-all ${isPurchased ? 'bg-cyan-900/50 border-cyan-700/80' : 'bg-gray-700/50 border-gray-600'}`}>
                                        <div className="flex-grow">
                                            <h4 className="font-semibold text-cyan-300">{skill.name}</h4>
                                            <p className="text-xs text-gray-400 mt-1">{skill.description}</p>
                                        </div>
                                        <button 
                                            onClick={() => buySkill(skill.id)} 
                                            disabled={isPurchased || !canAfford} 
                                            className={`w-full mt-3 bg-cyan-600 font-bold py-2 px-4 rounded-lg text-sm transition ${isPurchased ? 'bg-gray-600 opacity-70 cursor-not-allowed' : canAfford ? 'hover:bg-cyan-700 active:scale-95' : 'opacity-50 cursor-not-allowed'}`}
                                        >
                                            {isPurchased ? 'Comprado' : `Costo: ${skill.cost} Ciencia`}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
        }
