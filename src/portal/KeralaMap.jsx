import React from "react";

const regions = [
  [
    "kasaragod",
    "Kasaragod",
    "310,42 329,51 343,48 358,67 355,82 373,100 353,117 330,95 317,74",
    341,
    80,
  ],
  [
    "kannur",
    "Kannur",
    "330,95 353,117 373,100 388,112 389,137 407,145 398,167 377,180 352,147",
    370,
    137,
  ],
  [
    "wayanad",
    "Wayanad",
    "389,112 414,108 426,127 449,136 454,160 433,175 407,164 407,145 389,137",
    424,
    145,
  ],
  [
    "kozhikode",
    "Kozhikode",
    "352,147 377,180 398,167 407,164 418,192 414,211 389,226 375,197",
    390,
    196,
  ],
  [
    "malappuram",
    "Malappuram",
    "389,226 414,211 418,192 433,175 454,185 466,210 451,230 431,250 404,257",
    432,
    223,
  ],
  [
    "palakkad",
    "Palakkad",
    "454,185 474,191 485,208 518,220 526,243 508,258 482,260 465,277 431,250 451,230 466,210",
    480,
    236,
  ],
  [
    "thrissur",
    "Thrissur",
    "404,257 431,250 465,277 482,260 491,286 477,306 449,311 428,306 416,288",
    447,
    281,
  ],
  [
    "ernakulam",
    "Ernakulam",
    "428,306 449,311 477,306 491,286 506,309 505,337 484,350 465,357 442,348",
    468,
    330,
  ],
  [
    "idukki",
    "Idukki",
    "506,309 523,286 546,291 556,316 550,345 570,370 563,399 541,407 527,382 504,371 484,350 505,337",
    532,
    353,
  ],
  [
    "kottayam",
    "Kottayam",
    "465,357 484,350 504,371 527,382 521,403 492,407 478,390",
    495,
    382,
  ],
  [
    "alappuzha",
    "Alappuzha",
    "442,348 465,357 478,390 492,407 483,434 466,416 453,387",
    469,
    397,
  ],
  [
    "pathanamthitta",
    "Pathanamthitta",
    "492,407 521,403 527,382 541,407 563,399 564,426 548,445 527,442 511,454 483,434",
    524,
    423,
  ],
  [
    "kollam",
    "Kollam",
    "483,434 511,454 527,442 548,445 549,464 564,479 548,493 523,486 508,465",
    524,
    467,
  ],
  [
    "thiruvananthapuram",
    "Thiruvananthapuram",
    "523,486 548,493 564,479 575,497 571,516 582,535 569,555 551,535 540,516",
    557,
    518,
  ],
];

