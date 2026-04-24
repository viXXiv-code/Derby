// ==================== CAR GEOMETRY ====================
function getCarDimensions(car) {
  const type = car.carType;
  const frontCrush = (car.frontDamage / car.maxFrontDamage) * type.hoodLength * 0.6;
  const rearCrush = (car.rearDamage / car.maxRearDamage) * type.trunkLength * 0.6;
  const sideCrush = (car.sideDamage / car.maxSideDamage) * 3;

  return {
    length: (type.hoodLength - frontCrush) + type.cabinLength + (type.trunkLength - rearCrush),
    width: Math.max(type.width * 0.75, type.width - sideCrush),
    hoodLength: Math.max(4, type.hoodLength - frontCrush),
    trunkLength: Math.max(4, type.trunkLength - rearCrush),
    frontCrush,
    rearCrush,
    sideCrush
  };
}

// Get the 4 corners of the car in world coordinates
function getCarCorners(car) {
  const dim = getCarDimensions(car);
  const halfLen = dim.length / 2;
  const halfWid = dim.width / 2;

  // Local corners (car facing right = angle 0)
  const localCorners = [
    vec(halfLen, -halfWid),   // Front-right
    vec(halfLen, halfWid),    // Front-left
    vec(-halfLen, halfWid),   // Rear-left
    vec(-halfLen, -halfWid)   // Rear-right
  ];

  // Transform to world coordinates
  return localCorners.map(corner => {
    const rotated = vecRotate(corner, car.angle);
    return vecAdd(vec(car.x, car.y), rotated);
  });
}

// Get axes for SAT collision (the normals of each edge)
function getCarAxes(car) {
  const cos = Math.cos(car.angle);
  const sin = Math.sin(car.angle);
  return [
    vec(cos, sin),   // Forward axis
    vec(-sin, cos)   // Right axis
  ];
}

// ==================== CAR FACTORY ====================
function createCar(x, y, angle, isPlayer = false, colorIndex = 0, totalCars = 1) {
  const baseType = CAR_TYPES[Math.floor(Math.random() * CAR_TYPES.length)];

  // Scale the car type
  const carType = {
    ...baseType,
    length: baseType.length * CAR_SCALE,
    width: baseType.width * CAR_SCALE,
    hoodLength: baseType.hoodLength * CAR_SCALE,
    trunkLength: baseType.trunkLength * CAR_SCALE,
    cabinLength: baseType.cabinLength * CAR_SCALE
  };

  const color = isPlayer ? { h: 210, s: 70, l: 45 } : getUniqueColor(colorIndex, totalCars);

  return {
    x, y, angle,
    speed: 0,
    vx: 0, vy: 0,           // Additional velocity from impacts
    steerAngle: 0,
    angularVel: 0,
    lateralVel: 0,

    frontDamage: 0,
    rearDamage: 0,
    sideDamage: 0,
    maxFrontDamage: 400,
    maxRearDamage: 320,
    maxSideDamage: 360,

    isPlayer,
    color,
    carNumber: getUniqueNumber(),
    carType,
    disabled: false,
    disabledReason: null,

    lastContactFrame: 0,

    ai: isPlayer ? null : {
      state: 'scanning',
      stateTimer: 0,
      target: null,
      attackCooldown: 0,
      preferReverse: Math.random() > 0.45,
      aggressiveness: 0.35 + Math.random() * 0.45,
      patience: 50 + Math.random() * 80,
      stuckTimer: 0,
      lastPos: { x, y }
    },

    dents: [],
    impactMarks: [],  // Persistent scratches and damage marks
    lastHitFlash: 0,  // Frame when last hit for flash effect
    smokeTimer: 0,
    trackTimer: 0
  };
}

// ==================== CAR HEALTH / DAMAGE STATE ====================
function getFrontDamagePct(car) { return car.frontDamage / car.maxFrontDamage; }
function getRearDamagePct(car) { return car.rearDamage / car.maxRearDamage; }
function getSideDamagePct(car) { return car.sideDamage / car.maxSideDamage; }
function getFrontHealth(car) { return 1 - getFrontDamagePct(car); }
function getRearHealth(car) { return 1 - getRearDamagePct(car); }
function getSideHealth(car) { return 1 - getSideDamagePct(car); }

function getCarHealthPct(car) {
  // Calculate overall health as weighted average of zone damages
  const frontPct = car.frontDamage / car.maxFrontDamage;
  const sidePct = car.sideDamage / car.maxSideDamage;
  const rearPct = car.rearDamage / car.maxRearDamage;

  // Front is most critical (engine), then side, then rear
  const weightedDamage = frontPct * 0.45 + sidePct * 0.35 + rearPct * 0.20;
  return Math.max(0, 1 - weightedDamage);
}

function isDamagedOut(car) {
  const rearGone = car.rearDamage >= car.maxRearDamage;
  const frontGone = car.frontDamage >= car.maxFrontDamage;
  const totalDmgPct = (getFrontDamagePct(car) + getRearDamagePct(car) + getSideDamagePct(car)) / 3;
  return rearGone || frontGone || totalDmgPct > 0.85;
}

function getSpeedModifier(car) {
  // Rear damage: dragging bumper, flat tire, drivetrain damage
  // Affects top speed significantly
  const rearPenalty = getRearDamagePct(car) * 0.55;
  const sidePenalty = getSideDamagePct(car) * 0.15;
  return Math.max(0.2, 1 - rearPenalty - sidePenalty);
}

function getAccelerationModifier(car) {
  // Rear damage affects acceleration MORE than top speed
  // (engine/drivetrain strain, wheels rubbing)
  const rearPenalty = getRearDamagePct(car) * 0.7;
  const sidePenalty = getSideDamagePct(car) * 0.2;
  return Math.max(0.15, 1 - rearPenalty - sidePenalty);
}

function getSteerModifier(car) {
  // Front damage: bent tie rods, alignment damage, wheel interference
  const frontPenalty = getFrontDamagePct(car) * 0.65;
  const sidePenalty = getSideDamagePct(car) * 0.2;
  return Math.max(0.15, 1 - frontPenalty - sidePenalty);
}
