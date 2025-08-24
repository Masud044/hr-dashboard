export default function DonutChart({ data = [], size = 140, thickness = 16 }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;

  let offset = 0;
  const segments = data.map((d, i) => {
    const frac = d.value / total;
    const dash = circumference * frac;
    const seg = (
      <circle
        key={i}
        r={radius}
        cx={size / 2}
        cy={size / 2}
        fill="transparent"
        stroke={d.color}
        strokeWidth={thickness}
        strokeDasharray={`${dash} ${circumference - dash}`}
        strokeDashoffset={-offset}
      />
    );
    offset += dash;
    return seg;
  });

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="-rotate-90"
    >
      <circle
        r={radius}
        cx={size / 2}
        cy={size / 2}
        fill="transparent"
        stroke="#f3f4f6"
        strokeWidth={thickness}
      />
      {segments}
    </svg>
  );
}
