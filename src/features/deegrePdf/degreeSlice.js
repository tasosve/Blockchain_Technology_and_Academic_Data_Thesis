import {createSlice, createAsyncThunk} from "@reduxjs/toolkit"
import {degreeApiSlice} from "./degreeApiSlice"

export const degreeRequestThunk = createAsyncThunk(
    "oracle/degreeRequest",
    async (address, {dispatch}) => {
        try {
            const response = dispatch(
                degreeApiSlice.endpoints.degreeRequest.initiate(address)
            )
            response.unsubscribe()
            const result = await response
            return result.data
        } catch (err) {
            console.log(err.response.data)
        }
    }
)

export const degreeSlice = createSlice({
    name: "oracle",
    initialState: {
        status: "idle",
        error: null,
        response: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(degreeRequestThunk.pending, (state) => {
                state.status = "loading"
                console.log(state.status)
            })
            .addCase(degreeRequestThunk.fulfilled, (state, action) => {
                state.status = "succeeded"
                state.response = action.payload
                console.log(state.response)
            })
            .addCase(degreeRequestThunk.rejected, (state, action) => {
                state.status = "failed"
                state.error = action.error.message
                console.log(state.error)
            })
    },
})

export default degreeSlice.reducer
