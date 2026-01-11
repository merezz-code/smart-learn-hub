#!/bin/bash
# Script de vérification post-migration
# Smart Learn Hub - Vérification Frontend/Backend synchronisation

echo "🔍 VÉRIFICATION POST-MIGRATION"
echo "================================"
echo ""

# Couleurs pour l'affichage
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

SUCCESS=0
WARNINGS=0
ERRORS=0

# Fonction pour checker un fichier
check_file_exists() {
    if [ -f "$1" ]; then
        echo -e "${RED}❌ ERREUR: $1 existe encore (devrait être supprimé)${NC}"
        ((ERRORS++))
        return 1
    else
        echo -e "${GREEN}✅ OK: $1 supprimé${NC}"
        ((SUCCESS++))
        return 0
    fi
}

check_file_not_exists() {
    if [ ! -f "$1" ]; then
        echo -e "${RED}❌ ERREUR: $1 n'existe pas (requis)${NC}"
        ((ERRORS++))
        return 1
    else
        echo -e "${GREEN}✅ OK: $1 existe${NC}"
        ((SUCCESS++))
        return 0
    fi
}

check_content() {
    if grep -q "$2" "$1" 2>/dev/null; then
        echo -e "${GREEN}✅ OK: $1 contient '$3'${NC}"
        ((SUCCESS++))
        return 0
    else
        echo -e "${RED}❌ ERREUR: $1 ne contient pas '$3'${NC}"
        ((ERRORS++))
        return 1
    fi
}

check_no_content() {
    if grep -q "$2" "$1" 2>/dev/null; then
        echo -e "${RED}❌ ERREUR: $1 contient encore '$3' (devrait être supprimé)${NC}"
        ((ERRORS++))
        return 1
    else
        echo -e "${GREEN}✅ OK: $1 ne contient pas '$3'${NC}"
        ((SUCCESS++))
        return 0
    fi
}

echo "📂 VÉRIFICATION #1: Fichiers Supabase supprimés"
echo "------------------------------------------------"
check_file_exists "src/lib/supabase.ts"
check_file_exists "src/lib/testSupabase.ts"
check_file_exists "src/lib/testConnection.ts"
check_file_exists "src/lib/courseService.supabase.ts"
check_file_exists "src/lib/api/courses.ts"
check_file_exists "src/lib/api/progress.ts"
check_file_exists "src/lib/api/quizzes.ts"
check_file_exists "src/components/courses/CourseCardSupabase.tsx"

echo ""
echo "📦 VÉRIFICATION #2: Dépendance npm Supabase"
echo "--------------------------------------------"
if grep -q "@supabase/supabase-js" package.json 2>/dev/null; then
    echo -e "${RED}❌ ERREUR: @supabase/supabase-js encore dans package.json${NC}"
    ((ERRORS++))
else
    echo -e "${GREEN}✅ OK: @supabase/supabase-js supprimé de package.json${NC}"
    ((SUCCESS++))
fi

echo ""
echo "🔐 VÉRIFICATION #3: AuthContext - Stockage JWT"
echo "-----------------------------------------------"
check_file_not_exists "src/contexts/AuthContext.tsx"
check_content "src/contexts/AuthContext.tsx" "localStorage.setItem('token'" "stockage du token dans login"
check_content "src/contexts/AuthContext.tsx" "localStorage.removeItem('token')" "suppression du token dans logout"

echo ""
echo "🌐 VÉRIFICATION #4: Backend API - Envoi JWT"
echo "--------------------------------------------"
check_file_not_exists "src/lib/api/backend.ts"
check_content "src/lib/api/backend.ts" "Authorization.*Bearer" "envoi du token dans les headers"
check_content "src/lib/api/backend.ts" "localStorage.getItem('token')" "récupération du token"

echo ""
echo "🧹 VÉRIFICATION #5: Imports Supabase dans le code"
echo "--------------------------------------------------"
if grep -r "from.*supabase" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "node_modules"; then
    echo -e "${YELLOW}⚠️  WARNING: Imports Supabase trouvés dans le code${NC}"
    ((WARNINGS++))
    echo "   Fichiers concernés:"
    grep -r "from.*supabase" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "node_modules" | cut -d: -f1 | sort -u
else
    echo -e "${GREEN}✅ OK: Aucun import Supabase trouvé${NC}"
    ((SUCCESS++))
fi

echo ""
echo "🔧 VÉRIFICATION #6: Configuration Backend"
echo "------------------------------------------"
if [ -f "backend/.env" ]; then
    if grep -q "JWT_SECRET" backend/.env; then
        echo -e "${GREEN}✅ OK: JWT_SECRET configuré${NC}"
        ((SUCCESS++))
    else
        echo -e "${YELLOW}⚠️  WARNING: JWT_SECRET manquant dans backend/.env${NC}"
        ((WARNINGS++))
    fi
else
    echo -e "${YELLOW}⚠️  WARNING: backend/.env n'existe pas${NC}"
    ((WARNINGS++))
fi

    if [ -f "backend/middleware/auth.js" ]; then
    if grep -q "authenticateToken" backend/middleware/auth.js; then
        echo -e "${GREEN}✅ OK: Middleware authenticateToken présent${NC}"
        ((SUCCESS++))
    else
        echo -e "${RED}❌ ERREUR: Middleware authenticateToken manquant${NC}"
        ((ERRORS++))
    fi
else
    echo -e "${RED}❌ ERREUR: backend/middleware/auth.js n'existe pas${NC}"
    ((ERRORS++))
fi

echo ""
echo "================================"
echo "📊 RÉSUMÉ DE LA VÉRIFICATION"
echo "================================"
echo -e "${GREEN}Succès: $SUCCESS${NC}"
echo -e "${YELLOW}Avertissements: $WARNINGS${NC}"
echo -e "${RED}Erreurs: $ERRORS${NC}"
echo ""

if [ $ERRORS -eq 0 ]; then
    if [ $WARNINGS -eq 0 ]; then
        echo -e "${GREEN}🎉 MIGRATION COMPLÈTE ET VALIDÉE!${NC}"
        echo ""
        echo "✅ Tous les fichiers Supabase supprimés"
        echo "✅ JWT correctement implémenté"
        echo "✅ Synchronisation Frontend/Backend OK"
        echo ""
        echo "📋 PROCHAINES ÉTAPES:"
        echo "1. Tester la connexion/inscription"
        echo "2. Vérifier le stockage du token dans localStorage"
        echo "3. Tester les requêtes API protégées"
        echo ""
        exit 0
    else
        echo -e "${YELLOW}⚠️  MIGRATION OK avec quelques avertissements${NC}"
        echo ""
        echo "Revoyez les warnings ci-dessus et corrigez si nécessaire."
        echo ""
        exit 0
    fi
else
    echo -e "${RED}❌ MIGRATION INCOMPLÈTE - Des erreurs subsistent${NC}"
    echo ""
    echo "Revoyez les erreurs ci-dessus et corrigez avant de continuer."
    echo ""
    echo "📚 Consultez le GUIDE_MIGRATION.md pour plus d'aide"
    echo ""
    exit 1
fi