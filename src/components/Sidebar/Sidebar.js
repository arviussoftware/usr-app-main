import React, { useEffect, useState } from "react";
import { NavLink, Link, useLocation, useNavigate } from "react-router-dom";
import { Nav, NavLink as ReactstrapNavLink } from "reactstrap";
import usrlogo from 'assets/img/rd.png'
import Modal from 'react-modal';
import 'assets/css/toggle.css'
import userimg from 'assets/img/businessman.png'
import fetchDecodedUserData from '../../fetchDecodedUserData'
import { toast } from 'react-toastify';


function Sidebar(props) {

  const navigate = useNavigate();
  const location = useLocation();
  const sidebarRef = React.useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [usedata, setUserData] = useState([]);
  const [isAdmin, setIsAdmin] = useState(true);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  // Ensuring routes is always an array
  const routes = Array.isArray(props.routes) ? props.routes : [];

  // Check if a route is active
  const activeRoute = (routeName) => (location.pathname === routeName ? "active" : "");

  const { rtlActive, logo } = props;

  let logoImg = null;
  let logoText = null;

  if (logo) {
    if (logo.outterLink) {
      logoImg = (
        <a href={logo.outterLink} className="simple-text logo-mini" target="_blank" rel="noopener noreferrer">
          <div className="logo-img">
            <img src={logo.imgSrc} alt="react-logo" />
          </div>
        </a>
      );
      logoText = (
        <a href={logo.outterLink} className="simple-text logo-normal" target="_blank" rel="noopener noreferrer">
          {logo.text}
        </a>
      );
    } else {
      logoImg = (
        <Link to={logo.innerLink} className="simple-text logo-mini">
          <div className="logo-img">
            <img src={logo.imgSrc} alt="react-logo" />
          </div>
        </Link>
      );
      logoText = (
        <Link to={logo.innerLink} className="simple-text logo-normal">
          {logo.text}
        </Link>
      );
    }
  }

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


  const togglePopup = () => {
    setIsOpen(!isOpen);
  };

  const fetchUserData = async () => {
    try {
      const usrdata = JSON.parse(sessionStorage.getItem('userData'));
      if (usrdata?.token) {
        const userdetails = await fetchDecodedUserData(usrdata.token);
        setIsAdmin(userdetails.data.role === "Admin" ? false : true);
        setUserData(userdetails);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };
  const togglePasswordModal = () => {
    setShowPasswordModal(!showPasswordModal);
    // Reset password fields when opening the modal
    if (!showPasswordModal) {
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitPasswordChange = async (e) => {

    e.preventDefault();

    // Basic validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('All fields are required');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New password and confirm password do not match');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }
    try {
      const userData = JSON.parse(sessionStorage.getItem('userData'));
      if (!userData?.token) {
        toast.error('User not authenticated');
        return;
      }
      const decodedToken = await fetchDecodedUserData(userData.token); // Decode the JWT
      const userId = decodedToken.data.userId;
      // Call your API to change password
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/changepassword`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userData.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: userId,
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Password changed successfully');
        setShowPasswordModal(false);
      } else {
        toast.error(result.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('An error occurred while changing password');
    }
  };


  useEffect(() => {
    fetchUserData();
  }, [])

  const truncate = (str, maxLength) => {
    return str?.length > maxLength ? str.slice(0, maxLength) + "..." : str;
  };

  return (
    <div className="sidebar">
      <div className="sidebar-wrapper" ref={sidebarRef}>

        <div className="logo" style={{
          backgroundColor: "#fff",
          borderTopRightRadius: "4px",
          borderTopLeftRadius: "4px"
        }}>
          <NavLink to={'/dashboard'} className="nav-link" >
            <img src={usrlogo} alt="USR" style={{ height: "62px" }} />
          </NavLink>
        </div>
        <Nav>
          <li >
            <NavLink to={'/dashboard'} className="nav-link" >
              <i className={'tim-icons icon-chart-pie-36'} />
              <p>{'Dashboard'}</p>
            </NavLink>
          </li>
          <li >
            <NavLink to={'/user-profile'} className="nav-link" >
              <i className={'tim-icons icon-single-02'} />
              <p>{'User Profile'}</p>
            </NavLink>
          </li>
          <li >
            <NavLink to={'/Business'} className="nav-link" >
              <i className={'tim-icons icon-align-center'} />
              <p>{'Business'}</p>
            </NavLink>
          </li>
          <li>
            <NavLink to={'/Extension'} className="nav-link" >
              <i className={'tim-icons icon-molecule-40'} />
              <p>{'Extension'}</p>
            </NavLink>
          </li>
          <li>
            <NavLink to={'/audit'} className="nav-link" >
              <i className={'tim-icons icon-atom'} />
              <p>{'Audit Report'}</p>
            </NavLink>
          </li>
          <li >
            <NavLink className="nav-link" onClick={handleLogout} >
              <i className={'tim-icons icon-button-power'} />
              <p>{'Logout'}</p>
            </NavLink>
          </li>
          <li >
          </li>
          <li className="active-pro" >
            <ReactstrapNavLink onClick={togglePopup}>
              <i className="tim-icons icon-badge" />
              <p>Profile ({truncate(usedata?.data?.username || "user", 9)})</p>
            </ReactstrapNavLink>
          </li>
        </Nav>
        <Modal
          isOpen={isOpen}
          onRequestClose={togglePopup}
          contentLabel="User Info"
          style={{
            border: "none",
            background: 'none',
            content: {
              top: '30%',
              left: '50%',
              right: 'auto',
              bottom: 'auto',
              marginRight: '-50%',
              transform: 'translate(-50%, -50%)',
              border: "none",
              background: 'none',
              overflow: 'none'
            },

          }}
        >
          <div className="layout">
            <div className="profile">
              <div className="profile__picture"><img src={userimg} alt="ananddavis" /></div>
              <div className="profile__header">
                <div className="profile__account">
                  <h4 className="profile__username">{usedata?.data?.username || 'User'}</h4>
                </div>
              </div>
              <div className="profile__stats">
                <div className="profile__stat">
                  <div className="profile__icon profile__icon--gold"><i className="fas fa-id-card"></i></div>
                  <div className="profile__value">{usedata?.data?.userId || '000000'}
                    <div className="profile__key">User Id</div>
                  </div>
                </div>
                <div className="profile__stat">
                  <div className="profile__icon profile__icon--blue"><i className="fas fa-envelope"></i></div>
                  <div className="profile__value">{usedata?.data?.useremail || 'abc@example.com'}
                    <div className="profile__key">Email</div>
                  </div>
                </div>
                <div className="profile__stat">
                  <div className="profile__icon profile__icon--pink"><i className="fas fa-user"></i></div>
                  <div className="profile__value">{usedata?.data?.role || 'User'}
                    <div className="profile__key">User Type</div>
                  </div>
                </div>
              </div>
              {isAdmin && (
                <div style={{ marginTop: '15px', textAlign: 'center' }}>
                  <button
                    onClick={togglePasswordModal}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#1976d2',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '8px 12px',
                      borderRadius: '4px',
                      fontSize: '14px',
                      width: '30%',
                      marginLeft: '35%',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    <div class="profile__icon profile__icon--blue">
                      <i class="fas fa-key"></i>
                    </div>

                    Change Password
                  </button>
                </div>
              )}
            </div>
          </div>
        </Modal>
        <Modal
          isOpen={showPasswordModal}
          onRequestClose={togglePasswordModal}
          contentLabel="Change Password"
          style={{
            content: {
              top: '50%',
              left: '50%',
              right: 'auto',
              bottom: 'auto',
              marginRight: '-50%',
              transform: 'translate(-50%, -50%)',
              width: '400px',
              maxWidth: '90%',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            },
            overlay: {
              backgroundColor: 'rgba(0, 0, 0, 0.5)'
            }
          }}
        >
          <h3 style={{ marginBottom: '20px', textAlign: 'center' }}>Change Password</h3>
          <form onSubmit={handleSubmitPasswordChange}>
            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="currentPassword" style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                Current Password
              </label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
                required
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="newPassword" style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
                required
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="confirmPassword" style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={togglePasswordModal}
                style={{
                      border: "1px solid #87b6e6",
                      backgroundColor: "white",
                      color: "#1976d2",
                      borderRadius: "5px",
                      padding: "6px 12px",
                      textTransform: "none",
                    }}
              >
                Cancel
              </button>
              <button
                type="submit"
               style={{
                      border: "1px solid #87b6e6",
                      backgroundColor: "white",
                      color: "#1976d2",
                      borderRadius: "5px",
                      padding: "6px 12px",
                      textTransform: "none",
                    }}
              >
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}

export default Sidebar;
