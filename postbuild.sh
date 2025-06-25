#!/bin/bash

echo "🔧 Starting post-build process..."

# Clean up old packaging artifacts
rm -rfv debian/todo/usr/bin/*
rm -rfv debian/todo/usr/lib/*

# Recreate necessary folders
mkdir -p debian/todo/usr/lib/todo
mkdir -p debian/todo/usr/bin

# Get version from package.json
PACKAGE_VERSION=$(node -p "require('./package.json').version")
echo "📦 Packaging version: $PACKAGE_VERSION"

# 1. Create system-compatible entry point
echo "🛠️ Creating system bin script..."
sed -e 's|from "./lib/|from "/usr/lib/todo/|g' \
	-e 's|require("./lib/|require("/usr/lib/todo/|g' \
	dist/todo.js >debian/todo/usr/bin/todo

chmod +x debian/todo/usr/bin/todo

# 2. Copy compiled library
echo "📁 Copying compiled library..."
cp -r dist/lib/* debian/todo/usr/lib/todo/

# 3. Update control file version
echo "📝 Updating DEBIAN/control version..."
sed -i "s/^Version:.*/Version: $PACKAGE_VERSION/" debian/todo/DEBIAN/control

# 4. Update manpage version (e.g. "v1.1.2")
echo "📚 Updating manpage..."
sed -i "s/\"v[0-9]\+\.[0-9]\+\.[0-9]\+\"/\"v$PACKAGE_VERSION\"/" debian/todo/usr/share/man/man1/todo.1

# 5. Build .deb package
echo "📦 Building .deb package..."
cd debian
dpkg-deb --build ./todo ./todo-${PACKAGE_VERSION}-amd64.deb
cd ..

echo "✅ Package built: debian/todo-${PACKAGE_VERSION}-amd64.deb"

# 6. Final check
echo "🔍 Validating version..."
BUILT_VERSION=$(grep -oP 'VERSION\s*=\s*"\K[0-9]+\.[0-9]+\.[0-9]+' dist/lib/constants.js)

if [ "$BUILT_VERSION" = "$PACKAGE_VERSION" ]; then
	echo "✅ Version in build matches package.json: $BUILT_VERSION"
else
	echo "❌ Version mismatch! Expected: $PACKAGE_VERSION, Found: $BUILT_VERSION"
	exit 1
fi
