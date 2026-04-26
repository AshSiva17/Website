import {
  layoutWithLines,
  materializeLineRange,
  layoutNextLineRange,
  prepareWithSegments,
  type LayoutCursor,
  type PreparedTextWithSegments,
} from '@chenglou/pretext'
import { useEffect, useMemo, useRef, useState } from 'react'

const LINE_HEIGHT = 29
const FONT = '500 18px Lora'
const MIN_LINE_WIDTH = 72
const TEXT_PAD = 10

/** Served from `site/public/` — replace files to swap art */
const ASSETS = {
  ball: '/pixel-basketball.png',
  hoop: '/pixel-hoop.png',
} as const

/** Rim scoring hotspot: fractions of the drawn hoop sprite rect (left → right, top → bottom). */
const HOOP_RIM_U = 0.36
const HOOP_RIM_V = 0.33

/** Hoop sprite height (px); drawn below the last line of text. */
const HOOP_MAX_HEIGHT_PX = 158

/** Space between last text line and top of hoop sprite. */
const HOOP_GAP_BELOW_TEXT = 10

/** Extra px added to drawX: shifts hoop right (may clip past canvas edge). */
const HOOP_RIGHT_SHIFT = 32

type Ball = { x: number; y: number; vx: number; vy: number; r: number }

type LaidOutLine = { text: string; y: number; xOffset: number }

type Sample = { x: number; y: number; t: number }

type ConfettiPiece = {
  x: number
  y: number
  vx: number
  vy: number
  w: number
  h: number
  angle: number
  spin: number
  color: string
  life: number
  maxLife: number
}

type HoopLayout = {
  backX: number
  backY: number
  backW: number
  backH: number
  rimCx: number
  rimCy: number
  rimRx: number
  rimRy: number
  scoreDist2: number
  spriteDraw?: { x: number; y: number; w: number; h: number }
}

function hoopLayout(
  columnW: number,
  ballR: number,
  hoopImg: HTMLImageElement | null,
  lineCount: number,
): HoopLayout {
  const rimRx = ballR * 1.35 + 10
  const rimRy = Math.max(7, ballR * 0.42)
  const scoreDist2 = (ballR * 0.95 + 8) ** 2

  const textBottom = lineCount * LINE_HEIGHT
  const hoopTop = textBottom + HOOP_GAP_BELOW_TEXT

  const backW = 10
  const backH = 72
  const backX = columnW - backW - 2 + HOOP_RIGHT_SHIFT
  const backY = hoopTop
  let rimCx = columnW - 26 + HOOP_RIGHT_SHIFT * 0.4
  let rimCy = backY + backH - 4
  let spriteDraw: HoopLayout['spriteDraw']

  if (hoopImg?.complete && hoopImg.naturalWidth > 0) {
    const nh = hoopImg.naturalHeight
    const nw = hoopImg.naturalWidth
    const destH = HOOP_MAX_HEIGHT_PX
    const scale = destH / nh
    const destW = nw * scale
    const drawX = columnW - destW + HOOP_RIGHT_SHIFT
    const drawY = hoopTop
    spriteDraw = { x: drawX, y: drawY, w: destW, h: destH }
    rimCx = drawX + destW * HOOP_RIM_U
    rimCy = drawY + destH * HOOP_RIM_V
  }

  return {
    backX,
    backY,
    backW,
    backH,
    rimCx,
    rimCy,
    rimRx,
    rimRy,
    scoreDist2,
    spriteDraw,
  }
}

function hoopOccupiedBottom(hoop: HoopLayout): number {
  if (hoop.spriteDraw) {
    return hoop.spriteDraw.y + hoop.spriteDraw.h
  }
  return hoop.backY + hoop.backH + 12
}

