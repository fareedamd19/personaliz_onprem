/**
 * Overlay element model v2.
 *
 * Extends the stored element shape with optional `type`, `keyframes`, `bind`,
 * `format`, `visibleIf`, `href`, `src` and `z` fields — while guaranteeing that an
 * element carrying NONE of them behaves exactly as it did before.
 *
 * Legacy behaviour, preserved bit for bit:
 *   position  = textbox_x / textbox_y / textbox_w / textbox_h
 *   opacity   = 1 while start_time <= t <= end_time, otherwise 0
 *
 * Every function here is pure so it can be tested without a DOM.
 */

/* ------------------------------------------------------------------ easing */

export const EASINGS = {
  linear: (p) => p,
  easeOutCubic: (p) => 1 - Math.pow(1 - p, 3),
  easeInCubic: (p) => p * p * p,
  easeInOutCubic: (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2),
};

const easingFor = (name) => EASINGS[name] || EASINGS.linear;

/* --------------------------------------------------------------- normalize */

export const elementType = (el) => el?.type || "text";

/** True when the element uses the v2 keyframe track. */
export const hasKeyframes = (el) =>
  Array.isArray(el?.keyframes) && el.keyframes.length > 0;

/** Keyframes sorted by time, defaults filled from the legacy textbox_* fields. */
export function normalizeKeyframes(el) {
  if (!hasKeyframes(el)) {
    return [
      {
        t: Number(el?.start_time) || 0,
        x: num(el?.textbox_x),
        y: num(el?.textbox_y),
        w: num(el?.textbox_w),
        h: num(el?.textbox_h),
        opacity: 1,
        progress: 1,
        ease: "linear",
      },
    ];
  }
  return [...el.keyframes]
    .map((k) => ({
      t: Number(k.t) || 0,
      x: k.x !== undefined ? num(k.x) : num(el?.textbox_x),
      y: k.y !== undefined ? num(k.y) : num(el?.textbox_y),
      w: k.w !== undefined ? num(k.w) : num(el?.textbox_w),
      h: k.h !== undefined ? num(k.h) : num(el?.textbox_h),
      opacity: k.opacity !== undefined ? Number(k.opacity) : 1,
      progress: k.progress !== undefined ? Number(k.progress) : 1,
      ease: k.ease || "linear",
    }))
    .sort((a, b) => a.t - b.t);
}

const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

/* ----------------------------------------------------------------- sample */

/**
 * Geometry and opacity of an element at time `t`.
 * Returns `visible:false` when the element is outside its time window.
 */
export function sampleElement(el, t) {
  const start = Number(el?.start_time) || 0;
  const end = Number(el?.end_time) || 0;
  const inWindow = t >= start && t <= end;

  if (!hasKeyframes(el)) {
    // Legacy path — identical to the original renderer.
    return {
      x: num(el?.textbox_x),
      y: num(el?.textbox_y),
      w: num(el?.textbox_w),
      h: num(el?.textbox_h),
      opacity: inWindow ? 1 : 0,
      progress: 1,
      visible: true,
    };
  }

  const kfs = normalizeKeyframes(el);
  const first = kfs[0];
  const last = kfs[kfs.length - 1];

  // Clamp outside the keyframe track, then apply the time window to opacity.
  if (t <= first.t) return withWindow(first, inWindow);
  if (t >= last.t) return withWindow(last, inWindow);

  let a = first;
  let b = last;
  for (let i = 0; i < kfs.length - 1; i++) {
    if (t >= kfs[i].t && t <= kfs[i + 1].t) {
      a = kfs[i];
      b = kfs[i + 1];
      break;
    }
  }

  const span = b.t - a.t;
  const raw = span <= 0 ? 1 : (t - a.t) / span;
  // Easing belongs to the keyframe being moved TOWARDS.
  const p = easingFor(b.ease)(clamp01(raw));

  return {
    x: lerp(a.x, b.x, p),
    y: lerp(a.y, b.y, p),
    w: lerp(a.w, b.w, p),
    h: lerp(a.h, b.h, p),
    opacity: inWindow ? lerp(a.opacity, b.opacity, p) : 0,
    progress: lerp(a.progress, b.progress, p),
    visible: true,
  };
}

const withWindow = (k, inWindow) => ({
  x: k.x, y: k.y, w: k.w, h: k.h,
  opacity: inWindow ? k.opacity : 0,
  progress: k.progress,
  visible: true,
});

const lerp = (a, b, p) => a + (b - a) * p;
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

/* -------------------------------------------------------------- conditions */

const OPS = {
  eq: (a, b) => a === b,
  neq: (a, b) => a !== b,
  gt: (a, b) => Number(a) > Number(b),
  gte: (a, b) => Number(a) >= Number(b),
  lt: (a, b) => Number(a) < Number(b),
  lte: (a, b) => Number(a) <= Number(b),
  in: (a, b) => Array.isArray(b) && b.includes(a),
  truthy: (a) => Boolean(a),
  falsy: (a) => !a,
};

/**
 * Whether an element should exist at all for this recipient.
 * A missing or malformed condition means "show" — never hide on bad config.
 */
