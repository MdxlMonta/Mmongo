// Parametres de configuration du serveur node
const options = {
    ip: '192.168.1.12',
    portMongoDb: '27017',
    nameDB: 'MmongoTest',
    nameCollection: 'test'
}
options.mongodb = `mongodb://${options.ip}:${options.portMongoDb}/${options.nameDB}`
module.exports = options