function drawHoopProcedural(ctx: CanvasRenderingContext2D, h: HoopLayout) {
  const { backX, backY, backW, backH, rimCx, rimCy, rimRx, rimRy } = h

  ctx.save()

  ctx.fillStyle = '#e8e4dc'
  ctx.strokeStyle = '#c5c0b6'
  ctx.lineWidth = 1
  ctx.fillRect(backX, backY, backW, backH)
  ctx.strokeRect(backX + 0.5, backY + 0.5, backW - 1, backH - 1)

  ctx.strokeStyle = '#c0392b'
  ctx.lineWidth = Math.max(2.5, rimRy * 0.35)
  ctx.beginPath()
  ctx.ellipse(rimCx, rimCy, rimRx, rimRy, 0, 0.15 * Math.PI, 0.85 * Math.PI)
  ctx.stroke()

  ctx.strokeStyle = 'rgba(180, 175, 168, 0.85)'
  ctx.lineWidth = 1
  for (let i = 0; i < 5; i++) {
    const t = 0.25 + i * 0.12
    const px = rimCx + Math.cos(t * Math.PI) * rimRx * 0.92
    const py = rimCy + Math.sin(t * Math.PI) * rimRy * 0.92
    ctx.beginPath()
    ctx.moveTo(px, py)
    ctx.lineTo(px - 6, py + 22 + i * 3)
    ctx.stroke()
  }

  ctx.restore()
}

function drawHoop(
  ctx: CanvasRenderingContext2D,
  h: HoopLayout,
  hoopImg: HTMLImageElement | null,
) {
  if (hoopImg?.complete && hoopImg.naturalWidth > 0 && h.spriteDraw) {
    const sd = h.spriteDraw
    ctx.save()
    ctx.imageSmoothingEnabled = false
    ctx.drawImage(hoopImg, sd.x, sd.y, sd.w, sd.h)
    ctx.restore()
    return
  }
  drawHoopProcedural(ctx, h)
}

function spawnConfetti(pieces: ConfettiPiece[], x: number, y: number) {
  const colors = [
    '#c0392b',
    '#2980b9',
    '#f39c12',
    '#27ae60',
    '#8e44ad',
    '#d35400',
    '#1abc9c',
    '#e74c3c',
  ]
  const n = 64
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2
    const s = 2.2 + Math.random() * 6
    pieces.push({
      x: x + (Math.random() - 0.5) * 8,
      y: y + (Math.random() - 0.5) * 4,
      vx: Math.cos(a) * s * (0.55 + Math.random() * 0.9),
      vy: Math.sin(a) * s - 4.5,
      w: 2.5 + Math.random() * 5,
      h: 2 + Math.random() * 3.5,
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.35,
      color: colors[i % colors.length]!,
      life: 0,
      maxLife: 50 + Math.random() * 55,
    })
  }
}

function updateAndDrawConfetti(
  ctx: CanvasRenderingContext2D,
  pieces: ConfettiPiece[],
  cssH: number,
  columnW: number,
) {
  const alive: ConfettiPiece[] = []
  for (const p of pieces) {
    p.life += 1
    if (p.life >= p.maxLife) continue

    p.vy += 0.14
    p.vx *= 0.985
    p.x += p.vx
    p.y += p.vy
    p.angle += p.spin

    if (p.y > cssH + 40 || p.x < -40 || p.x > columnW + 40) continue

    alive.push(p)

    const fadeIn = Math.min(1, p.life / 8)
    const fadeOut = Math.min(1, (p.maxLife - p.life) / 20)
    ctx.save()
    ctx.globalAlpha = fadeIn * fadeOut
    ctx.translate(p.x, p.y)
    ctx.rotate(p.angle)
    ctx.fillStyle = p.color
    ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
    ctx.restore()
  }
  pieces.length = 0
  pieces.push(...alive)
}

function lineWidthForBall(
  lineCenterY: number,
  ball: Ball,
  columnW: number,
): { maxWidth: number; xOffset: number } {
  const dy = lineCenterY - ball.y
  if (Math.abs(dy) >= ball.r) {
    return { maxWidth: columnW, xOffset: 0 }
  }

  const halfChord = Math.sqrt(ball.r * ball.r - dy * dy)
  const leftEdge = ball.x - halfChord
  const rightEdge = ball.x + halfChord

  if (ball.x > columnW / 2) {
    const w = leftEdge - TEXT_PAD
    return {
      maxWidth: Math.min(columnW, Math.max(MIN_LINE_WIDTH, w)),
      xOffset: 0,
    }
  }

  const w = columnW - rightEdge - TEXT_PAD
  return {
    maxWidth: Math.min(columnW, Math.max(MIN_LINE_WIDTH, w)),
    xOffset: Math.max(0, rightEdge + TEXT_PAD),
  }
}

