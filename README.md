# Backend

## Overview

[![codecov](https://codecov.io/gh/dopeshot/order-and-pay-backend/branch/main/graph/badge.svg?token=RI1XZPSHEV)](https://codecov.io/gh/dopeshot/order-and-pay-backend)

Das Backend verbindet Frontend client und Frontend admin. Zudem werden hier die Daten des Restaurants gespeichert und verwaltet.

## Das Projekt starten

**Im Docker**:

    docker-compose up

Das Backend ist dann erreichbar auf Port [4001](http://localhost:4001)
Hierbei hat das Backend direkt eine vollständige Beispieldatenbank. Die Verbindung zur MongoDb kann hergestellt werden mit dem MongoDB Compass und dieser URI:

    mongodb://OrderAndPay:UedD8WR2U8Amv3t2@localhost:27018/Order-and-Pay?authSource=admin

**Normal mit npm**:

    npm i
    npm run start

Das Backend ist dann erreichbar auf Port [3001](http://localhost:3001)

**Tests:**  
(Umfasst unit und e2e tests)

    npm run test

## Deploy

Das gehostete Backend ist [hier](https://api.dopeshot.coffee/) erreichbar
