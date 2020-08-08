const express = require("express");
const path = require("path");
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { check, validationResult } = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const bcrypt = require('bcryptjs');
var multer = require('multer');
const passport = require('passport');
const config = require('./config/database');
const port = 8000;
const io = require('socket.io')(3000)
// init app
const app = express();





// mongoose connect
mongoose.connect('mongodb://localhost/Alumni', { useNewUrlParser: true });
let db = mongoose.connection;

// check connection
db.once('open', function () {
    console.log('connected to mongo db');
});

// check for db error
db.on('error', function (err) {
    console.log(err);
});


// below real code
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/uploads')
    },
    filename(req, file, cb) {
        cb(null, file.originalname)
    }
})

// multer
var upload = multer({ storage: storage });

var picSchema = new mongoose.Schema({
    picspath: String,
    title: String,
    body: String
})

//collection schema will be save in db by name picsdemo 
// picModel contain the instance of picdemo by which it can manipulate data in it.
var picModel = mongoose.model('picsdemo', picSchema)


// Bring in models for Ourstories
let Ourstories = require('./models/ourstories');

// Bring in models for Register user
let User = require('./models/users');



// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());


//Express specific stuff
app.use('/static', express.static('static')) //serves static files
//app.use(express.static(picPath));

//pug specific stuff
app.set('view engine', 'pug') //set the template engine as pug
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')) //set the views directory

var picPath = path.resolve(__dirname, 'public');

// Express Session Middlewarre
app.set('trust proxy', 1)
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// Express Messages Midleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

// Passport Config
require('./config/passport')(passport);

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', function (req, res, next) {
    res.locals.user = req.user || null;
    next();
});

//Endpoints
app.get('/', (req, res) => {
    res.render('home.pug');
});


// Forum page get request
app.get('/forum', (req, res) => {
    picModel.find((err, data) => {
        if (err) {
            console.log(err)
        }
        if (data) {
            // console.log(data)
            data = data.reverse();
            res.render('forum_add.ejs', { data: data })
        }
        else {
            res.render('forum_add.ejs', { data: {} })
        }
    })

});

// Forum upload get request
app.get('/forum/create', ensureAuthenticated, (req, res) => {
    picModel.find((err, data) => {
        if (err) {
            console.log(err)
        }
        if (data) {
            // console.log(data)
            data = data.reverse();
            res.render('forum.ejs', { data: data })
        }
        else {
            res.render('forum.ejs', { data: {} })
        }
    })

});
// Forum upload post request
app.post('/forum/create', upload.single('pic'), (req, res) => {
    var x = 'uploads/' + req.file.originalname;
    var title = req.body.title;
    var body = req.body.body;
    console.log(title);
    var picss = new picModel({
        picspath: x,
        title: title,
        body: body
    })
    picss.save((err, data) => {
        if (err) {
            console.log(err)
        }
        else {
            console.log('data', data)
            res.redirect('/forum')
        }
    })
});

// Forum upload get request for downlaod
app.get('/forum/download/:id', (req, res) => {
    picModel.find({ _id: req.params.id }, (err, data) => {
        if (err) {
            console.log(err)
        }
        else {
            var path = __dirname + '/public/' + data[0].picspath;
            res.download(path);
        }
    })
})


// About 
app.get('/about', (req, res) => {
    res.render('about.pug');
});

// GET - Register route
app.get('/users/register', (req, res) => {
    res.render('register.pug');
});

// POST -register routes
app.post('/users/register', [
    check('name', 'Name is required').isLength({ min: 1 }),
    check('email', 'Email is not valid').isEmail(),
    check('username', 'Username is required').isLength({ min: 1 }),
    check('password', 'Password is required').isLength({ min: 5 }),
    check('password2', 'Please confirm password').custom((value, { req, loc, path }) => {
        if (value !== req.body.password) {
            throw new Error("Passwords don't match");
        } else { return value; }
    })
], (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.render('register.pug', {
            errors: errors.mapped()
        });
    } else {
        let newUser = new User({
            name: name,
            email: email,
            username: username,
            password: password
        });
        bcrypt.genSalt(10, function (err, salt) {
            bcrypt.hash(newUser.password, salt, function (err, hash) {
                if (err) {
                    console.log(err);
                }
                newUser.password = hash;
                newUser.save(function (err) {
                    if (err) {
                        console.log(err);
                        return;
                    } else {
                        req.flash('success', 'you are now registered can login');
                        res.redirect('/users/login');
                    }
                })
            });
        });
    }

});

// Get - Login route
app.get('/users/login', (req, res) => {
    res.render('login.pug');
});

// Login Process
app.post('/users/login', function (req, res, next) {
    passport.authenticate('local', {
        successRedirect: '/ourstories',
        failureRedirect: '/users/login',
        failureFlash: true,
    })(req, res, next);
});

// Logout 
app.get('/users/logout', (req, res) => {
    req.logout();
    req.flash('success', 'You are logged out');
    res.redirect('/users/login');
});

