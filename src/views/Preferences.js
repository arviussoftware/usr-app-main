import React, { useState, useEffect, useCallback, useMemo } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import styled from "styled-components";
import Select from 'react-select';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Mybutton from "../components/custombutton.js";
import {
  DataGrid, GridToolbar, GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  GridToolbarExport
} from "@mui/x-data-grid";
import { Typography, Box, Card, useTheme, Switch, FormControlLabel, Tooltip } from "@mui/material";
import { tokens } from "./theme";
import { toast } from 'react-toastify';
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";



const options = [
  { value: '1004', label: '1004' },
  { value: '1002', label: '1002' },
  { value: '1001', label: '1001' },
  { value: '1005', label: '1005' },
]

const opt = [
  { value: 0, label: 'InActive' },
  { value: 1, label: 'Active' }
]

const removeItem = (array, item) => {
  const newArray = array.slice();
  newArray.splice(newArray.findIndex(a => a === item), 1);
  return newArray;
};

function User() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState('');
  const [fromDate, setfromDate] = useState(new Date());
  const [toDate, settoDate] = useState(new Date());
  var [exten, setexten] = useState([]);
  const [calid, setcalid] = useState([]);
  const [calling, setcalling] = useState([]);
  const [called, setcalled] = useState([]);
  const [bus, setbus] = useState([]);
  const [show, setShow] = useState(false);
  // const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const [extensionFilter, setExtensionFilter] = useState([]);
  const [calidFilter, setCalidFilter] = useState([]);
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [isValid, setIsValid] = useState(true);
  const [selectedbusiness, setselectedbusiness] = useState();
  const [business, setbusiness] = useState([]);
  const [usertype, setusertype] = useState([]);
  const [selectedusertype, setselectedusertype] = useState();
  const [isActiv, setisActive] = useState();
  const [showEditModal, setshowEditModal] = useState(false);
  const handleEditClose = () => setshowEditModal(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [edituserName, seteditUserName] = useState('');
  const [editemail, seteditEmail] = useState('');
  const [editselectedbusiness, seteditselectedbusiness] = useState([]);
  const [editusertype, seteditusertype] = useState();
  const [selectActivetype, setActivetype] = useState();
  const [filterModel, setFilterModel] = useState({ items: [] });
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 7,
  });
  const [open, setOpen] = React.useState(false);
  const [downloadAudio, setDownloadAudio] = useState(0);
  const [editdownloadAudio, seteditDownloadAudio] = useState(0);


  const SearchBar = styled.input`
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #ccc;
  border-radius: 4px;
`;
  const fetchUsers = async (page, size, searchText, fromDate, toDate, ex, calid, calling, called, bus) => {
    setLoading(true);

    try {
      const session = JSON.parse(sessionStorage.getItem("userData"));
      let queryString = new URLSearchParams({ page: page, size: size, }).toString();
      if (filterModel?.items?.length > 0) {
        queryString += `&filter=${encodeURIComponent(JSON.stringify(filterModel?.items))}`;
      }
      const url = `${process.env.REACT_APP_API_URL}/api/v1/getusers?${queryString}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session?.token}`,
          'Content-Type': 'application/json'
        }
      });
      //const response = await fetch(url);
      const data = await response.json();
      setData(data?.users);
      setTotalRows(data?.users?.length);
      setLoading(false);
      let queryString1 = new URLSearchParams({ page: 0, size: 100, }).toString();
      const url1 = `${process.env.REACT_APP_API_URL}/api/v1/getbusiness?${queryString1}`;
      const response1 = await fetch(url1, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session?.token}`,
          'Content-Type': 'application/json'
        }
      });
      // const response1 = await fetch(url1);
      const data1 = await response1.json();
      const business = data1.business.map((i) => ({ value: i.id, label: i.b_businessname }));
      setbusiness(business);
      const url2 = `${process.env.REACT_APP_API_URL}/api/v1/getusertype?${queryString}`;
      // const response2 = await fetch(url2);
      const response2 = await fetch(url2, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session?.token}`,
          'Content-Type': 'application/json'
        }
      });
      const data2 = await response2.json();
      console.log(data2);
      const usertype = data2.usertype.map((i) => ({ value: i.id, label: i.b_usertype }));
      setusertype(usertype);
    } catch (error) {
      console.error('Error fetching users:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(paginationModel.page, paginationModel.pageSize, searchText, fromDate, toDate, exten, calid, calling, called, bus);
  }, [paginationModel.page, paginationModel.pageSize, searchText, fromDate, toDate, exten, calid, calling, called, bus, filterModel]);





  const handleClosePass = () => {
    setOpen(false);
  };

  const handleAnotherAction = (values) => {
    //  alert(`Another action triggered for user: ${values.row.u_userloginid}`);
    setOpen(true);
  };


  const handleEmailChange = (e) => {
    const inputEmail = e.target.value;
    const sanitizedEmail = inputEmail.replace(/(<([^>]+)>)/gi, '');
    setEmail(sanitizedEmail);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setIsValid(emailRegex.test(sanitizedEmail));
  };
  const handleisActive = (op) => {
    setisActive(op ? op.value : "");
  }

  const handleClose = () => {
    setShow(false);
    setUserName();
    setEmail();
    setbusiness([]);
    setisActive();
    setFormErrors({});
    // document.getElementById('userNameInput').value = '';
  }

  const saveuser = async () => {

    let errors = {};
    const alphaRegex = /^[A-Za-z][A-Za-z ]{0,19}$/;
    if (!userName) {
      errors.userName = 'User Name is required';
    } else if (!alphaRegex.test(userName)) {
      errors.userName = 'User Name must contain only alphabets and should be 1 to 20 characters long';
    }
    if (!email) {
      errors.email = 'Email is required';
    } else if (!isValid) {
      errors.email = 'Please enter a valid email address';
    }
    if (!selectedbusiness) {
      errors.business = 'Business is required';
    }
    if (!selectedusertype) {
      errors.usertype = 'User Type is required';
    }

    if (isActiv !== 0 && isActiv !== 1) {
      errors.isActive = 'IsActive is required';
    }

    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }
    const userEmail = email === undefined ? '' : email.toString();

    const business = selectedbusiness === undefined ? '' : selectedbusiness.toString();
    const userType = selectedusertype === undefined ? '' : selectedusertype.toString();
    const isActive = isActiv === undefined ? '' : isActiv.toString();
    const isAudio = downloadAudio.toString();

    const newUser = {
      userName,
      userEmail,
      business,
      isActive,
      isAudio,
      userType
    };
    // Perform any additional processing or validation here
    try {
      setLoading(true);
      const url = `${process.env.REACT_APP_API_URL}/api/v1/insertusers`;
      const session = JSON.parse(sessionStorage.getItem("userData"));
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session?.token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      console.log(response);
      toast.success("Data saved successfully!");
      fetchUsers(paginationModel.page, paginationModel.pageSize, searchText, fromDate, toDate, exten, calid, calling, called, bus);
      setEmail();
      setselectedbusiness();
      setselectedusertype();
      setisActive();
      handleClose();

    } catch (error) {
      console.log(error)
      toast.error("Data not save !");
      setLoading(false);
    } finally {
      setLoading(false);
    }
  }



  const handleExtensionChange = (values) => {
    setExtensionFilter(values);
    // Update data fetch with extension filter values
    fetchUsers(currentPage, perPage, searchText, fromDate, toDate, values, calidFilter, /*... other filters */);
  };

  const handleCalidChange = (values) => {
    setCalidFilter(values);
    // Update data fetch with calid filter values
    fetchUsers(currentPage, perPage, searchText, fromDate, toDate, extensionFilter, values, /*... other filters */);
  };
  const handleEdit1 = async (row) => {

    setshowEditModal(true);
    setSelectedRow(row.row);
    const queryString = new URLSearchParams({ userid: row.row.u_userloginid });
    const session = JSON.parse(sessionStorage.getItem("userData"));
    const url = `${process.env.REACT_APP_API_URL}/api/v1/editusers?${queryString}`;
    // const url = `http://localhost:5000/api/v1/editusers?${queryString}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session?.token}`,
        'Content-Type': 'application/json'
      }
    });
    const result = await response.json();
    seteditEmail(result.users[0].useremail);
    seteditUserName(result.users[0].username);
    seteditDownloadAudio(result.users[0].isaudio)

    //const items = ({ label: result.users[0].businessname, value: Number(result.users[0].businessid) });
    const businessNames = result?.users[0]?.businessname.split(', ');
    const businessIds = result?.users[0]?.businessid.split(',');

    // Create items array with label and value pairs
    const items = businessNames.map((name, index) => ({
      label: name,
      value: Number(businessIds[index].trim()) // Convert business id to number (assuming they are numeric)
    }));
    seteditselectedbusiness(items)

    var items1 = ({ label: result.users[0].active === 1 ? 'Active' : 'InActive', value: result.users[0].active });
    setActivetype(items1);
    var items1 = ({ label: result.users[0].usertype, value: result.users[0].usertypeid });
    seteditusertype(items1);
  };

  const columns = [
    {
      field: "u_userloginid", headerName: "User ID",
      renderHeader: () => (<>User ID{" "}<i className="fa fa-info-circle ml-2" title="User Id of the agent."></i></>),
      flex: 0.5
    },
    { field: "u_username", headerName: "UserName", renderHeader: () => (<>User Name{" "}<i className="fa fa-info-circle ml-2" title="Full name of the agent."></i></>), flex: 0.5 },
    {
      field: "u_useremail", headerName: "Email Id",
      renderHeader: () => (<> Email Id{" "}<i className="fa fa-info-circle ml-2" title="Email of the agent."></i></>),
      flex: 0.8
    },
    {
      field: "u_businessname", headerName: "Business Id",
      renderHeader: () => (<> Business {" "}<i className="fa fa-info-circle ml-2" title="Business Id of agent mapped with."></i></>),
      flex: 0.5

    },
    {
      field: "u_usertype", headerName: "User Type",
      renderHeader: () => (<> User Type{" "}<i className="fa fa-info-circle ml-2" title="User Type of the agent."></i></>),
      flex: 0.5
    },
    {
      field: "u_active", headerName: "Status",
      renderHeader: () => (<> Status{" "}<i className="fa fa-info-circle ml-2" title="Status of agent either is active or inactive."></i></>),
      flex: 0.5,
      renderCell: (params) => (
        <span style={{ color: params.row.u_active == 1 ? 'green' : 'red' }}>
          {params.row.u_active == 1 ? 'Active' : 'InActive'}
        </span>

      )
    },
    {
      field: "u_isaudio", headerName: "Download Permission",
      renderHeader: () => (<>Download Permission{" "}<i className="fa fa-info-circle ml-2" title="Permission for download the audio file"></i></>),
      flex: 0.5,
      renderCell: (params) => (
        <span style={{ color: params.row.u_isaudio == 1 ? 'green' : 'red' }} >
          {params.row.u_isaudio == 1 ? 'True' : 'False'}
        </span>

      )
    },
    {
      field: "action", headerName: "Action", // Ensuring consistency in naming convention
      renderHeader: () => (<>Action{""}<i className="fa fa-info-circle ml-2" title="Edit the user."></i></>),

      renderCell: (row) => {
        const isNotAdmin = row.row.u_isadmin !== 1;

        return (
          <div style={{ display: "flex", gap: "8px" }}>
            {/* ✅ Conditionally Render Edit Button */}
            {isNotAdmin && (
              <button
                className="btn"
                style={{ margin: "0", border: "1px solid #87b6e6" }}
                onClick={() => handleEdit1(row)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="16"
                  width="18"
                  viewBox="0 0 576 512"
                >
                  <path
                    fill="#1976d2"
                    d="M402.6 83.2l90.2 90.2c3.8 3.8 3.8 10 0 13.8L274.4 405.6l-92.8 10.3c-12.4 1.4-22.9-9.1-21.5-21.5l10.3-92.8L388.8 83.2c3.8-3.8 10-3.8 13.8 0zm162-22.9l-48.8-48.8c-15.2-15.2-39.9-15.2-55.2 0l-35.4 35.4c-3.8 3.8-3.8 10 0 13.8l90.2 90.2c3.8 3.8 10 3.8 13.8 0l35.4-35.4c15.2-15.3 15.2-40 0-55.2zM384 346.2V448H64V128h229.8c3.2 0 6.2-1.3 8.5-3.5l40-40c7.6-7.6 2.2-20.5-8.5-20.5H48C21.5 64 0 85.5 0 112v352c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V306.2c0-10.7-12.9-16-20.5-8.5l-40 40c-2.2 2.3-3.5 5.3-3.5 8.5z"
                  />
                </svg>
              </button>
            )}

            {/* Always Render Second Button */}
            {isNotAdmin && (

              <button
                className="btn"
                style={{ margin: "0", border: "1px solid #87b6e6" }}
                onClick={() => handleAnotherAction(row)}
              >
                <svg
                  fill="#1976d2"
                  height="25"
                  width="25"
                  viewBox="-61.44 -61.44 595.50 595.50"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M0,49.231v157.538h472.615V49.231H0z M127.644,139.133l-9.846,17.058l-19.337-11.165v22.328H78.769v-22.328 l-19.337,11.165l-9.846-17.058l19.335-11.163l-19.335-11.164l9.846-17.058l19.337,11.166V88.586h19.692v22.328l19.337-11.166 l9.846,17.058L108.31,127.97L127.644,139.133z M226.106,139.133l-9.846,17.058l-19.337-11.165v22.328h-19.692v-22.328 l-19.337,11.165l-9.846-17.058l19.335-11.163l-19.335-11.164l9.846-17.058l19.337,11.166V88.586h19.692v22.328l19.337-11.166 l9.846,17.058l-19.335,11.164L226.106,139.133z M324.568,139.133l-9.846,17.058l-19.337-11.165v22.328h-19.692v-22.328 l-19.337,11.165l-9.846-17.058l19.335-11.163l-19.335-11.164l9.846-17.058l19.337,11.166V88.586h19.692v22.328l19.337-11.166 l9.846,17.058l-19.335,11.164L324.568,139.133z M423.029,139.133l-9.846,17.058l-19.337-11.165v22.328h-19.692v-22.328 l-19.337,11.165l-9.846-17.058l19.335-11.163l-19.335-11.164l9.846-17.058l19.337,11.166V88.586h19.692v22.328l19.337-11.166 l9.846,17.058l-19.335,11.164L423.029,139.133z" />
                  <path d="M384,315.051H204.486c-8.995-39.434-44.268-68.897-86.332-68.897c-48.837,0-88.615,39.679-88.615,88.615 c0,48.837,39.778,88.615,88.615,88.615c38.48,0,71.243-24.74,83.448-59.103h74.09l24.615,24.615l34.462-34.462l19.692,19.692H384 l29.538-29.538L384,315.051z M88.615,354.436c-10.876,0-19.692-8.817-19.692-19.692c0-10.876,8.816-19.692,19.692-19.692 c10.876,0,19.692,8.816,19.692,19.692C108.308,345.619,99.491,354.436,88.615,354.436z" />
                </svg>
              </button>
            )}

            {/* Always Render Dialog */}
            <Dialog
              open={open}
              onClose={handleClosePass}
              aria-labelledby="alert-dialog-title"
              aria-describedby="alert-dialog-description"
              BackdropProps={{
                style: {
                  backgroundColor: "rgba(0, 0, 0, 0.1)", // semi-transparent dark overlay
                  // backdropFilter: "blur(1px)",           // subtle blur effect
                },
              }}
              PaperProps={{
                style: {
                  boxShadow: "none", // removes the black glow
                  borderRadius: "8px", // optional: keep it clean and smooth
                },
              }}
            >
              <DialogTitle id="alert-dialog-title">Set Default Password</DialogTitle>
              <DialogContent>
                <DialogContentText id="alert-dialog-description">
                  Would you like to reset your password to the Default password ?
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button
                  style={{
                    border: "1px solid #87b6e6",
                    backgroundColor: "white",
                    color: "#1976d2",
                    borderRadius: "5px",
                    padding: "6px 12px",
                    textTransform: "none",
                  }}
                  onClick={handleClosePass}
                >
                  Disagree
                </Button>
                <Button
                  style={{
                    border: "1px solid #87b6e6",
                    backgroundColor: "white",
                    color: "#1976d2",
                    borderRadius: "5px",
                    padding: "6px 12px",
                    textTransform: "none",
                  }}
                  onClick={async () => {
                    try {
                      if (!row.row.u_userloginid) {
                        toast.error("User ID not found. Please try again.");
                        return;
                      }
                      const queryString = new URLSearchParams({
                        login_id: row.row.u_userloginid,
                      });
                      const session = JSON.parse(sessionStorage.getItem("userData"));
                      const url = `${process.env.REACT_APP_API_URL}/api/v1/resetpassword?${queryString}`;
                      const response = await fetch(url, {
                        method: "POST",
                        headers: {
                          'Authorization': `Bearer ${session?.token}`,
                          "Content-Type": "application/json",
                        },
                      });

                      const result = await response.json();

                      if (result.success) {
                        toast.success("Password has been reset successfully.");
                        handleClosePass();
                      } else {
                        toast.warning("Unable to reset password.");
                      }
                    } catch (err) {
                      toast.error("Failed in resetting the password.");
                    }
                  }}
                  autoFocus
                >
                  Agree
                </Button>
              </DialogActions>
            </Dialog>
          </div>
        );
      },
      flex: 0.5
    }
  ];

  // Default column visibility (only show 4 columns)
  const [columnVisibilityModel, setColumnVisibilityModel] = useState({
    u_userloginid: true,
    u_username: true,
    u_useremail: true,
    u_businessid: true,
    u_active: true,
    action: true
  });


  const handlePageChange = page => {
    setCurrentPage(page);
  };

  const handlePerRowsChange = async (newPerPage, page) => {
    setPerPage(newPerPage);
    setCurrentPage(page); // Reset to page 1 when changing the number of rows per page
  };
  const handleSearch = (value) => {
    setSearchText(value);
  };
  const handledate = (value, rd) => {
    //debugger;
    if (rd === 1) {
      var dateto = new Date(value);
      const today = new Date();
      ///setfromDate(ConverDate(value));
      setfromDate(value);
      dateto.setDate(dateto.getDate() + 30);
      dateto > today ? settoDate(today) : settoDate(dateto);
    } else {
      //debugger;
      settoDate(value);
      setfromDate(fromDate);
    }
  };

  const handleCategoryChange = (values) => {
    var ar = new Array();
    for (let i = 0; i < values.length; i++) {
      ///element.classList.add("mystyle");
      if (values[i].value !== 0) {
        ar.push(values[i].value);
      }
    }
    //debugger;
    exten = ar;
    setexten(ar);
    exten = ar;
    fetchUsers(currentPage, perPage, searchText, fromDate, toDate, exten, calid, calling, called, bus);
    console.log(values);
  }

  const handleBusiness = (selectedOption) => {
    debugger
    var business = new Array();
    for (let i = 0; i < selectedOption.length; i++) {
      ///element.classList.add("mystyle");
      if (selectedOption[i].value !== 0) {
        business.push(selectedOption[i].value);
      }
    }
    setselectedbusiness(business);
    // setselectedbusiness(selectedOption ? selectedOption.value : "");
  }

  const handleUserType = (selectedOption) => {
    setselectedusertype(selectedOption ? selectedOption.value : "");
  }

  const handleEditbusiness = (val) => {
    seteditselectedbusiness(val)
    // seteditselectedbusiness(val)
  }


  const handleEditusertype = (val) => {
    seteditusertype(val)
  }
  const handleEdituser = (e) => {
    const user = e.target.value;
    seteditUserName(user);
  }
  const handleEditisActive = (val) => {
    setActivetype(val)
  }
  const handleeditEmailChange = (e) => {
    const inputEmail = e.target.value;
    const sanitizedEmail = inputEmail.replace(/(<([^>]+)>)/gi, '');
    seteditEmail(sanitizedEmail);
    // Email validation using regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setIsValid(emailRegex.test(sanitizedEmail));

  };

  const update = async () => {

    let errors = {};
    //const alphaRegex = /^[a-zA-Z ]{1,20}$/
    const alphaRegex = /^[A-Za-z][A-Za-z ]{0,19}$/;
    if (!edituserName) {
      errors.edituserName = 'User Name is required';
    } else if (!alphaRegex.test(edituserName)) {
      errors.edituserName = 'User Name must contain only alphabets and should be 1 to 20 characters long';
    }
    if (!editemail) {
      errors.editemail = 'Email is required';
    } else if (!isValid) {
      errors.editemail = 'Please enter a valid email address';
    }
    if (editselectedbusiness.length < 0) {
      errors.userType = 'Business is required';
    }

    setFormErrors(errors);
    if (Object.keys(errors).length < 0) {
      return;
    }
    const username = edituserName;
    const useremail = editemail;
    //const business = editselectedbusiness.value;
    const business = editselectedbusiness.map(m => m.value).join(',')
    const isactive = selectActivetype.value;
    const userloginid = document.getElementById('userloginid').value;
    const isAudio = editdownloadAudio;
    const usertype = editusertype.value;

    // // Create a new user object with the input values
    const updateUser = {
      userloginid,
      username,
      useremail,
      business,
      isactive,
      isAudio,
      usertype
    };

    if (!username || !useremail || !business) {
      //toast.warn('Please fill in all fields')
      toast.warning('Please fill in all fields');
      return;
    }
    try {
      const session = JSON.parse(sessionStorage.getItem("userData"));
      const url = `${process.env.REACT_APP_API_URL}/api/v1/updateusers`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session?.token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(updateUser)
      });

      console.log(response);
      // await toast.success("Data saved successfully!");
      toast.success("Data saved successfully!");
      fetchUsers(paginationModel.page, paginationModel.pageSize, searchText, fromDate, toDate, exten, calid, calling, called, bus);
      // fetchUsers(currentPage, perPage, searchText);
      await handleEditClose();
    } catch (error) {
      console.log(error)
    }
  }

  // Handle switch change
  const handleChange = (event) => {
    setDownloadAudio(event.target.checked ? 1 : 0);
  };
  const handleeditChange = (event) => {
    seteditDownloadAudio(event.target.checked ? 1 : 0);
  }

  function CustomToolbar() {
    const slotProps = {
      tooltip: { title: 'Export data' },
      button: { variant: 'outlined' },
    };

    return (
      <GridToolbarContainer>
        <GridToolbarColumnsButton
          slotProps={{ tooltip: { title: 'Change Column' }, button: { variant: 'outlined' }, }}
        />
        <GridToolbarFilterButton
          slotProps={{ tooltip: { title: 'Filter value' }, button: { variant: 'outlined' }, }}
        />
        <GridToolbarDensitySelector
          slotProps={{ tooltip: { title: 'Change density' }, button: { variant: 'outlined' }, }}
        />
        <Box sx={{ flexGrow: 1 }} />

        <Button className="btn-sm"
          style={{ width: '85px', color: '#1976d2', border: '1px solid #87b6e6' }}
          variant={'outlined'} onClick={handleShow}
        >
          Add
        </Button>

        <GridToolbarExport
          csvOptions={{ fileName: 'userprofile_report' }}
          className="btn btn-sm btn-outline-primary btn btn-outlined"
          slotProps={{
            tooltip: { title: 'Export data' },
            button: { variant: 'outlined' },

          }}
        />
      </GridToolbarContainer>
    );
  }

  return (


    // <div className="row" style={{ boxshadow: "0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)" }}>
    <div className="content">

      <Box m="20px">
        <Box
          mt="8px"
          height="97vh"
          sx={{
            "& .MuiDataGrid-root": {
              border: "none",
              borderRadius: "10px",
              overflow: "hidden",
            },
            "& .MuiDataGrid-cell": {
              borderBottom: "none",
            },
            "& .name-column--cell": {
              color: colors.greenAccent[300],
              fontWeight: "bold",
            },
            "& .MuiDataGrid-columnHeaders": {
              // backgroundColor: colors.blueAccent[700],
              backgroundColor: '#069ebd !important',
              borderBottom: "none",
              fontSize: "16px",
              fontWeight: "normal",
            },
            "& .MuiDataGrid-virtualScroller": {
              backgroundColor: colors.primary[400],
            },
            "& .MuiDataGrid-footerContainer": {
              borderTop: "none",
              backgroundColor: '#1A76D1 !important',
            },
            "& .MuiCheckbox-root": {
              color: `${colors.greenAccent[200]} !important`,
            },
            "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
              color: `${colors.grey[100]} !important`,
            },
          }}

        >

          <DataGrid
            rows={data}
            columns={columns}
            slots={{ toolbar: CustomToolbar }}
            // components={{ Toolbar: GridToolbar }}
            pagination
            paginationMode="server" // Enables server-side pagination
            rowCount={totalRows}
            pageSize={paginationModel.pageSize}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel} // ✅ Handles both page and pageSize changes
            pageSizeOptions={[7, 10, 20]}  // ✅ Now this will work correctly
            loading={loading}
            columnVisibilityModel={columnVisibilityModel}
            onColumnVisibilityModelChange={setColumnVisibilityModel}
            onFilterModelChange={setFilterModel}
          />
        </Box>

      </Box>
      {/* Modal for Add */}
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Add User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-1">
              <Form.Label>User Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter UserName"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                required
                isInvalid={!!formErrors.userName}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.userName}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-1">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter Email"
                value={email}
                onChange={handleEmailChange}
                isInvalid={!!formErrors.email}
                required
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.email}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-1">
              <Form.Label>Business</Form.Label>
              <Select
                id="userTypeInput"
                //className="mb-1"
                aria-label="Default select example"
                value={business.find(option => option.value === selectedbusiness)}
                onChange={handleBusiness}
                options={business}
                isMulti
                placeholder="---- Select Business----"
                isClearable
                required
                className={formErrors.business ? 'is-invalid' : ''}
              />
              {formErrors.business && (
                <div className="invalid-feedback d-block">
                  {formErrors.business}
                </div>
              )}
            </Form.Group>
            <Form.Group className="mb-1">
              <Form.Label>User Type</Form.Label>
              <Select
                id="userTypeInput"
                //className="mb-1"
                aria-label="Default select example"
                value={usertype.find(option => option.value === selectedusertype)}
                onChange={handleUserType}
                options={usertype}
                placeholder="---- Select User Type----"
                isClearable
                required
                className={formErrors.usertype ? 'is-invalid' : ''}
              />
              {formErrors.usertype && (
                <div className="invalid-feedback d-block">
                  {formErrors.usertype}
                </div>
              )}
            </Form.Group>
            <Form.Group className="mb-1">
              <Form.Label>IsActive</Form.Label>
              <Select
                id="isActiveInput"
                // className="mb-1"
                // aria-label="Default select example"
                value={opt.find(op => op.value === isActiv)}
                onChange={handleisActive}
                options={opt}
                placeholder="---- Select an option ----"
                isClearable
                required
                className={formErrors.isActive ? 'is-invalid' : ''}
              />
              {formErrors.isActive && (
                <div className="invalid-feedback d-block">
                  {formErrors.isActive}
                </div>
              )}
            </Form.Group>
            <Form.Group>
              <Form.Label>Download Audio</Form.Label>
              <FormControlLabel style={{ marginLeft: '17rem' }} control={<Switch onChange={handleChange} name={"isdownloadaudio"} />} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" style={{ border: '1px solid #87b6e6' }} onClick={handleClose}>
            <span style={{ color: '#1976d2' }}>Close</span>
          </Button>
          <Button variant="light" style={{ border: '1px solid #87b6e6' }} onClick={saveuser}>
            <span style={{ color: '#1976d2' }}>Save</span>
          </Button>
        </Modal.Footer>
      </Modal>


      {/* Modal for Edit */}
      <Modal show={showEditModal} onHide={handleEditClose} >
        <Modal.Header closeButton>
          <Modal.Title>Edit Roles</Modal.Title>
        </Modal.Header>
        <Modal.Body >
          {selectedRow && (
            <Form>
              <Form.Group className="mb-1" style={{ display: "none" }}>
                <Form.Label>User LoginId</Form.Label>
                <Form.Control id="userloginid" as="select" defaultValue={selectedRow.u_userloginid} disabled>
                  <option >{selectedRow.u_userloginid}</option>
                </Form.Control>
              </Form.Group>
              <Form.Group className="mb-1">
                <Form.Label>User Name</Form.Label>
                <Form.Control
                  type="username"
                  placeholder="Enter username"
                  value={edituserName}
                  onChange={handleEdituser}
                  isInvalid={!!formErrors.edituserName}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors.edituserName}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-1">
                <Form.Label>User Email</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter Email"
                  value={editemail}
                  onChange={handleeditEmailChange}
                  isInvalid={!!formErrors.editemail}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors.editemail}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-1">
                <Form.Label>Business</Form.Label>
                <Select
                  id="userTypeInput"
                  aria-label="Default select example"
                  value={editselectedbusiness}
                  selectedOption={1}
                  onChange={handleEditbusiness}
                  options={business}
                  isMulti
                  placeholder="---- Select business ----"
                  isClearable
                  required
                // className={formErrors.userType ? 'is-invalid' : ''}
                />
              </Form.Group>
              <Form.Group className="mb-1">
                <Form.Label>User Type</Form.Label>
                <Select
                  id="userTypeInput"
                  //className="mb-1"
                  aria-label="Default select example"
                  value={editusertype}
                  onChange={handleEditusertype}
                  options={usertype}
                  placeholder="---- Select User Type----"
                  isClearable
                  required
                // className={formErrors.usertype ? 'is-invalid' : ''}
                />
              </Form.Group>
              <Form.Group className="mb-1">
                <Form.Label>IsActive</Form.Label>
                <Select
                  id="isActiveInput"
                  value={selectActivetype}
                  onChange={handleEditisActive}
                  options={opt}
                  placeholder="---- Select an option ----"
                  isClearable
                  required
                // className={formErrors.isActive ? 'is-invalid' : ''}
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Download Audio</Form.Label>
                <FormControlLabel style={{ marginLeft: '17rem' }} control={<Switch checked={editdownloadAudio} onChange={handleeditChange} name={"isdownloadaudio"} />} />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" style={{ border: '1px solid #87b6e6' }} onClick={handleEditClose}>
            <span style={{ color: '#1976d2' }}>Close</span>
          </Button>

          <Button variant="light" style={{ border: '1px solid #87b6e6' }} onClick={update}>
            <span style={{ color: '#1976d2' }}>Save Changes</span>
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );

}
export default User;
