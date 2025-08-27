// src/components/GameComponent.js
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { signOut } from "firebase/auth";
import { doc, setDoc, collection, query, onSnapshot } from "firebase/firestore";

import { 
    achievementTypes, generatorTypes, upgradeTypes, skillTypes, 
    ascensionUpgradeTypes, resourceTypes, artifactTypes, 
    PRESTIGE_REQUIREMENT, ASCENSION_REQUIREMENT, GOLD_RUSH 
} from '../gameData';
import { getNewGameState, formatNumber, formatTime } from '../utils';
import RankingComponent from './RankingComponent';

// --- Icon Component ---
const Icon = ({ name, className = "h-5 w-5" }) => {
    const icons = {
        gold: <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
        gem: <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />,
        science: <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />,
        relic: <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />,
        pickaxe: <path d="M19.9,6.31l-5.66,5.66-2.12-2.12,5.66-5.66a2,2,0,0,1,2.83,0,2,2,0,0,1,0,2.83Z M3,14.07l5.66-5.66,2.12,2.12L5.12,16.19a2,2,0,0,1-2.83,0,2,2,0,0,1,0-2.83Z M12.24,8.54,9.41,11.36l3.54,3.54,2.83-2.83Z M9.59,18.12l-1-1a1,1,0,0,0-1.41,0L3.3,20.94a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l3.88-3.88a1,1,0,0,0,0-1.41A1,1,0,0,0,9.59,17.12Z" />,
        research: <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />,
        ranking: <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />,
        ascension: <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />,
        achievements: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />,
        crafting: <path strokeLinecap="round" strokeLinejoin="round" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />,
    };

    const isFilled = name === 'pickaxe';

    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} fill={isFilled ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isFilled ? 0 : 1.5}>
            {icons[name]}
        </svg>
    );
};

// --- Small Presentational Components ---
const FloatingNumbers = ({ numbers }) => (
    <>
        {numbers.map(num => (
            <div key={num.id} className="floating-number" style={{ left: num.x, top: num.y }}>
                {num.value}
            </div>
        ))}
    </>
);

const OfflineModal = ({ earnings, onClose }) => (
    <div className="modal-backdrop fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-xl p-8 text-center space-y-4 border border-yellow-400 shadow-lg max-w-md mx-4">
            <h2 className="text-2xl font-bold text-yellow-400">¡Bienvenido de vuelta!</h2>
            <p className="text-gray-300">Mientras no estabas ({formatTime(earnings.time)}), has producido:</p>
            <p className="text-4xl font-bold text-white">{formatNumber(earnings.gold)} Oro</p>
            <div>
                {Object.entries(earnings.resources).map(([id, val]) => val > 0 && (
                    <p key={id} className="text-lg text-gray-300">
                        {`+${formatNumber(val)} ${resourceTypes.find(r => r.id === id).name}`}
                    </p>
                ))}
            </div>
            <button onClick={onClose} className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-2 px-6 rounded-lg text-lg transition transform active:scale-95">¡Genial!</button>
        </div>
    </div>
);

