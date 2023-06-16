import {useRef, useState} from "react"
import {useNavigate} from "react-router-dom"
import {useDispatch} from "react-redux"
import {setCredentials} from "../features/auth/authSlice"
import {useLoginMutation} from "../features/auth/authApiSlice"
import {getNonceThunk} from "../features/auth/authSlice"
import Web3 from "web3"

const WalletCard = () => {
    const web3 = new Web3(window.ethereum)
    const errRef = useRef()
    const [errMsg, setErrMsg] = useState("")

    const navigate = useNavigate()
    const dispatch = useDispatch()

    const [login, {isLoading}] = useLoginMutation()

    const handleEthersLogin = async () => {
        try {
            await window.ethereum.request({method: "eth_requestAccounts"})
            const accounts = await web3.eth.getAccounts()
            const address = accounts[0]

            const nonceResponse = await dispatch(getNonceThunk(address))

            const signature = await new Promise(async (resolve, reject) => {
                try {
                    const signedMessage = await web3.eth.personal.sign(
                        `I am signing my one-time nonce: ${nonceResponse.payload}`,
                        address
                    )
                    resolve(signedMessage)
                } catch (error) {
                    reject(error)
                }
            })

            const {accessToken} = await login({
                address,
                signature,
            }).unwrap()
            dispatch(setCredentials({accessToken}))
            navigate("/dash")
        } catch (err) {
            if (!err.status) {
                setErrMsg("No Server Responce")
            } else if (err.status === 400) {
                setErrMsg("Missing Credentials")
            } else if (err.starus === 401) {
                setErrMsg("Unauthorized")
            } else {
                setErrMsg(err.data?.message)
            }
            errRef.current.focus()
        }
    }

    if (isLoading) {
        return <p>Loading...</p>
    }

    return (
        <div className="login-wrap">
            <h2 className="login-title">Log In</h2>
            <p className="login-parg">
                Connect to an Oracle server to print your Digital Degree with
                safe connection to the Ethereum Blockchain
            </p>
            <p ref={errRef} aria-live="assertive">
                {errMsg}
            </p>
            <button className="login-button" onClick={handleEthersLogin}>
                Login with Metamask
            </button>
        </div>
    )
}

export default WalletCard
