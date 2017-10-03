##Mmongo

Une class Javascript/Node.js pour gérer simplement des objets dans une base de donnée MongoDB

###Instanciation
Nécessite les options : config.js
```javascript
const options = {
    ip: '192.168.1.12',
    portMongoDb: '27017',
    nameDB: 'MmongoTest',
    nameCollection: 'test'
}
options.mongodb = `mongodb://${options.ip}:${options.portMongoDb}/${options.nameDB}`
```

on crée ensuite l'instance

```javascript
const Mmongo = require('./Mmongo')
const options = require('./config')
const mongo = new Mmongo(options, options.nameCollection)
mongo.connectDb()
```

###Méthodes

```javascript
- connectDb
- findOne (query = {}, projection = {}) 
- addObject (obj)
- updateObject (obj)
- deleteObject (id)
- findObjects (query = {}, projection = {}, mode = 'w')
- getObjectById (id, projection = {}, mode = 'w')
- pushObjectInArray (objID, elem, nameArray)
- incFieldInArray (objID, nameArray, ArrayFieldId, fieldName)
- setFieldInArray (objID, nameArray, ArrayFieldId, fieldName, newValue = 0)
- updateObjectInArray (objID, nameArray, arrayId, objSet)
- UpdatePropertyInObject (objID, objSet)
- closeDb
```
Pour plus de détails voir les commentaires des méthodes dans le code