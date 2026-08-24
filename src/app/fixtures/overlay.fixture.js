/**
 * Synthetic overlay fixture — development only, never used in production.
 *
 * Deliberately NOT based on any real campaign. No client IDs, no client data.
 * Exercises every capability the MOHRE work needs, at realistic density:
 * the largest config in production uses 6 elements; this one uses 60+.
 */

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** Per-recipient values the overlay binds to. All invented. */
export const fixtureVariables = {
  owner_count: 6,
  first_name: "Test Establishment",
  full_name: "Sample Trading LLC",
  establishment_status: "Active",
  establishment_category: "Category 2",
  insurance_policies: "4",
  number_of_emirates: "3",
  bank_guarantee: "AED 300,000",
  quota_available: "12",
  absconding_record: "None",
  total_workers: "184",
  percent_skilled: 62.5,
  percent_low_skill: 37.5,
  fines_count: 2,
  incomplete_transactions: 3,
  commitment_status_ok: false,
  statement_url: "https://example.invalid/statement.pdf",
  ministry_url: "https://example.invalid/ministry",
  vision_url: "https://example.invalid/vision",
  support_url: "https://example.invalid/support",
  ...Object.fromEntries(
    MONTHS.map((m, i) => [`month${i + 1}_percentage`, 45 + ((i * 7) % 55)])
  ),
  ...Object.fromEntries(
    Array.from({ length: 6 }, (_, i) => [
      [`owner${i + 1}_name`, `Owner ${i + 1}`],
      [`owner${i + 1}_nationality`, "UAE"],
      [`owner${i + 1}_title`, "Partner"],
      [`owner${i + 1}_id`, `78400000000${i + 1}`],
      [`owner${i + 1}_mobile`, `+9715000000${i + 1}`],
      [`owner${i + 1}_email`, `owner${i + 1}@example.invalid`],
    ]).flat()
  ),
};

const text = (o) => ({
  type: "text",
  fontsize: 0.028,
  fontcolor: "#111111ff",
  fontname: "Montserrat",
  textStyle: {},
  alignment: "left",
  boxcolor: "#ffffff00",
  wrap_text: false,
  isStatic: false,
  is_default_variable: false,
  ...o,
});

/** Legacy-shaped elements: no keyframes. Must render exactly as today. */
const legacy = [
  text({
    variable_name: "first_name",
    text: "first_name",
    textbox_x: 0.1, textbox_y: 0.38, textbox_w: 0.8, textbox_h: 0.12,
    start_time: 0, end_time: 4,
    fontsize: 0.05, alignment: "center", textStyle: { B: "bold" },
  }),
  text({
    variable_name: "full_name",
    text: "full_name",
    textbox_x: 0.1, textbox_y: 0.52, textbox_w: 0.8, textbox_h: 0.08,
    start_time: 0, end_time: 4, alignment: "center",
  }),
];

/** Overview grid — 8 values, already beyond anything shipped. */
const overview = [
  "establishment_status", "bank_guarantee",
  "establishment_category", "quota_available",
  "insurance_policies", "absconding_record",
  "number_of_emirates", "total_workers",
].map((v, i) =>
  text({
    variable_name: v,
    text: v,
    textbox_x: i % 2 === 0 ? 0.30 : 0.74,
    textbox_y: 0.24 + Math.floor(i / 2) * 0.075,
    textbox_w: 0.18, textbox_h: 0.05,
    start_time: 5, end_time: 12,
  })
);

/**
 * Owner table as a single REPEATER instead of 36 hand-placed elements.
 * One row definition, bound to a record set, capped by owner_count.
 */
const ownerTable = [
  {
    repeat: { count: 6, as: "owner", countVar: "owner_count" },
    rowHeight: 0.055,
    textbox_y: 0.30,
    textbox_h: 0.04,
    start_time: 13,
    end_time: 20,
    fontsize: 0.018,
    fontcolor: "#111111ff",
    fontname: "Montserrat",
    textStyle: {},
    alignment: "left",
    boxcolor: "#ffffff00",
    wrap_text: false,
    columns: [
      { variable: "{as}{n}_name",        textbox_x: 0.08, textbox_w: 0.14 },
      { variable: "{as}{n}_nationality", textbox_x: 0.23, textbox_w: 0.14 },
      { variable: "{as}{n}_title",       textbox_x: 0.38, textbox_w: 0.14 },
      { variable: "{as}{n}_id",          textbox_x: 0.53, textbox_w: 0.14 },
      { variable: "{as}{n}_mobile",      textbox_x: 0.68, textbox_w: 0.14 },
      { variable: "{as}{n}_email",       textbox_x: 0.83, textbox_w: 0.14 },
    ],
  },
];

