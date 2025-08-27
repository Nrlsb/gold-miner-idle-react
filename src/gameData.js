// src/gameData.js

export const PRESTIGE_REQUIREMENT = 1000000;
export const ASCENSION_REQUIREMENT = 1000;

export const GOLD_RUSH = {
    DURATION: 15, // seconds
    COOLDOWN: 300, // 5 minutes
    MULTIPLIER: 10,
};

export const achievementTypes = {
    'click_1': { name: 'Principiante del Clic', description: 'Haz clic 100 veces.', rewardDescription: '+1% Oro por Clic', condition: (state) => state.stats.totalClicks >= 100, reward: { type: 'gpc_multiplier', value: 1.01 } },
    'click_2': { name: 'Rey del Clic', description: 'Haz clic 10,000 veces.', rewardDescription: '+5% Oro por Clic', condition: (state) => state.stats.totalClicks >= 10000, reward: { type: 'gpc_multiplier', value: 1.05 } },
    'miner_1': { name: 'Magnate Minero', description: 'Compra 200 Mineros.', rewardDescription: '+5% a la producción de Mineros', condition: (state) => (state.generators.miner || 0) >= 200, reward: { type: 'generator_multiplier', target: 'miner', value: 1.05 } },
    'prestige_1': { name: 'Primer Prestigio', description: 'Haz prestigio por primera vez.', rewardDescription: '+1 Gema de Prestigio', condition: (state) => state.stats.prestiges > 0, reward: { type: 'flat_gems', value: 1 } },
    'ascend_1': { name: 'Primer Ascenso', description: 'Asciende por primera vez.', rewardDescription: '+1 Reliquia Celestial', condition: (state) => state.stats.ascensions > 0, reward: { type: 'flat_relics', value: 1 } },
};

export const generatorTypes = [
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
    { id: 'gold_panning_plant', name: 'Planta de Lavado de Oro', description: 'Procesa el mineral para extraer más oro. Mejora a Mineros y Carretas.', baseCost: 150000, baseGps: 50, costMultiplier: 1.30 },
    { id: 'geologist', name: 'Geólogo', description: 'Busca recursos automáticamente.', baseCost: 5000, costMultiplier: 1.30, baseRps: { iron: 0.1, coal: 0.05, diamond: 0.001 } },
    { id: 'diamond_mine', name: 'Mina de Diamantes', description: 'Extrae oro y diamantes preciosos.', baseCost: 2000000, baseGps: 400, costMultiplier: 1.35, baseRps: { diamond: 0.1 } },
    { id: 'investment_syndicate', name: 'Sindicato de Inversores', description: 'Genera oro basado en tu oro total. ¡El dinero llama al dinero!', baseCost: 50000000, costMultiplier: 1.50, baseGps: 0 }
];

export const upgradeTypes = [
    { id: 'miner_gloves', name: 'Guantes de Minero', description: '+1 al oro por clic base.', cost: 50, type: 'click_add', value: 1 },
    { id: 'reinforced_pick', name: 'Pico Reforzado', description: '+4 al oro por clic base.', cost: 250, type: 'click_add', value: 4 },
    { id: 'quality_gears', name: 'Engranajes de Calidad', description: '+10% a la producción de todos los generadores.', cost: 500, type: 'gps_multiplier', value: 1.10 },
    { id: 'bigger_carts', name: 'Carretas más Grandes', description: 'Duplica la producción de las Carretas de Mina.', cost: 1000, type: 'generator_multiplier', target: 'cart', value: 2 },
    { id: 'smart_investments', name: 'Inversiones Inteligentes', description: '+25% a la producción de todos los generadores.', cost: 5000, type: 'gps_multiplier', value: 1.25 },
    { id: 'diamond_drills', name: 'Taladros de Diamante', description: 'Duplica la producción de las Excavadoras.', cost: 12000, type: 'generator_multiplier', target: 'excavator', value: 2 },
    { id: 'panning_plant_filters', name: 'Filtros de Alta Eficiencia', description: 'Duplica la producción de las Plantas de Lavado de Oro.', cost: 250000, type: 'generator_multiplier', target: 'gold_panning_plant', value: 2 },
    { id: 'industrial_diamond_bits', name: 'Brocas de Diamante Industrial', description: 'Duplica la producción de las Minas de Diamantes.', cost: 4000000, type: 'generator_multiplier', target: 'diamond_mine', value: 2 },
    { id: 'insider_trading', name: 'Información Privilegiada', description: 'Aumenta la ganancia del Sindicato de Inversores en un 25%.', cost: 100000000, type: 'generator_multiplier', target: 'investment_syndicate', value: 1.25 }
];