// home route of ourstories
app.get('/ourstories', ensureAuthenticated, (req, res) => {
    Ourstories.find({}, function (err, ourstories) {
        if (err) {
            console.log(err);
        } else {
            res.render('ourstories.pug', {
                title: 'Stories',
                ourstories: ourstories
            });
        }
    });
});


// Get route for add ourstories
app.get('/ourstories/add', ensureAuthenticated, (req, res) => {
    res.render('add_stories.pug');
});

//POST route for add stories
app.post('/ourstories/add', [
    check('name', 'Enter valid name').isLength({ min: 1 }),
    check('email', 'Enter valid email').isLength({ min: 1 }),
    check('currentcomp', 'Enter valid company').isLength({ min: 1 }),
    check('location', 'Enter valid location').isLength({ min: 1 }),
    check('oldcomp', 'Enter valid oldcomp').isLength({ min: 1 }),
    check('skills', 'Enter valid skills').isLength({ min: 1 }),
    check('year', 'Enter valid Graduation year').isLength({ min: 1 }),
    check('body', 'Enter valid body').isLength({ min: 1 })
], (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.render('add_stories.pug', {
            errors: errors.mapped()
        });
    }
    let ourstories = new Ourstories();
    ourstories.name = req.body.name;
    ourstories.email = req.body.email;
    ourstories.currentcomp = req.body.currentcomp;
    ourstories.location = req.body.location;
    ourstories.oldcomp = req.body.oldcomp;
    ourstories.skills = req.body.skills;
    ourstories.year = req.body.year;
    ourstories.body = req.body.body;
    ourstories.author = req.user._id;

    ourstories.save(function (err) {
        if (err) {
            console.log(err);
            return;
        } else {
            req.flash('success', 'story added');
            res.redirect('/ourstories');
        }
    });

});

// Get single route
app.get('/ourstories/:id', (req, res) => {
    Ourstories.findById(req.params.id, function (err, ourstories) {
        User.findById(ourstories.author, function (err, user) {
            res.render('singlestory.pug', {
                ourstories: ourstories,
                author: user.name
            });
        });
    });
});

// Get single route For edit
app.get('/ourstories/edit/:id', ensureAuthenticated, (req, res) => {
    Ourstories.findById(req.params.id, function (err, ourstories) {
        if (ourstories.author != req.user._id) {
            req.flash('danger', 'Not Authorized');
            res.redirect('/ourstories');
        }
        res.render('edit_stories.pug', {
            title: 'Edit Description',
            ourstories: ourstories
        });
    });
});

//POST route for Edit stories
app.post('/ourstories/edit/:id', (req, res) => {
    let ourstories = {};
    ourstories.name = req.body.name;
    ourstories.year = req.body.year;
    ourstories.currentcomp = req.body.currentcomp;
    ourstories.oldcomp = req.body.oldcomp;
    ourstories.body = req.body.body;

    let query = { _id: req.params.id }

    Ourstories.update(query, ourstories, function (err) {
        if (err) {
            console.log(err);
        } else {
            req.flash("success", "Ourstories added");
            res.redirect('/ourstories');
        }
    });
});

// DELETE Route
app.delete('/ourstories/:id', (req, res) => {
    if (!req.user._id) {
        res.status(500).send();
    }
    let query = { _id: req.params.id }
    Ourstories.findById(req.params.id, function (err, ourstories) {
        if (ourstories.author != req.user._id) {
            res.status(500).send();
        } else {
            Ourstories.remove(query, function (err) {
                if (err) {
                    console.log(err);
                }
                res.send('success');
            });
        }
    });

});

// POST route For search
app.post('/ourstories', function (req, res) {

    const fltrName = req.body.fltrname;

    if (fltrName != '') {
        var fltrParameter = {
            currentcomp: fltrName
        }
    } else {
        var fltrParameter = {}
    }

    var storyfilter = Ourstories.find(fltrParameter);
    storyfilter.exec(function (err, data) {
        if (err) {
            throw err;
        } else {
            res.render('ourstories.pug', {
                // title: 'Stories',
                ourstories: data
            });
        }
    });
});

// Get search
app.get("/ourstories", function (req, res, next) {
    var regex = new RegExp(req.query["term"], 'i');

    var storyfilter = Ourstories.find({ currentcomp: regex }, { 'currentcomp': 1 }).sort({ "updated_at": -1 }).sort({ "created_at": -1 }).limit(20);
    storyfilter.exec(function (err, data) {
        console.log(data);
        var result = [];
        if (!err) {
            if (data && data.length && data.length > 0) {
                data.forEach(user => {
                    let obj = {
                        id: user._id,
                        label: user.currentcomp
                    };
                    result.push(obj);
                });
            }

            res.jsonp(result);
        }
    });
});

// acces control
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        req.flash('danger', 'Please login');
        res.redirect('/users/login');
    }
}


//start the server
app.listen(port, () => {
    console.log("the app started");
});

