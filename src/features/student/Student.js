import {useGetStudentQuery} from "./studentApiSlice"
import useAuth from "../../hooks/useAuth"

const Student = () => {
    const {address} = useAuth()
    const {
        data: student,
        isError,
        isSuccess,
        error,
    } = useGetStudentQuery(address)

    if (isError) {
        return (
            <div>
                {error.status} {JSON.stringify(error.data)}
            </div>
        )
    }

    if (isSuccess) {
        return (
            <tr>
                <td>{student.id}</td>
                <td>{student.name}</td>
                <td>{student.semester}</td>
                <td>{student.department}</td>
            </tr>
        )
    } else return null
}

export default Student
