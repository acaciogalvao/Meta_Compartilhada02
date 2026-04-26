#!/bin/bash

# Script de Setup - Meta Compartilhada
# Inicializa o projeto com todas as dependências

set -e

echo "╔════════════════════════════════════════╗"
echo "║   Meta Compartilhada - Setup Script   ║"
echo "╚════════════════════════════════════════╝"
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# Verificar Node.js
echo "Verificando Node.js..."
if ! command -v node &> /dev/null; then
    print_error "Node.js não está instalado"
    echo "Instale em: https://nodejs.org/"
    exit 1
fi
print_status "Node.js $(node -v) encontrado"

# Verificar npm
echo "Verificando npm..."
if ! command -v npm &> /dev/null; then
    print_error "npm não está instalado"
    exit 1
fi
print_status "npm $(npm -v) encontrado"

echo ""
echo "═══════════════════════════════════════"
echo "1️⃣  Configurando Backend"
echo "═══════════════════════════════════════"

if [ ! -f "backend/.env" ]; then
    print_warning "Arquivo backend/.env não encontrado"
    if [ -f "backend/.env.example" ]; then
        cp backend/.env.example backend/.env
        print_status "Criado backend/.env (edite com suas configurações)"
    fi
else
    print_status "backend/.env já existe"
fi

echo "Instalando dependências do backend..."
cd backend
npm install > /dev/null 2>&1
print_status "Dependências do backend instaladas"
cd ..

echo ""
echo "═══════════════════════════════════════"
echo "2️⃣  Configurando Mobile"
echo "═══════════════════════════════════════"

if [ ! -f "mobile/.env.local" ]; then
    print_warning "Arquivo mobile/.env.local não encontrado"
    if [ -f "mobile/.env.example" ]; then
        cp mobile/.env.example mobile/.env.local
        print_status "Criado mobile/.env.local (edite se necessário)"
    fi
else
    print_status "mobile/.env.local já existe"
fi

echo "Instalando dependências do mobile..."
cd mobile
npm install > /dev/null 2>&1
print_status "Dependências do mobile instaladas"
cd ..

echo ""
echo "═══════════════════════════════════════"
echo "✅ Setup Concluído!"
echo "═══════════════════════════════════════"
echo ""
echo "Próximos passos:"
echo ""
echo "1️⃣  Configurar variáveis de ambiente:"
echo "   - Editar backend/.env com URL do MongoDB"
echo "   - Editar mobile/.env.local com URL da API"
echo ""
echo "2️⃣  Iniciar Backend (Terminal 1):"
echo "   cd backend && npm run dev"
echo ""
echo "3️⃣  Iniciar Mobile (Terminal 2):"
echo "   cd mobile && npm run dev"
echo ""
echo "4️⃣  Escanear QR code com Expo Go"
echo ""
echo "📚 Documentação:"
echo "   - ARCHITECTURE.md - Arquitetura do projeto"
echo "   - backend/README.md - Documentação do backend"
echo "   - mobile/README.md - Documentação do mobile"
echo ""
