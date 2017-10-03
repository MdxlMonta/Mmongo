/*
Mmongo v 0.1
@ MDXL
*/

'use strict'
const Mongo = require('mongodb')

module.exports = class Mmongo {

    constructor (options, collection) {
        this.options = options
        this.MongoClient = Mongo.MongoClient
        this.collection = collection
    }

    /* PRIVATE
    connexion a mongodb
    */
    connectDb () {
        return new Promise((resolve, reject) => {
            try {
                this.MongoClient.connect(this.options.mongodb, (err, db) => {
                    if (err) {
                        throw new ReferenceError(`
                            ERROR: Mmongo CANNOT CONNECT MONGODB
                            SERVER CAN'T START
                            `)
                    } else {
                        console.log('CONNEXION MONGODB OK')
                        this.db = db
                        this.col = this.db.collection(this.collection)
                        resolve(true)
                    }
                })
            } catch (e) {
                reject(e)
            }
        })
    }

    /* PRIVATE
    Recupere tous les objets d'une collection
    a l'aide d'une requete : query
    en utilisant la projection : projection
    */
    getList (query = {}, projection = {}) {
        return new Promise((resolve, reject) => {
            try {
                this.col.find(query, projection).sort({_id: -1}).toArray((err, r) => {
                    (err) ? reject(err) : resolve(r)
                })
            } catch (e) {
                reject(e)
            }
        })
    }

    /* PUBLIC
    Recupere dans une collection
    le premier objet satisfaisant la requete : query
    en utilisant la projection : projection
    */
    findOne (query = {}, projection = {}) {
        return new Promise((resolve, reject) => {
            try {
                this.col.findOne(query, projection, (err, r) => {
                    if (err) {
                        reject(err)
                    } else {
                        // if (r !== null) console.log(`findOne object id = ${r._id} in db.${this.collection}`)
                        resolve(r)
                    }
                })
            } catch (e) {
                reject(e)
            }
        })
    }

    /* PUBLIC
    ajoute un objet : obj
    a une collection
    */
    addObject (obj) {
        return new Promise((resolve, reject) => {
            try {
                delete obj._id
                this.col.insertOne(obj, (err, r) => {
                    if (err) {
                        reject(err)
                    } else {
                        console.log(`Save object id = ${r.insertedId} in db.${this.collection}`)
                        console.log(obj)
                        obj._id = r.insertedId
                        resolve(obj)
                    }
                })
            } catch (e) {
                reject(e)
            }
        })
    }

    /* PUBLIC
    Update un objet d'une collection : obj
        ATTENTION:
        change totalement l'objet (sauf l'_id biensur...)
        donc avoir bien recuperer l'objet de la bd avant par une des methode
            - findObjects
            - getObjectById
        en mode = 'w'
    */
    updateObject (obj) {
        return new Promise((resolve, reject) => {
            try {
                var _id = new Mongo.ObjectID(obj._id)
                const query = { _id }
                let mem = obj._id
                delete obj._id
                this.col.update(query, obj, (err, r) => {
                    if (err) {
                        obj._id = mem
                        reject(err)
                    } else {
                        obj._id = mem
                        console.log(`Update object id = ${_id} in db.${this.collection}`)
                        resolve(obj)
                    }
                })
            } catch (e) {
                reject(e)
            }
        })
    }

    /* PUBLIC
    efface un objet d'une collection grace a son id : id
    */
    deleteObject (id) {
        return new Promise((resolve, reject) => {
            try {
                var _id = new Mongo.ObjectID(id)
                const query = { _id }
                this.col.deleteOne(query, (err, r) => {
                    if (err) {
                        reject(err)
                    } else {
                        console.log(`Delete object id = ${_id} in db.${this.collection}`)
                        resolve(true)
                    }
                })
            } catch (e) {
                reject(e)
            }
        })
    }

    /* PUBLIC
    Recherche les objets satisfaisant la requete : query
    en utilisant la projection : projection
    - si la function est attaquer avec mode write : mode = "w'
      la projection doit etre total : projection = {} permettant ainsi l'utilisation future de updateObject
    - si la function est attaquer avec mode read : mode = "r'
      la projection peut-etre partiel mais on ne pourra pas utiliser par la suite updateObject
      sans deteriorer l'objet
    */
    findObjects (query = {}, projection = {}, mode = 'w') {
        if (mode === 'r') {
            return this.getList(query, projection)
        }
        if (this.checkIfProjection(projection)) {
            return this.getList(query, {})
        }
        this.badProjection(projection)
    }

    /* PRIVATE
    teste si une projection est vide : projection
    */
    checkIfProjection (projection) {
        return Object.getOwnPropertyNames(projection).length === 0
    }

    /* PRIVATE
    alerte si une projection est non vide : projection
    */
    badProjection (projection) {
        console.warn('WARNING : Mmongo.js : You cannot use projection with "w" option => ', projection, ' optionnaly you can add "r" options')
        throw new ReferenceError('You cannot use projection with "w" option')
    }

    /* PRIVATE
    recuperer un objet/document ayant l'id : id
    en utilisant une projection : projection
    */
    getById (id, projection = {}) {
        return new Promise((resolve, reject) => {
            try {
                let _id = new Mongo.ObjectID(id)
                let query = { _id }
                this.col.findOne(query, projection, (err, r) => {
                    if (err) {
                        reject(err)
                    } else {
                        console.log(`Load object id=${id} from db.${this.collection}`)
                        resolve(r)
                    }
                })
            } catch (e) {
                reject(e)
            }
        })
    }

    /* PUBLIC
    Recherche un objet dont l'id est : id
    en utilisant la projection : projection
    - si la function est attaquer avec mode write : mode = "w'
      la projection doit etre total : projection = {} permettant ainsi l'utilisation future de updateObject
    - si la function est attaquer avec mode read : mode = "r'
      la projection peut-etre partiel mais on ne pourra pas utiliser par la suite updateObject
      sans deteriorer l'objet
    */
    getObjectById (id, projection = {}, mode = 'w') {
        if (mode === 'r') {
            return this.getById(id, projection)
        }
        if (this.checkIfProjection(projection)) {
            return this.getById(id, {})
        }
        this.badProjection(projection)
    }

    /* PUBLIC
    Dans MongoDb
    on a un objet/document referencé par son id : objID
    chacun de ces documents possede une Array : nameArray
    on push un objet : elem
    dans cette array
    */
    pushObjectInArray (objID, elem, nameArray) {
        return new Promise((resolve, reject) => {
            try {
                var _id = new Mongo.ObjectID(objID)
                const query = { _id }
                this.col.update(
                    query,
                    {'$push': { [nameArray]: elem }},
                    (err, r) => {
                        if (err) {
                            reject(err)
                        } else {
                            console.log(`Update Array object id = ${objID} in db.${this.collection}`)
                            resolve(true)
                        }
                    }
                )
            } catch (e) {
                reject(e)
            }
        })
    }

    /* PUBLIC
    Dans MongoDb
    on a un objet/document referencé par son id : objID
    chacun de ces documents possede une Array : nameArray
    qui contient n objets
    chacun de ces objets a une propriété id : ArrayFieldId
    et dans cette objet on incremente la valeur de la fieldName : fieldName
    */
    incFieldInArray (objID, nameArray, ArrayFieldId, fieldName) {
        return new Promise((resolve, reject) => {
            try {
                let query = {
                    _id: new Mongo.ObjectID(objID),
                    [nameArray + '.id']: ArrayFieldId
                }
                let incQuery = {
                    '$inc': {
                        [nameArray + '.$.' + fieldName]: 1
                    }
                }
                this.col.update(
                    query,
                    incQuery,
                    (err, r) => {
                        if (err) {
                            reject(err)
                        } else {
                            console.log(`incFieldInArray Array object id = ${objID} in db.${this.collection}`)
                            resolve(true)
                        }
                    }
                )
            } catch (e) {
                reject(e)
            }
        })
    }

    /* PUBLIC
    Dans MongoDb
    on a un objet/document referencé par son id : objID
    chacun de ces documents possede une Array : nameArray
    qui contient n objets
    chacun de ces objets a une propriété id : ArrayFieldId
    et dans cette objet on modifie la valeur de la propiété : fieldName
    en : newValue
    */
    setFieldInArray (objID, nameArray, ArrayFieldId, fieldName, newValue = 0) {
        return new Promise((resolve, reject) => {
            try {
                let query = {
                    _id: new Mongo.ObjectID(objID),
                    [nameArray + '.id']: ArrayFieldId
                }
                let setQuery = {
                    '$set': {
                        [nameArray + '.$.' + fieldName]: newValue
                    }
                }
                this.col.update(
                    query,
                    setQuery,
                    (err, r) => {
                        if (err) {
                            reject(err)
                        } else {
                            console.log(`setFieldInArray Array object id = ${objID} in db.${this.collection}`)
                            resolve(true)
                        }
                    }
                )
            } catch (e) {
                reject(e)
            }
        })
    }

    /* PUBLIC
    Dans MongoDb
    on a un objet/document referencé par son id : objID
    chacun de ces documents possede une Array : nameArray
    qui contient n objets
    chacun de ces objets a une propriété id : arrayId
    et dans cette objet on modifie la valeur des propriétés
    en utilisant un objet : objSet
    ex:          let objSet = {
                    prop1AModifier: newValue1,
                    prop2AModifier: newValue2
                }
    */
    updateObjectInArray (objID, nameArray, arrayId, objSet) {
        return new Promise((resolve, reject) => {
            try {
                if (objSet._id !== undefined) delete objSet._id
                let query = {
                    _id: new Mongo.ObjectID(objID),
                    [nameArray + '.id']: arrayId
                }
                let querySet = {'$set': {}}
                for (let item in objSet) {
                    querySet.$set[nameArray + '.$.' + item] = objSet[item]
                }
                this.col.update(
                    query,
                    querySet,
                    (err, r) => {
                        if (err) {
                            reject(err)
                        } else {
                            console.log(`setFieldInArray Array object id = ${objID} in db.${this.collection}`)
                            resolve(true)
                        }
                    }
                )
            } catch (e) {
                reject(e)
            }
        })
    }

    /* PUBLIC
    TODO : renommer en UpdatePropertiesInObject
    dans un objet/documet dont l'id est : objID
    on modifie la valeur des propriétés
    en utilisant un objet : objSet
    ex:          let objSet = {
                    prop1AModifier: newValue1,
                    prop2AModifier: newValue2
                }
    */
    UpdatePropertyInObject (objID, objSet) {
        return new Promise((resolve, reject) => {
            try {
                if (objID === undefined) reject()
                if (objSet._id !== undefined) delete objSet._id
                let query = {_id: new Mongo.ObjectID(objID)}
                let querySet = {'$set': {}}
                for (let item in objSet) {
                    querySet.$set[item] = objSet[item]
                }
                this.col.update(
                    query,
                    querySet,
                    (err, r) => {
                        if (err) {
                            reject(err)
                        } else {
                            console.log(`UpdatePropertyInObject id = ${objID} in db.${this.collection}`)
                            resolve(true)
                        }
                    }
                )
            } catch (e) {
                reject(e)
            }
        })
    }
    /*
    easyMmongo
    */
    getAll (query = {}, projection = {}) {
        return this.getList(query, projection)
    }

    getMe (id, projection = {}) {
        return this.getObjectById(id, projection, 'r')
    }

    setMe (obj) {
        if (obj._id === undefined) return this.addObject(obj)
        let id = obj._id
        delete obj._id
        return this.UpdatePropertyInObject(id, obj)
    }

    deleteMe (obj) {
        return this.deleteObject(obj._id)
    }
}
