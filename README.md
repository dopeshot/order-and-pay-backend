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

Für den unwahrscheinlichen Fall, dass es zu Fehlern mit dieser db kommt, dann kann dies behoben werden, indem der Data ordner gelöscht und das docker voluem gelöscht wird.
Daraufhin kann die Datenbank anhand der JSON files im backup-db ordner neu befüllt werden.

(Im Deployment nutzen wir mongodump zum Backupen und Restoren der Datenbank)

**Normal mit npm**:

    npm i
    npm run start

Das Backend ist dann erreichbar auf Port [3001](http://localhost:3001)

**Tests:**  
(Umfasst unit und e2e tests)

    npm run test

## Deploy

Das gehostete Backend ist [hier](https://api.dopeshot.coffee/) erreichbar
