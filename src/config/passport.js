import local from "passport-local";
import passport from "passport";
import GithubStrategy from "passport-github2";
import { createHash, validatePassword } from "../utils.js";
import { userModel } from "../models/users.models.js";
const jwt = require("passport-jwt");

const LocalStrategy = local.Strategy;

const initializePassport = () => {
  passport.use(
    "register",
    new LocalStrategy(
      { passReqToCallback: true, usernameField: "email" },
      async (req, username, password, done) => {
        const { first_name, last_name, email, age } = req.body;

        try {
          const user = await userModel.findOne({ email: email });
          if (user) {
            return done(null, false);
          }
          const passwordHash = createHash(password);
          const userCreated = await userModel.create({
            first_name: first_name,
            last_name: last_name,
            email: email,
            age: age,
            password: passwordHash,
          });
          console.log(userCreated);
          return done(null, userCreated);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.use(
    "login",
    new LocalStrategy(
      { usernameField: "email" },
      async (username, password, done) => {
        try {
          const user = await userModel.findOne({ email: username });

          if (!user) {
            return done(null, false);
          }

          if (validatePassword(password, user.password)) {
            return done(null, user);
          }

          return done(null, false);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.use(
    "github",
    new GithubStrategy(
      {
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: process.env.CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          console.log(accessToken);
          console.log(refreshToken);
          console.log(process.env.CALLBACK_URL);
          const user = await userModel.findOne({ email: profile._json.email });
          if (!user) {
            const userCreated = await userModel.create({
              first_name: profile._json.name,
              last_name: " ",
              email: profile._json.email,
              age: 18, //Edad por defecto,
              password: "password",
            });
            done(null, userCreated);
          } else {
            done(null, user);
          }
        } catch (error) {
          done(error);
        }
      }
    )
  );

  const cookieExtractor = (req) => {
    let token = null;

    if (req && req.cookies) {
      token = req.cookies["coderCookieToken"];
    }

    return token;
  };

  const JWTStrategy = jwt.Strategy;
  const ExtractJWT = jwt.ExtractJwt;

  passport.use(
    "jwt",
    new JWTStrategy(
      {
        jwtFromRequest: ExtractJWT.fromExtractors([cookieExtractor]),
        secretOrKey: "coderSecret",
      },
      async (jwt_payload, done) => {
        try {
          return done(null, jwt_payload);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (id, done) => {
    const user = await userModel.findById(id);
    done(null, user);
  });
};

export default initializePassport;
