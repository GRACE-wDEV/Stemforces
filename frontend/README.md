# STEMFORCES Frontend

A modern, cross-platform STEM learning platform built with React, featuring PWA support for mobile and Electron for desktop.

## 🚀 Features

- **Progressive Web App (PWA)** - Install on any mobile device
- **Desktop App (Electron)** - Native Windows, macOS, and Linux apps
- **AI-Powered Tutoring** - Personalized learning with Gemini AI
- **Quizzes & Challenges** - Daily challenges, custom quizzes, and battles
- **Achievement System** - Gamified learning with badges and streaks
- **Leaderboards** - Compete with other learners

## 📦 Tech Stack

- **React 19** - UI framework
- **Vite 7** - Build tool
- **Tailwind CSS 4** - Styling
- **Zustand** - State management
- **TanStack Query** - Data fetching
- **Electron** - Desktop app framework
- **PWA (vite-plugin-pwa)** - Mobile installability

---

## 🌐 Web Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 📱 PWA (Progressive Web App)

The app is automatically a PWA when built for production. Users can install it from their browser:

### How users install the PWA:
1. Visit the deployed web app in Chrome/Safari/Edge
2. Click "Install" prompt or use browser menu → "Install app"
3. The app will be added to their home screen

### PWA Features:
- Offline caching of static assets
- App-like experience with no browser UI
- Automatic updates
- Add to home screen

---

## 🖥️ Desktop App (Electron)

### Development Mode

```bash
# Run Electron in development mode (hot reload)
npm run electron:dev
```

This starts both the Vite dev server and Electron, with hot reload enabled.

### Building Desktop Apps

```bash
# Build for current platform
npm run electron:build

# Build for Windows only
npm run electron:build:win

# Build for macOS only
npm run electron:build:mac

# Build for Linux only
npm run electron:build:linux

# Build for all platforms
npm run electron:build:all
```

### Output Files

Built applications are output to the `release/` folder:

| Platform | Outputs |
|----------|---------|
| Windows | `.exe` installer, portable `.exe` |
| macOS | `.dmg` installer |
| Linux | `.AppImage`, `.deb` |

### System Requirements

- **Windows**: Windows 10+ (64-bit)
- **macOS**: macOS 10.13+ (Intel & Apple Silicon)
- **Linux**: Ubuntu 18.04+, Debian 9+, Fedora 30+

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the frontend folder:

```env
# API base URL (optional - defaults to localhost:5000)
VITE_API_BASE=https://your-api.com/api
```

### Backend Connection

The desktop app connects to the backend via HTTP. Ensure your backend is running:

```bash
# In the backend folder
npm run dev
```

---

## 🏗️ Project Structure

```
frontend/
├── electron/           # Electron main process
│   ├── main.js        # Main process entry
│   └── preload.js     # Preload script (secure IPC)
├── public/            # Static assets
│   ├── logo1.png     # App icon
│   └── logo.svg      # Vector logo
├── src/
│   ├── api/          # API client
│   ├── components/   # React components
│   ├── pages/        # Page components
│   ├── stores/       # Zustand stores
│   └── hooks/        # Custom hooks
├── dist/             # Production build output
├── release/          # Electron build output
├── package.json      # Dependencies & scripts
└── vite.config.js    # Vite configuration
```

---

## 🔐 Security

- **Context Isolation** - Electron renderer is sandboxed
- **Preload Scripts** - Secure IPC communication
- **CSP Headers** - Content Security Policy enabled
- **HTTPS** - Production should use HTTPS

---

## 📄 License

MIT License

