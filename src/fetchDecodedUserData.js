const fetchDecodedUserData = async (token) => {
    if(token){
      try {
          const decodedataUrl = `${process.env.REACT_APP_API_URL}/api/decodedata`;
          const newUser = {
            accessToken:token
           
          };
          const response1 = await fetch(decodedataUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newUser)
          });
   
      
        if (!response1.ok) {
          throw new Error(`HTTP error! Status: ${response1.status}`);
        }
    
        const data = await response1.json();
        return data;  // Return the decoded user data as JSON
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        throw error;  // Re-throw the error to handle it in the calling code if needed
      }
    }else{
      return null;
    }
    };
    
    export default fetchDecodedUserData;
    