import { createBrowserRouter } from "react-router-dom";
import Login from '../pages/Login'
// import Form from "../pages/Form";
import Thankyou from "../pages/Thankyou";
import Admin from "../pages/Admin";
import Preview from "../pages/Preview";
import Formclosed from "../pages/Formclosed";

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
        path: '/formclosed',
        element: (
            <>
                <Formclosed/>
            </> 
        )
    },
    // {
    //     path: '/form',
    //     element: (
    //         <>
    //             <Form/>
    //         </>
    //     )
    // },
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