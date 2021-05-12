const date = new Date();

const renderForm = () => {
  //show timeslot in scrollbar in /booking screen
  const times = [ "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30" ];  
  let scrollWindow = document.querySelector("#selectedTime");
  let scrollBar = "";
  for (let f = 0; f < times.length; f++) {
    let timeLoop = times[f];
    scrollBar += `<option value="${timeLoop}">${timeLoop}</option>`;
    scrollWindow.innerHTML = scrollBar;
  }
    
  //alert for the invalid input
  $("#homeBtn").on("click", function() {    
    let emailInput = $("#email").val();
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailInput.match(emailRegex) && emailInput !== ""){
      alert("invalid email address")
    }

    let phoneNum = $("#phone").val();
    const phoneRegex =  /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/;
    if (!phoneNum.match(phoneRegex) && phoneNum !== ""){
      alert("invalid phone number")
    } 

    let firstNameInput = $("#firstName").val();
    let lastNameInput = $("#lastName").val();
    let nameRegex = /^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z ]*)*$/;     
    if (!firstNameInput.match(nameRegex) && firstNameInput !== ""){
      alert("invalid first name");
    }
    if (!lastNameInput.match(nameRegex) && lastNameInput !== ""){
      alert("invalid last name");
    }    
  });
};

renderForm();

