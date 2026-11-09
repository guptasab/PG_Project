#!/usr/bin/env bash
PORT=${1:-5000}
echo "=============================================="
echo "⚡ Starting RIVALS 3D FPS Game Server..."
echo "🎮 Open http://localhost:$PORT in your browser"
echo "=============================================="
python3 -m http.server "$PORT"
