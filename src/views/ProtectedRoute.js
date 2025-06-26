import { useEffect } from "react";
import { json, useNavigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
    const navigate = useNavigate();

    const tokenval= JSON.parse(sessionStorage.getItem("userData")); 

    useEffect(() => {
        if (!tokenval || tokenval.token==="false" ) {
            navigate("/");
        }
    }, [navigate]);

    return children;
};

export default ProtectedRoute;
