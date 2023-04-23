# Marrakech game

## Příkazy

### `npm start`
Lokální vývoj, aplikace poběží na url [http://localhost:3000](http://localhost:3000)

### `npm rub build`
Vytvoří ve složce `build` aplikaci v produkční verzi.


## API
Backend aplikace běží serverless, je postavený na platformě AWS. O aktuální data se stará AppSync napojený na DynamoDB pomocí js resolverů.
Využití AWS zaručuje stabilitu škálovatelnost. 