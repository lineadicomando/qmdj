<script lang="ts">
  /**
   * The rain, and the one thing on this site that is not the work.
   *
   * A column holds a name — 休門, 鶉火, 天蓬 — and spends it one character at
   * a time on the way down, so that a fragment of something the engine
   * actually computes with keeps forming and breaking up. When a name runs
   * out the column picks another; nothing is ever drawn that is not in
   * `glyphs.ts`.
   *
   * Behind everything, and never in the way of it: the canvas is fixed at the
   * back of the stacking order and takes no pointer, and the shell above it
   * carries a ground the text is read off. It draws in the appearance's own
   * tokens rather than in a colour of its own — matrix green against this
   * page's warm paper is the one thing that would make it look like a mistake
   * rather than a joke.
   */
  import { onMount } from 'svelte';
  import { ENGINE_NAMES } from '$lib/glyphs';

  let canvas = $state<HTMLCanvasElement | null>(null);

  /** The cell, in CSS pixels. A column is one glyph wide and rows are square. */
  const CELL = 18;
  /** How much of a column is still lit behind its head. */
  const TRAIL = 14;
  /** Frames between one column's steps, at either end of the range. */
  const SLOWEST = 9;
  const QUICKEST = 3;

  interface Column {
    /** The name being spent, and how far into it the head has got. */
    name: string;
    at: number;
    /** The row the head is on, counted from above the top of the screen. */
    row: number;
    /** What is still lit, head first. */
    lit: string[];
    period: number;
    tick: number;
  }

  const pick = <T,>(items: readonly T[]): T =>
    items[Math.floor(Math.random() * items.length)] as T;

  function fresh(rows: number, high: boolean): Column {
    return {
      name: pick(ENGINE_NAMES),
      at: 0,
      // Staggered on the first fill, so the rain does not start as one line.
      row: high ? -Math.floor(Math.random() * rows) : -TRAIL,
      lit: [],
      period: QUICKEST + Math.floor(Math.random() * (SLOWEST - QUICKEST + 1)),
      tick: 0,
    };
  }

  function step(column: Column, rows: number): void {
    if (column.at >= column.name.length) {
      column.name = pick(ENGINE_NAMES);
      column.at = 0;
    }
    column.lit.unshift(column.name[column.at] as string);
    column.lit.length = Math.min(column.lit.length, TRAIL);
    column.at += 1;
    column.row += 1;
    // Off the bottom, trail and all: begin again at the top with a new name.
    if (column.row - TRAIL > rows) Object.assign(column, fresh(rows, false));
  }

  /*
   * Arrow constants rather than declarations, all of them.
   *
   * A hoisted `function` can be called before the two guards above it have
   * run, so far as the checker is concerned, and `surface` and `ctx` go back
   * to being possibly null inside every one of them. Bound after the guards,
   * they stay narrowed.
   */
  onMount(() => {
    const surface = canvas;
    if (!surface) return;
    const ctx = surface.getContext('2d');
    if (!ctx) return;

    // Someone who asked for less movement gets the picture and not the
    // motion: one frame, drawn once, and no loop at all.
    const still = window.matchMedia('(prefers-reduced-motion: reduce)');

    let columns: Column[] = [];
    let rows = 0;
    let frame = 0;
    // The window in CSS pixels. The canvas is sized in device pixels and the
    // context scaled to match, so everything below this line is CSS pixels
    // and the two are never mixed.
    let width = 0;
    let height = 0;

    const measure = (): void => {
      const ratio = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      surface.width = Math.floor(width * ratio);
      surface.height = Math.floor(height * ratio);
      surface.style.width = `${width}px`;
      surface.style.height = `${height}px`;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

      rows = Math.ceil(height / CELL);
      columns = Array.from({ length: Math.ceil(width / CELL) }, () => fresh(rows, true));
      // A still picture has no frames to fill itself over, so it arrives
      // already fallen.
      if (still.matches) {
        for (const column of columns) for (let i = 0; i < TRAIL; i += 1) step(column, rows);
      }
    };

    /**
     * The two colours are read back out of the stylesheet, not written here.
     *
     * `--ink` and `--edge` are what the page is already set in, so the rain
     * follows a reader from light to dark to paper-white without knowing that
     * any of the three exists. Read afresh each frame: the appearance changes
     * under a button, and a colour cached at mount would keep the old one.
     */
    const draw = (): void => {
      const face = getComputedStyle(document.documentElement);
      const head = face.getPropertyValue('--ink').trim() || '#1a1a1a';
      const tail = face.getPropertyValue('--edge').trim() || '#8a8378';

      ctx.clearRect(0, 0, width, height);
      ctx.font = `${CELL - 3}px 'Noto Serif CJK SC', 'Songti SC', 'PingFang SC', serif`;
      ctx.textBaseline = 'top';

      columns.forEach((column, index) => {
        const x = index * CELL;
        column.lit.forEach((glyph, behind) => {
          const y = (column.row - behind) * CELL;
          if (y < -CELL || y > height) return;
          // The head is the page's own ink; everything behind it fades
          // through the colour the rules and the frames are drawn in.
          ctx.fillStyle = behind === 0 ? head : tail;
          ctx.globalAlpha = behind === 0 ? 0.62 : 0.4 * (1 - behind / TRAIL);
          ctx.fillText(glyph, x, y);
        });
      });
      ctx.globalAlpha = 1;
    };

    const tick = (): void => {
      frame = requestAnimationFrame(tick);
      for (const column of columns) {
        column.tick += 1;
        if (column.tick < column.period) continue;
        column.tick = 0;
        step(column, rows);
      }
      draw();
    };

    const start = (): void => {
      if (frame || still.matches) return;
      frame = requestAnimationFrame(tick);
    };

    const stop = (): void => {
      if (!frame) return;
      cancelAnimationFrame(frame);
      frame = 0;
    };

    const refit = (): void => {
      measure();
      draw();
    };

    // A tab nobody is looking at is a loop nobody is watching.
    const follow = (): void => {
      if (document.hidden) stop();
      else start();
    };

    const reconsider = (): void => {
      stop();
      refit();
      start();
    };

    measure();
    draw();
    start();

    window.addEventListener('resize', refit);
    document.addEventListener('visibilitychange', follow);
    still.addEventListener('change', reconsider);

    return () => {
      stop();
      window.removeEventListener('resize', refit);
      document.removeEventListener('visibilitychange', follow);
      still.removeEventListener('change', reconsider);
    };
  });
</script>

<canvas bind:this={canvas} aria-hidden="true"></canvas>

<style>
  /*
   * Behind the page and out of its way.
   *
   * `fixed` rather than tall: the rain is the window's weather and does not
   * scroll with the text. Negative in the stacking order, which puts it above
   * the ground `body` paints and below everything in the flow — and no
   * pointer, so nothing under the cursor moves because of it.
   */
  canvas {
    position: fixed;
    inset: 0;
    z-index: -1;
    pointer-events: none;
  }

  /* Whatever else it is, it is not something to print. */
  @media print {
    canvas { display: none; }
  }
</style>
