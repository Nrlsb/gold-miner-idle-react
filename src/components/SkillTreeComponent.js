// src/components/SkillTreeComponent.js
import React from 'react';
import { skillTypes } from '../gameData';
import { formatNumber } from '../utils';

const SkillNode = ({ skill, isPurchased, canAfford, isLocked, onBuySkill }) => {
    let bgColor = 'bg-gray-700/50 border-gray-600';
    let textColor = 'text-cyan-300';
    let buttonColor = 'bg-cyan-800/50 opacity-50 cursor-not-allowed';
    let buttonText = `Costo: ${formatNumber(skill.cost)} Ciencia`;

    if (isPurchased) {
        bgColor = 'bg-cyan-900/50 border-cyan-700/80';
        textColor = 'text-cyan-300';
        buttonColor = 'bg-gray-600 opacity-70 cursor-not-allowed';
        buttonText = 'Comprado';
    } else if (isLocked) {
        bgColor = 'bg-gray-800/60 border-gray-700 opacity-60';
        textColor = 'text-gray-400';
    } else if (canAfford) {
        buttonColor = 'bg-cyan-600 hover:bg-cyan-700 active:scale-95';
    }

    return (
        <div 
            className={`absolute p-3 rounded-lg border flex flex-col transition-all w-48 h-40 ${bgColor}`}
            style={{ left: `${skill.position.x * 14}rem`, top: `${skill.position.y * 12}rem` }}
        >
            <div className="flex-grow">
                <h4 className={`font-semibold ${textColor}`}>{skill.name}</h4>
                <p className="text-xs text-gray-400 mt-1">{skill.description}</p>
                {isLocked && (
                    <p className="text-xs text-red-400 mt-1">
                        Requiere: {skill.requires.map(reqId => skillTypes[reqId].name).join(', ')}
                    </p>
                )}
            </div>
            <button 
                onClick={() => onBuySkill(skill.id)} 
                disabled={isPurchased || isLocked || !canAfford}
                className={`w-full mt-3 font-bold py-2 px-4 rounded-lg text-sm transition ${buttonColor}`}
            >
                {buttonText}
            </button>
        </div>
    );
};

const SkillTreeComponent = ({ purchasedSkills, sciencePoints, onBuySkill }) => {
    const skills = Object.entries(skillTypes).map(([id, skill]) => ({ ...skill, id }));

    const getLineCoordinates = (fromSkill, toSkill) => {
        const fromX = fromSkill.position.x * 14 + 6; // 14rem width, 6rem is half
        const fromY = fromSkill.position.y * 12 + 10; // 12rem height, 10rem is bottom
        const toX = toSkill.position.x * 14 + 6;
        const toY = toSkill.position.y * 12; // 0 is top
        return { x1: fromX, y1: fromY, x2: toX, y2: toY };
    };

    return (
        <div className="relative h-[50rem] w-full overflow-auto p-4">
             <svg className="absolute top-0 left-0 w-full h-full" style={{ pointerEvents: 'none' }}>
                <defs>
                    <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#4A5568" />
                    </marker>
                     <marker id="arrow-unlocked" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#2dd4bf" />
                    </marker>
                </defs>
                {skills.map(skill => 
                    skill.requires.map(reqId => {
                        const fromSkill = skillTypes[reqId];
                        const toSkill = skill;
                        const { x1, y1, x2, y2 } = getLineCoordinates(fromSkill, toSkill);
                        const isUnlocked = purchasedSkills.includes(reqId);
                        return (
                            <line 
                                key={`${reqId}-${skill.id}`}
                                x1={`${x1}rem`} y1={`${y1}rem`} 
                                x2={`${x2}rem`} y2={`${y2}rem`} 
                                stroke={isUnlocked ? '#2dd4bf' : '#4A5568'} 
                                strokeWidth="2"
                                markerEnd={isUnlocked ? "url(#arrow-unlocked)" : "url(#arrow)"}
                            />
                        );
                    })
                )}
            </svg>
            {skills.map(skill => {
                const isPurchased = purchasedSkills.includes(skill.id);
                const requirementsMet = skill.requires.every(reqId => purchasedSkills.includes(reqId));
                const canAfford = sciencePoints >= skill.cost;
                const isLocked = !requirementsMet;

                return (
                    <SkillNode 
                        key={skill.id}
                        skill={skill}
                        isPurchased={isPurchased}
                        canAfford={canAfford}
                        isLocked={isLocked}
                        onBuySkill={onBuySkill}
                    />
                );
            })}
        </div>
    );
};

export default SkillTreeComponent;