function layoutParagraphAroundBall(
  prepared: PreparedTextWithSegments,
  columnW: number,
  ball: Ball,
): LaidOutLine[] {
  const lines: LaidOutLine[] = []
  let cursor: LayoutCursor = { segmentIndex: 0, graphemeIndex: 0 }
  let y = 0

  while (true) {
    const lineCenterY = y + LINE_HEIGHT / 2
    const { maxWidth, xOffset } = lineWidthForBall(lineCenterY, ball, columnW)
    const range = layoutNextLineRange(prepared, cursor, maxWidth)
    if (range === null) break

    const line = materializeLineRange(prepared, range)
    lines.push({ text: line.text, y, xOffset })
    cursor = range.end
    y += LINE_HEIGHT

    if (y > 8000) break
  }

  return lines
}

function drawBasketballProcedural(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.save()
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.1, x, y, r)
  g.addColorStop(0, '#f0a050')
  g.addColorStop(0.55, '#c45c28')
  g.addColorStop(1, '#8b3a16')
  ctx.fillStyle = g
  ctx.fill()

  ctx.strokeStyle = '#1a1410'
  ctx.lineWidth = Math.max(1.2, r * 0.07)
  ctx.lineCap = 'round'

  ctx.beginPath()
  ctx.ellipse(x, y, r * 0.96, r * 0.38, 0, 0, Math.PI * 2)
  ctx.stroke()

  ctx.beginPath()
  ctx.ellipse(x, y, r * 0.38, r * 0.96, 0, 0, Math.PI * 2)
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(x, y, r * 0.92, -0.45 * Math.PI, 0.45 * Math.PI)
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(x, y, r * 0.92, 0.55 * Math.PI, 1.45 * Math.PI)
  ctx.stroke()

  ctx.restore()
}

/**
 * Full PNG scaled like CSS object-fit: cover so the circle is filled, then clipped
 * (centers the crop — good for a ball in the middle of a square image).
 */
function drawBasketball(
  ctx: CanvasRenderingContext2D,
  ballImg: HTMLImageElement | null,
  x: number,
  y: number,
  r: number,
) {
  if (ballImg?.complete && ballImg.naturalWidth > 0) {
    const iw = ballImg.naturalWidth
    const ih = ballImg.naturalHeight
    const d = r * 2
    const scale = Math.max(d / iw, d / ih)
    const dw = iw * scale
    const dh = ih * scale
    const dx = x - dw / 2
    const dy = y - dh / 2
    ctx.save()
    ctx.imageSmoothingEnabled = false
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.clip()
    ctx.drawImage(ballImg, 0, 0, iw, ih, dx, dy, dw, dh)
    ctx.restore()
    return
  }
  drawBasketballProcedural(ctx, x, y, r)
}

function dist2(ax: number, ay: number, bx: number, by: number) {
  const dx = ax - bx
  const dy = ay - by
  return dx * dx + dy * dy
}

function clampBallToBounds(ball: Ball, columnW: number, cssH: number, margin = 8) {
  ball.x = Math.max(margin + ball.r, Math.min(columnW - margin - ball.r, ball.x))
  ball.y = Math.max(margin + ball.r, Math.min(cssH - margin - ball.r, ball.y))
}

type Props = { text: string }

