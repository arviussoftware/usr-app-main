import React, { useState, useEffect, useCallback, useMemo } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import styled from "styled-components";
import Select from 'react-select';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import {
  DataGrid, GridToolbar, GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  GridToolbarExport
} from "@mui/x-data-grid";
import { Typography, Box, Card, useTheme } from "@mui/material";
import { tokens } from "./theme";
import { toast } from 'react-toastify';
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import fetchDecodedUserData from "../fetchDecodedUserData";



const removeItem = (array, item) => {
  const newArray = array.slice();
  newArray.splice(newArray.findIndex(a => a === item), 1);
  return newArray;
};

function App1() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [perPage, setPerPage] = useState(7);
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

  //const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const [formErrors, setFormErrors] = useState({});
  const [business, setBusiness] = useState('');
  const [location, setLocation] = useState('');
  const [contact, setContact] = useState('');
  const [isActiv, setIsActiv] = useState('');
  const [contactperson, setContactPerson] = useState('');
  const [showEditModal, setshowEditModal] = useState(false);
  const handleEditClose = () => setshowEditModal(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [editbusinessname, setEditbusinessname] = useState('');
  const [editlocation, setEditlocation] = useState([]);
  const [editcontact, setEditcontact] = useState('');
  const [editcontactperson, setEditcontactPerson] = useState('');
  const [selectActivetype, setActivetype] = useState();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 7,
  });
  const [filterModel, setFilterModel] = useState({ items: [] });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);

  const opt = [
    { value: 0, label: 'InActive' },
    { value: 1, label: 'Active' }
  ]

  const handleisActive = (op) => {
    setIsActiv(op ? op.value : "");
  }

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
      const url = `${process.env.REACT_APP_API_URL}/api/v1/getbusiness?${queryString}`;
      //  const response = await fetch(url);
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session?.token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      setData(data?.business);
      setTotalRows(data?.business[0]?.u_totalcount);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchUsers(paginationModel.page, paginationModel.pageSize, searchText, fromDate, toDate, exten, calid, calling, called, bus);
  }, [paginationModel.page, paginationModel.pageSize, searchText, fromDate, toDate, exten, calid, calling, called, bus, filterModel]);



  const columns = [
    // {
    //   field: "id",
    //   headerName: "Business ID",
    //   renderHeader: () => (<>Business ID{" "}<i className="fa fa-info-circle ml-2" title="Id of the business."></i></>),
    //   flex: 0.5
    // },
    { field: "b_businessname", headerName: "Business Name", renderHeader: () => (<>Business Name{" "}<i className="fa fa-info-circle ml-2" title="Name of the business."></i></>), flex: 0.5 },
    {
      field: "b_location", headerName: "User Location",
      renderHeader: () => (<> User Location{" "}<i className="fa fa-info-circle ml-2" title="Location associated with the business."></i></>),
      flex: 0.5
    },
    {
      field: "b_contactnumber", headerName: "Contact Number",
      renderHeader: () => (<> Contact Number {" "}<i className="fa fa-info-circle ml-2" title="Contact number assosciated with the business."></i></>),
      flex: 0.5

    },
    {
      field: "b_contactperson", headerName: "Contact Person",
      renderHeader: () => (<> Contact Person{" "}<i className="fa fa-info-circle ml-2" title="Name of the person associated with the business."></i></>),
      flex: 0.5
    }
    ,
    {
      field: "b_createddate", headerName: "Created Date",
      renderHeader: () => (<> Created Date{" "}<i className="fa fa-info-circle ml-2" title="Created date of the business."></i></>),
      flex: 0.5
    },
    {
      field: "b_status", headerName: "Status",
      renderHeader: () => (<> Status{" "}<i className="fa fa-info-circle ml-2" title="Status of the business either active or inactive."></i></>),
      flex: 0.5,
      renderCell: (data) => (
        <span style={{ color: data.row.b_status === 1 ? 'green' : 'red' }}>
          {data.row.b_status === 1 ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      field: "action",
      headerName: "Action",
      renderHeader: () => (<>Action{" "}<i className="fa fa-info-circle ml-2" title="Edit or Delete the Business"></i></>),
      renderCell: (params) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="btn"
            style={{
              border: "none",
              margin: "0",
              padding: '4px 8px',
              backgroundColor: '#fff',
              border: '1px solid #87b6e6',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
            onClick={() => handleEdit(params.row)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" height="16" width="18" viewBox="0 0 576 512">
              <path fill="#1976d2" d="M402.6 83.2l90.2 90.2c3.8 3.8 3.8 10 0 13.8L274.4 405.6l-92.8 10.3c-12.4 1.4-22.9-9.1-21.5-21.5l10.3-92.8L388.8 83.2c3.8-3.8 10-3.8 13.8 0zm162-22.9l-48.8-48.8c-15.2-15.2-39.9-15.2-55.2 0l-35.4 35.4c-3.8 3.8-3.8 10 0 13.8l90.2 90.2c3.8 3.8 10 3.8 13.8 0l35.4-35.4c15.2-15.3 15.2-40 0-55.2zM384 346.2V448H64V128h229.8c3.2 0 6.2-1.3 8.5-3.5l40-40c7.6-7.6 2.2-20.5-8.5-20.5H48C21.5 64 0 85.5 0 112v352c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V306.2c0-10.7-12.9-16-20.5-8.5l-40 40c-2.2 2.3-3.5 5.3-3.5 8.5z" />
            </svg>
          </button>
          {isAdmin && (
            <button
              className="btn"
              style={{
                border: "none",
                margin: "0",
                padding: '4px 8px',
                backgroundColor: '#fff',
                border: '1px solid #ff6b6b',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
              onClick={() => handleDelete(params.row)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 448 512">
                <path fill="#ff6b6b" d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z" />
              </svg>
            </button>
          )}
        </div>
      ),
      flex: 0.7,
      sortable: false,
      filterable: false
    }
    // {
    //   field: "action", headerName: "Action", // Ensuring consistency in naming convention
    //   renderHeader: () => (<>Action{""}<i className="fa fa-info-circle ml-2" title="Edit the Business."></i></>),
    //   //  headerName: "Action", // Explicitly defining a header name for this column
    //   renderCell: (row) => (
    //     <button
    //       className="btn"
    //       style={{ border: "none", margin: "0em",border:'1px solid #87b6e6' }}
    //       onClick={handleEdit(row)}
    //     >
    //       <svg xmlns="http://www.w3.org/2000/svg" height="16" width="18" viewBox="0 0 576 512">
    //         <path  fill="#1976d2" d="M402.6 83.2l90.2 90.2c3.8 3.8 3.8 10 0 13.8L274.4 405.6l-92.8 10.3c-12.4 1.4-22.9-9.1-21.5-21.5l10.3-92.8L388.8 83.2c3.8-3.8 10-3.8 13.8 0zm162-22.9l-48.8-48.8c-15.2-15.2-39.9-15.2-55.2 0l-35.4 35.4c-3.8 3.8-3.8 10 0 13.8l90.2 90.2c3.8 3.8 10 3.8 13.8 0l35.4-35.4c15.2-15.3 15.2-40 0-55.2zM384 346.2V448H64V128h229.8c3.2 0 6.2-1.3 8.5-3.5l40-40c7.6-7.6 2.2-20.5-8.5-20.5H48C21.5 64 0 85.5 0 112v352c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V306.2c0-10.7-12.9-16-20.5-8.5l-40 40c-2.2 2.3-3.5 5.3-3.5 8.5z" />
    //       </svg>
    //     </button>
    //   ),
    //   flex: 0.5
    // }
  ];

  // Default column visibility (only show 4 columns)
  const [columnVisibilityModel, setColumnVisibilityModel] = useState({
    id: true,
    b_businessname: true,
    b_location: true,
    b_contactnumber: true,
    b_contactperson: true,
    b_createddate: false,
    b_status: true,
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
    if (rd === 1) {
      var dateto = new Date(value);
      const today = new Date();
      ///setfromDate(ConverDate(value));
      setfromDate(value);
      dateto.setDate(dateto.getDate() + 30);
      dateto > today ? settoDate(today) : settoDate(dateto);
    } else {
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
    exten = ar;
    setexten(ar);
    exten = ar;
    fetchUsers(currentPage, perPage, searchText, fromDate, toDate, exten, calid, calling, called, bus);
    console.log(values);
  }

  const handleClose = () => {
    setShow(false);
    setBusiness();
    setLocation();
    setContact();
    setContactPerson();
    setIsActiv();
    setFormErrors({});
    // document.getElementById('userNameInput').value = '';
  }
  const handleDelete = (row) => {
    setRowToDelete(row);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!rowToDelete) return;

    try {
      const userData = JSON.parse(sessionStorage.getItem('userData'));
      if (!userData?.token) {
        toast.error('User not authenticated');
        return;
      }

      const businessId = rowToDelete.id;
      debugger;
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/v1/deletebusiness/${businessId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${userData.token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to delete business');
      }

      toast.success(`Business ${businessId} deleted successfully`);
      setDeleteDialogOpen(false);
      fetchUsers(
        paginationModel.page,
        paginationModel.pageSize,
        searchText,
        fromDate,
        toDate,
        exten,
        calid,
        calling,
        called,
        bus
      );
    } catch (error) {
      console.error('Error deleting business:', error);
      toast.error(`Failed to delete business: ${error.message}`);
    } finally {
      setRowToDelete(null);
    }
  };

  const checkAdminStatus = async () => {
    try {
      const userData = JSON.parse(sessionStorage.getItem('userData'));
      if (userData?.token) {
        const decodedToken = await fetchDecodedUserData(userData.token);
        setIsAdmin(decodedToken.data.role === 'Admin');
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const saveuser = async () => {
    let errors = {};
    const alphaRegex = /^[A-Za-z][A-Za-z ]{0,19}$/;
    if (!business) {
      errors.business = 'Business Name is required';
    } else if (!alphaRegex.test(business)) {
      errors.business = 'Business Name must contain only alphabets and should be 1 to 20 characters long';
    }
    if (!location) {
      errors.location = 'Email is required';
    }
    if (!contactperson) {
      errors.contactperson = 'contactperson is required';
    }
    const mobileRegex = /^[1-9]\d{9}$/;
    if (!contact) {
      errors.contact = 'contact is required';
    } else if (!mobileRegex.test(contact)) {
      errors.contact = 'Invalid mobile number';
    }

    if (isActiv !== 0 && isActiv !== 1) {
      errors.isActive = 'IsActive is required';
    }
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }
    const Business = business === undefined ? '' : business.toString();
    const Location = location === undefined ? '' : location.toString();
    const Contact = contact === undefined ? '' : contact.toString();
    // const business = selectedbusiness === undefined ? '' : selectedbusiness.toString();
    const isActive = isActiv === undefined ? '' : isActiv.toString();
    const ContactPerson = contactperson === undefined ? '' : contactperson.toString();

    const newUser = {
      Business,
      Location,
      Contact,
      ContactPerson,
      isActive
    };
    // Perform any additional processing or validation here
    try {
      setLoading(true);
      const userData = JSON.parse(sessionStorage.getItem('userData'));
      const url = `${process.env.REACT_APP_API_URL}/api/v1/insertbusiness`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${userData.token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      console.log(response);
      // toast.success("Data saved successfully!");
      toast.success("Data saved successfully!");
      fetchUsers(paginationModel.page, paginationModel.pageSize, searchText, fromDate, toDate, exten, calid, calling, called, bus);
      setBusiness();
      setLocation();
      setContactPerson();
      setContact();
      setIsActiv();
      handleClose();

    } catch (error) {
      console.log(error)
      // toast.error("Data not save !");
      toast.warning("Data not save !");
      setLoading(false);
    } finally {
      setLoading(false);
    }
  }


  const handleEditBusiness = (e) => {
    const user = e.target.value;
    setEditbusinessname(user);
  }
  const handleeditLocationChange = (e) => {
    const user = e.target.value;
    setEditlocation(user);
  }

  const handleeditContactChange = (e) => {
    const user = e.target.value;
    setEditcontact(user);
  }

  const handleeditContactpersonChange = (e) => {
    const user = e.target.value;
    setEditcontactPerson(user);
  }

  const handleEditisActive = (val) => {
    setActivetype(val)
  }

  // const handleEdit = useCallback(
  //   row => async () => {
  //     debugger
  //     setshowEditModal(true);
  //     setSelectedRow(row.row);
  //     const queryString = new URLSearchParams({ userid: row.row.id });
  //     const url = `${process.env.REACT_APP_API_URL}/api/v1/editbusiness?${queryString}`;
  //     const response = await fetch(url, {
  //       method: 'GET',
  //       headers: {
  //         'Content-Type': 'application/json'
  //       }
  //     });
  //     const result = await response.json();
  //     setEditbusinessname(result.users[0].businessname);
  //     setEditlocation(result.users[0].location);
  //     setEditcontact(result.users[0].contactnumber)
  //     setEditcontactPerson(result.users[0].contactperson)
  //     // const items = ({ label: result.users[0].businessid, value: result.users[0].businessid });
  //     // seteditselectedbusiness(items)
  //     var items1 = ({ label: result.users[0].status === 1 ? 'Active' : 'InActive', value: result.users[0].status });
  //     setActivetype(items1);
  //   },
  //   [currentPage, perPage, totalRows]
  // );


  const handleEdit = async (row) => {
    setshowEditModal(true);
    setSelectedRow(row);

    try {
      const userData = JSON.parse(sessionStorage.getItem('userData'));
      const queryString = new URLSearchParams({ userid: row.id }).toString();
      const url = `${process.env.REACT_APP_API_URL}/api/v1/editbusiness?${queryString}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userData.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch business details');
      }

      const result = await response.json();

      // Set all the form fields with the fetched data
      setEditbusinessname(result.users[0].businessname || '');
      setEditlocation(result.users[0].location || '');
      setEditcontact(result.users[0].contactnumber || '');
      setEditcontactPerson(result.users[0].contactperson || '');
      setActivetype({
        label: result.users[0].status === 1 ? 'Active' : 'InActive',
        value: result.users[0].status
      });

    } catch (error) {
      console.error('Error fetching edit data:', error);
      toast.error('Failed to fetch business details: ' + error.message);
      setshowEditModal(false); // Close the modal if there's an error
    }
  };

  const update = async () => {
    let errors = {};
    const alphaRegex = /^[A-Za-z][A-Za-z ]{0,19}$/;
    if (!editbusinessname) {
      errors.editbusinessname = 'Business Name is required';
    } else if (!alphaRegex.test(editbusinessname)) {
      errors.editbusinessname = 'Business Name must contain only alphabets and should be 1 to 20 characters long';
    }

    if (!editlocation) {
      errors.editlocation = 'Email is required';
    }
    if (!editcontactperson) {
      errors.editcontactperson = 'contactperson is required';
    }
    const mobileRegex = /^[1-9]\d{9}$/;
    if (!editcontact) {
      errors.editcontact = 'contact is required';
    } else if (!mobileRegex.test(editcontact)) {
      errors.editcontact = 'Invalid mobile number';
    }

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    const businessname = editbusinessname;
    const location = editlocation;
    const contactperson = editcontactperson;
    const contact = editcontact;
    const isactive = selectActivetype.value;
    const userloginid = document.getElementById('userloginid').value;

    // // Create a new user object with the input values
    const updateUser = {
      businessname,
      location,
      contactperson,
      contact,
      isactive,
      userloginid,
    };

    if (!businessname || !location || !contactperson || !contact) {
      //toast.warn('Please fill in all fields')
      toast.warning('Please fill in all fields');
      return;
    }
    try {
      const userData = JSON.parse(sessionStorage.getItem('userData'));
      const url = `${process.env.REACT_APP_API_URL}/api/v1/updatebusiness`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${userData.token}`, 'Content-Type': 'application/json' },
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
        csvOptions={{ fileName: 'business_report' }}
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
            pagination
            paginationMode="server" // Enables server-side pagination
            rowCount={totalRows}
            pageSize={paginationModel.pageSize}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel} // ✅ Handles both page and pageSize changes
            pageSizeOptions={[7, 10, 20]} // ✅ Now this will work correctly
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
          <Modal.Title>Add Business</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-1">
              <Form.Label>Business Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter BusinessName"
                value={business}
                onChange={(e) => setBusiness(e.target.value)}
                required
                isInvalid={!!formErrors.business}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.business}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-1">
              <Form.Label>Location</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                /// onChange={handleEmailChange}
                isInvalid={!!formErrors.location}
                required
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.location}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-1">
              <Form.Label>Contact Person</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter Contact Person"
                value={contactperson}
                onChange={(e) => setContactPerson(e.target.value)}
                /// onChange={handleEmailChange}
                isInvalid={!!formErrors.contactperson}
                required
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.contactperson}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-1">
              <Form.Label>Contact No.</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter Contact No."
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                /// onChange={handleEmailChange}
                isInvalid={!!formErrors.contact}
                required
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.contact}
              </Form.Control.Feedback>
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
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" style={{ border: '1px solid #87b6e6' }} onClick={handleClose}>
            <span style={{ color: '#1976d2' }}>Close</span>
          </Button>
          {/* <Button variant="primary" onClick={saveuser}> */}
          <Button variant="light" style={{ border: '1px solid #87b6e6' }} onClick={saveuser}>
            <span style={{ color: '#1976d2' }}>Save</span>
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal for Edit */}
      <Modal show={showEditModal} onHide={handleEditClose}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Business</Modal.Title>
        </Modal.Header>
        <Modal.Body >
          {selectedRow && (
            <Form>
              <Form.Group className="mb-1" style={{ display: "none" }}>
                <Form.Label>Business Id</Form.Label>
                <Form.Control id="userloginid" as="select" defaultValue={selectedRow.b_id} disabled>
                  <option >{selectedRow.id}</option>
                </Form.Control>
              </Form.Group>
              <Form.Group className="mb-1">
                <Form.Label>Business Name</Form.Label>
                <Form.Control
                  type="username"
                  placeholder="Enter username"
                  value={editbusinessname}
                  onChange={handleEditBusiness}
                  isInvalid={!!formErrors.editbusinessname}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors.editbusinessname}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-1">
                <Form.Label>User Location</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter Location"
                  value={editlocation}
                  onChange={handleeditLocationChange}
                  isInvalid={!!formErrors.editlocation}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors.editlocation}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-1">
                <Form.Label>Contact</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter Contact"
                  value={editcontact}
                  onChange={handleeditContactChange}
                  isInvalid={!!formErrors.editcontact}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors.editcontact}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-1">
                <Form.Label>Contact Person</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter Contact Person"
                  value={editcontactperson}
                  onChange={handleeditContactpersonChange}
                  isInvalid={!!formErrors.editcontactperson}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors.editcontactperson}
                </Form.Control.Feedback>
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
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Confirm Deletion
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete this business?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          {/* <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="primary" autoFocus>
            Confirm
          </Button> */}
          <Button
            onClick={() => setDeleteDialogOpen(false)}
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
          </Button>
          <Button onClick={confirmDelete}
            style={{
              border: "1px solid #87b6e6",
              backgroundColor: "white",
              color: "#1976d2",
              borderRadius: "5px",
              padding: "6px 12px",
              textTransform: "none",
            }}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </div>

  );

}
export default App1;
