install:
	npm install

publish:
	npm publish --dry-run

run:
	node --experimental-json-module ./bin/gendiff.js

lint:
	npx eslint .

test:
	npm test

coverage:
	npm run coverage