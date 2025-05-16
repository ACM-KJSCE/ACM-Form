import { createBrowserRouter } from "react-router-dom";
import Login from '../pages/Login'
import Form from "../pages/Form";
import Thankyou from "../pages/Thankyou";
import Admin from "../pages/Admin";
import Preview from "../pages/Preview";

const router = createBrowserRouter([
    {
        path: '/',
        element: (
            <>
                <Login/>
            </> 
        )
    },
    {
        path: '/form',
        element: (
            <>
                <Form/>
            </>
        )
    },
    {
        path:"/success",
        element: (
            <>
                <Thankyou/>
            </>
        )
    },
    {
        path:"/admin",
        element: (
            <>
                <Admin/>
            </>
        )
    },
    {
        path:"/preview",
        element: (
            <>
                <Preview/>
            </>
        )

    }
],{
    basename:"/join"
});

export default router;