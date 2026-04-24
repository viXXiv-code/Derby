// ==================== PARTICLES ====================
function spawnSparks(x, y, count) {
  for (let i = 0; i < count; i++) {
    particles.push({
      x, y,
      vx: (Math.random() - 0.5) * 7,
      vy: (Math.random() - 0.5) * 7,
      life: 10 + Math.random() * 12,
      color: ['#ff0', '#f80', '#fff'][Math.floor(Math.random() * 3)],
      size: 2 + Math.random() * 2,
      type: 'spark'
    });
  }
}

function spawnDebris(x, y, color, count) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 4;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 25 + Math.random() * 20,
      color: color,
      size: 3 + Math.random() * 4,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.3,
      type: 'debris'
    });
  }
}

function spawnPaintChips(x, y, hslColor, count) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1.5 + Math.random() * 3;
    // Vary the color slightly
    const h = hslColor.h + (Math.random() - 0.5) * 20;
    const s = hslColor.s;
    const l = hslColor.l + (Math.random() - 0.5) * 15;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 30 + Math.random() * 25,
      color: `hsl(${h}, ${s}%, ${l}%)`,
      size: 2 + Math.random() * 3,
      type: 'paint'
    });
  }
}

function spawnSmoke(x, y, size) {
  particles.push({
    x, y,
    vx: (Math.random() - 0.5) * 0.3,
    vy: -0.3 - Math.random() * 0.3,
    life: 30 + Math.random() * 18,
    size: size || 5,
    type: 'smoke'
  });
}
