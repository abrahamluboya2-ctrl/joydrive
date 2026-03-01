export PS1="[CMD_BEGIN]\n\u@\h:\w\n[CMD_END]"; export PS2=""
export TERM=xterm-256color
export OPENAI_API_KEY="sk-jU8EbPKbKkr5E9s85NQRBV"
export OPENAI_API_BASE="https://api.manus.im/api/llm-proxy/v1"
export OPENAI_BASE_URL="https://api.manus.im/api/llm-proxy/v1"
ps() { /bin/ps "$@" | grep -v -E '(start_server\.py|upgrade\.py|supervisor)' || true; }
pgrep() { /usr/bin/pgrep "$@" | while read pid; do [ -n "$pid" ] && cmdline=$(/bin/ps -p $pid -o command= 2>/dev/null) && ! echo "$cmdline" | grep -q -E '(start_server\.py|upgrade\.py|supervisor)' && echo "$pid"; done; }
source /home/ubuntu/.user_env && cd . && echo "Bonjour ! C'est une excellente idée. Pour créer un portfolio qui vous ressemble, j'ai besoin de quelques informations :

1. Quel est votre **domaine d'activité** (ex: design, development, photography, engineering, etc.) ?
2. Quel **style** préférez-vous (minimaliste, coloré, corporate, créatif, etc.) ?
3. Quelles **sections** souhaitez-vous inclure (ex: Accueil, Projets, À propos, Contact, Témoignages, etc.) ?
4. Avez-vous déjà des **conten reflect** (textes, images) ou préférez-vous que je commence par une structure avec du texte de remplissage ?

Une fois ces informations reçues, je pourrai commencer la conception de votre site."
export PS1="[CMD_BEGIN]\n\u@\h:\w\n[CMD_END]"; export PS2=""
export TERM=xterm-256color
export OPENAI_API_KEY="sk-jU8EbPKbKkr5E9s85NQRBV"
export OPENAI_API_BASE="https://api.manus.im/api/llm-proxy/v1"
export OPENAI_BASE_URL="https://api.manus.im/api/llm-proxy/v1"
ps() { /bin/ps "$@" | grep -v -E '(start_server\.py|upgrade\.py|supervisor)' || true; }
pgrep() { /usr/bin/pgrep "$@" | while read pid; do [ -n "$pid" ] && cmdline=$(/bin/ps -p $pid -o command= 2>/dev/null) && ! echo "$cmdline" | grep -q -E '(start_server\.py|upgrade\.py|supervisor)' && echo "$pid"; done; }
source /home/ubuntu/.user_env && cd . && cd /home/ubuntu && unzip -q "upload/joy_drive(1).zip" && ls -la
source /home/ubuntu/.user_env && cd . && cd /home/ubuntu && find . -maxdepth 2 -type f -name "*.ts" -o -name "*.tsx" | head -20
source /home/ubuntu/.user_env && cd . && cd /home/ubuntu && pnpm install 2>&1 | tail -50
