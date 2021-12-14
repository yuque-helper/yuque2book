FRONT_VERSION=v0.9.1
FRONT_PKG_NAME=book-front-end_${FRONT_VERSION}.zip
FRONT_URL=https://github.com/yuque-helper/book-front-end/releases/download/${FRONT_VERSION}/${FRONT_PKG_NAME}

build: install
	rm -rf dist
	./node_modules/.bin/tsc
	mkdir dist/front-end
	cd dist/front-end && wget --no-check-certificate ${FRONT_URL} && unzip ${FRONT_PKG_NAME} && rm -rf ${FRONT_PKG_NAME}
	cp package.json dist/
	rm -rf dist/front-end/.DS_Store
	chmod +x dist/src/index.js

install:
	if [ ! -d node_modules ]; then\
		yarn;\
	fi

dev:
	if [ -d front-end ]; then \
		rm -rf front-end;\
	fi
	mkdir front-end
	cd front-end && wget --no-check-certificate ${FRONT_URL} && unzip ${FRONT_PKG_NAME} && rm -rf ${FRONT_PKG_NAME}
