import { createBrowserRouter } from "react-router-dom";
import Login from '../pages/Login'
import Form from "../pages/Form";
import Thankyou from "../pages/Thankyou";
import Admin from "../pages/Admin";

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
    }
]);

export default router;