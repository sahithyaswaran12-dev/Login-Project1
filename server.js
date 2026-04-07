const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const nocache = require('nocache');
const path = require('path');

const app = express();
const PORT = 3000;

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(nocache()); // To prevent browser from caching pages after logout

// Session handling
app.use(session({
    secret: 'my_super_secret_key_123',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Predefined user credentials
const validUser = {
    username: 'admin',
    password: 'password'
};

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
}

// Routes
// Redirect root to login
app.get('/', (req, res) => {
    if (req.session.user) {
        res.redirect('/home');
    } else {
        res.redirect('/login');
    }
});

// GET Login Page
app.get('/login', (req, res) => {
    if (req.session.user) {
        return res.redirect('/home'); // Redirect to home if already logged in
    }
    const error = req.query.error === 'true' ? 'Incorrect username or password' : null;
    res.render('login', { error: typeof error !== 'undefined' ? error : null });
});

// POST Login
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    if (username === validUser.username && password === validUser.password) {
        req.session.user = username; // Create session
        res.redirect('/home');
    } else {
        res.render('login', { error: 'Incorrect username or password' });
    }
});

// GET Home Page
app.get('/home', isAuthenticated, (req, res) => {
    res.render('home', { username: req.session.user });
});

// POST Logout
app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/home');
        }
        res.clearCookie('connect.sid');
        res.redirect('/login');
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
