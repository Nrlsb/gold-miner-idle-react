// src/components/SettingsComponent.js
import React from 'react';

const SettingsComponent = ({ onHardReset }) => {
    const handleHardResetClick = () => {
        onHardReset();
    };

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-200">Configuración</h3>
            
            <div className="bg-red-900/50 p-4 rounded-lg border border-red-700/80">
                <h4 className="font-semibold text-red-300">Zona de Peligro</h4>
                <p className="text-xs text-gray-400 mt-1">
                    Esta acción es irreversible y reiniciará todo tu progreso, incluyendo gemas, reliquias y puntos de infinito.
                </p>
                <button 
                    onClick={handleHardResetClick} 
                    className="w-full mt-3 bg-red-700 hover:bg-red-800 text-white font-bold py-2 px-4 rounded-lg text-sm transition active:scale-95"
                >
                    Reiniciar Partida (Hard Reset)
                </button>
            </div>
        </div>
    );
};

export default SettingsComponent;
