#!/bin/bash
git pull
npm run build
# ensure it's there
mkdir -p ./docs/static/media/skills
# preserve existing skills
cp -r ./docs/static/media/skills ./build/static/media/
rm -rf ./docs/
mv ./build ./docs
git add ./docs
git commit -m 'update website'
git push
