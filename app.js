
const http = require('http');
const express = require('express');
const path = require('path');
const session = require('express-session');
const mongoose = require('mongoose');

let Chat = require('./models/Chat');
let Message = require('./models/Message');

mongoose.connect('mongodb://localhost:27017/socket', {useNewUrlParser: true});
const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());
app.use(express.urlencoded({extended:true}));

let sessionMiddleWare = session({
    secret: 'hfdb677kk8l896g',
    saveUninitialized:false,
    resave:false
});

app.use(sessionMiddleWare);



let server = http.createServer(app);

let io = require('socket.io')(server);

io.use((socket, next)=>{
 sessionMiddleWare(socket.request, socket.request.res, next)
});
io.on('connect', async function(socket) {
    console.log('connected', socket.id);
    let principal = socket.request.session.principal
        ?socket.request.session.principal
        :{name:'Anonim'};

    let chat = socket.request.session.chat
        ?socket.request.session.chat
        :{_id : '5c3ee883440e2718bc611fa4'};

    socket.join(chat._id);

    io.to(socket.id).emit('init',{
       messages: await Message.find({chat:chat._id})
    });

    io.to(socket.id).emit('message',{
        text: 'Welcome!',
        author: 'Admin',
        date: new Date()
    });

    socket.broadcast.to(chat._id).emit('message',{ message що він приєднався в кімнату
        text: `${principal.name} connected!`,
        author: 'Admin',
        date: new Date()
    });
    socket.on('message',async (data)=>{
        let message = data.message;
        let date = new Date();
        let newMessage = await Message.create({
            author : principal.name,
            chat,
            text : message,
            date
        });
        io.to(chat._id).emit('message', newMessage);
    });



    socket.on('disconnect', ()=>{
        console.log('disconnected', socket.id);
        socket.broadcast.to(chat._id).emit('message',{
            text: `${principal.name} disconnected!`,
            author: 'Admin',
            date: new Date()
        });
    })
});














app.get('/', (req, res)=>{
    res.render('idex');
});
app.get('/chats', async (req, res)=>{
    let chats = await Chat.find();
    res.render('chats',{
        principal:req.session.principal,
        chats
    });
});



app.get('/conversation/:id',async (req, res)=>{
    req.session.chat = await Chat.findById(req.params.id);
    res.render('chat');
});

app.post('/login', (req, res)=>{
    req.session.principal = req.body;
    res.redirect('/chats')
});

app.post('/create-chat', async(req, res)=>{
    await Chat.create(req.body);
    res.redirect('/chats')
});



server.listen(3000, ()=>{
    console.log('LISTENING !');
});
