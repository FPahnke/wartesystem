const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

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

server.listen(3000, () => {
    console.log('Server läuft auf Port 3000');
});
