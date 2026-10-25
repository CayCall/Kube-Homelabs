#!/bin/bash
 kubectl create secret docker-registry my-docker-secret \
   --docker-server=docker.io \
   --docker-username=c4yy \
   --docker-password=<your-password> \
   --docker-email=<your-email>n