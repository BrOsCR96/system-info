const express = require('express')
const http = require('http')
const socketIo = require('socket.io')
const os = require('os')
const { exec } = require('child_process')
const si = require('systeminformation')
const diskusage = require('diskusage')

const port = 5050
const app = express()
app.use(express.static('public'))
const server = http.createServer(app)
const io = socketIo(server)

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html')
})

let cachedPM2Processes = null

const getPublicIP = () => {
  return new Promise((resolve, reject) => {
    exec('curl ifconfig.me', (err, stdout) => {
      if (err) reject(err)
      resolve(stdout.trim())
    })
  })
}

const getPM2Processes = () => {
  return new Promise((resolve, reject) => {
    if (cachedPM2Processes) {
      resolve(cachedPM2Processes)
      return
    }

    exec('sudo pm2 jlist', (err, stdout) => {
      if (err) {
        reject(err)
        return
      }
      try {
        const processes = JSON.parse(stdout)
        cachedPM2Processes = processes.map(proc => ({
          name: proc.name,
          status: proc.pm2_env.status,
          cpu: proc.monit.cpu,
          memory: (proc.monit.memory / 1024 / 1024).toFixed(2) + ' MB'
        }))
        resolve(cachedPM2Processes)
      } catch (parseError) {
        reject(parseError)
      }
    })
  })
}

const getCPUTemperature = () => {
  return new Promise((resolve, reject) => {
    si.cpuTemperature()
      .then(data => {
        resolve(data.main)
      })
      .catch(error => {
        reject(error)
      })
  })
}

const getFreeSpace = () => {
  return new Promise((resolve, reject) => {
    diskusage.check(os.homedir(), (err, info) => {
      if (err) {
        reject(err)
        return
      }
      const freeSpace = (info.free / (1024 * 1024 * 1024)).toFixed(2)
      resolve(freeSpace)
    })
  })
}

io.on('connection', (socket) => {
  console.log('Cliente conectado')

  const sendData = async () => {
    try {
      const publicIP = await getPublicIP()
      const pm2Processes = await getPM2Processes()
      const cpuUsage = await si.currentLoad()
      const memoryData = await si.mem()
      const freeSpace = await getFreeSpace()
      const cpuTemperature = await getCPUTemperature()

      socket.emit('systemData', {
        localIP: os.networkInterfaces().eth0 ? os.networkInterfaces().eth0[0].address : 'No disponible',
        publicIP,
        cpuUsage: cpuUsage.currentLoad.toFixed(2),
        memoryUsage: ((memoryData.active / memoryData.total) * 100).toFixed(2),
        pm2Processes,
        freeSpace: freeSpace + ' GB',
        cpuTemperature: cpuTemperature.toFixed(2) + ' °C'
      })
    } catch (error) {
      console.error('Error al obtener datos:', error)
    }
  }

  const interval = setInterval(sendData, 1000)

  socket.on('disconnect', () => {
    clearInterval(interval)
    console.log('Cliente desconectado')
  })
})

server.listen(port, () => {
  console.log(`http://localhost:${port}`)
})
