#!/bin/bash

# postbuild.sh

rm -rfv debian/todo/usr/bin/*
rm -rfv debian/todo/usr/lib/*

mkdir -p debian/todo/usr/lib/todo
mkdir -p debian/todo/usr/bin

# binary
cp dist/todo.js debian/todo/usr/bin/todo
chmod +x debian/todo/usr/bin/todo

cp -r dist/lib/* debian/todo/usr/lib/todo/

# cp -r usr/share/* debian/todo/usr/share

# cd debian && builddeb
