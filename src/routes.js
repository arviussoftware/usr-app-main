import React, { useState } from 'react'
import { useRoutes } from 'react-router-dom'
import Login from "views/Login";
import ErrorPage from "./components/ErrorPage/404.js";
import Dashboard from "views/Dashboard.js";
import UserProfile from "views/Preferences.js";
import Business from 'views/business'
import Admin from 'layouts/Admin/Admin.js';
import ProtectedRoute from './views/ProtectedRoute.js'
import Extension  from 'views/extension.js';
import Auditreport from 'views/auditreport.js';


function Routes() {



    const routes = [
        { path: '/', element: <Login /> },
        {
            path: '/', element: <ProtectedRoute><Admin /> </ProtectedRoute>,
            children: [
                { path: 'dashboard', element: <Dashboard /> },
                { path: 'user-profile', element: <UserProfile /> },
                { path: 'Business', element: <Business /> }, 
                { path: 'Extension', element: <Extension /> },
                 { path: 'audit', element: <Auditreport /> }
               
            ]
        },
        { path: '*', element: <ErrorPage /> },
    ]

    return useRoutes(routes)
}

export default Routes
