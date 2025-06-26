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



const removeItem = (array, item) => {
  const newArray = array.slice();
  newArray.splice(newArray.findIndex(a => a === item), 1);
  return newArray;
};

function AuditReport() {
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
  const [businessOptions, setBusinessOptions] = useState([]);

  //const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const [formErrors, setFormErrors] = useState({});
  const [business, setBusiness] = useState('');
  const [extension, setExtension] = useState('');
  const [isActiv, setIsActiv] = useState('');
  const [showEditModal, setshowEditModal] = useState(false);
  const handleEditClose = () => setshowEditModal(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [editbusinessname, setEditbusinessname] = useState('');
  const [selectedbusiness, setselectedbusiness] = useState();
  const [editlocation, setEditlocation] = useState([]);
  const [editcontact, setEditcontact] = useState('');
  const [Editextension, setEditextension] = useState('');
  const [selectActivetype, setActivetype] = useState();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 7,
  });
  const [filterModel, setFilterModel] = useState({ items: [] });

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
      const url = `${process.env.REACT_APP_API_URL}/api/v1/getaudit?${queryString}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session?.token}`,
          'Content-Type': 'application/json'
        }
      });
   
      // const response = await fetch(url);
      const data = await response.json();
      setData(data?.business);
      setTotalRows(data.business[0].u_totalcount);
      // const business = data.extension.map((i) => ({ value: i.u_businessid, label: i.u_businessid }));
      // setBusiness(business)
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchUsers(paginationModel.page, paginationModel.pageSize, searchText, fromDate, toDate, exten, calid, calling, called, bus);
  }, [paginationModel.page, paginationModel.pageSize, searchText, fromDate, toDate, exten, calid, calling, called, bus, filterModel]);

  function processQueueStartTime(queueStartTime) {
    if (queueStartTime === null || queueStartTime === undefined) {
      return ''
    }
    return queueStartTime.replace('T', ' ').replace(/\.\d+Z$/, '');
  }


  const columns = [
    {
      field: "b_username",
      headerName: "User Name",
      renderHeader: () => (<>User{" "}<i className="fa fa-info-circle ml-2" title="Name of the user"></i></>),
      flex: 0.5
    },
    {
      field: "b_startdate", headerName: "Start Time", renderHeader: () => (<>Start Time{" "}<i className="fa fa-info-circle ml-2" title="Login Time"></i></>), flex: 0.5
      ,
      renderCell: (params) => {
        // const status = (params.value);
        const status = processQueueStartTime(params.value);
        return <div>{status}</div>;
      }
    },
    {
      field: "b_enddate", headerName: "End Time",
      renderHeader: () => (<> End Time{" "}<i className="fa fa-info-circle ml-2" title="logout time"></i></>),
      flex: 0.5,
      renderCell: (params) => {
        const status = processQueueStartTime(params.value);
        return <div>{status}</div>;
      }
    },
    {
      field: "b_activity", headerName: "Status",
      renderHeader: () => (<> Status{" "}<i className="fa fa-info-circle ml-2" title="Status of the Loggedin user"></i></>),
      flex: 0.5

    }
  ];

  // Default column visibility (only show 4 columns)
  const [columnVisibilityModel, setColumnVisibilityModel] = useState({
    id: true,
    b_username: true,
    b_startdate: true,
    b_enddate: true,
    b_activity: true
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
    setExtension();
    setIsActiv();
    setFormErrors({});
    // document.getElementById('userNameInput').value = '';
  }

  const saveuser = async () => {

    let errors = {};
    const alphaRegex = /^[A-Za-z][A-Za-z ]{0,19}$/;
    if (!business) {
      errors.business = 'Business  is required';
    }

    if (!extension) {
      errors.location = 'Extension is required';
    }

    if (isActiv !== 0 && isActiv !== 1) {
      errors.isActive = 'IsActive is required';
    }
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }
    const businessId = business === undefined ? '' : business.toString();
    const extensionIds = extension === undefined ? '' : extension.toString();
    const status = isActiv === undefined ? '' : isActiv.toString();

    const newUser = {
      businessId,
      extensionIds,
      status
    };
    // Perform any additional processing or validation here
    try {
      setLoading(true);
      const session = JSON.parse(sessionStorage.getItem("userData"));
      const url = `${process.env.REACT_APP_API_URL}/api/v1/insertextensions`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session?.token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      console.log(response);
      // toast.success("Data saved successfully!");
      toast.success("Data saved successfully!");
      fetchUsers(paginationModel.page, paginationModel.pageSize, searchText, fromDate, toDate, exten, calid, calling, called, bus);
      setBusiness();
      setExtension();
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


  const handleeditExtensionChange = (e) => {
    const user = e.target.value;
    setEditextension(user);
  }

  const handleBusiness = (selectedOption) => {
    setselectedbusiness(selectedOption ? selectedOption.value : "");
  }

  const handleEditisActive = (val) => {
    setActivetype(val)
  }


  const handleEdit = useCallback(
    row => async () => {
      setshowEditModal(true);
      setSelectedRow(row.row);
      const session = JSON.parse(sessionStorage.getItem("userData"));
      const queryString = new URLSearchParams({ userid: row.row.id });
      const url = `${process.env.REACT_APP_API_URL}/api/v1/editextension?${queryString}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session?.token}`,
          'Content-Type': 'application/json'
        }
      });
      const result = await response.json();
      setEditbusinessname(result.users[0].businessid);
      setEditextension(result.users[0].extensionid);
      // const items = ({ label: result.users[0].businessid, value: result.users[0].businessid });
      // setEditbusinessname(items)
      var items1 = ({ label: result.users[0].status === 1 ? 'Active' : 'InActive', value: result.users[0].status });
      setActivetype(items1);
    },
    [currentPage, perPage, totalRows]
  );

  const update = async () => {

    let errors = {};
    const alphaRegex = /^[A-Za-z][A-Za-z ]{0,19}$/;
    // if (!editbusinessname) {
    //   errors.editbusinessname = 'Business Name is required';
    // } else if (!alphaRegex.test(editbusinessname)) {
    //   errors.editbusinessname = 'Business Name must contain only alphabets and should be 1 to 20 characters long';
    // }
    if (!Editextension) {
      errors.Editextension = 'contactperson is required';
    }
    const mobileRegex = /^[1-9]\d{9}$/;
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }
    const businessname = editbusinessname;
    const extension = Editextension;
    const isactive = selectActivetype.value;
    const userloginid = document.getElementById('userloginid').value;

    // // Create a new user object with the input values
    const updateUser = {
      businessname,
      extension,
      isactive,
      userloginid,
    };

    if (!businessname || !extension) {
      //toast.warn('Please fill in all fields')
      toast.warning('Please fill in all fields');
      return;
    }
    try {
      const url = `${process.env.REACT_APP_API_URL}/api/v1/updateextension`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        {/* <Button className="btn-sm"
          style={{ width: '85px', color: '#1976d2', border: '1px solid #87b6e6' }}
          variant={'outlined'} onClick={handleShow}
        >
          Add
        </Button> */}
        <GridToolbarExport
          className="btn btn-sm btn-outline-primary btn btn-outlined"
          csvOptions={{ fileName: 'audit_report' }}
          slotProps={{
            tooltip: { title: 'Export data' },
            button: { variant: 'outlined' },

          }}
        />
      </GridToolbarContainer>
    );
  }


  // useEffect(() => {
  //   async function fetchBusinessIds() {
  //     const url = `${process.env.REACT_APP_API_URL}/api/v1/getbusiness`;
  //     const response = await fetch(url); // Replace with your API
  //     const data = await response.json();
  //     const options = data.business.map(b => ({
  //       label: b.name || b.id,  // or any property you want to show
  //       value: b.id
  //     }));
  //     setBusinessOptions(options);
  //   }

  //   fetchBusinessIds();
  // }, []);

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
          <Modal.Title>Add Extension</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Business Id</Form.Label>
              <Select
                id="businessIdInput"
                isMulti
                value={businessOptions.filter(opt => business?.includes(opt.value))}
                onChange={(selected) => {
                  const selectedValues = selected ? selected.map(opt => opt.value) : [];
                  setBusiness(selectedValues);
                }}
                options={businessOptions}
                placeholder="---- Select Business Id(s) ----"
                isClearable
                className={formErrors.business ? 'is-invalid' : ''}
              />
              {formErrors.business && (
                <div className="invalid-feedback d-block">
                  {formErrors.business}
                </div>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Extension</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter Extension"
                value={extension}
                onChange={(e) => setExtension(e.target.value)}
                /// onChange={handleEmailChange}
                isInvalid={!!formErrors.location}
                required
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.location}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>IsActive</Form.Label>
              <Select
                id="isActiveInput"
                // className="mb-3"
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
              <Form.Group className="mb-3" style={{ display: "none" }}>
                <Form.Label>Business Id</Form.Label>
                <Form.Control id="userloginid" as="select" defaultValue={selectedRow.b_id} disabled>
                  <option >{selectedRow.id}</option>
                </Form.Control>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Business Id</Form.Label>
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
              <Form.Group className="mb-3">
                <Form.Label>Extension</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter Extension"
                  value={Editextension}
                  onChange={handleeditExtensionChange}
                  isInvalid={!!formErrors.Editextension}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors.Editextension}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
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
    </div>

  );

}
export default AuditReport;


