const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Statische Dateien aus dem 'public' Verzeichnis bereitstellen
app.use(express.static('public'));

let waitingCustomers = [];
let currentNumber = 1;
let lastResetDate = new Date().toLocaleDateString();

function resetDailyNumber() {
    const today = new Date().toLocaleDateString();
    if (today !== lastResetDate) {
        currentNumber = 1;
        lastResetDate = today;
        waitingCustomers = [];
    }
}

io.on('connection', (socket) => {
    console.log('Ein Benutzer ist verbunden');

    socket.on('newCustomer', (data) => {
        resetDailyNumber();
        data.number = currentNumber++;
        waitingCustomers.push(data);
        io.emit('customerListUpdate', waitingCustomers);
    });

    socket.on('newNumber', (data) => {
        io.emit('updateNumber', data);
    });

    socket.on('removeCustomer', (number) => {
        waitingCustomers = waitingCustomers.filter(customer => customer.number !== number);
        io.emit('customerListUpdate', waitingCustomers);
    });

    socket.on('disconnect', () => {
        console.log('Ein Benutzer hat die Verbindung getrennt');
    });
});

// Verwenden Sie den von Heroku bereitgestellten Port oder 3000 lokal
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server läuft auf Port ${PORT}`);
});
