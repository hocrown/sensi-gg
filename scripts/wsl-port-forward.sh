#!/bin/bash
# WSL2 → Windows localhost 포트 포워딩 자동 설정
# WSL 재시작 시 IP가 변경되므로 매번 실행 필요
#
# 사용법:
#   bash scripts/wsl-port-forward.sh          # 기본 포트 (3000, 3747)
#   bash scripts/wsl-port-forward.sh 3000     # 특정 포트만
#   bash scripts/wsl-port-forward.sh --clean  # 프록시 제거

set -e

WSL_IP=$(hostname -I | awk '{print $1}')
PORTS="${@:-3000 3747}"

if [ "$1" = "--clean" ]; then
  echo "Removing all port proxies..."
  powershell.exe -Command "Start-Process powershell -ArgumentList '-Command', 'netsh interface portproxy reset' -Verb RunAs" 2>/dev/null
  echo "Done."
  exit 0
fi

echo "WSL IP: $WSL_IP"
echo "Forwarding ports: $PORTS"

# Build netsh commands
CMDS=""
for PORT in $PORTS; do
  CMDS="$CMDS netsh interface portproxy delete v4tov4 listenport=$PORT listenaddress=127.0.0.1 2>\$null;"
  CMDS="$CMDS netsh interface portproxy add v4tov4 listenport=$PORT listenaddress=127.0.0.1 connectport=$PORT connectaddress=$WSL_IP;"
done
CMDS="$CMDS netsh interface portproxy show all"

powershell.exe -Command "Start-Process powershell -ArgumentList '-Command', '$CMDS' -Verb RunAs" 2>/dev/null

sleep 2

echo ""
echo "Port forwarding configured:"
for PORT in $PORTS; do
  echo "  localhost:$PORT → $WSL_IP:$PORT"
done
echo ""
echo "Test: http://localhost:3000"
