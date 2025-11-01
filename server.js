
const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const PORT = 3000;

let latestData = null;


app.use(cors());
app.use(express.json());
app.use(express.static('public'));


const wss = new WebSocket.Server({ noServer: true });

wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket');
    

    if (latestData) {
        ws.send(JSON.stringify(latestData));
    }
    
    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

// รับข้อมูลจาก Roblox
app.post('/update', (req, res) => {
    latestData = {
        ...req.body,
        receivedAt: new Date().toISOString()
    };
    
   // console.log('Data received:', latestData.player?.name || 'Unknown');

    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(latestData));
        }
    });
    
    res.json({ success: true });
});


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


app.get('/api/data', (req, res) => {
    res.json(latestData || { message: 'No data yet' });
});


const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Waiting for Roblox data...');
});

server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });
}); 