export function HeroBasketballText({ text }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const prepared = useMemo(
    () => prepareWithSegments(text, FONT, { letterSpacing: 0.09 }),
    [text],
  )

  const [columnW, setColumnW] = useState(0)
  const ballRef = useRef<Ball | null>(null)
  const rafRef = useRef<number>(0)

  const draggingRef = useRef(false)
  const dragSampleRef = useRef<Sample | null>(null)
  const flickRef = useRef<{ dx: number; dy: number; dt: number } | null>(null)
  const activePointerIdRef = useRef<number | null>(null)
  const cssHRef = useRef(320)

  const confettiRef = useRef<ConfettiPiece[]>([])
  const scoreCooldownRef = useRef(0)
  const ballSpriteRef = useRef<HTMLImageElement | null>(null)
  const hoopSpriteRef = useRef<HTMLImageElement | null>(null)

  useEffect(() => {
    let alive = true
    const setBall = (img: HTMLImageElement) => {
      if (alive) ballSpriteRef.current = img
    }
    const setHoop = (img: HTMLImageElement) => {
      if (alive) hoopSpriteRef.current = img
    }

    const ball = new Image()
    ball.decoding = 'async'
    ball.onload = () => setBall(ball)
    ball.onerror = () => {
      if (import.meta.env.DEV) {
        console.warn('[HeroBasketballText] Missing or blocked:', ASSETS.ball)
      }
    }
    ball.src = ASSETS.ball
    if (ball.complete && ball.naturalWidth > 0) setBall(ball)

    const hoop = new Image()
    hoop.decoding = 'async'
    hoop.onload = () => setHoop(hoop)
    hoop.src = ASSETS.hoop
    if (hoop.complete && hoop.naturalWidth > 0) setHoop(hoop)

    return () => {
      alive = false
    }
  }, [])

  const baseTextHeight = useMemo(() => {
    if (columnW <= 0) return 120
    return layoutWithLines(prepared, columnW, LINE_HEIGHT).height + LINE_HEIGHT
  }, [prepared, columnW])

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return

    const ro = new ResizeObserver(() => {
      const w = el.clientWidth
      setColumnW(w)
      if (!ballRef.current && w > 0) {
        ballRef.current = {
          x: w * 0.35,
          y: 48,
          vx: 0,
          vy: 0,
          r: Math.min(26, w * 0.08),
        }
      }
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || columnW <= 0) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const grabRadiusMul = 1.5

    const clientToCanvas = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect()
      const scaleX = columnW / Math.max(rect.width, 1)
      const scaleY = cssHRef.current / Math.max(rect.height, 1)
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY,
      }
    }

    const onPointerDown = (e: PointerEvent) => {
      const ball = ballRef.current
      if (!ball) return

      const { x, y } = clientToCanvas(e.clientX, e.clientY)
      const grabR = ball.r * grabRadiusMul
      if (dist2(x, y, ball.x, ball.y) > grabR * grabR) return

      draggingRef.current = true
      flickRef.current = null
      const now = performance.now()
      dragSampleRef.current = { x: ball.x, y: ball.y, t: now }
      ball.vx = 0
      ball.vy = 0
      activePointerIdRef.current = e.pointerId
      canvas.setPointerCapture(e.pointerId)
      canvas.classList.add('hero-basketball__canvas--grabbing')
    }

    const onPointerMove = (e: PointerEvent) => {
      if (!draggingRef.current) return
      const ball = ballRef.current
      if (!ball) return

      const { x, y } = clientToCanvas(e.clientX, e.clientY)
      const now = performance.now()
      ball.x = x
      ball.y = y
      clampBallToBounds(ball, columnW, cssHRef.current)

      const prev = dragSampleRef.current
      if (prev) {
        const dt = Math.max(5, now - prev.t)
        flickRef.current = { dx: ball.x - prev.x, dy: ball.y - prev.y, dt }
      }
      dragSampleRef.current = { x: ball.x, y: ball.y, t: now }
    }

    const endDrag = (e: PointerEvent) => {
      if (!draggingRef.current) return
      if (
        activePointerIdRef.current !== null &&
        e.pointerId !== activePointerIdRef.current
      ) {
        return
      }

      draggingRef.current = false
      activePointerIdRef.current = null

      if (canvas.hasPointerCapture(e.pointerId)) {
        canvas.releasePointerCapture(e.pointerId)
      }
      canvas.classList.remove('hero-basketball__canvas--grabbing')

      const ball = ballRef.current
      const flick = flickRef.current
      if (ball && flick && flick.dt > 0) {
        const scale = 16
        let vx = (flick.dx / flick.dt) * scale
        let vy = (flick.dy / flick.dt) * scale
        const speed = Math.hypot(vx, vy)
        const cap = 18
        if (speed > cap) {
          vx = (vx / speed) * cap
          vy = (vy / speed) * cap
        }
        ball.vx = vx
        ball.vy = vy
      }
      dragSampleRef.current = null
      flickRef.current = null
    }

    const onPointerUp = (e: PointerEvent) => endDrag(e)
    const onPointerCancel = (e: PointerEvent) => endDrag(e)

    canvas.addEventListener('pointerdown', onPointerDown)
    canvas.addEventListener('pointermove', onPointerMove)
    canvas.addEventListener('pointerup', onPointerUp)
    canvas.addEventListener('pointercancel', onPointerCancel)

    const tick = () => {
      const ball = ballRef.current
      if (!ball) {
        rafRef.current = requestAnimationFrame(tick)
        return
      }

      const lines = layoutParagraphAroundBall(prepared, columnW, ball)
      const hoop = hoopLayout(columnW, ball.r, hoopSpriteRef.current, lines.length)
      const bottomContent = hoopOccupiedBottom(hoop)
      const cssH = Math.max(
        baseTextHeight + 48,
        lines.length * LINE_HEIGHT + 40,
        bottomContent + 48,
      )
      cssHRef.current = cssH

      if (draggingRef.current) {
        clampBallToBounds(ball, columnW, cssH)
      }

      canvas.style.width = `${columnW}px`
      canvas.style.height = `${cssH}px`
      canvas.width = Math.floor(columnW * dpr)
      canvas.height = Math.floor(cssH * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      ctx.clearRect(0, 0, columnW, cssH)
      ctx.fillStyle = '#1c1b19'
      ctx.font = FONT
      ctx.textBaseline = 'top'

      for (const line of lines) {
        ctx.fillText(line.text, line.xOffset, line.y)
      }

      drawHoop(ctx, hoop, hoopSpriteRef.current)

      drawBasketball(ctx, ballSpriteRef.current, ball.x, ball.y, ball.r)

      updateAndDrawConfetti(ctx, confettiRef.current, cssH, columnW)

      if (scoreCooldownRef.current > 0) {
        scoreCooldownRef.current -= 1
      }

      if (!draggingRef.current) {
        const gravity = 0.34
        ball.vy += gravity
        ball.x += ball.vx
        ball.y += ball.vy

        const margin = 8
        const rimBand =
          Math.abs(ball.y - hoop.rimCy) < hoop.rimRy + ball.r * 1.2

        if (ball.y + ball.r > cssH - margin) {
          ball.y = cssH - margin - ball.r
          ball.vy *= -0.52
          ball.vx *= 0.9
        }
        if (ball.x + ball.r > columnW - margin && !rimBand) {
          ball.x = columnW - margin - ball.r
          ball.vx *= -0.62
        }
        if (ball.x - ball.r < margin) {
          ball.x = margin + ball.r
          ball.vx *= -0.62
        }
        if (ball.y - ball.r < margin) {
          ball.y = margin + ball.r
          ball.vy *= -0.38
        }
      }

      if (scoreCooldownRef.current === 0) {
        if (dist2(ball.x, ball.y, hoop.rimCx, hoop.rimCy) < hoop.scoreDist2) {
          spawnConfetti(confettiRef.current, hoop.rimCx, hoop.rimCy)
          scoreCooldownRef.current = 95
        }
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)

    return () => {
      canvas.removeEventListener('pointerdown', onPointerDown)
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerup', onPointerUp)
      canvas.removeEventListener('pointercancel', onPointerCancel)
      cancelAnimationFrame(rafRef.current)
    }
  }, [prepared, columnW, baseTextHeight])

  return (
    <div ref={wrapRef} className="hero-basketball">
      <canvas
        ref={canvasRef}
        className="hero-basketball__canvas"
        aria-label="Drag the basketball through the text and into the hoop"
      />
      <p className="sr-only">{text}</p>
    </div>
  )
}