export const skillTypes = {
    'powerful_clicks_1': { name: 'Clics Potenciados I', description: 'Aumenta el oro por clic en un 25%.', cost: 1, type: 'click_bonus', value: 1.25, branch: 'clicking', tier: 1, requires: [] },
    'critical_click': { name: 'Golpe Crítico', description: 'Tus clics tienen un 2% de probabilidad de generar 10 veces más oro.', cost: 3, type: 'critical_click_chance', value: 0.02, multiplier: 10, branch: 'clicking', tier: 2, requires: ['powerful_clicks_1'] },
    'powerful_clicks_2': { name: 'Clics Potenciados II', description: 'Aumenta el oro por clic en otro 50%.', cost: 8, type: 'click_bonus', value: 1.5, branch: 'clicking', tier: 3, requires: ['critical_click'] },
    'efficient_miners_1': { name: 'Minería Eficiente I', description: 'Los Mineros Automáticos producen un 25% más.', cost: 1, type: 'generator_bonus', target: 'miner', value: 1.25, branch: 'automation', tier: 1, requires: [] },
    'cart_optimization': { name: 'Optimización de Carretas', description: 'Las Carretas de Mina producen un 25% más.', cost: 4, type: 'generator_bonus', target: 'cart', value: 1.25, branch: 'automation', tier: 2, requires: ['efficient_miners_1'] },
    'compound_interest': { name: 'Interés Compuesto', description: 'Gana un 0.01% de tu oro actual por segundo.', cost: 10, type: 'interest_bonus', value: 0.0001, branch: 'automation', tier: 3, requires: ['cart_optimization'] },
    'gem_hoarder_1': { name: 'Acumulador de Gemas I', description: 'Gana 1 gema de prestigio extra cada vez que haces prestigio.', cost: 2, type: 'prestige_bonus', value: 1, branch: 'prestige', tier: 1, requires: [] },
    'science_surplus': { name: 'Excedente Científico', description: 'Gana un 10% más de Puntos de Ciencia al hacer prestigio.', cost: 5, type: 'science_bonus', value: 1.1, branch: 'prestige', tier: 2, requires: ['gem_hoarder_1'] },
    'geology_grants': { name: 'Subsidios Geológicos', description: 'Los Geólogos cuestan un 10% menos.', cost: 8, type: 'cost_reduction', target: 'geologist', value: 0.9, branch: 'prestige', tier: 3, requires: ['science_surplus'] },
    'upgrade_automation': { name: 'Ingeniero de Mejoras', description: 'Desbloquea la compra automática de mejoras de oro.', cost: 15, type: 'unlock_feature', value: 'auto_buyer', branch: 'prestige', tier: 4, requires: ['geology_grants'] },
};

export const ascensionUpgradeTypes = {
    'relic_power': { name: 'Poder de las Reliquias', description: 'Cada Reliquia Celestial también aumenta la producción de oro en un 100%.', cost: 1, type: 'relic_gold_bonus' },
    'gem_mastery': { name: 'Maestría en Gemas', description: 'Las Gemas de Prestigio son un 25% más efectivas.', cost: 2, type: 'gem_effectiveness_bonus', value: 1.25 },
    'eternal_knowledge': { name: 'Conocimiento Eterno', description: 'Comienza cada prestigio con 1 Punto de Ciencia.', cost: 5, type: 'starting_science', value: 1 },
};

export const resourceTypes = [
    { id: 'iron', name: 'Hierro', icon: '🔩' },
    { id: 'coal', name: 'Carbón', icon: '⚫' },
    { id: 'diamond', name: 'Diamante', icon: '💎' }
];

export const artifactTypes = [
    { id: 'diamond_pickaxe', name: 'Pico de Diamante', description: 'Aumenta permanentemente el oro por clic en un 25%.', cost: { diamond: 100, iron: 500 }, type: 'click_multiplier', value: 1.25 },
    { id: 'coal_engine', name: 'Motor a Carbón', description: 'Duplica la producción de las Carretas de Mina.', cost: { coal: 1000, iron: 2000 }, type: 'generator_multiplier', target: 'cart', value: 2 },
    { id: 'lucky_geode', name: 'Geoda de la Suerte', description: 'Aumenta la probabilidad de encontrar recursos en un 10%.', cost: { diamond: 500 }, type: 'resource_chance', value: 1.10 },
    { id: 'steel_support_beams', name: 'Vigas de Acero', description: 'Reduce el costo de todos los generadores en un 5%.', cost: { iron: 5000, coal: 2500 }, type: 'cost_reduction_all', value: 0.95 },
    { id: 'automated_geology_maps', name: 'Mapas Geológicos Automatizados', description: 'Los Geólogos producen recursos un 25% más rápido.', cost: { iron: 10000, diamond: 1000 }, type: 'generator_multiplier', target: 'geologist', value: 1.25 },
    { id: 'golden_prospecting_pan', name: 'Batea Dorada', description: 'Aumenta la producción de las Plantas de Lavado de Oro en un 100%.', cost: { iron: 15000, coal: 5000, diamond: 2500 }, type: 'generator_multiplier', target: 'gold_panning_plant', value: 2.0 }
];
