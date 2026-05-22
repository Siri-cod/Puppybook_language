#!/bin/bash
cd "$(dirname "$0")"
PORT="${1:-8080}"
echo "Puppy Book: http://localhost:$PORT"
echo "Phone (same Wi-Fi): http://$(ipconfig getifaddr en0 2>/dev/null || hostname -I 2>/dev/null | awk '{print $1}'):$PORT"
python3 -m http.server "$PORT"
