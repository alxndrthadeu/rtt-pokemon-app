#!/bin/bash
# Disparado pelo PostToolUse hook após cada Bash tool call.
# Se detectar um git commit bem-sucedido, injeta instrução para rodar os 4 agentes.

INPUT=$(cat)

# Extrai o comando e o exit code do JSON recebido via stdin
if command -v jq &>/dev/null; then
    COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // ""' 2>/dev/null)
    EXIT_CODE=$(echo "$INPUT" | jq -r '.tool_response.exit_code // 1' 2>/dev/null)
else
    COMMAND=$(echo "$INPUT" | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    print(d.get('tool_input', {}).get('command', ''))
except:
    print('')
" 2>/dev/null)
    EXIT_CODE=$(echo "$INPUT" | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    print(d.get('tool_response', {}).get('exit_code', 1))
except:
    print(1)
" 2>/dev/null)
fi

# Só dispara em git commit bem-sucedido (exit code 0)
if echo "$COMMAND" | grep -qE "git commit" && [ "$EXIT_CODE" = "0" ]; then
    echo "🤖 REVISÃO AUTOMÁTICA OBRIGATÓRIA: Commit detectado. Conforme CLAUDE.md, execute AGORA os 4 agentes em paralelo (uma única mensagem com 4 Agent tool calls): senior-engineer, senior-designer, senior-qa, game-tester. Cada um deve rodar git diff HEAD~1 HEAD e reportar findings. Não responda ao usuário antes de consolidar os resultados."
    exit 2
fi

exit 0
