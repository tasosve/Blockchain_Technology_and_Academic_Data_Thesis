import {Routes, Route} from "react-router-dom"
import Layout from "./components/Layout"
import LoginWallet from "./components/LoginWallet"
import DashLayout from "./components/DashLayout"
import LoggedIn from "./features/auth/LoggedIn"
import PersistLogin from "./features/auth/PersistLogin"
import RequireAuth from "./features/auth/RequireAuth"

function App() {
    return (
        <Routes>
            <Route path="/" element={<Layout />}>
                <Route index element={<LoginWallet />} />

                <Route element={<PersistLogin />}>
                    <Route element={<RequireAuth />}>
                        <Route path="dash" element={<DashLayout />}>
                            <Route index element={<LoggedIn />} />
                        </Route>
                    </Route>
                </Route>
            </Route>
        </Routes>
    )
}

export default App
