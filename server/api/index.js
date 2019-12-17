const router = require("express").Router();
const passport = require("passport");
const express = require("express");
const db = require("../db/db");
const { Subject, User, Node, Tree } = require("../db/models/index");

router.use(express.json());
router.use(passport.initialize());
router.use(passport.session());
router.use(express.urlencoded({ extended: true }));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await db.models.User.findByPk(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

router.get("/users", (req, res, next) => {
  User.findAll({ attributes: ["id", "email", "name"] })
    .then(user => res.send(user))
    .catch(next);
});

router.post("/login", (req, res, next) => {
  User.findOne({ where: { email: req.body.email } })
    .then(user => {
      if (!user) {
        res.status(401).send("Email is not correct or registered");
      } else if (!user.correctPassword(req.body.password, user)) {
        req.status(401).send("Incorrect password");
      } else {
        req.login(user, err => (err ? next(err) : res.json(user)));
      }
    })
    .catch(next);
});

router.post("/register", (req, res, next) => {
  const newuser = {name: req.body.name, email: req.body.email, password: req.body.password}
  User.create(newuser)
    .then(user => {
      req.login(user, err => (err ? next(err) : res.json(user)));
    })
    .catch(err => {
      if (err.name === "SequelizeUniqueConstraintError") {
        res.status(401).send("User already xists");
      } else {
        next(err);
      }
    });
});

router.post("/logout", (req, res) => {
  req.logout();
  req.session.destroy();
  res.redirect("/");
});

router.get("/nodes", (req, res, next) => {
  return Node.findAll()
    .then(nodes => res.send(nodes))
    .catch(next);
});
router.post("/nodes", (req, res, next) => {
  return Node.create(req.body)
    .then(node => res.status(201).send(node))
    .catch(next);
});
router.get("/subjects", (req, res, next) => {
  return Subject.findAll()
    .then(subjects => res.send(subjects))
    .catch(next);
});

router.get("/subjects/:id", (req, res, next) => {
  Subject.findByPk(req.params.id)
    .then(subjects => res.send(subjects))
    .catch(next);
});
router.post("/subjects", (req, res, next) => {
  console.log("API POST ", req.body);
  return Subject.create(req.body)
    .then(subject => res.status(201).send(subject))
    .catch(next);
});

router.get("/trees", (req, res, next) => {
  return Tree.findAll()
    .then(trees => res.send(trees))
    .catch(next);
});

router.post("/trees", (req, res, next) => {
  return Tree.create(req.body)
    .then(tree => res.status(201).send(tree))
    .catch(next);
});

module.exports = router;
