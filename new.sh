#!/bin/bash
cd functions
npm run build
cd ..
npx firebase deploy --only functions