export function shouldRender(el, variables = {}) {
  const cond = el?.visibleIf;
  if (!cond || !cond.var) return true;
  const op = OPS[cond.op || "truthy"];
  if (!op) return true;
  return Boolean(op(variables[cond.var], cond.value));
}

/* -------------------------------------------------------------- formatting */

/** Formats a bound value. Unknown kinds fall through untouched. */
export function formatValue(raw, format) {
  if (!format || raw === undefined || raw === null) return raw;
  const locale = format.locale || "en";
  const digits = format.decimals;
  try {
    switch (format.kind) {
      case "number":
        return new Intl.NumberFormat(locale, fractionOpts(digits)).format(Number(raw));
      case "percent":
        return `${new Intl.NumberFormat(locale, fractionOpts(digits)).format(Number(raw))}%`;
      case "currency":
        return new Intl.NumberFormat(locale, {
          style: "currency",
          currency: format.currency || "AED",
          ...fractionOpts(digits),
        }).format(Number(raw));
      case "date": {
        const d = new Date(raw);
        if (Number.isNaN(d.getTime())) return raw;
        return new Intl.DateTimeFormat(locale, format.dateOptions || {
          day: "2-digit", month: "short", year: "numeric",
        }).format(d);
      }
      default:
        return raw;
    }
  } catch {
    return raw; // never let a formatting error blank out a value
  }
}

const fractionOpts = (d) =>
  Number.isFinite(d) ? { minimumFractionDigits: d, maximumFractionDigits: d } : {};

/* ------------------------------------------------------------------- bind */

/** Proportion 0..1 of a bound value between its min and max. For bar and arc. */
export function boundProportion(el, variables = {}) {
  const bind = el?.bind;
  if (!bind) return 0;
  const v = Number(variables[bind.value]);
  const min = Number(bind.min ?? 0);
  const max = Number(bind.max ?? 100);
  if (!Number.isFinite(v) || max === min) return 0;
  return clamp01((v - min) / (max - min));
}

/** Resolves an { var } / { value } reference against the recipient's variables. */
export function resolveRef(ref, variables = {}) {
  if (!ref) return undefined;
  if (typeof ref === "string") return ref;
  if (ref.var !== undefined) return variables[ref.var];
  return ref.value;
}

/* ------------------------------------------------------------------- href */

/**
 * Validates a link destination before it reaches the DOM.
 *
 * Destinations come from per-recipient database values, so they are untrusted
 * input. Anything that is not http(s) — `javascript:` above all — is rejected and
 * the element renders as plain, non-interactive content instead.
 */
export function safeHref(raw) {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed, "https://invalid.example");
    return url.protocol === "http:" || url.protocol === "https:" ? trimmed : null;
  } catch {
    return null;
  }
}

/* -------------------------------------------------------------- repeaters */

/**
 * Expands repeating rows into individual elements.
 *
 * A table like MOHRE's owner details is six records across seven columns — 42
 * elements, each placed by hand today. A repeater defines the row once and binds
 * it to a record set:
 *
 *   {
 *     repeat: { count: 6, as: "owner", countVar: "owner_count" },
 *     rowHeight: 0.055,
 *     columns: [ { variable: "{as}{n}_name", textbox_x: 0.08, textbox_w: 0.14 }, ... ],
 *     textbox_y: 0.30, textbox_h: 0.04, start_time: 13, end_time: 20
 *   }
 *
 * `{n}` becomes the 1-based row number and `{as}` the row prefix, so
 * "{as}{n}_name" resolves to "owner1_name", "owner2_name" and so on. When
 * `countVar` names a variable, that value caps the row count — a record with
 * three owners renders three rows, not six blanks.
 *
 * Rows are expanded before rendering, so every downstream feature — keyframes,
 * conditions, links, formatting — works on a repeated cell exactly as it does on
 * a hand-placed one.
 */
export function expandRepeaters(elements, variables = {}) {
  if (!Array.isArray(elements)) return [];

  const out = [];
  for (const el of elements) {
    if (!el?.repeat || !Array.isArray(el.columns)) {
      out.push(el);
      continue;
    }

    const declared = Number(el.repeat.count) || 0;
    const fromVar = el.repeat.countVar ? Number(variables[el.repeat.countVar]) : NaN;
    // Never render more rows than the data has, and never more than declared.
    const rows = Number.isFinite(fromVar)
      ? Math.max(0, Math.min(declared, fromVar))
      : declared;

    const prefix = el.repeat.as || "row";
    const rowHeight = Number(el.rowHeight) || Number(el.textbox_h) || 0.05;
    const baseY = Number(el.textbox_y) || 0;

    for (let r = 0; r < rows; r++) {
      for (const col of el.columns) {
        const name = String(col.variable || "")
          .replace(/\{as\}/g, prefix)
          .replace(/\{n\}/g, String(r + 1));

        out.push({
          ...el,
          ...col,
          repeat: undefined,
          columns: undefined,
          variable_name: name,
          text: col.text !== undefined ? col.text : name,
          textbox_x: col.textbox_x,
          textbox_w: col.textbox_w,
          textbox_y: baseY + r * rowHeight,
          textbox_h: el.textbox_h,
          __repeatRow: r + 1,
        });
      }
    }
  }
  return out;
}

