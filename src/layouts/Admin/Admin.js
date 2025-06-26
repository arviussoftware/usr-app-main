// import React from "react";
// import { useLocation } from "react-router-dom";
// // Javascript plugin used to create scrollbars on windows
// import PerfectScrollbar from "perfect-scrollbar";

// // Core components
// import AdminNavbar from "components/Navbars/AdminNavbar.js";
// import Footer from "components/Footer/Footer.js";
// import Sidebar from "components/Sidebar/Sidebar.js";
// import { Outlet } from "react-router-dom";
// import logo from "assets/img/react-logo.png";
// import usrlogo from 'assets/img/rd.png'
// // reactstrap components
// import {
//   Button,
//   Collapse,
//   DropdownToggle,
//   DropdownMenu,
//   DropdownItem,
//   UncontrolledDropdown,
//   Input,
//   InputGroup,
//   NavbarBrand,
//   Navbar,
//   NavLink,
//   Nav,
//   Container,
//   Modal,
//   NavbarToggler,
//   ModalHeader,
// } from "reactstrap";

// var ps;

// function Admin({ children }) {
//   const location = useLocation();
//   const mainPanelRef = React.useRef(null);
//   const [sidebarOpened, setSidebarOpened] = React.useState(
//     document.documentElement.className.indexOf("nav-open") !== -1
//   );
//   const toggleSidebar = () => {
//     document.documentElement.classList.toggle("nav-open");
//     setSidebarOpened(!sidebarOpened);
//   };

//   return (
//     <div className="wrapper" style={{ zoom: '90%' }}>
//       <Sidebar
//         logo={{
//           outterLink: "https://www.creative-tim.com/",
//           text: "",
//           imgSrc: usrlogo,

//         }}
//         toggleSidebar={toggleSidebar}
//       />
//       <div className="main-panel" >
//       <div className="navbar-toggle d-inline" >
//           <NavbarToggler onClick={toggleSidebar} >
//             <span className="navbar-toggler-bar bar1" />
//             <span className="navbar-toggler-bar bar2" />
//             <span className="navbar-toggler-bar bar3" />
//           </NavbarToggler>
//         </div>

//         <AdminNavbar toggleSidebar={toggleSidebar} sidebarOpened={sidebarOpened} />
//         <div className="content">
//           <Outlet />
//         </div>
//         {/* <Footer /> */}
//       </div>
//     </div>
//   );
// }

// export default Admin;


import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
// Javascript plugin used to create scrollbars on windows
import PerfectScrollbar from "perfect-scrollbar";

// Core components
import AdminNavbar from "components/Navbars/AdminNavbar.js";
import Footer from "components/Footer/Footer.js";
import Sidebar from "components/Sidebar/Sidebar.js";
import { Outlet } from "react-router-dom";
import logo from "assets/img/react-logo.png";
import usrlogo from 'assets/img/rd.png'
import { toast, ToastContainer } from "react-toastify";

// reactstrap components
import {
  Button,
  Collapse,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  UncontrolledDropdown,
  Input,
  InputGroup,
  NavbarBrand,
  Navbar,
  NavLink,
  Nav,
  Container,
  Modal,
  NavbarToggler,
  ModalHeader,
} from "reactstrap";

var ps;