function Palm({ x, y, size = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${size})`} className="map-palm">
      <path d="M0 15 Q5 3 1 -8" fill="none" stroke="#797b4c" strokeWidth="2" />
      <path
        d="M1-8 Q-11-19-16-6 Q-8-12 1-8 M1-8 Q-3-24 6-22 Q3-16 1-8 M1-8 Q16-21 18-10 Q9-13 1-8 M1-8 Q16-10 14 0 Q8-7 1-8 M1-8 Q-12-10-12 0 Q-5-7 1-8"
        fill="#467956"
      />
    </g>
  );
}

export default function KeralaMap({ selected, onSelect, visited, zoom }) {
  return (
    <svg
      className="kerala-map"
      viewBox="0 0 1000 590"
      role="group"
      aria-label="Interactive illustrated map of the 14 districts of Kerala"
    >
      <defs>
        <pattern id="paper" width="8" height="8" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="2" r=".5" fill="#75826a" opacity=".09" />
          <circle cx="5" cy="6" r=".4" fill="#75826a" opacity=".1" />
        </pattern>
        <pattern
          id="water"
          width="45"
          height="30"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M4 15q6-3 12 0t12 0"
            stroke="#a2c2c0"
            strokeWidth=".7"
            fill="none"
            opacity=".22"
          />
        </pattern>
        <filter id="landShadow">
          <feDropShadow
            dx="0"
            dy="4"
            stdDeviation="5"
            floodColor="#516651"
            floodOpacity=".13"
          />
        </filter>
        <clipPath id="landClip">
          {regions.map((r) => (
            <polygon key={r[0]} points={r[2]} />
          ))}
        </clipPath>
      </defs>
      <rect width="1000" height="590" fill="#f0f0e7" />
      <path
        d="M0 0H303Q316 110 374 203T434 353T527 528L570 590H0Z"
        fill="#e3eeea"
      />
      <path
        d="M0 0H294Q307 110 365 203T425 353T518 528L561 590H0Z"
        fill="url(#water)"
      />
      <path
        d="M300-10Q325 118 375 198T439 350T538 543L576 600"
        fill="none"
        stroke="#c8dcd0"
        strokeWidth="2"
        opacity=".7"
      />
      <g opacity=".27" fill="none" stroke="#c6cdb8" strokeWidth="1">
        <path d="M450-20Q390 68 480 115T569 265T632 429T689 610" />
        <path d="M476-20Q416 68 506 115T595 265T658 429T715 610" />
        <path d="M510-20Q450 68 540 115T629 265T692 429T749 610" />
        <path d="M549-20Q489 68 579 115T668 265T731 429T788 610" />
      </g>
      <rect width="1000" height="590" fill="url(#paper)" />
      <g
        className="map-geography"
        style={{
          transform: `translate(${(1 - zoom) * 460}px, ${(1 - zoom) * 295}px) scale(${zoom})`,
        }}
      >
        <g filter="url(#landShadow)">
          {regions.map(([id, name, points], i) => (
            <polygon
              key={id}
              points={points}
              fill={
                selected === id
                  ? "#9fbc7b"
                  : visited.includes(id)
                    ? "#bfd09c"
                    : ["#c5d4ac", "#b4c99c", "#aabe92", "#cedab5"][i % 4]
              }
              stroke="#f4f1dc"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          ))}
        </g>
        <g clipPath="url(#landClip)" pointerEvents="none">
          {Array.from({ length: 115 }, (_, i) => {
            const x = 330 + ((i * 47) % 250),
              y = 55 + ((i * 73) % 480);
            return (
              <g key={i}>
                <ellipse
                  cx={x}
                  cy={y + 3}
                  rx="10"
                  ry="6"
                  fill="#648958"
                  opacity=".10"
                />
                <circle
                  cx={x}
                  cy={y}
                  r={5 + (i % 5)}
                  fill="#71945f"
                  opacity=".16"
                />
              </g>
            );
          })}
          <path
            d="M429 150q-23 24 0 51t-6 39m83 60q-37 11-27 30t-26 19m87 13q-39 9-29 32t-29 17"
            fill="none"
            stroke="#7eafab"
            strokeWidth="2"
            opacity=".7"
          />
          <path
            d="M462 354q-13 31 16 60"
            stroke="#88b3a7"
            strokeWidth="6"
            fill="none"
          />
          <path
            d="M467 357q-10 22 9 44"
            stroke="#d7e7ca"
            strokeWidth="2"
            fill="none"
          />
          {[
            [418, 128],
            [439, 150],
            [465, 203],
            [510, 246],
            [535, 309],
            [544, 337],
            [551, 377],
            [545, 414],
          ].map(([x, y], i) => (
            <g key={i} transform={`translate(${x} ${y})`}>
              <path d="M-10 9L0-10 12 9Z" fill="#789363" opacity=".5" />
              <path d="M0-10L12 9H3Z" fill="#537952" opacity=".35" />
              <path d="M-3-4L0-10 4-3 0-5Z" fill="#e6e7ca" />
            </g>
          ))}
        </g>
        {[
          [331, 87, 0.6],
          [361, 156, 0.65],
          [382, 212, 0.6],
          [411, 269, 0.65],
          [435, 323, 0.55],
          [453, 371, 0.55],
          [493, 448, 0.6],
          [543, 517, 0.6],
          [509, 342, 0.6],
          [396, 132, 0.5],
        ].map(([x, y, s], i) => (
          <Palm key={i} x={x} y={y} size={s} />
        ))}
        {regions.map(([id, name, points, x, y]) => (
          <g
            key={id}
            className={`district-region ${selected === id ? "selected" : ""}`}
            tabIndex="0"
            role="button"
            aria-label={`Explore ${name}${visited.includes(id) ? ", visited" : ""}`}
            onClick={() => onSelect(id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect(id);
              }
            }}
          >
            <polygon
              className="district-hit"
              points={points}
              fill="transparent"
            />
            <circle
              cx={x}
              cy={y - 4}
              r={selected === id ? 6 : 3}
              fill={selected === id ? "#fff9e8" : "#42614a"}
              stroke={selected === id ? "#234c37" : "#f0efda"}
              strokeWidth={selected === id ? 3 : 1.4}
            />
            <text
              x={x + (id === "wayanad" || id === "idukki" ? 13 : -10)}
              y={y + 13}
              textAnchor={
                id === "wayanad" || id === "idukki" ? "start" : "middle"
              }
              className="district-label"
            >
              {name}
            </text>
          </g>
        ))}
        <g transform="translate(395 384)" pointerEvents="none">
          <path d="M-24 5Q0 15 26 4L19 12Q0 21-19 11Z" fill="#805d3c" />
          <path d="M-15 4V-7Q0-18 16-7V5Z" fill="#c6a471" />
          <path
            d="M-17-5Q0-21 18-5"
            fill="none"
            stroke="#735c3d"
            strokeWidth="2"
          />
          <path d="M-8-6V3M0-8V3M8-6V3" stroke="#806545" strokeWidth="2" />
          <path d="M-28 22q15-4 29 0t26 0" fill="none" stroke="#a2c1bb" />
        </g>
        <g transform="translate(336 121)" pointerEvents="none">
          <path d="M-13 6V-8H-8V-13H-3V-8H3V-13H8V-8H13V6Z" fill="#988e70" />
          <path d="M-4 6V-1Q0-8 4-1V6" fill="#5d7053" />
        </g>
      </g>
      <text
        x="230"
        y="338"
        className="sea-label"
        transform="rotate(-24 230 338)"
      >
        Arabian Sea
      </text>
      <text x="561" y="160" className="neighbor-label">
        TAMIL NADU
      </text>
      <text x="391" y="35" className="neighbor-label">
        KARNATAKA
      </text>
      <g transform="translate(70 446)" className="compass">
        <text x="0" y="-33" textAnchor="middle">
          N
        </text>
        <path d="M0-25L6 0 0-4-6 0Z" fill="#476355" />
        <path d="M0 25L6 0 0 4-6 0Z" fill="#b6c5b5" />
        <path d="M-20 0H20M0-24V25" stroke="#476355" strokeWidth=".7" />
        <circle r="13" fill="none" stroke="#8eaa98" strokeWidth=".7" />
      </g>
    </svg>
  );
}
