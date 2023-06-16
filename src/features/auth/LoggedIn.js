import React, {useState, useEffect} from "react"
import {Link} from "react-router-dom"
import Cookies from "js-cookie"
import {useDispatch} from "react-redux"
import {useGetStudentQuery} from "../student/studentApiSlice"
import Student from "../student/Student"
import useAuth from "../../hooks/useAuth"
import {degreeRequestThunk} from "../deegrePdf/degreeSlice"
import {pdfRequestThunk} from "../deegrePdf/pdfDegreeSlice"

const LoggedIn = () => {
    const dispatch = useDispatch()

    const {address} = useAuth()
    const [studentTokenId, setStudentTokenId] = useState(null)

    useEffect(() => {
        const studentTokenIdRef = Cookies.get("studentTokenId")
        if (studentTokenIdRef) {
            setStudentTokenId(studentTokenIdRef)
        }
    }, [])

    const onPrintPdfClicked = async () => {
        try {
            const studentTokenIdResponse = await dispatch(
                degreeRequestThunk(address)
            ).unwrap()
            const {tokenId} = studentTokenIdResponse
            setStudentTokenId(tokenId)
            Cookies.set("studentTokenId", tokenId)
        } catch (error) {
            console.log(error)
        }
    }

    const printPdfButton = (
        <button
            className="print-button"
            title="Print_NFT_Degree"
            onClick={onPrintPdfClicked}
        >
            Print Degree
        </button>
    )

    const handleLinkClick = async () => {
        const {payload} = await dispatch(pdfRequestThunk(studentTokenId))
        console.log(payload)
        window.open(payload, "_blank")
    }

    const {
        data: student,
        isError,
        error,
        isSuccess,
    } = useGetStudentQuery(address)

    if (isError) {
        return <p className={"errmsg"}>{error?.data?.message}</p>
    }

    if (isSuccess) {
        const {address} = student

        const tableContent = address ? <Student key={address} /> : null

        return (
            <>
                <div className="logged-in-wrap">
                    <div className="container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th scope="col">id</th>
                                    <th scope="col">Name</th>
                                    <th scope="col">Semester</th>
                                    <th scope="col">Department</th>
                                </tr>
                            </thead>
                            <tbody>{tableContent}</tbody>
                        </table>
                        <p className="paragraph">
                            With just one click and no intermediary in between,
                            you can generate your degree in seconds.This degree
                            is a unique ECR 721 token matched to your address.
                        </p>
                        <p>
                            By clicking the following button you can print your
                            NFT Digital Degree.
                        </p>
                        {printPdfButton}
                        {studentTokenId && (
                            <Link onClick={handleLinkClick}>
                                Click to open Degree
                            </Link>
                        )}
                    </div>
                </div>
            </>
        )
    }
}

export default LoggedIn
