# 🎱 Multiplayer BINGO – Production-Quality Real-Time Web Game

A complete, server-authoritative multiplayer 75-ball Bingo game built with **FastAPI** (Python), **React + TypeScript + Vite**, **WebSockets**, **SHA-256 Cryptographic Commitments**, and **Docker Compose**. Designed for multiple people playing together simultaneously on their own phones or computers.

---

## 🌟 Key Features

* **⚡ Real-Time WebSockets:** Instant number calling, turn progression, and live lobby updates with automatic reconnection and keepalive heartbeats.
* **🛡️ Server-Authoritative State:** The backend strictly controls turns, validates number ranges, rejects duplicate calls, and independently verifies all Bingo claims.
* **🎲 Verifiable Cryptographic Fairness:**
  * Uses Python's cryptographically secure `secrets` module and SHA-256 counter-mode PRNG.
  * Combines server seed + game ID + player ID + player entropy (`SHA-256`).
  * Server pre-commits to its seed hash before player entropy is finalized.
  * Server creates cryptographic card commitments `SHA256(canonical_card + secret_nonce)`.
  * Fully auditable post-game verification endpoint and UI modal to reproduce card generation.
* **📱 Modern Mobile-First UI:**
  * Clean, high-energy gaming aesthetics built with Tailwind CSS.
  * Responsive layout with prominent touch targets down to 320px screens.
  * Column filter tabs (ALL, B, I, N, G, O) for rapid mobile number selection.
  * QR Code modal and 1-click shareable links for instant player onboarding.
  * Sound effects synthesized via Web Audio API (with mute toggle) and confetti celebration respecting `prefers-reduced-motion`.
* **🔄 Seamless Reconnection:** Session tokens stored per browser tab allow players to safely reconnect if Wi-Fi drops without losing game state.
* **🐳 Production Ready:** Fully containerized with Docker and Docker Compose.

---

## 🏗️ System Architecture

```
                    FASTAPI (Authoritative Backend)
                                   │
             ┌─────────────────────┼─────────────────────┐
             │                     │                     │
          PLAYERS                TURNS             CALLED NUMBERS
             │                     │                     │
             └─────────────────────┼─────────────────────┘
                                   │
                              GAME MANAGER
                                   │
                               WebSocket
                                   │
             ┌─────────────────────┼─────────────────────┐
             ▼                     ▼                     ▼
          PLAYER A              PLAYER B              PLAYER C
             │                     │                     │
          Own card              Own card              Own card
             │                     │                     │
       Local marking         Local marking         Local marking
             │                     │                     │
        Local Bingo           Local Bingo           Local Bingo
             │
             ▼
        "BINGO!" CLAIM
             │
             ▼
          FASTAPI (Independent Server Validation)
             │
             ▼
          🏆 WINNER (First Valid Claim Wins)
             │
             ▼
       BROADCAST RESULT
```

### State Division
* **Backend Authority (FastAPI):** Game lifecycle, player sessions, lobby state, turn order, called numbers set, authoritative cards, secret nonces, Bingo claim verification, winner declaration, post-game audit.
* **Client Responsibilities (React):** Rendering cards, animations, responsive number selector, local pattern detection (`"BINGO AVAILABLE!"` alert), audio playback, submitting user actions.

---

## 🔒 Cryptographic Fairness & Anti-Cheat

### 1. Card Generation
Cards strictly obey traditional 75-ball column constraints:
* **B:** 5 unique numbers from `1–15`
* **I:** 5 unique numbers from `16–30`
* **N:** 4 unique numbers from `31–45` (`FREE` space at center `[2][2]`)
* **G:** 5 unique numbers from `46–60`
* **O:** 5 unique numbers from `61–75`

### 2. Entropy Mixing & Seed Derivation
```text
material = server_seed + ":" + game_id + ":" + player_id + ":" + player_entropy
derived_seed = SHA256(material)
```
The derived seed is used with a counter-mode PRNG and Fisher-Yates shuffle with rejection sampling for unbiased uniform card generation.

### 3. Commitments
* **Server Seed Commitment:** Published to all players in the lobby before entropy is finalized:
  $$\text{server\_seed\_hash} = \text{SHA256}(\text{server\_seed})$$
* **Card Commitment:**
  $$\text{card\_hash} = \text{SHA256}(\text{canonical\_card} + ":" + \text{secret\_nonce})$$

### 4. Post-Game Verifiable Audit
When the game ends, the server reveals `server_seed`. Any player can inspect or compute:
1. That $\text{SHA256}(\text{server\_seed}) == \text{server\_seed\_hash}$.
2. That re-running the deterministic PRNG on their seed yields the exact same 25-cell card.
3. That $\text{SHA256}(\text{canonical\_card} + \text{nonce}) == \text{card\_hash}$.

---

## 🚀 Quick Start (Local Development)

### Prerequisites
* **Python 3.11+**
* **Node.js 18+** / npm

### 1. Backend Setup
```bash
cd backend
python -m venv venv

# Windows:
.\venv\Scripts\activate
# Linux / macOS:
# source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be running at `http://localhost:8000`. API docs available at `http://localhost:8000/docs`.

### 2. Frontend Setup
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```

Frontend will be available at `http://localhost:5173`.

---

## 🐳 Docker Deployment

To launch the complete production stack (Backend + Frontend served via Nginx with WebSocket reverse proxy):

```bash
docker compose up --build
```

Access the game in your browser at `http://localhost`.

---

## 🧪 Running Automated Tests

Run the backend test suite with `pytest`:

```bash
# From the repository root
python -m pytest backend/tests -v
```

### Test Coverage Highlights:
* **Card Generation:** Column boundaries (B: 1-15, I: 16-30, N: 31-45, G: 46-60, O: 61-75), no duplicate cells, center `FREE` cell, deterministic reproducibility from seed, commitment verification.
* **Turn System:** Starting player randomization, strict turn rotation, rejection of out-of-turn calls, invalid numbers (`0`, `76`, negatives), duplicate number rejection.
* **Bingo Validation:** Server-side validation of rows, columns, main diagonals, anti-diagonals, uncalled numbers, and rejection of claims after game finish.
* **Reconnection & Lifecycle:** Full game lifecycle, session token validation, and state restoration on reconnect.

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
| Variable | Default | Description |
| :--- | :--- | :--- |
| `HOST` | `0.0.0.0` | Bind address |
| `PORT` | `8000` | Port for FastAPI server |
| `ENVIRONMENT` | `development` | Environment mode (`development` / `production`) |
| `CORS_ORIGINS` | `["*"]` | Allowed CORS origins list |
| `DISCONNECT_TIMEOUT_SECONDS` | `30` | Seconds before auto-skipping a disconnected player's turn |

### Frontend (`frontend/.env`)
| Variable | Default | Description |
| :--- | :--- | :--- |
| `VITE_API_URL` | Auto (`/api`) | Backend REST API base URL |
| `VITE_WS_URL` | Auto (`/ws`) | Backend WebSocket base URL |

---

## ⚠️ Architecture Limitations & Scalability Notes

* **In-Memory Storage:** The initial implementation holds game state in memory within the `GameManager` instance. If the backend process restarts, active games reset.
* **Horizontal Scaling:** For multi-instance horizontal scaling across multiple FastAPI instances, state should be backed by a shared Redis instance with Redis Pub/Sub for cross-worker WebSocket broadcast.

---

## 📜 License

MIT License. Designed and built with ❤️.
