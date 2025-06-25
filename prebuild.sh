#!/bin/bash

# scripts/prebuild.sh

PACKAGE_VERSION=$(node -p "require('./package.json').version")
echo "Injecting version $PACKAGE_VERSION into constants.ts..."

TEMPLATE_FILE="src/lib/constants.template.ts"
TARGET_FILE="src/lib/constants.ts"

sed "s/__VERSION__/$PACKAGE_VERSION/" "$TEMPLATE_FILE" >"$TARGET_FILE"

echo "✅ constants.ts generated with version $PACKAGE_VERSION"
