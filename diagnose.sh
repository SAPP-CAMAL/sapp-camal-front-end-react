#!/bin/bash

# Script para diagnosticar problemas de archivos estáticos
# Ejecutar en el servidor: bash diagnose.sh

echo "=========================================="
echo "🔍 DIAGNÓSTICO DE SAPP"
echo "=========================================="

# 1. Ver ruta actual
echo ""
echo "📍 Ruta actual:"
pwd

# 2. Ver si existe el archivo .env
echo ""
echo "📄 Archivo .env:"
[ -f ".env" ] && echo "✅ Existe" || echo "❌ NO existe"

# 3. Ver contenido de .env (sin mostrar valores sensibles)
echo ""
echo "📋 Variables en .env:"
grep -E "^[A-Z_]+" .env 2>/dev/null | cut -d= -f1 || echo "❌ No se pudo leer"

# 4. Ver estructura de carpetas
echo ""
echo "📂 Estructura de carpetas:"
ls -lah | grep -E "^\." || ls -lah

# 5. Verificar .next/static
echo ""
echo "🔎 Verificar .next/static:"
if [ -d ".next/static" ]; then
    echo "✅ .next/static EXISTE"
    echo ""
    echo "Tamaño:"
    du -sh .next/static
    echo ""
    echo "Contenido:"
    ls -lah .next/static/
    echo ""
    echo "Cantidad de archivos:"
    find .next/static -type f | wc -l
else
    echo "❌ .next/static NO EXISTE"
    echo ""
    echo "¿Existe .next?"
    ls -lah .next 2>/dev/null || echo "❌ Ni .next existe"
fi

# 6. Verificar public
echo ""
echo "🔎 Verificar public:"
if [ -d "public" ]; then
    echo "✅ public EXISTE"
    ls -lah public/ | head -10
else
    echo "❌ public NO EXISTE"
fi

# 7. Verificar permisos
echo ""
echo "🔐 Permisos:"
ls -lad .next 2>/dev/null || echo ".next no existe"
ls -lad public 2>/dev/null || echo "public no existe"

# 8. Ver proceso PM2
echo ""
echo "⚙️  Estado de PM2:"
pm2 status
pm2 logs sapp --lines 5

# 9. Ver si Next.js está escuchando
echo ""
echo "🌐 Puerto 3001:"
netstat -tlnp 2>/dev/null | grep 3001 || echo "No se escucha en 3001"

echo ""
echo "=========================================="
echo "Fin del diagnóstico"
echo "=========================================="
