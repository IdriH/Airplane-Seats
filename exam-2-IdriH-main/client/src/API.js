const APIURL = 'http://localhost:3000';

/**
 * A utility function for parsing the HTTP response.
 */
function getJson(httpResponsePromise) {
    // server API always return JSON, in case of error the format is the following { error: <message> } 
    return new Promise((resolve, reject) => {
      httpResponsePromise
        .then((response) => {
          if (response.ok) {
  
           // the server always returns a JSON, even empty {}. Never null or non json, otherwise the method will fail
           response.json()
              .then( json => resolve(json) )
              .catch( err => reject({ error: "Cannot parse server response" }))
  
          } else {
            // analyzing the cause of error
            response.json()
              .then(obj => 
                reject(obj)
                ) // error msg in the response body
              .catch(err => reject({ error: "Cannot parse server response" })) // something else
          }
        })
        .catch(err => 
          reject({ error: "Cannot communicate"  })
        ) // connection error
    });

  }

  const getSeats = async (plane_id) => {
    return getJson(
        fetch(APIURL + '/api/seats/' + plane_id)
    ).then( json => {
        return json.map((seat) => {  
            const clientSeat = {
                id: seat.seat_id,
                status: seat.status,
            }
            
            
            return clientSeat;
        })
    })
    
    ;

  }

  async function putRandomBooking(requestData) {
    console.log(requestData);

    const response = await fetch(APIURL + `/api/random/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',  // this parameter specifies that authentication cookie must be forwared
      body: JSON.stringify(requestData),
    });
    
    if (!response.ok) {
      // get the error message from the server's response, if available
      let errMsg = await response.text();
      
  
      console.log(errMsg);
  
      // throw an error manually
      if(typeof errMsg === 'object' && errMsg !== null) {
        // If errMsg is an object, stringify it so it can be shown as a message
        throw new Error(JSON.stringify(errMsg));
      } else {
        // Else, it's a string and can be shown directly
        throw new Error(errMsg || "Something went wrong");
      }
    }
  
    return response.json();
  }

  async function putBooking (requestData,plane_id) {
   

    const response = await fetch(APIURL + `/api/seats/`+ plane_id, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(requestData),
    });
    
    if (!response.ok) {
      // get the error message from the server's response, if available
      let errMsg = await response.text();
      /*
      let json_error = JSON.parse(errMsg);
      console.log(JSON.stringify(json_error.seatsAlreadybooked));
      
      console.log(response.text.seatsAlreadybooked.json());
      if(response.seatsAlreadybooked && response.seatsAlreadybooked.length > 0){
        console.log("!!!!!!!!!!!!!!")
        throw new Error(response.seatsAlreadybooked.map(seat => seat.seat_id).join(', '));
      }
        console.log(errMsg);
      */
      console.log(errMsg);
      // throw an error manually
      if(typeof errMsg === 'object' && errMsg !== null) {
        // If errMsg is an object, stringify it so it can be shown as a message
        throw new Error(JSON.stringify(errMsg));
      } else {
        // Else, it's a string and can be shown directly
        throw new Error(errMsg || "Something went wrong");
      }
    }
  
    return response.json();
  }
  async function getUserBooking(planeId) {
    console.log("getUserBooking called " + planeId)
    const response = await fetch(APIURL + `/api/seats/user/`+ planeId, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',

    });
  
    if (!response.ok) {
      // get the error message from the server's response, if available
      let errMsg = await response.text();
  
      console.log(errMsg);
  
      // throw an error manually
      if(typeof errMsg === 'object' && errMsg !== null) {
        // If errMsg is an object, stringify it so it can be shown as a message
        throw new Error(JSON.stringify(errMsg));
      } else {
        // Else, it's a string and can be shown directly
        throw new Error(errMsg || "Something went wrong");
      }
    }
  
    // Get full response from server
    const responseData = await response.json();
  
    // Extract and return only the seat_ids
    return responseData.map(booking => booking.seat_id);
  }





  
  export { getUserBooking, putBooking };
  
  

async function deleteUserBookings(userId, planeId) {
  const response = await fetch(APIURL + `/api/seats/user/delete/` + planeId, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include'
  });

  if (!response.ok) {
    // get the error message from the server's response, if available
    let errMsg = await response.text();

    console.log(errMsg);

    // throw an error manually
    if(typeof errMsg === 'object' && errMsg !== null) {
      // If errMsg is an object, stringify it so it can be shown as a message
      throw new Error(JSON.stringify(errMsg));
    } else {
      // Else, it's a string and can be shown directly
      throw new Error(errMsg || "Something went wrong");
    }
  }

  return response.json();
}



  const getNoAvaliableSeats  = async(plane_id) => {
    return getJson(
      fetch(APIURL + `/api/seats/available/` + plane_id)
    )
  }

/**
 * This function wants username and password inside a "credentials" object.
 * It executes the log-in.
 */
const logIn = async (credentials) => {
  console.log(credentials);
  console.log("logInAPI called")
  return getJson(fetch(APIURL + '/api/sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',  // this parameter specifies that authentication cookie must be forwared
    body: JSON.stringify(credentials),
  })
  )
};

/**
 * This function is used to verify if the user is still logged-in.
 * It returns a JSON object with the user info.
 */
const getUserInfo = async () => {
  return getJson(fetch(APIURL + '/api/sessions/current', {
    // this parameter specifies that authentication cookie must be forwared
    credentials: 'include'
  })
  )
};

/**
 * This function destroy the current user's session and execute the log-out.
 */
const logOut = async() => {
  console.log("logOutAPI called from API.js")
  return getJson(fetch(APIURL + '/api/sessions/current', {
    method: 'DELETE',
    credentials: 'include'  // this parameter specifies that authentication cookie must be forwared
  })
  )
}




const API = {logIn, getUserInfo, logOut, deleteUserBookings ,getJson,getSeats,getNoAvaliableSeats,putRandomBooking,putBooking};
export default API;