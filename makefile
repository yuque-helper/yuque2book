build:
	rm -rf dist
	rm -rf front-end/dist
	./node_modules/.bin/tsc
	cd front-end && npm run build
	mkdir dist/front-end
	cp -r front-end/dist dist/front-end/
	cp package.json dist/
	rm -rf dist/front-end/node_modules
	chmod +x dist/src/index.js
