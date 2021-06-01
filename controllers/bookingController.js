const express = require("express");
let router = express.Router({ mergeParams: true });

const mongoose = require("mongoose");
const Booking = mongoose.model("Booking");

router.get("/", (req, res) => {
  if (req.query.err === "emptydate") {
    const {firstName, lastName, email, phone} = req.query;
    res.render("booking/home", { homeError: "please select a date", firstName: firstName, lastName: lastName, phone: phone, email: email });
  } else if (typeof req.query.datetocheck == "string") {
    dateTest(req, res);
  } else {
    res.render("booking/home");
  }
});

router.post("/", (req, res) => {
  const { selectedDate, selectedTime, firstName, lastName, phone, email } = req.body;
  const date = new Date(selectedDate).toDateString();
  if (
    isInfoMissing(req, res) == true &&
    isDateValid(req, res) == true 
    //&& isInfoValid(req, res) == true
  ) {
    Booking.find(
      { selectedDate: date, selectedTime: selectedTime },
      (err, doc) => {
        if (doc != "") {
          res.render("booking/home", { homeError: "time not available", firstName: firstName, lastName: lastName, phone: phone, email: email, selectedDate: selectedDate });
        } else if (err) {
          res.render("booking/home", { homeError: "err booking", firstName: firstName, lastName: lastName, phone: phone, email: email, selectedDate: selectedDate });
        } else {
          saveBooking(req, res);
        }
      }
    );
  }
});

function dateTest(req, res) {
  const {firstName, lastName, phone, email, datetocheck} = req.query;
  let checkDate = new Date(req.query.datetocheck).getTime();
  const today = new Date().toDateString();
  let currentTimeTest = new Date(today).getTime();
  let sixtyDays = checkDate - currentTimeTest;
  if (checkDate < currentTimeTest) {
    res.render("booking/home", { homeError: "date already past", firstName: firstName, lastName: lastName, phone: phone, email: email, selectedDate: datetocheck });
  } else if (sixtyDays >= 5184000000) {
    res.render("booking/home", {
      homeError: "You can only check booking for next 60 days", firstName: firstName, lastName: lastName, phone: phone, email: email, selectedDate: datetocheck
    });
  } else {
    let checkDateStr = new Date(req.query.datetocheck).toDateString();
    Booking.find({ selectedDate: checkDateStr }, (err, docs) => {
      if (!err) {
        let dateOccupied = []; 
        docs.forEach((ele) => dateOccupied.push(ele.selectedTime));

        const times = [ "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30",];
        
        // check for available times
        const availableTimes = times.filter(
          (word) => !dateOccupied.includes(word)
        );
        
        res.render("booking/home", {
          availableTime: availableTimes.join(", "), firstName: firstName, lastName: lastName, phone: phone, email: email, selectedDate: datetocheck
        });
      } else {
        console.log("error finding available time");
        res.render("booking/home", { homeErr: "error searching for the time", firstName: firstName, lastName: lastName, phone: phone, email: email, selectedDate: datetocheck });
      }
    });
  }
}

// validate info for POST /booking
function isInfoMissing(req, res) {
  const { firstName, lastName, email, selectedDate, selectedTime, phone } = req.body;
  let testArr = [firstName, lastName, email, selectedDate, selectedTime];
  const isEmptyArr = (ele) => ele == "";
  if (testArr.some(isEmptyArr)) {
    res.render("booking/home", { homeError: "required field missing", firstName: firstName, lastName: lastName, phone: phone, email: email, selectedDate: selectedDate });
  } else {
    return true;
  }
}

function isDateValid(req, res) {
  const { firstName, lastName, email, selectedDate, selectedTime, phone } = req.body;
  let timeTest = new Date(selectedDate + ", " + selectedTime).getTime();
  let currentTimeTest = new Date().getTime();
  let sixtyDays = timeTest - currentTimeTest;
  if (timeTest < currentTimeTest) {
    res.render("booking/home", { homeError: "Date must not be in the past", firstName: firstName, lastName: lastName, phone: phone, email: email, selectedDate: selectedDate });
  } else if (sixtyDays > 5184000000) {
    res.render("booking/home", {
      homeError: "You can only make booking for next 60 days", firstName: firstName, lastName: lastName, phone: phone, email: email, selectedDate: selectedDate });
  } else {
    return true;
  }
}