function Admin({ children }) {
  const location = useLocation();
  const mainPanelRef = React.useRef(null);
  const [showpopup, setShowPopUp] = useState(false);
  const navigate = useNavigate();
  const [sidebarOpened, setSidebarOpened] = React.useState(
    document.documentElement.className.indexOf("nav-open") !== -1
  );
  const toggleSidebar = () => {
    document.documentElement.classList.toggle("nav-open");
    setSidebarOpened(!sidebarOpened);
  };


  const continuesession = async () => {
    try {
      const sessionpop = JSON.parse(sessionStorage.getItem("userData"));
      const refToken = sessionpop?.RefToken;
      const tokbody = {
        refToken,
      };
 
      const url = `${process.env.REACT_APP_API_URL}/api/refreshToken`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tokbody),
      });
      const sessionval = await response.json();

      if (sessionval.token) {
        sessionStorage.setItem("userData", JSON.stringify(sessionval));
        setShowPopUp(false);
      } else {
        toast.error("Failed to refresh session.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "light",
        });
      }
    } catch (error) {
      console.error("Error refreshing session:", error);
    }
  };

  const handleClose = () => {
    setShowPopUp(false);
  };

  const handleLogout = async () => {
    await insertAuditReport();
    sessionStorage.removeItem('userData');
    navigate('/');
  }

  const insertAuditReport = async () => {
    try {

      const loginguid = JSON.parse(sessionStorage.getItem('login_id'));
      const enddate = new Date().toISOString();
      const newUser = {
        loginguid,
        enddate
      };

      try {
        
        const url = `${process.env.REACT_APP_API_URL}/api/v1/updateauditreport`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newUser)
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        if (data.message === 'User inserted successfully') {
          toast.success("Logout successful!");
        }
        else {
          toast.warn("Logout failed!");
        }
      } catch (error) {
        toast.error(error);
      }
    } catch (error) {
      toast.error(error);
    }
  }

  const checksession = async () => {
    try {
      const sessionpop = JSON.parse(sessionStorage.getItem("userData"));
      const accessToken = sessionpop?.token;
      const tokbody = {
        accessToken,
      };
      const url = `${process.env.REACT_APP_API_URL}/api/checksession`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tokbody),
      });
      const sessionval = await response.json();
      if (sessionval == "Token is expired" && !showpopup) {
        setShowPopUp(true);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setShowPopUp(true);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      checksession();
    }, 5000);

    return () => clearInterval(interval); // cleanup
  }, []);

  return (
    <div className="wrapper" style={{ zoom: '90%' }}>
      <Sidebar
        logo={{
          outterLink: "https://www.creative-tim.com/",
          text: "",
          imgSrc: usrlogo,

        }}
        toggleSidebar={toggleSidebar}
      />
      <div className="main-panel" >
        <div className="navbar-toggle d-inline" >
          <NavbarToggler onClick={toggleSidebar} >
            <span className="navbar-toggler-bar bar1" />
            <span className="navbar-toggler-bar bar2" />
            <span className="navbar-toggler-bar bar3" />
          </NavbarToggler>
        </div>

        <AdminNavbar toggleSidebar={toggleSidebar} sidebarOpened={sidebarOpened} />
        <div className="content">
          <Outlet />
        </div>
        {/* <Footer /> */}
      </div>
      <Modal
        isOpen={showpopup}
        toggle={handleClose}
        style={{
          content: {
            top: '30%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            padding: '30px',
            borderRadius: '10px',
            width: '400px',
            boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
            backgroundColor: '#fff',
          },
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          },
        }}
      >
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div className="profile__icon profile__icon--gold" style={{ fontSize: '24px', color: '#2a9fd6', marginBottom: '10px' }}>
            <i className="fas fa-info-circle"></i>
          </div>
          <div className="profile__value" style={{ fontWeight: 'bold', fontSize: '18px', marginBottom: '10px' }}>
            Session Expired
          </div>
          <p className="profile__key" style={{ marginBottom: '20px' }}>Your session is about to expire.</p>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button
              onClick={continuesession}
              style={{
                border: "1px solid #87b6e6",
                cursor: "pointer",
                backgroundColor: "white", // or "#f8f9fa" for a light gray shade
                borderRadius: "5px",
                padding: "6px 12px",
                color: "#1976d2",
                flex: 1,
                marginRight: "10px",
              }}
            >
              Continue Session...
            </button>
            <button
              onClick={handleLogout}
              style={{
                border: "1px solid #87b6e6",
                cursor: "pointer",
                backgroundColor: "white",
                borderRadius: "5px",
                padding: "6px 12px",
                color: "#1976d2",
                flex: 1,
              }}
            >
              Log-out
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
}

export default Admin;