/** Animated bars — the WPS chart. easePosition equivalent. */
const wpsBars = MONTHS.map((m, i) => ({
  type: "bar",
  variable_name: `month${i + 1}_percentage`,
  bind: { value: `month${i + 1}_percentage`, min: 0, max: 100 },
  orientation: "vertical",
  boxcolor: "#B2832Cff",
  z: 1,
  // The keyframes define the TRACK (fixed) and animate `progress` 0 -> 1.
  // The filled portion is bind-proportion x progress, so the bar height is
  // driven by the data rather than baked into the keyframe.
  keyframes: [
    { t: 21.0 + i * 0.06, x: 0.10 + i * 0.065, y: 0.38, w: 0.045, h: 0.34, opacity: 1, progress: 0 },
    { t: 22.2 + i * 0.06, x: 0.10 + i * 0.065, y: 0.38, w: 0.045, h: 0.34, opacity: 1, progress: 1, ease: "easeOutCubic" },
  ],
  start_time: 21, end_time: 30,
}));

/** Animated arc — the workforce gauge. easePath equivalent, NOT a bar. */
const gauge = [{
  type: "arc",
  variable_name: "percent_skilled",
  bind: { value: "percent_skilled", min: 0, max: 100 },
  strokecolor: "#B2832Cff",
  strokewidth: 0.02,
  z: 1,
  keyframes: [
    { t: 31.0, x: 0.18, y: 0.30, w: 0.20, h: 0.20, opacity: 1, progress: 0 },
    { t: 32.6, x: 0.18, y: 0.30, w: 0.20, h: 0.20, opacity: 1, progress: 1, ease: "easeInOutCubic" },
  ],
  start_time: 31, end_time: 38,
}];

/** Motion — a panel that travels bottom to top. */
const movingPanel = [
  text({
    variable_name: "total_workers",
    text: "total_workers",
    fontsize: 0.06,
    alignment: "center",
    textStyle: { B: "bold" },
    start_time: 31, end_time: 38,
    keyframes: [
      { t: 31.0, x: 0.55, y: 0.62, w: 0.30, h: 0.10, opacity: 0 },
      { t: 32.4, x: 0.55, y: 0.42, w: 0.30, h: 0.10, opacity: 1, ease: "easeOutCubic" },
    ],
  }),
];

/** Conditional — only renders when commitment_status_ok is false. */
const conditional = [
  text({
    variable_name: "alert_text",
    text: "Alerts: attention required on wage protection compliance.",
    isStatic: true,
    textbox_x: 0.10, textbox_y: 0.62, textbox_w: 0.80, textbox_h: 0.10,
    start_time: 24, end_time: 30,
    fontcolor: "#A0392Aff",
    visibleIf: { var: "commitment_status_ok", op: "eq", value: false },
  }),
];

/** Clickable links — must open a new tab WITHOUT pausing the video. */
const links = [
  { v: "statement_url", label: "Download PDF", x: 0.10 },
  { v: "vision_url",    label: "Our Vision",   x: 0.34 },
  { v: "ministry_url",  label: "MOHRE Website", x: 0.58 },
  { v: "support_url",   label: "Support",      x: 0.82 },
].map(({ v, label, x }) =>
  text({
    type: "link",
    variable_name: v,
    text: label,
    isStatic: true,
    href: { var: v },
    textbox_x: x, textbox_y: 0.86, textbox_w: 0.16, textbox_h: 0.05,
    start_time: 5, end_time: 40,
    fontcolor: "#B2832Cff",
    alignment: "center",
    textStyle: { U: "underline" },
    z: 5,
  })
);

export const fixtureCaptions = [
  ...legacy,
  ...overview,
  ...ownerTable,
  ...wpsBars,
  ...gauge,
  ...movingPanel,
  ...conditional,
  ...links,
];

export const fixtureElementCount = fixtureCaptions.length;