//save in mongodb
function saveBooking(req, res) {
  const { firstName, lastName, email, selectedDate, selectedTime, phone } = req.body;

  let shortened = new Date(selectedDate).toDateString();
  
  let booking = new Booking({
    firstName: firstName,
    lastName: lastName,
    email: email,
    phone: phone,
    selectedDate: shortened,
    selectedTime: selectedTime,
    dateTimeArr: shortened + "," + selectedTime,
  });

  booking.save((err, doc) => {
    if (!err) {
      res.redirect("/confirmed/?id=" + doc._id);
    } else {
      res.render("booking/home", { homeError: "error booking", firstName: firstName, lastName: lastName, phone: phone, email: email, selectedDate: selectedDate });
      console.log("Error during sending data : " + err);
    }
  });
}

router.get("/confirmed", (req, res) => {
  const bookingId = req.query.id;
  Booking.findById(bookingId, (err, doc) => {
    if (!err) {
      res.render("booking/confirmed", { data: doc });
    } else {
      res.render("booking/home", {
        homeError: "we couldn't complete your booking",
      });
    }
  });
});

router.get("/check", (req, res) => {
  const searchError = req.query.err;
  const { firstName, lastName, email } = req.query;
  if (searchError == "notfound") {
    res.render("booking/check", { errMessage: "no booking found", firstName: firstName, lastName: lastName, email: email });
  } else if (searchError == "error") {
    res.render("booking/check", { errMessage: "error finding booking", firstName: firstName, lastName: lastName, email: email });
  } else {
    res.render("booking/check");
  }
});

router.get("/booked", (req, res) => {
  const { firstName, lastName, email } = req.query;
  Booking.find(
    { firstName: firstName, lastName: lastName, email: email },
    (err, docs) => {
      if (!docs.length || !dateAsc(docs).length) {
        res.redirect("/check/?err=notfound&firstName=" + firstName + "&lastName=" + lastName + "&email=" + email);
      } else if (err) {
        res.redirect("/check/?err=error&firstName=" + firstName + "&lastName=" + lastName + "&email=" + email);
      } else {
        res.render("booking/booked", {
          firstName: firstName,
          lastName: lastName,
          email: email,
          list: dateAsc(docs),
        });
      }
    }
  );
});

// show all the booking in ascending order in /booked
function dateAsc(docs) {
  let resultStr = docs.sort(
    (a, b) => new Date(a.dateTimeArr) - new Date(b.dateTimeArr)
  );
//filter out the past date  
  let resultArr = resultStr.filter(ele => {
    let currentTimeTest = new Date().getTime();
    let filteredStr = new Date(ele.dateTimeArr).getTime();
    return filteredStr > currentTimeTest
  });
  return resultArr;
}

router.get("/delete/:id", (req, res) => {
  Booking.findByIdAndRemove(req.params.id, (err, doc) => {
    if (!err) {
      console.log("deleted");
      res.redirect(
        "/booked/?firstName=" +
          doc.firstName +
          "&lastName=" +
          doc.lastName +
          "&email=" +
          doc.email
      );
    } else {
      console.log("error deleting the booking : " + err);
    }
  });
});

// check available timeslot in home screen
router.get("/datecheck", (req, res) => {
  let dateToCheck = req.query.selectedDate;
  const {firstName, lastName, phone, email} = req.query
  if (dateToCheck == "") {
    res.redirect("/?err=emptydate&firstName=" + firstName + "&lastName=" + lastName + "&phone=" + phone + "&email=" + email);
  } else {
    res.redirect("/?datetocheck=" + dateToCheck + "&firstName=" + firstName + "&lastName=" + lastName + "&phone=" + phone + "&email=" + email);
  }
});

// guide to /booked from /check
router.get("/booked/:firstName/:lastName/:email", (req, res) => {
  res.redirect("/booked");
});

module.exports = router;
