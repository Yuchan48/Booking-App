require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
var exphbs = require("express-handlebars");

require("./models/booking");

const path = require("path");

const bookingController = require("./controllers/bookingController");


let app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.use("/check", express.static("public"));
app.use("/booked", express.static("public"));
app.use("/confirmed", express.static("public"));

app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(bodyParser.json());

app.set("views", path.join(__dirname, "/views/"));


app.engine(
  "hbs",
  exphbs({
    extname: "hbs",
    defaultLayout: "mainLayout",
    layoutsDir: __dirname + "/views/layouts/",
    runtimeOptions: {
      allowProtoPropertiesByDefault: true,
      allowProtoMethodsBydefault: true,
    },
  })
);
app.set("view engine", "hbs");



app.listen(process.env.PORT || 3000, () => {
  console.log("Express server started at port : " + (process.env.PORT || 3000));
});

app.use(bookingController);


