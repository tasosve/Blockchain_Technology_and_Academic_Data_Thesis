import {apiSlice} from "../../app/api/apiSlice"

export const degreeApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        degreeRequest: builder.mutation({
            query: (address) => ({
                url: `oracle/${address}`,
                method: "POST",
            }),
            validateStatus: (response, result) => {
                return response.status === 200 && !result.isError
            },
        }),
    }),
})

export const {useDegreeRequestMutation, usePdfRequestMutation} = degreeApiSlice
