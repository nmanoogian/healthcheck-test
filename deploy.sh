#!/bin/bash
VERSION=$(git describe --always)
sed -i "" "s/VERSION_PLACEHOLDER/$VERSION/g" check.js
docker build . -t healthcheck-test
docker tag healthcheck-test localhost:5000/healthcheck-test
docker push localhost:5000/healthcheck-test
