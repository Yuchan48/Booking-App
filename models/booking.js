const mongoose = require("mongoose");

mongoose.connect(
  process.env.DB,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  },
  (err) => {
    if (!err) {
      console.log("MongoDB Connection Succeeded.");
    } else {
      console.log("Error in DB Connection: " + err);
    }
  }
);

let bookingSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: "This field is required.",
  },
  lastName: {
    type: String,
    required: "This field is required.",
  }, 
  email: {
    type: String,
    required: "This field is required.",
  },
  phone: {
    type: String,
  },
  selectedDate: {
    type: String,
    required: "This field is required.",
  },
  selectedTime: {
    type: String,
    required: "This field is required.",
  },
  dateTimeArr: {
    type: String
  }
});

//custom validation for email
bookingSchema.path("email").validate((val) => {
  emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return emailRegex.test(val);
}, "Invalid e-mail.");

mongoose.model("Booking", bookingSchema);
