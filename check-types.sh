#!/bin/bash

echo "🔍 Проверка TypeScript типов..."
npx tsc --noEmit

if [ $? -eq 0 ]; then
    echo "✅ TypeScript типы в порядке!"
else
    echo "❌ Есть ошибки TypeScript"
    exit 1
fi

echo "📦 Проверка зависимостей..."
npm ls --depth=0

echo "🎉 Проверка завершена!"