import {apiSlice} from "../../app/api/apiSlice"

export const studentApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getStudent: builder.query({
            query: (address) => `students/${address}`,
            validateStatus: (response, result) => {
                return response.status === 200 && !result.isError
            },
            //keepUnusedDataFor: 60,
        }),
    }),
})

export const {useGetStudentQuery} = studentApiSlice
