// src/components/InfinityComponent.js
import React from 'react';
import { challengeTypes, infinityUpgradeTypes, INFINITY_REQUIREMENT } from '../gameData';
import { formatNumber } from '../utils';

const InfinityComponent = ({ gameState, onStartChallenge, onAbandonChallenge, onBuyInfinityUpgrade, onInfinityReset }) => {
    const { infinityPoints, currentChallenge, completedChallenges, purchasedInfinityUpgrades, stats } = gameState;

    const infinityReset = () => {
        if (window.confirm('¿Estás seguro? Esto reiniciará TODO tu progreso (oro, gemas, ciencia, reliquias, etc.) a cambio de Puntos de Infinito.')) {
            onInfinityReset();
        }
    };
    
    // Calcula los puntos de infinito a ganar basado en el oro total minado.
    const infinityPointsToGain = Math.floor(Math.log10(stats.totalGoldMined || 1) / 3 - 4);

    return (
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            <div>
                <h3 className="text-xl font-bold text-pink-400 mb-2">Reseteo Infinito</h3>
                <div className="bg-pink-900/40 p-4 rounded-lg text-center space-y-2">
                    <p className="text-lg">Tienes <span className="font-bold text-white">{formatNumber(infinityPoints)}</span> Puntos de Infinito.</p>
                     <p className="text-sm text-gray-300">Reinicia para ganar <span className="font-bold text-white">{formatNumber(Math.max(0, infinityPointsToGain))}</span> Puntos de Infinito.</p>
                     <p className="text-xs text-gray-400">Requisito: {formatNumber(INFINITY_REQUIREMENT)} Oro Total</p>
                    <button 
                        onClick={infinityReset}
                        disabled={stats.totalGoldMined < INFINITY_REQUIREMENT}
                        className="w-full bg-pink-600 text-white font-bold py-2 px-4 rounded-lg transition enabled:hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Resetear por Puntos de Infinito
                    </button>
                </div>
            </div>

            <div>
                <h3 className="text-xl font-bold text-pink-400 mb-2">Desafíos</h3>
                {currentChallenge && (
                     <div className="bg-blue-900/40 p-3 rounded-lg mb-4">
                        <p className="font-bold">Desafío Activo: {challengeTypes[currentChallenge].name}</p>
                        <button onClick={onAbandonChallenge} className="text-xs bg-red-700 hover:bg-red-800 px-2 py-1 rounded mt-1">Abandonar</button>
                    </div>
                )}
                <div className="space-y-2">
                    {Object.entries(challengeTypes).map(([id, challenge]) => (
                        <div key={id} className={`p-3 rounded-lg border ${completedChallenges.includes(id) ? 'bg-green-900/50 border-green-700' : 'bg-gray-700/50 border-gray-600'}`}>
                            <h4 className="font-semibold">{challenge.name} {completedChallenges.includes(id) && '✓'}</h4>
                            <p className="text-xs text-gray-400">{challenge.description}</p>
                            <p className="text-xs font-bold text-yellow-400">Recompensa: {challenge.reward} Puntos de Infinito</p>
                            {!completedChallenges.includes(id) && (
                                <button 
                                    onClick={() => onStartChallenge(id)} 
                                    disabled={!!currentChallenge}
                                    className="w-full mt-2 bg-blue-600 font-bold py-1 px-3 rounded text-sm transition enabled:hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {currentChallenge ? 'Hay un desafío activo' : 'Comenzar Desafío'}
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

             <div>
                <h3 className="text-xl font-bold text-pink-400 mb-2">Mejoras de Infinito</h3>
                <div className="space-y-2">
                    {Object.entries(infinityUpgradeTypes).map(([id, upgrade]) => {
                        const level = purchasedInfinityUpgrades[id] || 0;
                        const cost = upgrade.cost(level);
                        const canAfford = infinityPoints >= cost;
                        const isMaxLevel = level >= upgrade.maxLevel;
                        return (
                            <div key={id} className={`p-3 rounded-lg border ${isMaxLevel ? 'bg-yellow-900/50 border-yellow-700' : 'bg-gray-700/50 border-gray-600'}`}>
                                <h4 className="font-semibold">{upgrade.name} (Nivel {level}/{upgrade.maxLevel})</h4>
                                <p className="text-xs text-gray-400">{upgrade.description}</p>
                                <button 
                                    onClick={() => onBuyInfinityUpgrade(id)}
                                    disabled={!canAfford || isMaxLevel}
                                    className="w-full mt-2 bg-pink-600 font-bold py-1 px-3 rounded text-sm transition enabled:hover:bg-pink-700 disabled:opacity-50"
                                >
                                    {isMaxLevel ? 'Máximo Nivel' : `Costo: ${formatNumber(cost)} PI`}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default InfinityComponent;

