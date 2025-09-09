<template>
  <div class="tech-background">
    <canvas 
      ref="canvasRef" 
      class="tech-canvas"
      @mousemove="handleMouseMove"
    ></canvas>
    <div class="gradient-overlay"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const canvasRef = ref<HTMLCanvasElement>()
const mouse = ref({ x: 0, y: 0 })
const particles: Particle[] = []
let animationId: number

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  color: string
}

const handleMouseMove = (event: MouseEvent) => {
  const rect = canvasRef.value?.getBoundingClientRect()
  if (rect) {
    mouse.value.x = event.clientX - rect.left
    mouse.value.y = event.clientY - rect.top
  }
}

const createParticle = (canvas: HTMLCanvasElement): Particle => {
  const colors = ['#00bfff', '#8a2be2', '#00d4ff', '#a855f7']
  return {
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 0.5,
    vy: (Math.random() - 0.5) * 0.5,
    size: Math.random() * 2 + 1,
    opacity: Math.random() * 0.5 + 0.2,
    color: colors[Math.floor(Math.random() * colors.length)]
  }
}

const updateParticle = (particle: Particle, canvas: HTMLCanvasElement) => {
  particle.x += particle.vx
  particle.y += particle.vy

  // 鼠标交互效果
  const dx = mouse.value.x - particle.x
  const dy = mouse.value.y - particle.y
  const distance = Math.sqrt(dx * dx + dy * dy)
  
  if (distance < 100) {
    const force = (100 - distance) / 100
    particle.vx += dx * force * 0.001
    particle.vy += dy * force * 0.001
  }

  // 边界反弹
  if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1
  if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1

  // 保持在画布内
  particle.x = Math.max(0, Math.min(canvas.width, particle.x))
  particle.y = Math.max(0, Math.min(canvas.height, particle.y))

  // 速度衰减
  particle.vx *= 0.99
  particle.vy *= 0.99
}

const drawParticle = (ctx: CanvasRenderingContext2D, particle: Particle) => {
  ctx.save()
  ctx.globalAlpha = particle.opacity
  ctx.fillStyle = particle.color
  ctx.shadowBlur = 10
  ctx.shadowColor = particle.color
  ctx.beginPath()
  ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

const drawConnections = (ctx: CanvasRenderingContext2D) => {
  ctx.save()
  ctx.strokeStyle = 'rgba(0, 191, 255, 0.1)'
  ctx.lineWidth = 1
  
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x
      const dy = particles[i].y - particles[j].y
      const distance = Math.sqrt(dx * dx + dy * dy)
      
      if (distance < 120) {
        const opacity = (120 - distance) / 120 * 0.1
        ctx.globalAlpha = opacity
        ctx.beginPath()
        ctx.moveTo(particles[i].x, particles[i].y)
        ctx.lineTo(particles[j].x, particles[j].y)
        ctx.stroke()
      }
    }
  }
  ctx.restore()
}

const animate = () => {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // 清除画布
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // 更新和绘制粒子
  particles.forEach(particle => {
    updateParticle(particle, canvas)
    drawParticle(ctx, particle)
  })

  // 绘制连接线
  drawConnections(ctx)

  animationId = requestAnimationFrame(animate)
}

const initCanvas = () => {
  const canvas = canvasRef.value
  if (!canvas) return

  const resize = () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }

  resize()
  window.addEventListener('resize', resize)

  // 创建粒子
  particles.length = 0
  const particleCount = Math.min(50, Math.floor((canvas.width * canvas.height) / 15000))
  
  for (let i = 0; i < particleCount; i++) {
    particles.push(createParticle(canvas))
  }

  animate()

  return () => {
    window.removeEventListener('resize', resize)
  }
}

onMounted(() => {
  const cleanup = initCanvas()
  onUnmounted(() => {
    if (animationId) {
      cancelAnimationFrame(animationId)
    }
    cleanup?.()
  })
})
</script>

<style scoped>
.tech-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

.tech-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.gradient-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 20% 80%, rgba(0, 191, 255, 0.03) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(138, 43, 226, 0.03) 0%, transparent 50%),
              linear-gradient(135deg, rgba(0, 191, 255, 0.01) 0%, transparent 50%, rgba(138, 43, 226, 0.01) 100%);
  pointer-events: none;
}
</style>
