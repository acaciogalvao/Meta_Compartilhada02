#!/bin/bash

# Script de Validação - Meta Compartilhada
# Verifica se a integração entre frontend, backend e banco de dados está funcionando

set -e

echo "╔════════════════════════════════════════╗"
echo "║   Meta Compartilhada - Validação     ║"
echo "╚════════════════════════════════════════╝"
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir com cor
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Verificar estrutura de pastas
echo "═══════════════════════════════════════"
echo "1️⃣  Verificando Estrutura de Pastas"
echo "═══════════════════════════════════════"

FOLDERS=("mobile" "backend" "docs")
for folder in "${FOLDERS[@]}"; do
    if [ -d "$folder" ]; then
        print_status "Pasta '$folder' encontrada"
    else
        print_error "Pasta '$folder' não encontrada"
        exit 1
    fi
done

echo ""
echo "═══════════════════════════════════════"
echo "2️⃣  Verificando Arquivos Críticos"
echo "═══════════════════════════════════════"

# Backend
BACKEND_FILES=(
    "backend/package.json"
    "backend/tsconfig.json"
    "backend/src/index.ts"
    "backend/src/config/database.ts"
    "backend/src/models/Goal.ts"
    "backend/src/controllers/goalController.ts"
    "backend/src/routes/goalRoutes.ts"
    "backend/.env.example"
)

for file in "${BACKEND_FILES[@]}"; do
    if [ -f "$file" ]; then
        print_status "$file"
    else
        print_error "$file não encontrado"
    fi
done

echo ""

# Mobile
MOBILE_FILES=(
    "mobile/package.json"
    "mobile/app.config.ts"
    "mobile/app/(tabs)/_layout.tsx"
    "mobile/app/(tabs)/index.tsx"
    "mobile/app/(tabs)/goals.tsx"
    "mobile/app/create-goal.tsx"
    "mobile/components/GoalCard.tsx"
    "mobile/components/GoalForm.tsx"
    "mobile/hooks/useGoals.ts"
    "mobile/lib/services/api.ts"
    "mobile/.env.example"
)

for file in "${MOBILE_FILES[@]}"; do
    if [ -f "$file" ]; then
        print_status "$file"
    else
        print_error "$file não encontrado"
    fi
done

echo ""
echo "═══════════════════════════════════════"
echo "3️⃣  Verificando Dependências"
echo "═══════════════════════════════════════"

# Backend dependencies
if [ -d "backend/node_modules" ]; then
    print_status "Backend: node_modules instalado"
else
    print_warning "Backend: node_modules não encontrado"
    print_info "Execute: cd backend && npm install"
fi

# Mobile dependencies
if [ -d "mobile/node_modules" ]; then
    print_status "Mobile: node_modules instalado"
else
    print_warning "Mobile: node_modules não encontrado"
    print_info "Execute: cd mobile && npm install"
fi

echo ""
echo "═══════════════════════════════════════"
echo "4️⃣  Verificando Configurações"
echo "═══════════════════════════════════════"

# Backend .env
if [ -f "backend/.env" ]; then
    print_status "Backend: .env configurado"
    if grep -q "MONGODB_URI" backend/.env; then
        print_status "Backend: MONGODB_URI definido"
    else
        print_warning "Backend: MONGODB_URI não definido"
    fi
else
    print_warning "Backend: .env não encontrado"
    print_info "Execute: cp backend/.env.example backend/.env"
fi

# Mobile .env
if [ -f "mobile/.env.local" ]; then
    print_status "Mobile: .env.local configurado"
    if grep -q "EXPO_PUBLIC_API_URL" mobile/.env.local; then
        print_status "Mobile: EXPO_PUBLIC_API_URL definido"
    else
        print_warning "Mobile: EXPO_PUBLIC_API_URL não definido"
    fi
else
    print_warning "Mobile: .env.local não encontrado"
    print_info "Execute: cp mobile/.env.example mobile/.env.local"
fi

echo ""
echo "═══════════════════════════════════════"
echo "5️⃣  Verificando Documentação"
echo "═══════════════════════════════════════"

DOCS=(
    "README_NOVO.md"
    "ARCHITECTURE.md"
    "QUICKSTART.md"
    "backend/README.md"
    "mobile/README.md"
)

for doc in "${DOCS[@]}"; do
    if [ -f "$doc" ]; then
        print_status "$doc"
    else
        print_error "$doc não encontrado"
    fi
done

echo ""
echo "═══════════════════════════════════════"
echo "✅ Validação Concluída!"
echo "═══════════════════════════════════════"
echo ""
echo "📋 Checklist Final:"
echo ""
echo "  [ ] Backend .env configurado com MONGODB_URI"
echo "  [ ] Mobile .env.local configurado com API URL"
echo "  [ ] Node.js instalado (v18+)"
echo "  [ ] npm install executado em backend e mobile"
echo "  [ ] MongoDB rodando ou configurado remotamente"
echo ""
echo "🚀 Para iniciar:"
echo ""
echo "  Terminal 1: cd backend && npm run dev"
echo "  Terminal 2: cd mobile && npm run dev"
echo ""
echo "📚 Documentação:"
echo "  - QUICKSTART.md - Guia rápido"
echo "  - ARCHITECTURE.md - Arquitetura"
echo "  - backend/README.md - Backend"
echo "  - mobile/README.md - Mobile"
echo ""