const SpecializationModal = ({ choice, onSelect }) => {
    if (!choice) return null;
    const generator = generatorTypes.find(g => g.id === choice);
    if (!generator || !generator.specializations) return null;

    return (
        <div className="modal-backdrop fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-xl p-8 text-center space-y-4 border border-yellow-400 shadow-lg max-w-lg">
                <h2 className="text-2xl font-bold text-yellow-400">¡Especialización de {generator.name}!</h2>
                <p className="text-gray-300">Has alcanzado {generator.specializations.milestone} {generator.name}s. ¡Elige una mejora permanente para ellos!</p>
                <div className="space-y-4 pt-4">
                    {Object.entries(generator.specializations.options).map(([specId, specDetails]) => (
                        <button key={specId} onClick={() => onSelect(generator.id, specId)} className="w-full text-left bg-gray-700 hover:bg-gray-600 p-4 rounded-lg transition">
                            <h3 className="font-bold text-lg text-white">{specDetails.name}</h3>
                            <p className="text-gray-400">{specDetails.description}</p>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

const Clickables = ({ clickables, onClick }) => (
    <div className="absolute inset-0 pointer-events-none">
        {clickables.map(c => (
            <div key={c.id} className="clickable-nugget" style={{ left: `${c.x}%`, top: `${c.y}%` }} onClick={() => onClick(c.id)}>
                <span className="text-4xl pointer-events-auto" role="img" aria-label="Pepita de Oro">💰</span>
            </div>
        ))}
    </div>
);

const Header = ({ user, gameState, goldPerSecond, prestigeBonus, onSignOut }) => (
     <div className="bg-gray-900/50 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-gray-700 lg:sticky top-4 z-10 shadow-lg">
        <div className="text-center mb-4">
            <h1 className="text-3xl font-bold text-yellow-400 tracking-wider">Gold Miner Idle</h1>
            <div className="flex items-center justify-center gap-4 mt-2">
                <p className="text-gray-400">Jugador: <span className="font-bold text-gray-200">{user.email || `anon-${user.uid.substring(0,6)}`}</span></p>
                <button onClick={onSignOut} className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded-lg text-sm transition">Cerrar Sesión</button>
            </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-black/20 p-2 rounded-lg"><h2 className="text-sm sm:text-base font-medium text-gray-400 flex items-center justify-center gap-1"><Icon name="gold" className="h-5 w-5 text-yellow-400"/>Oro</h2><p className="text-lg sm:text-2xl font-bold text-white" title={Math.floor(gameState.gold).toLocaleString('es')}>{formatNumber(gameState.gold)}</p></div>
            <div className="bg-black/20 p-2 rounded-lg"><h2 className="text-sm sm:text-base font-medium text-gray-400 flex items-center justify-center gap-1"><Icon name="gem" className="h-5 w-5 text-purple-400"/>Gemas</h2><p className="text-lg sm:text-2xl font-bold text-purple-400">{formatNumber(gameState.prestigeGems)}</p></div>
            <div className="bg-black/20 p-2 rounded-lg"><h2 className="text-sm sm:text-base font-medium text-gray-400 flex items-center justify-center gap-1"><Icon name="science" className="h-5 w-5 text-cyan-400"/>Ciencia</h2><p className="text-lg sm:text-2xl font-bold text-cyan-400">{formatNumber(gameState.sciencePoints)}</p></div>
            <div className="bg-black/20 p-2 rounded-lg"><h2 className="text-sm sm:text-base font-medium text-gray-400 flex items-center justify-center gap-1"><Icon name="relic" className="h-5 w-5 text-amber-300"/>Reliquias</h2><p className="text-lg sm:text-2xl font-bold text-amber-300">{gameState.celestialRelics}</p></div>
        </div>
        <p className="text-sm text-yellow-500 mt-3 text-center">{formatNumber(goldPerSecond)} oro por segundo</p>
        <p className="text-sm text-purple-300 mt-1 text-center">Bono de prestigio: +{((prestigeBonus - 1) * 100).toFixed(0)}%</p>
    </div>
);

const MainActions = ({ onManualClick, onActivateGoldRush, goldPerClick, goldRush, isMining }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button 
            onClick={onManualClick} 
            className={`w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-3 sm:py-4 px-6 rounded-lg text-lg sm:text-xl transition-transform duration-75 active:scale-95 active:brightness-90 shadow-lg shadow-yellow-500/20 flex items-center justify-center gap-2 ${isMining ? 'mine-button-animation' : ''}`}
        >
            <Icon name="pickaxe" className="h-7 w-7"/>
            Picar Oro (+{formatNumber(goldPerClick)})
        </button>
        <button onClick={onActivateGoldRush} disabled={goldRush.cooldown > 0 || goldRush.active} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 sm:py-4 px-6 rounded-lg text-lg sm:text-xl transition transform active:scale-95 shadow-lg shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed">
            {goldRush.active ? `¡Fiebre del Oro! (${Math.ceil(goldRush.timeLeft)}s)` : goldRush.cooldown > 0 ? `Enfriamiento (${Math.ceil(goldRush.cooldown)}s)` : 'Fiebre del Oro'}
        </button>
    </div>
);


const GameComponent = ({ user, initialGameState, db, auth, appId }) => {
    const [gameState, setGameState] = useState(initialGameState);
    const [floatingNumbers, setFloatingNumbers] = useState([]);
    const [offlineEarnings, setOfflineEarnings] = useState(null);
    const [specializationChoice, setSpecializationChoice] = useState(null);
    const [activeTab, setActiveTab] = useState('research');
    const [buyAmount, setBuyAmount] = useState(1);
    const [ranking, setRanking] = useState([]);
    const [rankingLoading, setRankingLoading] = useState(true);
    const [isMining, setIsMining] = useState(false);

    const gameStateRef = useRef(gameState);
    useEffect(() => { gameStateRef.current = gameState; }, [gameState]);

    // --- Obtención de datos del Ranking ---
    useEffect(() => {
        if (!db || !appId) return;
        const rankingColRef = collection(db, `artifacts/${appId}/public/data/rankings`);
        const q = query(rankingColRef);

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const players = [];
            querySnapshot.forEach((doc) => {
                players.push({ id: doc.id, ...doc.data() });
            });
            
            players.sort((a, b) => (b.totalGoldMined || 0) - (a.totalGoldMined || 0));
            setRanking(players.slice(0, 100));
            setRankingLoading(false);
        }, (error) => {
            console.error("Error al obtener el ranking:", error);
            setRankingLoading(false);
        });

        return () => unsubscribe();
    }, [db, appId]);

    // --- Lógica de cálculo centralizada ---
    const recalculateValues = useCallback((currentState) => {
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
                
                if (type.id === 'miner' || type.id === 'cart') {
                    const plantCount = currentState.generators['gold_panning_plant'] || 0;
                    const synergyBonus = 1 + (plantCount * 0.05);
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
        
        const syndicateCount = currentState.generators['investment_syndicate'] || 0;
        if (syndicateCount > 0) {
            let syndicateMultiplier = 1.0;
            if(currentState.purchasedUpgrades.includes('insider_trading')) {
                syndicateMultiplier = upgradeTypes.find(u => u.id === 'insider_trading').value;
            }
            goldPerSecond += (currentState.gold * 0.0001 * syndicateCount * syndicateMultiplier);
        }

        if (currentState.goldRush.active) {
            goldPerClick *= GOLD_RUSH.MULTIPLIER;
            goldPerSecond *= GOLD_RUSH.MULTIPLIER;
        }

        return { goldPerClick, goldPerSecond };
    }, []);

    const { goldPerClick, goldPerSecond } = useMemo(() => recalculateValues(gameState), [gameState, recalculateValues]);
    
    const prestigeBonus = useMemo(() => {
        let gemEffectiveness = 1.0;
        if (gameState.purchasedAscensionUpgrades.includes('gem_mastery')) {
            gemEffectiveness = ascensionUpgradeTypes['gem_mastery'].value;
        }
        return 1 + (gameState.prestigeGems * 0.05 * gemEffectiveness);
    }, [gameState.prestigeGems, gameState.purchasedAscensionUpgrades]);
    
    const gemsToGain = useMemo(() => {
        if (gameState.gold < PRESTIGE_REQUIREMENT) return 0;
        let gems = Math.floor(Math.sqrt(gameState.gold / PRESTIGE_REQUIREMENT)) * 5;
        if (gameState.purchasedSkills.includes('gem_hoarder_1')) {
            gems += skillTypes['gem_hoarder_1'].value;
        }
        return Math.floor(gems);
    }, [gameState.gold, gameState.purchasedSkills]);

    const relicsToGain = useMemo(() => {
        if (gameState.prestigeGems < ASCENSION_REQUIREMENT) return 0;
        return 1 + Math.floor(gameState.prestigeGems / ASCENSION_REQUIREMENT);
    }, [gameState.prestigeGems]);

    const scienceToGain = useMemo(() => {
        if (gemsToGain <= 0) return 0;
        let science = Math.floor(gemsToGain / 5);
        if (gameState.purchasedSkills.includes('science_surplus')) {
            science *= skillTypes['science_surplus'].value;
        }
        return Math.floor(science);
    }, [gemsToGain, gameState.purchasedSkills]);
    
    const resourceFindingBonus = useMemo(() => {
        const excavatorCount = gameState.generators['excavator'] || 0;
        let bonus = 1 + (Math.floor(excavatorCount / 10) * 0.01);
        if (gameState.craftedArtifacts.includes('lucky_geode')) {
            bonus *= artifactTypes.find(a => a.id === 'lucky_geode').value;
        }
        return bonus;
    }, [gameState.generators, gameState.craftedArtifacts]);

    const resourcesPerSecond = useMemo(() => {
        const rps = { iron: 0, coal: 0, diamond: 0 };
        for (const type of generatorTypes) {
            if (type.baseRps) {
                const count = gameState.generators[type.id] || 0;
                if (count > 0) {
                    for (const resourceId in type.baseRps) {
                        rps[resourceId] = (rps[resourceId] || 0) + count * type.baseRps[resourceId] * resourceFindingBonus;
                    }
                }
            }
        }
        if (gameState.generatorSpecializations['miner'] === 'iron_miners') {
            const minerCount = gameState.generators['miner'] || 0;
            rps.iron += minerCount * 0.1;
        }
        return rps;
    }, [gameState.generators, gameState.generatorSpecializations, resourceFindingBonus]);

    const handleManualClick = (e) => {
        setIsMining(true);
        setTimeout(() => setIsMining(false), 150);

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
            stats: { 
                ...prev.stats, 
                totalClicks: prev.stats.totalClicks + 1,
                totalGoldMined: (prev.stats.totalGoldMined || 0) + clickValue,
            }
        }));

        const newFloatingNumber = { id: Date.now() + Math.random(), value: `+${formatNumber(clickValue)}`, x: e.clientX, y: e.clientY };
        setFloatingNumbers(current => [...current, newFloatingNumber]);
        setTimeout(() => setFloatingNumbers(current => current.filter(n => n.id !== newFloatingNumber.id)), 1000);
    };

    const calculateGeneratorCost = useCallback((generatorId, amount) => {
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
                newState.stats.totalGoldMined = prev.stats.totalGoldMined;
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
                newState.stats.totalGoldMined = prev.stats.totalGoldMined;
                return newState;
            });
        }
    };

    const hardReset = async () => {
        if (window.confirm("¿Estás seguro de que quieres reiniciar TODO tu progreso? Se perderán incluso las gemas, la ciencia y las reliquias.")) {
            const newGame = getNewGameState();
            setGameState(newGame);
            const gameDocRef = doc(db, `artifacts/${appId}/users/${user.uid}/gameData`, 'progress');
            await setDoc(gameDocRef, newGame);
            const rankingDocRef = doc(db, `artifacts/${appId}/public/data/rankings`, user.uid);
            await setDoc(rankingDocRef, { email: user.email, totalGoldMined: 0 });
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
            setGameState(prev => ({ 
                ...prev, 
                gold: prev.gold + goldReward,
                stats: {
                    ...prev.stats,
                    totalGoldMined: (prev.stats.totalGoldMined || 0) + goldReward
                }
            }));
        }
        setGameState(prev => ({ ...prev, activeClickables: prev.activeClickables.filter(c => c.id !== clickableId) }));
    };
    
    useEffect(() => {
        let loadedState = { ...initialGameState };
        const { goldPerSecond: loadedGps } = recalculateValues(loadedState);
        
        const initialResourceFindingBonus = 1 + (Math.floor((loadedState.generators['excavator'] || 0) / 10) * 0.01) * (loadedState.craftedArtifacts.includes('lucky_geode') ? artifactTypes.find(a => a.id === 'lucky_geode').value : 1);
        const initialRps = { iron: 0, coal: 0, diamond: 0 };
        for (const type of generatorTypes) {
            if (type.baseRps) {
                const count = loadedState.generators[type.id] || 0;
                if (count > 0) {
                    for (const resourceId in type.baseRps) {
                        initialRps[resourceId] = (initialRps[resourceId] || 0) + count * type.baseRps[resourceId] * initialResourceFindingBonus;
                    }
                }
            }
        }
        if (loadedState.generatorSpecializations['miner'] === 'iron_miners') {
            const minerCount = loadedState.generators['miner'] || 0;
            initialRps.iron += minerCount * 0.1;
        }

        const timeNow = Date.now();
        const timeDifferenceSeconds = (timeNow - loadedState.lastSaveTimestamp) / 1000;
        const earnedGold = timeDifferenceSeconds * loadedGps;
        const earnedResources = { 
            iron: timeDifferenceSeconds * initialRps.iron, 
            coal: timeDifferenceSeconds * initialRps.coal, 
            diamond: timeDifferenceSeconds * initialRps.diamond 
        };

        if (timeDifferenceSeconds > 5 && (earnedGold > 1 || Object.values(earnedResources).some(r => r > 1))) {
            loadedState.gold += earnedGold;
            loadedState.stats.totalGoldMined = (loadedState.stats.totalGoldMined || 0) + earnedGold;
            for(const resId in earnedResources) {
                loadedState.resources[resId] = (loadedState.resources[resId] || 0) + earnedResources[resId];
            }
            setOfflineEarnings({ time: timeDifferenceSeconds, gold: earnedGold, resources: earnedResources });
        }
        
        setGameState(loadedState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialGameState]);

    useEffect(() => {
        const gameTick = setInterval(() => {
            setGameState(prev => {
                 let newState = { ...prev };
                 newState.resources = { ...prev.resources };
                 newState.purchasedUpgrades = [...prev.purchasedUpgrades];

                 if (newState.autoBuyUpgradesEnabled) {
                     for (const upgrade of upgradeTypes) {
                         if (!newState.purchasedUpgrades.includes(upgrade.id) && newState.gold >= upgrade.cost) {
                             newState.gold -= upgrade.cost;
                             newState.purchasedUpgrades.push(upgrade.id);
                             break; 
                         }
                     }
                 }

                 const rps = resourcesPerSecond;
                 for (const resId in rps) {
                    newState.resources[resId] = (newState.resources[resId] || 0) + rps[resId] / 10;
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

                 const { goldPerSecond: currentGps } = recalculateValues(newState);
                 const goldEarnedThisTick = currentGps / 10;

                 return { 
                     ...newState, 
                     gold: newState.gold + goldEarnedThisTick,
                     stats: {
                        ...newState.stats,
                        totalGoldMined: (newState.stats.totalGoldMined || 0) + goldEarnedThisTick
                     },
                     goldRush: newGoldRush, 
                     unlockedAchievements: [...prev.unlockedAchievements, ...newlyUnlocked], 
                     prestigeGems: newGems, 
                     celestialRelics: newRelics 
                 };
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
    }, [resourcesPerSecond, recalculateValues]);

    useEffect(() => {
        const saveInterval = setInterval(async () => {
            if (user && user.uid && db) {
                const currentGameState = gameStateRef.current;
                const gameDocRef = doc(db, `artifacts/${appId}/users/${user.uid}/gameData`, 'progress');
                const rankingDocRef = doc(db, `artifacts/${appId}/public/data/rankings`, user.uid);
                try {
                    await setDoc(gameDocRef, { ...currentGameState, lastSaveTimestamp: Date.now() });
                    await setDoc(rankingDocRef, {
                        email: user.email || `anon-${user.uid.substring(0,6)}`,
                        totalGoldMined: currentGameState.stats.totalGoldMined || 0
                    }, { merge: true });
                } catch (error) {
                    console.error("Error al guardar el estado del juego:", error);
                }
            }
        }, 5000);
        return () => clearInterval(saveInterval);
    }, [user, appId, db]);

    const skillBranches = useMemo(() => {
        const branches = { clicking: { name: 'Clics', skills: [] }, automation: { name: 'Automatización', skills: [] }, prestige: { name: 'Prestigio', skills: [] } };
        for (const skillId in skillTypes) {
            const skill = { ...skillTypes[skillId], id: skillId };
            if (branches[skill.branch]) branches[skill.branch].skills.push(skill);
        }
        for (const branch in branches) branches[branch].skills.sort((a, b) => a.tier - b.tier);
        return branches;
    }, []);

    const tabConfig = {
        research: { name: 'Investigación', icon: 'research', color: 'cyan' },
        ranking: { name: 'Ranking', icon: 'ranking', color: 'green' },
        ascension: { name: 'Celestiales', icon: 'ascension', color: 'amber' },
        achievements: { name: 'Logros', icon: 'achievements', color: 'yellow' },
        crafting: { name: 'Fabricación', icon: 'crafting', color: 'orange' },
    };

    return (
        <>
            <SpecializationModal choice={specializationChoice} onSelect={selectSpecialization} />
            <FloatingNumbers numbers={floatingNumbers} />
            {offlineEarnings && <OfflineModal earnings={offlineEarnings} onClose={() => setOfflineEarnings(null)} />}
            <Clickables clickables={gameState.activeClickables} onClick={handleClickable} />

            <div className="text-white flex items-start justify-center min-h-screen py-4 sm:py-8 font-sans">
                <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 p-2 sm:p-4">
                    <div className="lg:col-span-2 bg-gray-800/60 backdrop-blur-sm rounded-2xl shadow-2xl p-4 sm:p-6 space-y-6 border border-gray-700">
                        <Header 
                            user={user}
                            gameState={gameState}
                            goldPerSecond={goldPerSecond}
                            prestigeBonus={prestigeBonus}
                            onSignOut={() => signOut(auth)}
                        />
                        <MainActions 
                            onManualClick={handleManualClick}
                            onActivateGoldRush={activateGoldRush}
                            goldPerClick={goldPerClick}
                            goldRush={gameState.goldRush}
                            isMining={isMining}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center border-b-2 border-gray-700 pb-2 mb-4">
                                    <h2 className="text-2xl font-bold text-gray-300">Mejoras</h2>
                                    {gameState.purchasedSkills.includes('upgrade_automation') && (
                                        <label htmlFor="auto-buy-toggle" className="flex items-center cursor-pointer">
                                            <span className="text-sm font-medium text-gray-300 mr-3">Compra Automática</span>
                                            <div className="relative">
                                                <input 
                                                    type="checkbox" 
                                                    id="auto-buy-toggle" 
                                                    className="sr-only" 
                                                    checked={gameState.autoBuyUpgradesEnabled}
                                                    onChange={() => setGameState(prev => ({ ...prev, autoBuyUpgradesEnabled: !prev.autoBuyUpgradesEnabled }))}
                                                />
                                                <div className={`block w-10 h-6 rounded-full ${gameState.autoBuyUpgradesEnabled ? 'bg-green-500' : 'bg-gray-600'}`}></div>
                                                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${gameState.autoBuyUpgradesEnabled ? 'transform translate-x-full' : ''}`}></div>
                                            </div>
                                        </label>
                                    )}
                                </div>
                                {upgradeTypes.map(upgrade => { const isPurchased = gameState.purchasedUpgrades.includes(upgrade.id); const canAfford = gameState.gold >= upgrade.cost; return ( <div key={upgrade.id} className="bg-green-900/40 p-3 rounded-lg border border-green-700/60 flex justify-between items-center"><div><h4 className="font-semibold">{upgrade.name}</h4><p className="text-xs text-gray-400">{upgrade.description}</p></div><button onClick={() => buyUpgrade(upgrade.id)} disabled={isPurchased || !canAfford} className={`bg-green-600 font-bold py-2 px-4 rounded-lg text-sm transition ${isPurchased ? 'bg-gray-600 opacity-70 cursor-not-allowed' : canAfford ? 'hover:bg-green-700 active:scale-95 can-afford' : 'opacity-50 cursor-not-allowed'}`}>{isPurchased ? 'Comprado' : `${formatNumber(upgrade.cost)} Oro`}</button></div>); })}
                            </div>

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
                                if (gen.id === 'gold_panning_plant') {
                                    synergyBonusText = <p className="text-xs text-green-400">Bono a Mineros/Carretas: +{(count * 5).toFixed(0)}%</p>;
                                }
                                const timeToAfford = (totalCost - gameState.gold) / goldPerSecond;
                                
                                const buttonClass = `text-white font-bold py-2 px-4 rounded-lg text-sm transition ${isResourceGen ? 'bg-teal-600' : 'bg-blue-600'} ${canAfford ? `${isResourceGen ? 'hover:bg-teal-700' : 'hover:bg-blue-700'} active:scale-95 can-afford` : 'opacity-50 cursor-not-allowed'}`;

                                return (
                                <div key={gen.id} className={`p-4 rounded-xl space-y-3 border ${specialization ? 'bg-yellow-900/30 border-yellow-600/50' : 'bg-gray-700/50 border-gray-600'}`}>
                                    <div className="flex justify-between items-center">
                                        <div><h3 className="text-lg font-semibold">{gen.name}</h3><p className="text-gray-400 text-xs">{gen.description}</p><p className="text-xs text-gray-300">Posees: <span className="font-bold">{formatNumber(count)}</span></p>{synergyBonusText}{specialization && <p className="text-xs text-yellow-400 font-semibold mt-1">Especialización: {gen.specializations.options[specialization].name}</p>}</div>
                                        <button onClick={() => buyGenerator(gen.id, buyAmount)} disabled={!canAfford} className={buttonClass}>Comprar {amountToBuy > 0 ? formatNumber(amountToBuy) : ''}</button>
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
                        <div className="pt-4 border-t border-gray-700"><button onClick={hardReset} className="w-full bg-red-800 hover:bg-red-900 text-white font-bold py-2 px-4 rounded-lg transition active:scale-95">Reiniciar Partida (Hard Reset)</button></div>
                    </div>
                    <div className="lg:col-span-1 space-y-6 lg:h-fit lg:sticky top-4">
                        <div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl shadow-2xl p-4 sm:p-6 space-y-4 border border-gray-700">
                            <div className="flex border-b border-gray-700 overflow-x-auto tab-scroll">
                                {Object.entries(tabConfig).map(([key, { name, icon, color }]) => (
                                    <button 
                                        key={key}
                                        onClick={() => setActiveTab(key)} 
                                        className={`flex-shrink-0 py-2 px-4 font-semibold flex items-center gap-2 transition-colors duration-200 ${activeTab === key ? `text-${color}-400 border-b-2 border-${color}-400` : 'text-gray-400 hover:text-white'}`}
                                    >
                                        <Icon name={icon} className="h-5 w-5" />
                                        {name}
                                    </button>
                                ))}
                            </div>

                            {activeTab === 'ranking' && (
                                <RankingComponent ranking={ranking} loading={rankingLoading} currentUserEmail={user.email} />
                            )}

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
};

export default GameComponent;
