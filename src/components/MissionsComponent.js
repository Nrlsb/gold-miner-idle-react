// src/components/MissionsComponent.js
import React from 'react';
import { formatNumber } from '../utils';

const MissionsComponent = ({ missions, onClaimMission }) => {
    if (!missions || missions.length === 0) {
        return <div className="text-center text-gray-400">No hay misiones disponibles.</div>;
    }

    return (
        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            {missions.map(mission => {
                const progress = Math.min(mission.progress, mission.target);
                const progressPercent = (progress / mission.target) * 100;
                const isComplete = progress >= mission.target;

                return (
                    <div key={mission.id} className={`p-3 rounded-lg border transition-all ${isComplete ? 'bg-green-900/50 border-green-700/80' : 'bg-gray-700/50 border-gray-600'}`}>
                        <h4 className="font-semibold text-gray-200">{mission.name}</h4>
                        <p className="text-xs text-gray-400 mt-1">{mission.description}</p>
                        
                        <div className="w-full bg-gray-800 rounded-full h-2.5 my-2">
                            <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${progressPercent}%` }}></div>
                        </div>
                        <p className="text-xs text-gray-400">{formatNumber(progress)} / {formatNumber(mission.target)}</p>

                        <p className="text-xs mt-1 font-bold text-yellow-400">Recompensa: {mission.rewardDescription}</p>
                        
                        <button 
                            onClick={() => onClaimMission(mission.id)} 
                            disabled={!isComplete}
                            className={`w-full mt-3 font-bold py-2 px-4 rounded-lg text-sm transition ${isComplete ? 'bg-green-600 hover:bg-green-700 active:scale-95' : 'bg-gray-600 opacity-50 cursor-not-allowed'}`}
                        >
                            {isComplete ? 'Reclamar' : 'En Progreso'}
                        </button>
                    </div>
                );
            })}
        </div>
    );
};

export default MissionsComponent;
