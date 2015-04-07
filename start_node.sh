#!/bin/bash


node local_site.js '{ "debug": false, "mongo_port": 27017, "http_port": 3000, "https_config": { "port": 3443, "key": "./credentials/key.pem", "cert": "./credentials/cert.pem" }}'

