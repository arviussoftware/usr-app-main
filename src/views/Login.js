import React, { useState } from "react";
import { Button, Card, CardBody, Form, FormGroup, Input, Label } from "reactstrap";
import "../assets/css/Login.css"; // Importing the CSS file
import { useNavigate } from "react-router-dom";
import lo from "../assets/img/login12.jpg"
import { toast } from 'react-toastify';
import fetchDecodedUserData from '../fetchDecodedUserData';
import log from "../assets/img/rd.png"

const Login = () => {

  const navigate = useNavigate();

  const [loadingId, setLoadingId] = useState(false);
  const [loading, setLoading] = useState(false);
  const [username, setUserName] = useState();
  const [Userpassword, setPassword] = useState();
  async function loginUser(credentials) {

    try {

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/validateUser`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });
      const data = await response.json();
      debugger
      if (data.token === 'Invalid credentials') {
        //setLoading(false);
        setLoading(false);
        toast.warning("Incorrect credentials! Kindly try again.");
        return false;
      }
      if (data.token === 'INACTIVE') {
        //setLoading(false);
        setLoading(false);
        toast.warning("Your account is inactive. Please contact support to reactivate.");
        return false;
      }

      return data;
    } catch (error) {
      setLoading(false);
      toast.error("Login failed! Please check your connection.");
      return false;
    }
  }
  function generateGUIId(prefix = "gui") {
    return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }
  const handleSubmit = async e => {
    e.preventDefault();
    setLoadingId(true);
    setLoading(true);
    const token = await loginUser({
      username,
      Userpassword
    });
    sessionStorage.setItem('userData', JSON.stringify(token))
    sessionStorage.setItem('login_id', JSON.stringify(generateGUIId()))
    var fetchdta = await fetchDecodedUserData(token.token);
    if (token) {
      toast.success("Login successful!");
      navigate('/dashboard');
      await insertAuditReport(fetchdta);
    }
    else {
      navigate('/')
    }
    setLoadingId(false);
  }

  const insertAuditReport = async (userdataaudit) => {

    try {
      const userloginid = userdataaudit?.data?.userId.toString();
      const loginguid = JSON.parse(sessionStorage.getItem('login_id'));
      const activity = "Login";
      const startdate = new Date().toISOString();
      const enddate = null;
      const newUser = {
        userloginid,
        loginguid,
        activity,
        startdate,
        enddate
      };

       const session = JSON.parse(sessionStorage.getItem("userData"));
      const url = `${process.env.REACT_APP_API_URL}/api/v1/addauditreport`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {  'Authorization': `Bearer ${session?.token}`,'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });

      if (!response.ok) {
        //throw new Error(`HTTP error! Status: ${response.status}`);
        toast.warn(`HTTP error! Status: ${response.status}`)

      }
      const data = await response.json();
      //console.log(data);
      return data;
    }
    catch (error) {
      console.error('Error inserting audit report:', error);
      throw error;
    }
  }



  return (
    <div className="container1">
      <input type="checkbox" id="flip" />
      <div className="cover">
        <div className="front">
          <img src={lo} alt="" />
        </div>
        <div className="back">
          {/* <img className="backImg" src="images/backImg.jpg" alt=""> */}
          <div className="text">
            <span className="text-1">Complete miles of journey <br /> with one step</span>
            <span className="text-2">Let's get started</span>
          </div>
        </div>
      </div>
      <div className="forms">
        <div className="form-content">
          <div className="login-form">
            <img className="login-logo" src={log} alt="" />
            <div className="title">Login</div>
            <form onSubmit={handleSubmit}>
              <div className="input-boxes">
                <div className="input-box">
                  <i className="fas fa-envelope"></i>
                  <input type="text" name="username" id="username" placeholder="Enter your user-id"
                    required
                    onChange={e => setUserName(e.target.value)} />
                </div>
                <div className="input-box">
                  <i className="fas fa-lock"></i>
                  <input type="password" name="password" id="password" placeholder="Enter your password"
                    required
                    onChange={e => setPassword(e.target.value)} />
                </div>
                <div className="button input-box">
                  <input type="submit" style={{
                    border: "1px solid #87b6e6",
                    backgroundColor: "white",
                    color: "#1976d2",
                    borderRadius: "5px",
                    padding: "6px 12px",
                    textTransform: "none",
                  }} value={loading ? "Loading..." : "Submit"} disabled={loading} />
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
