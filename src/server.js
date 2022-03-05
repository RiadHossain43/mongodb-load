import dotenv from "dotenv"
dotenv.config()
import { MongoClient } from "mongodb"
import express from "express"
import cluster from 'cluster'
import os from 'os'
import compression from "compression"
const nCpus = os.cpus().length
const app = express()
let localDb
let remoteDb
const connectDb = async url => MongoClient.connect(url)
app.use(compression())
app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({ limit: '200mb', extended: true }));
app.use((req, res, next) => {
    console.log(new Date(), "↓")
    console.info("request: ", req.method, " Host:", req.headers.origin, " End point:", req.originalUrl)
    next()
})
app.get('/localtest', (req, res) => {
    const db = localDb.db('loadtest')
    db.collection('testdata').find({}).toArray(function (err, result) {
        if (err) throw err;
        res.status(200).json({ message: "Data retrival success" })
    })
})
app.get('/remotetest', (req, res) => {
    const db = remoteDb.db('loadtest')
    db.collection('testdata').find({}).toArray(function (err, result) {
        if (err) throw err;
        res.status(200).json({ message: "Data retrival success" })
    })
})
async function startServer() {
    const PORT = process.env.PORT || 8000;
    const httpServer = app.listen(PORT, () => console.log(`Server ${process.pid} started @ port ${PORT}`));
}
(async () => {
    try {
        localDb = await connectDb(process.env.LOCAL_DB)
        remoteDb = await connectDb(process.env.REMOTE_DB)
        if (cluster.isMaster)
            for (let i = 0; i < nCpus; i++)
                cluster.fork()
        else
            startServer()
    } catch (error) {
        console.log(error)
    }
})()