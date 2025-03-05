import { mobs, armor, weapons, arrows, foods, meads } from './data.js';
import { useState, useEffect } from 'react';
import {
  UserIcon,
  ShieldExclamationIcon,
  HeartIcon,
  BoltIcon,
  AdjustmentsHorizontalIcon,
  ArchiveBoxIcon,
  ScaleIcon,
  FireIcon,
  XMarkIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ChevronDownIcon,
  PlusIcon,
  MinusIcon,
  CursorArrowRaysIcon,
  TrophyIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  UserGroupIcon,
  Bars3Icon,
  BeakerIcon,
  ArrowPathIcon,
  SparklesIcon
} from '@heroicons/react/24/solid';

function App() {
  // State for tracking selected entities and stats
  const [selectedMob, setSelectedMob] = useState('');
  const [battlefieldMobs, setBattlefieldMobs] = useState([]);
  const [playerEquipment, setPlayerEquipment] = useState({
    helmet: null,
    chest: null,
    leg: null,
    cape: null,
    shield: null,
    weapon: null,
    arrow: null
  });
  const [playerFood, setPlayerFood] = useState([null, null, null]);
  const [skillLevel, setSkillLevel] = useState(0.5); // Default 50% skill level
  const [shotsLanded, setShotsLanded] = useState(0); // Default 0 (equal shots landed)
  const [battleOutcome, setBattleOutcome] = useState(null);

  // Auto-calculate battle simulation when params change
  useEffect(() => {
    simulateBattle();
  }, [battlefieldMobs, playerEquipment, playerFood, skillLevel, shotsLanded]);

  // Handle equipment changes
  const handleEquipmentChange = (type, value) => {
    setPlayerEquipment({
      ...playerEquipment,
      [type]: value || null
    });
  };

  // Handle food changes
  const handleFoodChange = (index, value) => {
    const newPlayerFood = [...playerFood];
    newPlayerFood[index] = value || null;
    setPlayerFood(newPlayerFood);
  };

  // Add selected mob to battlefield
  const addMobToBattlefield = (mobName) => {
    if (!mobName) return;
    
    // Create a unique ID for each mob instance
    const mobInstance = {
      id: Date.now(), // Use timestamp as a simple unique ID
      name: mobName,
      health: mobs[mobName].health,
      damage: mobs[mobName].damage,
      maxHealth: mobs[mobName].health
    };
    
    setBattlefieldMobs([...battlefieldMobs, mobInstance]);
  };

  // Handle mob selection and automatically add to battlefield
  const handleMobSelection = (e) => {
    const mobName = e.target.value;
    setSelectedMob(mobName);
    
    if (mobName) {
      addMobToBattlefield(mobName);
    }
  };

  // Remove mob from battlefield
  const removeMobFromBattlefield = (mobId) => {
    setBattlefieldMobs(battlefieldMobs.filter(mob => mob.id !== mobId));
  };

  // Calculate player stats based on equipment
  const calculatePlayerArmor = () => {
    let total = 0;
    if (playerEquipment.helmet) total += armor.helmet[playerEquipment.helmet] || 0;
    if (playerEquipment.chest) total += armor.chest[playerEquipment.chest] || 0;
    if (playerEquipment.leg) total += armor.leg[playerEquipment.leg] || 0;
    if (playerEquipment.cape) total += armor.cape[playerEquipment.cape] || 0;
    if (playerEquipment.shield) total += armor.shield[playerEquipment.shield] || 0;
    return total;
  };

  const calculatePlayerDamage = () => {
    let damage = 0;
    
    // Add weapon damage
    if (playerEquipment.weapon) {
      damage += weapons[playerEquipment.weapon] || 0;
    }
    
    // Add arrow damage if using a bow
    if (playerEquipment.weapon && playerEquipment.weapon.includes('Bow') && playerEquipment.arrow) {
      damage += arrows[playerEquipment.arrow] || 0;
    }
    
    // Apply skill level multiplier
    damage = Math.round(damage * skillLevel);
    
    return damage;
  };

  // Calculate player health and stamina from food
  const calculatePlayerHealth = () => {
    return 25 + playerFood.reduce((total, food) => 
      total + (food && foods[food] ? foods[food].health : 0), 0);
  };

  const calculatePlayerStamina = () => {
    return 50 + playerFood.reduce((total, food) => 
      total + (food && foods[food] ? foods[food].stamina : 0), 0);
  };

  // Calculate damage based on the specified formula
  const calculateDamage = (attackerDamage, defenderArmor) => {
    if (defenderArmor < attackerDamage / 2) {
      return Math.max(1, attackerDamage - defenderArmor);
    } else {
      return Math.max(1, Math.floor((attackerDamage / (defenderArmor * 4)) * attackerDamage));
    }
  };

  // Simulate battle between player and mobs
  const simulateBattle = () => {
    if (battlefieldMobs.length === 0) {
      setBattleOutcome({
        result: "waiting",
        message: "Add mobs to the battlefield to see the outcome"
      });
      return;
    }
    
    // Player stats
    const playerInitialHealth = calculatePlayerHealth();
    const playerArmor = calculatePlayerArmor();
    const playerDamage = calculatePlayerDamage();
    
    let playerHealth = playerInitialHealth;
    let activeMobs = JSON.parse(JSON.stringify(battlefieldMobs)); // Deep copy to manipulate
    
    // Calculate shots landed adjustment
    const playerShotsMultiplier = 1 + Math.max(0, shotsLanded); // 1 to 2 (100% to 200%)
    const mobShotsMultiplier = 1 + Math.max(0, -shotsLanded); // 1 to 2 (100% to 200%)
    
    // Battle rounds
    let round = 1;
    
    while (playerHealth > 0 && activeMobs.length > 0) {
      // Player attacks each mob
      for (let i = 0; i < activeMobs.length; i++) {
        const mob = activeMobs[i];
        // Apply shots landed multiplier
        const playerHits = Math.floor(playerShotsMultiplier);
        const playerHitChance = playerShotsMultiplier - playerHits; // Decimal part as chance for extra hit
        const extraHit = Math.random() < playerHitChance ? 1 : 0;
        const totalHits = playerHits + extraHit;
        
        for (let hit = 0; hit < totalHits; hit++) {
          const damageDealt = calculateDamage(playerDamage, 0); // Assuming mobs have 0 armor
          mob.health -= damageDealt;
          
          if (mob.health <= 0) {
            break; // Stop attacking this mob if it's defeated
          }
        }
      }
      
      // Remove defeated mobs
      activeMobs = activeMobs.filter(mob => mob.health > 0);
      
      // If all mobs are defeated, player wins
      if (activeMobs.length === 0) {
        const healthPercentage = Math.round((playerHealth / playerInitialHealth) * 100);
        setBattleOutcome({
          result: "victory",
          message: `Victory! You would defeat all enemies with ${playerHealth} HP remaining (${healthPercentage}% health).`,
          playerHP: playerHealth,
          playerInitialHP: playerInitialHealth,
          enemyHP: 0,
          healthPercentage: healthPercentage
        });
        return;
      }
      
      // Mobs attack player
      for (let mob of activeMobs) {
        // Apply shots landed multiplier
        const mobHits = Math.floor(mobShotsMultiplier);
        const mobHitChance = mobShotsMultiplier - mobHits; // Decimal part as chance for extra hit
        const extraHit = Math.random() < mobHitChance ? 1 : 0;
        const totalHits = mobHits + extraHit;
        
        for (let hit = 0; hit < totalHits; hit++) {
          const damageDealt = calculateDamage(mob.damage, playerArmor);
          playerHealth -= damageDealt;
          
          if (playerHealth <= 0) {
            break; // Stop mob attacks if player is defeated
          }
        }
        
        if (playerHealth <= 0) break; // Exit mob attack loop if player is defeated
      }
      
      // If player is defeated, mobs win
      if (playerHealth <= 0) {
        const totalMobHealth = activeMobs.reduce((total, mob) => total + mob.health, 0);
        setBattleOutcome({
          result: "defeat",
          message: `Defeat! You would be defeated with enemies having ${totalMobHealth} total HP remaining.`,
          playerHP: 0,
          playerInitialHP: playerInitialHealth,
          enemyHP: totalMobHealth,
          mobsRemaining: activeMobs.length
        });
        return;
      }
      
      round++;
      
      // Safety check to prevent infinite loops
      if (round > 100) {
        setBattleOutcome({
          result: "stalemate",
          message: "Battle would likely end in a stalemate (too many rounds)."
        });
        return;
      }
    }
  };

  // Create equipment select dropdown with stats
  const renderEquipmentSelect = (type, options, label, Icon) => {
    return (
      <div className="mb-4 relative">
        <label className="block text-sm font-medium text-gray-200 mb-1">{label}</label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400 z-10">
            {Icon && <Icon className="w-5 h-5" />}
          </div>
          <select 
            className="bg-gray-800 text-white pl-10 py-2.5 pr-3 w-full rounded-lg border border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all appearance-none"
            value={playerEquipment[type] || ''}
            onChange={(e) => handleEquipmentChange(type, e.target.value)}
          >
            <option value="">None</option>
            {Object.keys(options).map(itemName => {
              let statInfo = '';
              
              // Add appropriate stat info based on item type
              if (type === 'weapon') {
                statInfo = ` (${options[itemName]} damage)`;
              } else if (['helmet', 'chest', 'leg', 'cape', 'shield'].includes(type)) {
                statInfo = ` (${options[itemName]} armor)`;
              }
              
              return (
                <option key={itemName} value={itemName}>
                  {itemName}{statInfo}
                </option>
              );
            })}
          </select>
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-indigo-400 z-10">
            <ChevronDownIcon className="w-4 h-4" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center justify-center mb-8">
          <h1 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 mb-2">
            Viking Combat Simulator
          </h1>
          <p className="text-gray-400 text-center max-w-2xl">
            Configure your equipment, add enemies, and see if you would survive the battle
          </p>
        </div>
        
        {/* Battle Section - Now at the top */}
        <div className="bg-gray-800 rounded-xl overflow-hidden shadow-2xl border border-gray-700 mb-6">
          <div className="bg-gradient-to-r from-purple-700 via-violet-700 to-indigo-700 px-6 py-4">
            <h2 className="text-2xl font-bold flex items-center">
              <ScaleIcon className="w-6 h-6 mr-2" /> Battle Simulation
            </h2>
          </div>
          
          <div className="p-6">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-purple-300 flex items-center">
                  <ArrowPathIcon className="w-5 h-5 mr-2" /> Combat Accuracy
                </h3>
                <div className="px-3 py-1 bg-purple-800 rounded-full text-sm font-semibold">
                  {shotsLanded === 0 
                    ? "Equal" 
                    : shotsLanded > 0 
                      ? `+${Math.round(shotsLanded * 100)}% Player` 
                      : `+${Math.round(Math.abs(shotsLanded) * 100)}% Enemies`}
                </div>
              </div>
              
              <div className="bg-gray-700 p-4 rounded-lg shadow-inner">
                <div className="flex items-center mb-2">
                  <span className="text-sm text-red-400 w-24">Enemy Advantage</span>
                  <input 
                    type="range" 
                    min="-1" 
                    max="1" 
                    step="0.1" 
                    value={shotsLanded}
                    onChange={(e) => setShotsLanded(parseFloat(e.target.value))}
                    className="w-full mx-2 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                  <span className="text-sm text-green-400 w-24 text-right">Player Advantage</span>
                </div>
                
                <div className="text-center font-medium text-xs text-gray-400 mt-1">
                  {shotsLanded === 0 
                    ? "Both sides land equal attacks" 
                    : shotsLanded > 0 
                      ? `Player lands ${Math.round((1 + shotsLanded) * 100)}% attacks, enemies land 100% attacks` 
                      : `Player lands 100% attacks, enemies land ${Math.round((1 + Math.abs(shotsLanded)) * 100)}% attacks`}
                </div>
              </div>
            </div>
            
            {/* Battle outcome display */}
            <div className={`rounded-xl overflow-hidden shadow-lg ${
              battleOutcome?.result === 'victory' ? 'bg-gradient-to-br from-green-900 to-green-800' : 
              battleOutcome?.result === 'defeat' ? 'bg-gradient-to-br from-red-900 to-red-800' : 
              'bg-gradient-to-br from-gray-800 to-gray-700'
            } border ${
              battleOutcome?.result === 'victory' ? 'border-green-600' : 
              battleOutcome?.result === 'defeat' ? 'border-red-600' : 
              'border-gray-600'
            }`}>
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${
                    battleOutcome?.result === 'victory' ? 'bg-green-700' :
                    battleOutcome?.result === 'defeat' ? 'bg-red-700' :
                    'bg-gray-700'
                  }`}>
                    {battleOutcome?.result === 'victory' ? (
                      <TrophyIcon className="w-6 h-6" />
                    ) : battleOutcome?.result === 'defeat' ? (
                      <XCircleIcon className="w-6 h-6" />
                    ) : (
                      <ClockIcon className="w-6 h-6" />
                    )}
                  </div>
                  <h3 className="font-bold text-xl">Battle Prediction</h3>
                </div>
                
                {battleOutcome?.result === 'waiting' ? (
                  <div className="flex flex-col items-center py-6 text-gray-400">
                    <Bars3Icon className="w-12 h-12 mb-4 opacity-30" />
                    <p className="text-center">{battleOutcome.message}</p>
                  </div>
                ) : battleOutcome?.result === 'victory' ? (
                  <div>
                    <p className="font-bold text-xl text-green-300 mb-3">{battleOutcome.message}</p>
                    <div className="bg-gray-900 bg-opacity-50 rounded-lg p-3 mb-3">
                      <div className="text-sm text-gray-300 mb-1">Remaining Health</div>
                      <div className="w-full bg-gray-800 rounded-full h-4 overflow-hidden">
                        <div 
                          className="bg-green-600 h-full rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ease-out"
                          style={{width: `${battleOutcome.healthPercentage}%`}}
                        >
                          {battleOutcome.healthPercentage > 15 ? `${battleOutcome.healthPercentage}%` : ''}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : battleOutcome?.result === 'defeat' ? (
                  <div>
                    <p className="font-bold text-xl text-red-300 mb-3">{battleOutcome.message}</p>
                    <div className="bg-gray-900 bg-opacity-50 rounded-lg p-3 mb-3 flex items-center">
                      <div className="w-10 h-10 bg-red-900 rounded-full flex items-center justify-center mr-3">
                        <UserGroupIcon className="w-5 h-5 text-red-200" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">Remaining Enemies</div>
                        <div className="text-lg font-bold">{battleOutcome.mobsRemaining}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-yellow-300 font-bold text-center py-4">{battleOutcome?.message || "Prepare for battle..."}</p>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Player and Mobs sections */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Player Section */}
          <div className="w-full lg:w-1/2">
            <div className="bg-gray-800 rounded-xl overflow-hidden shadow-2xl border border-gray-700">
              <div className="bg-gradient-to-r from-blue-700 to-indigo-700 px-6 py-4">
                <h2 className="text-2xl font-bold flex items-center">
                  <UserIcon className="w-6 h-6 mr-2" /> Viking Warrior
                </h2>
              </div>
              
              <div className="p-6">
                <div className="bg-gray-700 rounded-lg p-4 mb-6 flex flex-wrap gap-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-green-800 flex items-center justify-center mr-2">
                      <HeartIcon className="w-5 h-5 text-green-300" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Health</div>
                      <div className="font-bold text-green-300">{calculatePlayerHealth()}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-800 flex items-center justify-center mr-2">
                      <BoltIcon className="w-5 h-5 text-blue-300" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Stamina</div>
                      <div className="font-bold text-blue-300">{calculatePlayerStamina()}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-yellow-800 flex items-center justify-center mr-2">
                      <ShieldExclamationIcon className="w-5 h-5 text-yellow-300" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Armor</div>
                      <div className="font-bold text-yellow-300">{calculatePlayerArmor()}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-red-800 flex items-center justify-center mr-2">
                      <ArchiveBoxIcon className="w-5 h-5 text-red-300" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Damage</div>
                      <div className="font-bold text-red-300">{calculatePlayerDamage()}</div>
                    </div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="font-semibold mb-2 flex items-center text-blue-300">
                    <AdjustmentsHorizontalIcon className="w-5 h-5 mr-2" /> Weapon Skill
                  </h3>
                  <div className="bg-gray-700 p-3 rounded-lg">
                    <input 
                      type="range" 
                      min="0" 
                      max="1" 
                      step="0.05" 
                      value={skillLevel}
                      onChange={(e) => setSkillLevel(parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                    <div className="flex justify-between items-center mt-2 text-xs text-gray-400">
                      <span>Beginner</span>
                      <span>Skilled</span>
                      <span>Master</span>
                    </div>
                    <div className="flex justify-center mt-2">
                      <span className="text-blue-400 font-medium">Current Skill: {Math.round(skillLevel * 100)}%</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="col-span-1">
                    <h3 className="font-semibold mb-2 flex items-center text-indigo-300">
                      <ShieldExclamationIcon className="w-5 h-5 mr-2" /> Equipment
                    </h3>
                    {renderEquipmentSelect('helmet', armor.helmet, 'Helmet', ShieldExclamationIcon)}
                    {renderEquipmentSelect('chest', armor.chest, 'Chest', ShieldExclamationIcon)}
                    {renderEquipmentSelect('leg', armor.leg, 'Legs', ShieldExclamationIcon)}
                    {renderEquipmentSelect('cape', armor.cape, 'Cape', ShieldExclamationIcon)}
                    {renderEquipmentSelect('shield', armor.shield, 'Shield', ShieldExclamationIcon)}
                    {renderEquipmentSelect('weapon', weapons, 'Weapon', ArchiveBoxIcon)}
                    
                    {/* Arrow selection - only when bow is equipped */}
                    {playerEquipment.weapon && playerEquipment.weapon.includes('Bow') && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-200 mb-1">Arrows</label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400">
                            <CursorArrowRaysIcon className="w-5 h-5" />
                          </div>
                          <select 
                            className="bg-gray-800 text-white pl-10 py-2.5 pr-3 w-full rounded-lg border border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                            value={playerEquipment.arrow || ''}
                            onChange={(e) => handleEquipmentChange('arrow', e.target.value)}
                          >
                            <option value="">None</option>
                            {Object.keys(arrows).map(arrowName => (
                              <option key={arrowName} value={arrowName}>
                                {arrowName} ({arrows[arrowName]} damage)
                              </option>
                            ))}
                          </select>
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-indigo-400">
                            <ChevronDownIcon className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="col-span-1">
                    <h3 className="font-semibold mb-2 flex items-center text-green-300">
                      <BeakerIcon className="w-5 h-5 mr-2" /> Food
                    </h3>
                    {[0, 1, 2].map(index => (
                      <div key={index} className="mb-4 relative">
                        <label className="block text-sm font-medium text-gray-200 mb-1">Food Slot {index + 1}</label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400 z-10">
                            <BeakerIcon className="w-5 h-5" />
                          </div>
                          <select 
                            className="bg-gray-800 text-white pl-10 py-2.5 pr-3 w-full rounded-lg border border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all appearance-none"
                            value={playerFood[index] || ''}
                            onChange={(e) => handleFoodChange(index, e.target.value)}
                          >
                            <option value="">None</option>
                            {Object.keys(foods).map(foodName => (
                              <option key={foodName} value={foodName}>
                                {foodName} ({foods[foodName].health} health, {foods[foodName].stamina} stamina)
                              </option>
                            ))}
                          </select>
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-indigo-400 z-10">
                            <ChevronDownIcon className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Mobs Section */}
          <div className="w-full lg:w-1/2">
            <div className="bg-gray-800 rounded-xl overflow-hidden shadow-2xl border border-gray-700">
              <div className="bg-gradient-to-r from-red-700 to-orange-700 px-6 py-4">
                <h2 className="text-2xl font-bold flex items-center">
                  <UserGroupIcon className="w-6 h-6 mr-2" /> Enemies
                </h2>
              </div>
              
              <div className="p-6">
                <div className="mb-5 relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <PlusIcon className="w-5 h-5 text-gray-500" />
                  </div>
                  <select 
                    className="bg-gray-700 text-white pl-10 py-3 pr-3 w-full rounded-lg border border-gray-600 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all shadow-lg"
                    onChange={handleMobSelection}
                    value={selectedMob || ''}
                  >
                    <option value="">+ Add enemy to battlefield</option>
                    {Object.keys(mobs).map(mobName => (
                      <option key={mobName} value={mobName}>
                        {mobName} (Health: {mobs[mobName].health}, Damage: {mobs[mobName].damage})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="mt-5">
                  <h3 className="font-semibold mb-4 text-lg text-red-300 border-b border-gray-700 pb-2 flex items-center">
                    <FireIcon className="w-5 h-5 mr-2" /> Battlefield
                  </h3>
                  
                  {battlefieldMobs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                      <ExclamationTriangleIcon className="w-12 h-12 mb-3 opacity-50" />
                      <p className="text-center">No enemies on the battlefield yet. Add some to begin the simulation.</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
                      {battlefieldMobs.map(mob => (
                        <div key={mob.id} className="group bg-gray-700 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all border border-gray-600 hover:border-red-500">
                          <div className="bg-gradient-to-r from-gray-600 to-gray-700 py-2 px-4 flex justify-between items-center">
                            <div className="font-medium">{mob.name}</div>
                            <button 
                              className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700 transition-colors flex items-center opacity-80 group-hover:opacity-100"
                              onClick={() => removeMobFromBattlefield(mob.id)}
                            >
                              <XMarkIcon className="w-3 h-3 mr-1" /> Remove
                            </button>
                          </div>
                          <div className="p-3 flex items-center">
                            <div className="w-full">
                              <div className="flex justify-between mb-1 text-xs text-gray-400">
                                <span>Health</span>
                                <span>{mob.health}/{mob.maxHealth}</span>
                              </div>
                              <div className="w-full bg-gray-800 rounded-full h-2.5">
                                <div 
                                  className="bg-red-600 h-2.5 rounded-full" 
                                  style={{ width: `${Math.max(0, Math.min(100, (mob.health / mob.maxHealth) * 100))}%` }}
                                ></div>
                              </div>
                              <div className="flex items-center mt-2">
                                <SparklesIcon className="w-4 h-4 text-red-400 mr-1" />
                                <span className="text-sm">Damage: {mob.damage}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App

