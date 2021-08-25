#!/bin/bash
docker build . -t healthcheck-test
docker tag healthcheck-test localhost:5000/healthcheck-test
docker push localhost:5000/healthcheck-test
