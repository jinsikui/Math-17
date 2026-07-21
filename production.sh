#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

ACTION="${1:-run}"
HOST="${HOST:-127.0.0.1}"
PORT="${PORT:-4173}"
MATH17_EDITING_ENABLED="${MATH17_EDITING_ENABLED:-0}"
RUN_DIR="${RUN_DIR:-.runtime}"
PID_FILE="${PID_FILE:-$RUN_DIR/math-17-production.pid}"
SERVER_SCRIPT="server/site-server.js"

require_command() {
  local command_name="$1"

  if command -v "$command_name" >/dev/null 2>&1; then
    return
  fi

  echo "未找到 $command_name，请先安装 Node.js 和 npm。" >&2
  exit 1
}

is_enabled() {
  case "$1" in
    1|true|TRUE|yes|YES|on|ON)
      return 0
      ;;
    *)
      return 1
      ;;
  esac
}

is_project_server() {
  local pid="$1"
  local command_line

  command_line="$(ps -p "$pid" -o command= 2>/dev/null || true)"
  [[ "$command_line" == *"node"* && "$command_line" == *"$SERVER_SCRIPT"* ]]
}

list_port_pids() {
  if ! command -v lsof >/dev/null 2>&1; then
    return
  fi

  lsof -nP -iTCP:"$PORT" -sTCP:LISTEN -t 2>/dev/null || true
}

wait_for_stop() {
  local pid="$1"

  for _ in {1..20}; do
    if ! kill -0 "$pid" >/dev/null 2>&1; then
      return 0
    fi

    sleep 0.25
  done

  return 1
}

stop_pid() {
  local pid="$1"
  local source="$2"

  if ! kill -0 "$pid" >/dev/null 2>&1; then
    return
  fi

  if ! is_project_server "$pid"; then
    echo "跳过 $source 中的 PID $pid：不是本项目生产服务。"
    return
  fi

  echo "停止旧生产服务 PID $pid。"
  kill "$pid"

  if wait_for_stop "$pid"; then
    return
  fi

  echo "旧服务未正常退出，强制停止 PID $pid。"
  kill -9 "$pid" >/dev/null 2>&1 || true
}

stop_existing_server() {
  mkdir -p "$RUN_DIR"

  if [ -f "$PID_FILE" ]; then
    local recorded_pid
    recorded_pid="$(cat "$PID_FILE")"

    if [[ "$recorded_pid" =~ ^[0-9]+$ ]]; then
      stop_pid "$recorded_pid" "$PID_FILE"
    fi

    rm -f "$PID_FILE"
  fi

  local port_pids
  port_pids="$(list_port_pids)"

  for pid in $port_pids; do
    if is_project_server "$pid"; then
      stop_pid "$pid" "端口 $PORT"
    else
      echo "端口 $PORT 已被其他进程 PID $pid 占用，请换 PORT 或手动处理。" >&2
      exit 1
    fi
  done
}

install_dependencies() {
  require_command node
  require_command npm

  if [ -f package-lock.json ]; then
    npm ci
  else
    npm install
  fi
}

build_site() {
  npm run build
}

run_server() {
  rm -f "$PID_FILE"

  export HOST
  export PORT
  export MATH17_EDITING_ENABLED

  echo "生产服务运行中。"
  echo "地址：http://$HOST:$PORT/"

  if is_enabled "$MATH17_EDITING_ENABLED"; then
    echo "编辑：已开启"
  else
    echo "编辑：已关闭"
  fi

  echo "按 Ctrl+C 停止服务。"
  exec node "$SERVER_SCRIPT"
}

show_status() {
  local found=0
  local port_pids

  port_pids="$(list_port_pids)"

  for pid in $port_pids; do
    if is_project_server "$pid"; then
      echo "生产服务正在运行。"
      echo "PID：$pid"
      echo "地址：http://$HOST:$PORT/"
      found=1
    else
      echo "端口 $PORT 被其他进程 PID $pid 占用。"
      found=1
    fi
  done

  if [ -f "$PID_FILE" ]; then
    local recorded_pid
    recorded_pid="$(cat "$PID_FILE")"

    if ! [[ "$recorded_pid" =~ ^[0-9]+$ ]] || ! kill -0 "$recorded_pid" >/dev/null 2>&1; then
      echo "已清理陈旧 PID 文件。"
      rm -f "$PID_FILE"
    fi
  fi

  if [ "$found" -eq 0 ]; then
    echo "没有检测到运行中的生产服务。"
  fi
}

case "$ACTION" in
  run|restart|start)
    install_dependencies
    build_site
    stop_existing_server
    run_server
    ;;
  build)
    install_dependencies
    build_site
    ;;
  stop)
    stop_existing_server
    echo "生产服务已停止。"
    ;;
  status)
    show_status
    ;;
  *)
    echo "用法：$0 [run|restart|start|build|stop|status]" >&2
    exit 1
    ;;
esac
