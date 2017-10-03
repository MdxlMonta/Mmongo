/*
Test unitaire sur le class Mmongo v 0.1
v0.1
*/

/* eslint-env node, mocha */

const chai = require('chai')
const expect = chai.expect
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
const sinon = require('sinon')

const Mmongo = require('../Mmongo')
const options = require('../config')

const objType = {
    pseudo: 'monta',
    password: 'ze45sdf4',
    list: [{id: '1', name: 'user1', count: 0}]
}
const mongo = new Mmongo(options, options.nameCollection)

describe('Mmongo Tests', () => {
    before(() => {
    })

    describe('#connectDb', () => {
        it('should connect MongoDB', (done) => {
            expect(mongo.connectDb())
                .to.eventually.be.true.notify(done)
        })
    })

    describe('#addObject : object : ', () => {
        it('should add a Object', (done) => {
            expect(mongo.addObject(objType))
                .to.eventually.be.equal(objType, 'Probleme sur addObject').notify(done)
        })
    })

    describe('#findOne : query = {}, projection = {} : ', () => {
        it('should find a Object by query but no result', (done) => {
            let query = {pseudo: 'badId'}
            expect(mongo.findOne(query, {}))
                .to.eventually.be.null.notify(done)
        })
        it('should find a Object by query', (done) => {
            let query = {_id: objType._id}
            expect(mongo.findOne(query, {}))
                .to.eventually.have.property('password', objType.password).notify(done)
        })
    })

    describe('#getById : query = {}, projection = {} : ', () => {
        it('should find a Object by _id - reject', (done) => {
            expect(mongo.getById('badId', {}))
                .to.be.rejected.notify(done)
        })
        it('should find a Object by _id', (done) => {
            expect(mongo.getById(objType._id, {}))
                .to.eventually.have.property('password', objType.password).notify(done)
        })
    })

    describe('#updateObject : object : ', () => {
        it('should update a Object - reject', (done) => {
            expect(mongo.updateObject({_id: 'badId'}))
                .to.be.rejected.notify(done)
        })
        it('should update a Object', (done) => {
            objType.pseudo = 'luigi'
            expect(mongo.updateObject(objType))
                .to.eventually.be.equal(objType, 'Probleme sur updateObject').notify(done)
        })
        it('Check Mongodb for updateObject', (done) => {
            let query = {_id: objType._id}
            expect(mongo.findOne(query, {}))
                .to.eventually.have.property('pseudo', 'luigi').notify(done)
        })
    })

    describe('#getList : query = {}, projection = {} : ', () => {
        it('should get a array of Objects', (done) => {
            expect(mongo.getList({}, {}))
                .to.eventually.be.a('array').notify(done)
        })
    })

    describe('#pushObjectInArray : objID, elem, nameArray : ', () => {
        it('should put a object into a array - reject', (done) => {
            expect(mongo.pushObjectInArray('badId', {id: '1', name: 'user2', count: 0}, 'list'))
                .to.be.rejected.notify(done)
        })
        it('should put a object into a array', (done) => {
            expect(mongo.pushObjectInArray(objType._id, {id: '2', name: 'user2', count: 0}, 'list'))
                .to.eventually.be.equal(true).notify(done)
        })
        it('Check Mongodb for pushObjectInArray', (done) => {
            let query = {_id: objType._id}
            expect(mongo.findOne(query, {}))
                .to.eventually.have.nested.property('list.length', 2).notify(done)
        })
    })

    describe('#incFieldInArray : objID, nameArray, ArrayFieldId, fieldName : ', () => {
        it('should increment a field into a objects who is in a array - reject', (done) => {
            expect(mongo.incFieldInArray('badId', 'list', '1', 'count'))
                .to.be.rejected.notify(done)
        })
        it('should increment a field into a objects who is in a array', (done) => {
            expect(mongo.incFieldInArray(objType._id, 'list', '1', 'count'))
                .to.eventually.be.equal(true).notify(done)
        })
        it('Check Mongodb for pushObjectInArray', (done) => {
            let query = {_id: objType._id}
            expect(mongo.findOne(query, {}))
                .to.eventually.have.nested.property('list[0].count', 1).notify(done)
        })
    })

    describe('#setFieldInArray : objID, nameArray, ArrayFieldId, fieldName, newValue = 0 : ', () => {
        it('should set a field in a array - reject', (done) => {
            expect(mongo.setFieldInArray('badId', 'list', '1', 'name', 'toto'))
                .to.be.rejected.notify(done)
        })
        it('should set a field in a array', (done) => {
            expect(mongo.setFieldInArray(objType._id, 'list', '1', 'name', 'toto'))
                .to.eventually.be.equal(true).notify(done)
        })
        it('Check Mongodb for setFieldInArray', (done) => {
            let query = {_id: objType._id}
            expect(mongo.findOne(query, {}))
                .to.eventually.have.nested.property('list[0].name', 'toto').notify(done)
        })
    })

    describe('#updateObjectInArray : object : ', () => {
        it('should update some properties of an object who is in a array - reject', (done) => {
            expect(mongo.updateObjectInArray('badId', 'list', '1', {}))
                .to.be.rejected.notify(done)
        })
        it('should update some properties of an object who is in a array', (done) => {
            let objSet = {
                name: 'newname',
                count: 50
            }
            expect(mongo.updateObjectInArray(objType._id, 'list', '1', objSet))
                .to.eventually.be.equal(true).notify(done)
        })
        it('Check Mongodb for updateObjectInArray - Part 1', (done) => {
            let query = {_id: objType._id}
            expect(mongo.findOne(query, {}))
                .to.eventually.have.nested.property('list[0].name', 'newname').notify(done)
        })
        it('Check Mongodb for updateObjectInArray - Part 2', (done) => {
            let query = {_id: objType._id}
            expect(mongo.findOne(query, {}))
                .to.eventually.have.nested.property('list[0].count', 50).notify(done)
        })
    })

    describe('#UpdatePropertyInObject : object : ', () => {
        it('should update some properties of an object - reject', (done) => {
            expect(mongo.UpdatePropertyInObject('badId', {}))
                .to.be.rejected.notify(done)
        })
        it('should update some properties of an object', (done) => {
            let objSet = {
                pseudo: 'newpseudo',
                password: '777',
                test: ['1', '2', '3']
            }
            expect(mongo.UpdatePropertyInObject(objType._id, objSet))
                .to.eventually.be.equal(true).notify(done)
        })

        it('Check Mongodb for UpdatePropertyInObject - Part 1', (done) => {
            let query = {_id: objType._id}
            expect(mongo.findOne(query, {}))
                .to.eventually.have.deep.property('pseudo', 'newpseudo').notify(done)
        })
        it('Check Mongodb for UpdatePropertyInObject - Part 2', (done) => {
            let query = {_id: objType._id}
            expect(mongo.findOne(query, {}))
                .to.eventually.have.deep.property('password', '777').notify(done)
        })
    })

    describe('#checkIfProjection', () => {
        it('shoud check if projection is empty', () => {
            expect(mongo.checkIfProjection({}))
                .be.true
        })
        it('shoud check if projection is not empty', () => {
            expect(mongo.checkIfProjection({id: 1}))
                .be.false
        })
    })

    describe('#findObjects : query = {}, projection = {} : ', () => {
        it('should get a array of Objects with projection = {} mode r', (done) => {
            expect(mongo.findObjects({}, {}, 'r'))
                .to.eventually.be.a('array').notify(done)
        })
        it('should get a array of Objects with projection = {id: 1} mode r', (done) => {
            expect(mongo.findObjects({}, {id: 1}, 'r'))
                .to.eventually.be.a('array').notify(done)
        })
        it('should get a array of Objects with projection = {} mode w', (done) => {
            expect(mongo.findObjects({}, {}, 'w'))
                .to.eventually.be.a('array').notify(done)
        })
        it('should sure it verify projection (mode w)', () => {
            sinon.spy(mongo, 'checkIfProjection')
            mongo.findObjects({}, {}, 'w')
            expect(mongo.checkIfProjection.calledOnce).to.be.true
            mongo.checkIfProjection.restore()
        })
        it('should sure it not verify projection (mode r)', () => {
            sinon.spy(mongo, 'checkIfProjection')
            mongo.findObjects({}, {}, 'r')
            expect(mongo.checkIfProjection.calledOnce).to.be.false
            mongo.checkIfProjection.restore()
        })
        it('should not get a array of Objects with projection = {id: 1} mode w', () => {
            expect(() => mongo.findObjects({}, {id: 1}, 'w'))
                .to.throw(Error)
        })
    })

    describe('#getObjectById : query = {}, projection = {} : ', () => {
        it('should get a object by id with projection = {} mode r', (done) => {
            expect(mongo.getObjectById(objType._id, {}, 'r'))
                .to.eventually.be.a('object').notify(done)
        })
        it('should get a object by id with projection = {id: 1} mode r', (done) => {
            expect(mongo.getObjectById(objType._id, {id: 1}, 'r'))
                .to.eventually.be.a('object').notify(done)
        })
        it('should get a object by id with projection = {} mode w', (done) => {
            expect(mongo.getObjectById(objType._id, {}, 'w'))
                .to.eventually.be.a('object').notify(done)
        })

        it('should sure it verify projection (mode w)', () => {
            sinon.spy(mongo, 'checkIfProjection')
            mongo.getObjectById(objType._id, {}, 'w')
            expect(mongo.checkIfProjection.calledOnce).to.be.true
            mongo.checkIfProjection.restore()
        })
        it('should sure it not verify projection (mode r)', () => {
            sinon.spy(mongo, 'checkIfProjection')
            mongo.getObjectById(objType._id, {}, 'r')
            expect(mongo.checkIfProjection.calledOnce).to.be.false
            mongo.checkIfProjection.restore()
        })
        it('should not get a object by id with projection = {id: 1} mode w', () => {
            expect(() => mongo.getObjectById(objType._id, {id: 1}, 'w'))
                .to.throw(Error)
        })
    })

    describe('#badProjection : projection : ', () => {
        it('should throw error for bab projection (mode = r | w)', () => {
            expect(() => mongo.badProjection({id: 1}))
                .to.throw(Error)
        })
    })

    describe('#deleteObject : id : ', () => {
        it('should delete a Object by _id', (done) => {
            expect(mongo.deleteObject(objType._id)).to.eventually.be.equal(true).notify(done)
        })
        it('Check Mongodb for deleteObject', (done) => {
            let query = {_id: objType._id}
            expect(mongo.findOne(query, {}))
                .to.eventually.be.equal(null).notify(done)
        })
    })

    after(() => {
        mongo.closeDb()
    })
})