/* ------------------------------------------------------------- chapters */

/**
 * Conditional chapters — one film, many journeys.
 *
 * The incumbent ships a separately rendered MP4 for each combination of flags
 * (compliant / non-compliant / simplified, times two languages — six films for
 * one campaign). Instead of rendering a film per combination, a chapter marks a
 * time range on ONE base video as included or skipped:
 *
 *   [{ id: "wps", start: 64, end: 88, visibleIf: {var:"has_wps", op:"eq", value:true} }]
 *
 * A chapter whose condition fails is jumped over during playback.
 *
 * CAVEAT, and it must not be hidden from the client: skipping a range cannot
 * rewrite narration. Either the base film is scripted so each chapter is
 * self-contained in audio, or a chapter carries its own audio track. This is the
 * question to settle with the video producer BEFORE the film is scripted.
 */

/** Chapters excluded for this recipient, sorted by start time. */
export function skippedChapters(chapters, variables = {}) {
  if (!Array.isArray(chapters)) return [];
  return chapters
    .filter((c) => c && Number.isFinite(Number(c.start)) && Number.isFinite(Number(c.end)))
    .filter((c) => !shouldRender(c, variables))
    .map((c) => ({ ...c, start: Number(c.start), end: Number(c.end) }))
    .sort((a, b) => a.start - b.start);
}

/**
 * Where playback should jump to from time `t`, or null to keep playing.
 *
 * Consecutive skipped chapters collapse into a single jump so playback never
 * lands inside another excluded range — which would otherwise cause a visible
 * stutter of seek, play one frame, seek again.
 */
export function chapterSkipTarget(chapters, t, variables = {}, epsilon = 0.05) {
  const skips = skippedChapters(chapters, variables);
  if (skips.length === 0) return null;

  let target = null;
  let cursor = t;

  // Follow the chain of adjacent skips.
  for (let guard = 0; guard < skips.length; guard++) {
    const hit = skips.find((c) => cursor >= c.start - epsilon && cursor < c.end);
    if (!hit) break;
    cursor = hit.end;
    target = hit.end;
  }

  return target;
}

/** Total runtime once excluded chapters are removed. For progress display. */
export function effectiveDuration(chapters, duration, variables = {}) {
  const skips = skippedChapters(chapters, variables);
  const removed = skips.reduce((sum, c) => sum + Math.max(0, c.end - c.start), 0);
  return Math.max(0, (Number(duration) || 0) - removed);
}

/* ------------------------------------------------------------- languages */

/**
 * Language variants of one campaign.
 *
 * The incumbent ships English and Arabic as separate embed bundles chosen when
 * the page loads, each with its own set of films — so a viewer cannot change
 * language without a different link. Treating language as a variant of a single
 * campaign lets one link carry both and swap in place.
 *
 *   variants: [
 *     { lang:"en", label:"English", rtl:false, videoUrl:"...", elements:[...], chapters:[...] },
 *     { lang:"ar", label:"العربية", rtl:true,  videoUrl:"...", elements:[...], chapters:[...] },
 *   ]
 *
 * Video source, element set and text direction must change together: a swap that
 * changes the film but keeps the previous language's overlay produces Arabic
 * audio under English captions.
 */

export function normalizeVariants(config) {
  const variants = config?.variants;
  if (!Array.isArray(variants) || variants.length === 0) return [];
  return variants
    .filter((v) => v && v.lang)
    .map((v) => ({
      lang: String(v.lang),
      label: v.label || String(v.lang).toUpperCase(),
      rtl: Boolean(v.rtl),
      videoUrl: v.videoUrl || null,
      elements: Array.isArray(v.elements) ? v.elements : [],
      chapters: Array.isArray(v.chapters) ? v.chapters : [],
    }));
}

/**
 * Picks the variant to open with: an explicit choice, else the campaign default,
 * else the first defined. Never returns undefined when variants exist, so the
 * player cannot end up with a film and no overlay.
 */
export function pickVariant(variants, requestedLang, defaultLang) {
  if (!Array.isArray(variants) || variants.length === 0) return null;
  const byLang = (l) => variants.find((v) => v.lang === l);
  return byLang(requestedLang) || byLang(defaultLang) || variants[0];
}

/**
 * Maps a playback position from one variant to another when switching mid-play.
 *
 * Variants of the same campaign are usually the same edit in another language,
 * but rarely the same length. Carrying the raw timestamp across would land the
 * viewer in the wrong place, so the position is carried proportionally and
 * clamped to the target duration.
 */
export function mapTimeAcrossVariants(t, fromDuration, toDuration) {
  const from = Number(fromDuration) || 0;
  const to = Number(toDuration) || 0;
  const time = Number(t) || 0;
  if (from <= 0 || to <= 0) return 0;
  return Math.max(0, Math.min(to, (time / from) * to));
}
