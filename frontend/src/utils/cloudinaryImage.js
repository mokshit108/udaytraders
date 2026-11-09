export const catalogueImg = (url, width = 600) =>
  url && url.includes("/upload/") ? url.replace("/upload/", `/upload/f_auto,q_auto,w_${width}/`) : url;

export const PLACEHOLDER_IMG =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='600' viewBox='0 0 600 600'>
      <rect width='600' height='600' fill='#e2e8f0'/>
      <g fill='#94a3b8' font-family='Arial, sans-serif'>
        <rect x='215' y='190' width='170' height='220' rx='12' fill='#cbd5e1'/>
        <rect x='235' y='210' width='130' height='140' rx='6' fill='#e2e8f0'/>
        <text x='300' y='460' text-anchor='middle' font-size='24'>Image coming soon</text>
      </g>
    </svg>`
  );
