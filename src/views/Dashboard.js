import React, { useState, useEffect, useCallback, useMemo } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from "react-select";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import {
  DataGrid,
  GridToolbar,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  GridToolbarExport,
} from "@mui/x-data-grid";
import { Typography, Box, Card, useTheme } from "@mui/material";
import { tokens } from "./theme";
import fetchDecodedUserData from "../fetchDecodedUserData";
import Audio from './audio'

const removeItem = (array, item) => {
  const newArray = array.slice();
  newArray.splice(
    newArray.findIndex((a) => a === item),
    1
  );
  return newArray;
};

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  return formattedDate;
}

function Dashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [fromDate, setfromDate] = useState(new Date());
  const [toDate, settoDate] = useState(new Date());
  const [exten, setexten] = useState([]);
  const [calid, setcalid] = useState([]);
  const [calling, setcalling] = useState([]);
  const [called, setcalled] = useState([]);
  const [bus, setbus] = useState([]);
  const [show, setShow] = useState(false);
  const [showAudioPopup, setShowAudioPopup] = useState(false);
  const [selectedAudio, setSelectedAudio] = useState(null);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const [extension, setextension] = useState([]);
  const [dnis, setdnis] = useState([]);
  const [ani, setani] = useState([]);
  const [business, setbusiness] = useState([]);
  const [filterModel, setFilterModel] = useState({ items: [] });
  const [audioid, setAudioid] = useState(null);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });

  const [download, setdownload] = useState(false);

  const fetchUsers = async (
    page,
    size,
    searchText,
    fromDate,
    toDate,
    ex,
    calid,
    calling,
    called,
    bus
  ) => {
    setLoading(true);
    const fromDate1 = formatDate(fromDate);
    const toDate1 = formatDate(toDate);
    try {


      const queryString = new URLSearchParams({
        fromDate: fromDate1,
        toDate: toDate1,
      }).toString();
      const session = JSON.parse(sessionStorage.getItem("userData"));
      const url = `${process.env.REACT_APP_API_URL}/api/v1/getfilterdata?${queryString}`;
      // const response = await fetch(url);
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session?.token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      const extension = data.extension.map((i) => ({
        value: i.c_extension,
        label: i.c_extension,
      }));
      const dnis = data.dnis.map((i) => ({ value: i.c_dnis, label: i.c_dnis }));
      const ani = data.ani.map((i) => ({ value: i.c_ani, label: i.c_ani }));
      const business = data.business.map((i) => ({
        value: i.c_id,
        label: i.c_businessname,
      }));
      setextension(extension);
      setdnis(dnis);
      setani(ani);
      setbusiness(business);
      const userdata = JSON.parse(sessionStorage.getItem("userData"));
      var fetchdta = await fetchDecodedUserData(userdata.token);
      const businessid = fetchdta.data.BussinessId;
      const roleid = fetchdta.data.roleid;
      let queryString1 = new URLSearchParams({
        fromDate: fromDate1,
        toDate: toDate1,
        businessid: businessid,
        roleid: roleid,
        page: page,
        size: size,
      }).toString();
      if (filterModel?.items?.length > 0) {
        queryString1 += `&filter=${encodeURIComponent(
          JSON.stringify(filterModel?.items)
        )}`;
      }

      const url1 = `${process.env.REACT_APP_API_URL}/api/v1/getcalldata?${queryString1}`;
      //const response1 = await fetch(url1);
      const response1 = await fetch(url1, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session?.token}`,
          'Content-Type': 'application/json'
        }
      });
      const data1 = await response1.json();
      debugger
      setData(data1.calldata);
      setTotalRows(data1.totalcount);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      setLoading(false);
    }
  };

  const [columnVisibilityModel, setColumnVisibilityModel] = useState({
    c_call_id: true,
    c_audio_start_time: true,
    c_audio_end_time: true,
    c_ani: true,
    c_dnis: true,
    c_extension: true,
    c_personal_name: true,
    c_duration: false,
    c_ucid: false,
    c_business: false,
    c_direction: false,
    media: true,
  });


  const AudioComponent = ({ fileName, canDownload }) => {

    const [audioUrl, setAudioUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
      const fetchAudioUrl = async () => {
        setLoading(true);
        try {
          const response = await fetch(
            `${process.env.REACT_APP_API_URL
            // }/api/v1/get-audio-url?file=${encodeURIComponent(fileName)}
            }/decrypt-audio/${encodeURIComponent(fileName)}`
          );
          const data = await response.json();
          console.log("Audio URL data:", data);
          if (data.url) {
            setAudioUrl(data.url);
          } else {
            console.error("Audio URL not found");
          }
        } catch (error) {
          console.error("Error fetching audio URL:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchAudioUrl();
    }, [fileName]);

    if (loading) {
      return <span>Loading...</span>;
    }

    return (
      <div>
        <audio
          style={{ height: "36px" }}
          src={audioUrl}
          controls
          controlsList={canDownload ? "" : "nodownload"}
        />
        {canDownload ? (
          <a
            href={audioUrl}
            download={fileName}
            style={{ marginLeft: "10px", textDecoration: "none" }}
          >
            <Button
              color="primary"
              style={{ marginTop: "-20px" }}
            >
              Download
            </Button>
            {/* <Button variant="outlined" color="primary" style={{ marginTop: '-20px'}}>
              Download
            </Button> */}
          </a>
        ) : (
          ""
        )}
      </div>
    );
  };

  useEffect(() => {
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
  }, [
    paginationModel.page,
    paginationModel.pageSize,
    searchText,
    fromDate,
    toDate,
    exten,
    calid,
    calling,
    called,
    bus,
    filterModel,
  ]);

  const handleAudioPopupOpen = (fileName) => {

    setSelectedAudio(fileName);
    setShowAudioPopup(true);
  };

  const handleAudioPopupClose = () => {
    setShowAudioPopup(false);
  };

  const columns = [
    {
      field: "c_call_id",
      headerName: "Call Id",
      renderHeader: () => (
        <>
          Call Id{" "}
          <i
            className="fa fa-info-circle ml-1"
            title="Call Id of the agent."
          ></i>
        </>
      ),
      flex: 0.5,
    },
    {
      field: "c_audio_start_time",
      headerName: "Audio End Time",
      renderHeader: () => (
        <>
          Audio Start Time{" "}
          <i
            className="fa fa-info-circle ml-1"
            title="Start time of the call."
          ></i>
        </>
      ),
      flex: 0.5,
    },
    {
      field: "c_audio_end_time",
      headerName: "Audio End Time",
      renderHeader: () => (
        <>
          {" "}
          Audio End Time{" "}
          <i
            className="fa fa-info-circle ml-1"
            title="End time of the call."
          ></i>
        </>
      ),
      flex: 0.8,
    },
    {
      field: "c_ani",
      headerName: "Ani",
      renderHeader: () => (
        <>
          {" "}
          ANI <i className="fa fa-info-circle ml-1" title="Caller number."></i>
        </>
      ),
      flex: 0.5,
    },
    {
      field: "c_dnis",
      headerName: "Dnis",
      renderHeader: () => (
        <>
          {" "}
          DNIS <i className="fa fa-info-circle ml-1" title="Called number."></i>
        </>
      ),
      flex: 0.5,
    },
    {
      field: "c_extension",
      headerName: "Extension",
      renderHeader: () => (
        <>
          {" "}
          Extension{" "}
          <i
            className="fa fa-info-circle ml-1"
            title="Extension for the call."
          ></i>
        </>
      ),
      flex: 0.5,
    },
    {
      field: "c_personal_name",
      headerName: "Agent Name",
      renderHeader: () => (
        <>
          {" "}
          Agent Name{" "}
          <i
            className="fa fa-info-circle ml-1"
            title="Name of the agent on call."
          ></i>
        </>
      ),
      flex: 0.5,
    },
    {
      field: "c_duration",
      headerName: "Duration",
      renderHeader: () => (
        <>
          {" "}
          Duration{" "}
          <i
            className="fa fa-info-circle ml-1"
            title="Duration for the call."
          ></i>
        </>
      ),
      flex: 0.5,
    },
    {
      field: "c_ucid",
      headerName: "UCID",
      renderHeader: () => (
        <>
          {" "}
          UCID{" "}
          <i
            className="fa fa-info-circle ml-1"
            title="UCID for the call."
          ></i>
        </>
      ),
      flex: 0.5,
    },
    {
      field: "c_business",
      headerName: "Business",
      renderHeader: () => (
        <>
          {" "}
          Business{" "}
          <i
            className="fa fa-info-circle ml-1"
            title="Business for the call."
          ></i>
        </>
      ),
      flex: 0.5,
    },
    {
      field: "c_direction",
      headerName: "Direction",
      renderHeader: () => (
        <>
          {" "}
          Direction{" "}
          <i
            className="fa fa-info-circle ml-1"
            title="Direction for the call."
          ></i>
        </>
      ),
      flex: 0.5,
    },
    {
      field: "media",
      headerName: "Media",
      renderHeader: () => (
        <>
          Media {""}{" "}
          <i
            className="fa fa-info-circle ml-1"
            title="Media to play and download."
          ></i>
        </>
      ),
      renderCell: (params) => (


        <Button
          variant="outlined"
          color="primary"
          style={{
            border: "1px solid #87b6e6",
            margin: 0,
            padding: "6px 10px",
            backgroundColor: "white",
            cursor: "pointer"
          }}

          onClick={() => {
            setSelectedAudio(params.row.c_mp3path);
            setAudioid(params.row.c_call_id);
            setShowAudioPopup(true);
          }}

        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="16"
            viewBox="0 0 24 24"
            fill="#1A76D1"
          >
            <path d="M8 5v14l11-7z" />
          </svg>

        </Button>
      ),
      flex: 0.5,
    },
  ];

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePerRowsChange = async (newPerPage, page) => {
    setPerPage(newPerPage);
    setCurrentPage(page);
  };

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const handledate = (value, rd) => {
    if (rd === 1) {
      var dateto = new Date(value);
      const today = new Date();
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
      if (values[i].value !== 0) {
        ar.push(values[i].value);
      }
    }
    setexten(ar);
    fetchUsers(
      currentPage,
      perPage,
      searchText,
      fromDate,
      toDate,
      ar,
      calid,
      calling,
      called,
      bus
    );
  };

  const fechdata = async () => {
    const userdata = JSON.parse(sessionStorage.getItem("userData"));
    const audio = await fetchDecodedUserData(userdata?.token);
    const queryString = new URLSearchParams({ userid: audio?.data?.userId });
    const url = `${process.env.REACT_APP_API_URL}/api/v1/editusers?${queryString}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        'Authorization': `Bearer ${userdata?.token}`,
        "Content-Type": "application/json",
      },
    });
    const result = await response.json();
    setdownload(result?.users[0]?.isaudio == 1 ? true : false);
  };

  useEffect(() => {
    let timerId = setTimeout(() => {
      fechdata();
      timerId = null;
    }, 5000);
    return () => clearTimeout(timerId);
  }, []);

  function CustomToolbar() {
    const slotProps = {
      tooltip: { title: "Export data" },
      button: { variant: "outlined" },
    };

    return (
      <GridToolbarContainer>
        <div style={{ marginRight: "-48px" }}>
          <label
            htmlFor="inputField"
            style={{
              color: "#1976d2",
              fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
              fontWeight: 400,
              fontSize: "0.875rem",
            }}
          >
            From Date:
          </label>
          <DatePicker
            className="form form-control w-75 dtp outline-primary h-25"
            selectsStart
            selected={new Date(fromDate)}
            onChange={(rd) => handledate(rd, 1)}
            startDate={new Date(fromDate)}
            dateFormat="MM-dd-yyyy HH:mm"
            showYearDropdown
            showMonthDropdown
            maxDate={new Date()}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
          />
        </div>
        <div>
          <label
            htmlFor="inputField"
            style={{
              color: "#1976d2",
              fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
              fontWeight: 400,
              fontSize: "0.875rem",
            }}
          >
            To Date:
          </label>
          <DatePicker
            className="form form-control dtp w-75 outline-primary h-25"
            selectsEnd
            selected={new Date(toDate)}
            onChange={(rd) => handledate(rd, 2)}
            endDate={new Date(toDate)}
            startDate={new Date(toDate)}
            minDate={new Date(fromDate)}
            maxDate={new Date(toDate)}
            dateFormat="MM-dd-yyyy HH:mm"
            showYearDropdown
            showMonthDropdown
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
          />
        </div>
        <GridToolbarColumnsButton
          slotProps={{
            tooltip: { title: "Change Column" },
            button: { variant: "outlined" },
          }}
        />
        <GridToolbarFilterButton
          slotProps={{
            tooltip: { title: "Filter value" },
            button: { variant: "outlined" },
          }}
        />
        <GridToolbarDensitySelector
          slotProps={{
            tooltip: { title: "Change density" },
            button: { variant: "outlined" },
          }}
        />
        <Box sx={{ flexGrow: 1 }} />
        <GridToolbarExport
          csvOptions={{ fileName: 'Dashboard_report' }}
          className="btn btn-sm btn-outline-primary btn btn-outlined"
          slotProps={{
            tooltip: { title: "Export data" },
            button: { variant: "outlined" },
          }}
        />
      </GridToolbarContainer>
    );
  }

  return (
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
              backgroundColor: "#069ebd !important",
              color: "black",
              borderBottom: "none",
              fontSize: "16px",
              fontWeight: "normal",
            },
            "& .MuiDataGrid-virtualScroller": {
              backgroundColor: colors.primary[400],
            },
            "& .MuiDataGrid-footerContainer": {
              borderTop: "none",
              color: "white",
              backgroundColor: "#1A76D1 !important",
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
            paginationMode="server"
            rowCount={totalRows}
            pageSize={paginationModel.pageSize}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[10, 20, 50, 100]}
            loading={loading}
            sx={{ border: 0 }}
            columnVisibilityModel={columnVisibilityModel}
            onColumnVisibilityModelChange={setColumnVisibilityModel}
            onFilterModelChange={setFilterModel}
          />
        </Box>
      </Box>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Modal heading</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form>
            <div className="row mb-3">
              <div className="col-md-5" style={{ marginRight: "8px" }}>
                <label className="form-label"> Extension</label>
                <Select
                  onChange={handleCategoryChange}
                  isMulti
                  className="basic-multi-select"
                  options={extension}
                  placeholder="Extension"
                />
              </div>
              <div className="col-md-5">
                <label className="form-label"> DNIS</label>
                <Select
                  onChange={handleCategoryChange}
                  isMulti
                  className="basic-multi-select"
                  options={dnis}
                  placeholder="DNIS"
                />
              </div>
            </div>
            <div className="row mb-3">
              <div className="col-md-5" style={{ marginRight: "8px" }}>
                <label className="form-label">ANI</label>
                <Select
                  onChange={handleCategoryChange}
                  isMulti
                  className="basic-multi-select"
                  options={ani}
                  placeholder="ANI"
                />
              </div>
              <div className="col-md-5">
                <label className="form-label">Business</label>
                <Select
                  onChange={handleCategoryChange}
                  isMulti
                  className="basic-multi-select"
                  options={business}
                  placeholder="Business"
                />
              </div>
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button style={{ background: "#0d6efd" }} onClick={handleClose}>
            Close
          </Button>
          <Button style={{ background: "#0d6efd" }} onClick={handleClose}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      <Audio
        fileName={selectedAudio}
        audioid={audioid}
        canDownload={download}
        showAudioPopup={showAudioPopup}
        handleAudioPopupClose={handleAudioPopupClose}
        selectedAudio={selectedAudio}
      />


    </div>
  );
}

export default Dashboard;
