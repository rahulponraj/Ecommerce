const addToCart = (productId) => {
  console.log(productId);

  const loader = document.getElementById("loader");
  loader.style.display = "block"; // Show the loader when adding to cart.

  fetch("/home/singleProduct/addToCart", {
      method: "post",
      headers: {
          "Content-Type": "application/json",
      },
      body: JSON.stringify({
          productId: productId,
      }),
  })
  .then((response) => response.json())
  .then((data) => {
      // Handle the response data here (addToCartSuccess or addToCartError).
      const addToCartSuccess = document.getElementById("addedToCartMsg");
      const addToCartError = document.getElementById("addToCartError");
      if (data.success) {
          setTimeout(()=>{
              addToCartSuccess.textContent = data.message;
              addToCartError.textContent = "";
          },1500 )
          
         
      } else {
          addToCartSuccess.textContent = "";
          addToCartError.textContent = data.message;
      }

     
      setTimeout(() => {
          loader.style.display = "none";
      }, 1400);

  })
  .catch((error) => {
      console.error("Error occurred:", error);
      loader.style.display = "none"; // Hide the loader in case of an error.
  });
};

const addToWishlist=(productId)=>{
   

    fetch("/home/singleProduct/addToWishlist", {
        method: "post",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            productId: productId,
        }),
    })
    .then((response) => response.text()) // Change this line to response.text()
    .then((responseText) => {
        console.log(responseText); // Log the raw response text
        const data = JSON.parse(responseText);
        // Rest of your code handling parsed data
    
        const addToCartSuccess = document.getElementById("addedToCartMsg");
        const addToCartError = document.getElementById("addToCartError");

        if (data.success) {
            loader.style.display = "none"; 
            addToCartSuccess.textContent = data.message;
            addToCartError.textContent = "";

            setTimeout(() => {
                addToCartSuccess.textContent = "";
            }, 1500);
        } 
        if (!data.success) {
            addToCartSuccess.textContent = "";
            addToCartError.textContent = "Please login";
        
            if (data.redirectTo) {
                window.location.href = data.redirectTo;
            }
        }
    })
    .catch((error) => {
        console.error("Error occurred:", error);
        loader.style.display = "none"; // Hide the loader in case of an error.
    });
}