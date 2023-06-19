var GoogleStrategy = require("passport-google-oauth20");
const passport = require("passport");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:8080/auth/google/callback",
    },
    function (accessToken, refreshToken, profile, cb) {
    //   console.log(accessToken, profile);
      return cb(null, {
        accessToken,
        name: profile.name.givenName,
        email: profile.emails[0].value,
      }); // error, message

      // to create a jwt token
      // payload header signature
    }
  )
);

// export the whole function
// export using object notation/ array
