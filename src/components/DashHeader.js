import {useEffect} from "react"
import {useNavigate} from "react-router-dom"
import {useSendLogoutMutation} from "../features/auth/authApiSlice"
import useAuth from "../hooks/useAuth"

const DashHeader = () => {
    const {address} = useAuth()

    const navigate = useNavigate()

    const [sendLogout, {isLoading, isSuccess, isError, error}] =
        useSendLogoutMutation()

    useEffect(() => {
        if (isSuccess) navigate("/")
    }, [isSuccess, navigate])

    const onLogoutClicked = () => {
        sendLogout()
    }

    if (isLoading) {
        return <p>Logging Out...</p>
    }

    if (isError) {
        return <p>Error: {error.data?.message}</p>
    }

    const logoutButton = (
        <button
            className="logout-button"
            title="Logout"
            onClick={onLogoutClicked}
        >
            Log out
        </button>
    )

    return (
        <>
            <div className="header-wrap">
                {logoutButton}
                <p className="curent-user">Curent Student: {address}</p>
            </div>
        </>
    )
}

export default DashHeader
