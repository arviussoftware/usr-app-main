import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import React, { useState, useEffect } from "react";
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import fetchDecodedUserData from '../fetchDecodedUserData';
import { toast } from 'react-toastify';

const Audio = ({ fileName, canDownload, showAudioPopup, handleAudioPopupClose, selectedAudio, audioid }) => {

    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        setLoading(true);
    }, [selectedAudio]);

    const handleLoadedData = () => {
        setLoading(false);
    };

    const handleDownload = async () => {
        try {
            setDownloading(true);
            const session = JSON.parse(sessionStorage.getItem("userData"));
            const audioUrl = `${process.env.REACT_APP_API_URL}/decrypt-audio/${selectedAudio}`;
            // const response = await fetch(audioUrl, {
            //     method: 'GET',
            //     headers: {
            //         'Authorization': `Bearer ${session?.token}`,
            //         'Content-Type': 'application/json'
            //     }
            // });
            const response = await fetch(audioUrl);

            if (!response.ok) {
                throw new Error('Failed to download audio file.');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = fileName || selectedAudio || 'audio.mp3';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            const usrdata = JSON.parse(sessionStorage.getItem('userData'));
            var fetchdta = await fetchDecodedUserData(usrdata?.token);
            await insertAuditReport(fetchdta, "Download(" + audioid + ")");
            setDownloading(false);
        } catch (error) {
            console.error("Download failed:", error);
            alert("Failed to download the audio file.");
        }
    };

    const handlePlay = async () => {

        try {
            const usrdata = JSON.parse(sessionStorage.getItem('userData'));
            var fetchdta = await fetchDecodedUserData(usrdata?.token);
            await insertAuditReport(fetchdta, "Play(" + audioid + ")");
        } catch (error) {
            console.error("unable to insert play data:", error);
            alert("unable to insert play data.");
        }

    }

    const insertAuditReport = async (userdataaudit, status) => {

        try {
            const userloginid = userdataaudit?.data?.userId.toString();
            const loginguid = JSON.parse(sessionStorage.getItem('login_id'));
            const activity = status;
            const startdate = new Date().toISOString();
            const enddate = new Date().toISOString();
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
                headers: { 'Authorization': `Bearer ${session?.token}`, 'Content-Type': 'application/json' },
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
        <Modal show={showAudioPopup} onHide={handleAudioPopupClose}>
            <Modal.Header closeButton>
                <Modal.Title>Audio Player</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    {loading && (
                        <p>
                            <span style={{ fontSize: "1.2rem", color: "#6c757d" }}>
                                Loading audio file...
                            </span>
                            <Stack sx={{ color: 'grey.500' }} spacing={2} direction="row">
                                <CircularProgress color="secondary" />
                                <CircularProgress color="success" />
                                <CircularProgress color="inherit" />
                            </Stack>
                        </p>
                    )}
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "1rem" }}>
                        <audio
                            src={`${process.env.REACT_APP_API_URL}/decrypt-audio/${selectedAudio}`}
                            controls
                            controlsList="nodownload"
                            onPlay={handlePlay}
                            onLoadedData={handleLoadedData}
                            style={{ display: loading ? 'none' : 'block', marginTop: '1rem' }}
                        />

                        {canDownload && (
                            downloading ? (
                                <Stack sx={{ color: 'grey.500', width: '20px' }} spacing={2} direction="row">
                                    <CircularProgress color="secondary" />
                                </Stack>
                            ) : (
                                <span
                                    title="Download Audio"
                                    onClick={handleDownload}
                                    style={{ display: loading ? 'none' : 'block', marginTop: '1rem', cursor: 'pointer' }}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        height="16"
                                        width="16"
                                        viewBox="0 0 512 512"
                                    >
                                        <path
                                            fill="#1976d2"
                                            d="M480 352h-96V160H128v192H32L256 480 480 352zM32 32h448v64H32z"
                                        />
                                    </svg>
                                </span>
                            )
                        )}


                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button
                    className="btn btn-sm btn-outline-primary"
                    style={{
                        background: "white",
                        display: "block",
                        margin: "0 auto",
                        color: "#0d6efd",
                        borderColor: "#0d6efd",
                        pointerEvents: "auto",
                    }}
                    onClick={handleAudioPopupClose}
                >
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default Audio;
