document.addEventListener("DOMContentLoaded", function() {
  var form = document.getElementById("signup-form-v");
  form.addEventListener("submit", function(event) {
      event.preventDefault(); 
      
      var nameInput=document.getElementById("name");
      var emailInput = document.getElementById("email");
      var passwordInput = document.getElementById("password");
     
      var nameError=document.getElementById("name-error")
      var emailError = document.getElementById("email-error");
      var passwordError = document.getElementById("password-error");
    
      nameError.textContent=""
      emailError.textContent = "";
      passwordError.textContent = "";
      
      
      var isValid = true;
      
      
      if (nameInput.value.length<4){
        nameError.textContent="Name should have atleast 4 characters";
        isValid=false;
      }

      var emailRegex = /^\S+@\S+\.\S+$/;
      
      if (!emailRegex.test(emailInput.value)) {
          emailError.textContent = "Enter a valid email address";
          isValid = false;
      }
      
      if (passwordInput.value.length < 6) {
          passwordError.textContent = "Password must be at least 6 characters";
          isValid = false;
      }
    
      if (isValid) {
          form.submit();
      }
  });
});
