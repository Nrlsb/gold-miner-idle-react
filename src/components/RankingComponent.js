// src/components/RankingComponent.js
import React from 'react';
import { formatNumber } from '../utils';

const RankingComponent = ({ ranking, loading, currentUserEmail }) => {
    if (loading) {
        return <div className="text-center text-gray-400">Cargando ranking...</div>;
    }

    if (!ranking || ranking.length === 0) {
        return <div className="text-center text-gray-400">No hay datos en el ranking todavía.</div>;
    }

    return (
        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-800 p-2 rounded-t-lg z-10 flex justify-between text-xs font-bold text-gray-400">
                <span>Pos. / Jugador</span>
                <span>Oro Total Minado</span>
            </div>
            {ranking.map((player, index) => (
                <div 
                    key={player.id} 
                    className={`p-3 rounded-lg border flex justify-between items-center ${player.email === currentUserEmail ? 'bg-blue-900/50 border-blue-700' : 'bg-gray-700/50 border-gray-600'}`}
                >
                    <div className="flex items-center overflow-hidden">
                        <span className="font-bold text-lg w-8 flex-shrink-0">{index + 1}.</span>
                        <span className="text-sm truncate" title={player.email}>{player.email}</span>
                    </div>
                    <span className="font-bold text-yellow-400 flex-shrink-0 ml-2">{formatNumber(player.totalGoldMined)}</span>
                </div>
            ))}
        </div>
    );
};

export default RankingComponent;
