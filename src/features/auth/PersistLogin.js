import {Outlet, Link} from "react-router-dom"
import {useEffect, useRef, useState} from "react"
import {useRefreshMutation} from "./authApiSlice"
import {useSelector} from "react-redux"
import {selectCurrentToken} from "./authSlice"

const PersistLogin = () => {
    const token = useSelector(selectCurrentToken)
    const effectRan = useRef(true)

    const [trueSuccess, setTrueSuccess] = useState(false)

    const [refresh, {isUninitialized, isLoading, isSuccess, isError, error}] =
        useRefreshMutation()

    useEffect(() => {
        const verifyRefreshToken = async () => {
            console.log("verifying refresh token")
            try {
                await refresh()
                setTrueSuccess(true)
            } catch (err) {
                console.error(err)
            }
        }

        verifyRefreshToken()

        return () => (effectRan.current = true)

        // eslint-disable-next-line
    }, [])

    if (isLoading) {
        console.log("loading")
    } else if (isError) {
        console.log("error")
        return (
            <p className="errmsg">
                {`${error?.data?.message} - `}
                <Link to="/login">Please login again</Link>.
            </p>
        )
    } else if (isSuccess && trueSuccess) {
        return <Outlet />
    } else if (token && isUninitialized) {
        return <Outlet />
    }
}
export default PersistLogin
