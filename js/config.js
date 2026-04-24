// ==================== CONFIGURATION ====================
const ARENA_WIDTH = 800;
const ARENA_HEIGHT = 880;
const WALL_THICKNESS = 50;
const CAR_SCALE = 1.2; // 20% larger cars
const CONTACT_TIMEOUT = 45 * 60; // 45 seconds at 60fps

const PHYSICS = {
  BASE_ACCELERATION: 0.04,
  MAX_FORWARD_SPEED: 9,
  MAX_REVERSE_SPEED: 9,  // Same as forward when healthy
  ROLLING_FRICTION: 0.975,
  MUD_DRAG: 0.965,
  MAX_STEER_ANGLE: 0.42,
  STEER_SPEED: 0.055,
  STEER_RETURN_SPEED: 0.08,
  MIN_SPEED_TO_TURN: 0.15,
  SLIDE_FRICTION: 0.85,
  ANGULAR_FRICTION: 0.82,
  // Collision physics
  RESTITUTION: 0.35,
  COLLISION_BIAS: 0.3,
  ANGULAR_IMPULSE_SCALE: 0.012
};

// Car types - ALL IDENTICAL STATS, only visual differences (cosmetic only)
const CAR_TYPES = [
  { name: 'Crown Vic', length: 65, width: 28, hoodLength: 20, trunkLength: 16, cabinLength: 29, bodyStyle: 'sedan', frontStrength: 1.0, rearStrength: 1.0, weight: 1.0, acceleration: 1.0, topSpeed: 1.0 },
  { name: 'Town Car', length: 65, width: 28, hoodLength: 22, trunkLength: 14, cabinLength: 29, bodyStyle: 'sedan', frontStrength: 1.0, rearStrength: 1.0, weight: 1.0, acceleration: 1.0, topSpeed: 1.0 },
  { name: 'Impala', length: 65, width: 28, hoodLength: 19, trunkLength: 17, cabinLength: 29, bodyStyle: 'sedan', frontStrength: 1.0, rearStrength: 1.0, weight: 1.0, acceleration: 1.0, topSpeed: 1.0 },
  { name: 'Imperial', length: 65, width: 28, hoodLength: 21, trunkLength: 15, cabinLength: 29, bodyStyle: 'sedan', frontStrength: 1.0, rearStrength: 1.0, weight: 1.0, acceleration: 1.0, topSpeed: 1.0 },
  { name: 'Wagon', length: 65, width: 28, hoodLength: 18, trunkLength: 20, cabinLength: 27, bodyStyle: 'wagon', frontStrength: 1.0, rearStrength: 1.0, weight: 1.0, acceleration: 1.0, topSpeed: 1.0 },
  { name: 'LeSabre', length: 65, width: 28, hoodLength: 18, trunkLength: 17, cabinLength: 30, bodyStyle: 'sedan', frontStrength: 1.0, rearStrength: 1.0, weight: 1.0, acceleration: 1.0, topSpeed: 1.0 },
  { name: 'DeVille', length: 65, width: 28, hoodLength: 20, trunkLength: 16, cabinLength: 29, bodyStyle: 'sedan', frontStrength: 1.0, rearStrength: 1.0, weight: 1.0, acceleration: 1.0, topSpeed: 1.0 },
  { name: 'Delta 88', length: 65, width: 28, hoodLength: 19, trunkLength: 17, cabinLength: 29, bodyStyle: 'sedan', frontStrength: 1.0, rearStrength: 1.0, weight: 1.0, acceleration: 1.0, topSpeed: 1.0 }
];
