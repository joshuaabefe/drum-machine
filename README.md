# 🥁 BEATBOX 909 — Drum Machine

> An interactive, browser-based drum machine built with pure HTML, CSS, and JavaScript. No frameworks. No dependencies. Just beats.

---

## ✨ Features

- 🎹 **9 Drum Pads** — Kick, Snare, Hi-Hat, Clap, Tom, Open Hat, Rim, Crash, Perc
- ⌨️ **Keyboard Support** — Trigger pads with `Q W E / A S D / Z X C`
- 🖱️ **Mouse / Touch** — Click or tap any pad
- 🔊 **Web Audio API** — All sounds synthesized live in the browser (no audio files needed)
- 🕐 **Live Clock** — Real-time date and time display
- 🌙 **Dark & Light Mode** — Toggle with the ☀️/🌙 button
- 🔈 **Volume Control** — Vertical slider to adjust output level
- ⚡ **Power Toggle** — Turn the machine on and off
- 📱 **Fully Responsive** — Works on desktop, tablet, and mobile
- 🎨 **Custom Favicon** — Drum pad icon matching the color palette

---

## 🎮 How to Play

| Action | Control |
|---|---|
| Play **Kick** | Click pad or press `Q` |
| Play **Snare** | Click pad or press `W` |
| Play **Hi-Hat** | Click pad or press `E` |
| Play **Clap** | Click pad or press `A` |
| Play **Tom** | Click pad or press `S` |
| Play **Open Hat** | Click pad or press `D` |
| Play **Rim** | Click pad or press `Z` |
| Play **Crash** | Click pad or press `X` |
| Play **Perc** | Click pad or press `C` |
| Adjust volume | Drag the vertical slider |
| Toggle theme | Click the ☀️ / 🌙 button |
| Power on/off | Flip the **PWR** switch |

---

## 🚀 Getting Started

### Option 1 — Node.js (recommended)

```bash
# Clone the repo
git clone https://github.com/joshuaabefe/drum-machine.git
cd drum-machine

# Serve locally
npx serve .
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

### Option 2 — Python

```bash
cd drum-machine
python3 -m http.server 8080
```

Then open [http://localhost:8080](http://localhost:8080).

### Option 3 — VS Code Live Server

1. Open the project folder in VS Code
2. Install the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension
3. Right-click `index.html` → **Open with Live Server**

> ⚠️ **Do not** open `index.html` by double-clicking — browsers block the Web Audio API on `file://` URLs. Always use a local server.

---

## 📁 Project Structure

```
drum-machine/
├── index.html        # App structure and markup
├── style.css         # Styling, themes, animations
├── script.js         # Audio synthesis, interactions, clock
├── favicon.ico       # Browser tab icon
├── favicon.png       # High-res favicon + Apple touch icon
├── .gitignore        # Git ignored files
├── LICENSE           # MIT License
└── README.md         # You are here
```

---

## 🎨 Color Palette

| Swatch | Hex | Usage |
|---|---|---|
| ![#023047](https://placehold.co/16x16/023047/023047.png) | `#023047` | Background, card |
| ![#219EBC](https://placehold.co/16x16/219EBC/219EBC.png) | `#219EBC` | Drum pads |
| ![#8ECAE6](https://placehold.co/16x16/8ECAE6/8ECAE6.png) | `#8ECAE6` | Text, key labels |
| ![#FFB703](https://placehold.co/16x16/FFB703/FFB703.png) | `#FFB703` | Active glow, screen |
| ![#FB8500](https://placehold.co/16x16/FB8500/FB8500.png) | `#FB8500` | Accents, orange pop |

---

## 🛠️ Built With

- **HTML5** — Semantic markup
- **CSS3** — Custom properties, Grid, Flexbox, keyframe animations
- **Vanilla JavaScript** — DOM manipulation, Web Audio API, event handling
- **Google Fonts** — [Oswald](https://fonts.google.com/specimen/Oswald) + [Share Tech Mono](https://fonts.google.com/specimen/Share+Tech+Mono)
- **Web Audio API** — Real-time drum sound synthesis (no `.wav` files)

---

## 🔊 How the Audio Works

All drum sounds are **synthesized in real time** using the browser's built-in Web Audio API — no audio files are loaded or required. Each sound is crafted from:

- `OscillatorNode` — generates pitched tones (kick, tom, rim, perc)
- `AudioBuffer` (white noise) — for percussive textures (snare, hi-hat, clap, crash)
- `BiquadFilterNode` — shapes the frequency character of each sound
- `GainNode` — controls volume and envelope (attack / decay / release)

This means the app works **100% offline** after the first page load, with no CORS issues or MIME type errors.

---

## 📸 Screenshots

| Dark Mode | Light Mode |
|---|---|
| *(add screenshot)* | *(add screenshot)* |

---

## 🌐 Live Demo

👉 [https://beatbyjosh.netlify.app/](https://beatbyjosh.netlify.app/)

---

## 📜 License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for details.

---

## 👤 Author

**Joshua Abefe**
- Website: [joshuaabefe.github.io](https://joshuaabefe.github.io/)
- GitHub: [@joshuaabefe](https://github.com/joshuaabefe)

---

<p align="center">Copyright &copy; 2026 Joshua Abefe. All Rights Reserved.</p>
