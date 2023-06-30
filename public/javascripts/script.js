// function addToCart(prodId){
//     $.ajax({
//       url:'/add-to-cart/'+prodId,
//       method:'get',
//       success:(response)=>{
//         if(response.status)
//         {   
//                 let count=$('#cart-count').html()
//                 count=parseInt(count)+1
//                 $("#cart-count").html(count)
                

//         }
           
//       }
//     })
//   }

  // function addToWishlist(prodId){
  //   $.ajax({
  //     url:'/add-to-Wishlist/'+prodId,
  //     method:'get',
  //     success:(response)=>{
  //       if(response.status)
  //       {   
               
                

  //       }
           
  //     }
  //   })
  // }


  function addToCart(prodId){
    $.ajax({
      url:'/add-to-cart/'+prodId,
      method:'get',
      success:(response)=>{
        if(response.status)
        {   

                 let count=$('#cart-count').html()
                  count=parseInt(count)+1
                  $("#cart-count").html(count)
                
                Swal.fire({
                  title: "Item added to Cart!",
                  text: response.message,
                  icon: "success"
                });
              } else {
                Swal.fire({
                  title: 'Login Required',
                  text: 'You need to be logged in to add items to the Cart. Please login or create an account.',
                  icon: "error"
                });
              } 

            }         
      
    })
  }

  function addToWishlist(prodId){
    $.ajax({
      url:'/add-to-Wishlist/'+prodId,
      method:'get',
      success:(response)=>{
        if(response.status)
        {   
                
                Swal.fire({
                  title: "Item added to wishlist!",
                  text: response.message,
                  icon: "success"
                });
              } else {
                Swal.fire({
                  title: 'Login Required',
                  text: 'You need to be logged in to add items to the wishlist. Please login or create an account.',
                  icon: "error"
                });
              } 

            }         
      
    })
  }