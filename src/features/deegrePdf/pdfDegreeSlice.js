import {createSlice, createAsyncThunk} from "@reduxjs/toolkit"

export const pdfRequestThunk = createAsyncThunk(
    "degrees/pdfRequest",
    async (filename, {getState}) => {
        try {
            const token = getState().auth.token
            const response = await fetch(
                `http://localhost:3500/degrees/${filename}`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )
            const blob = await response.blob()
            const pdfUrl = URL.createObjectURL(blob)
            return pdfUrl
        } catch (err) {
            console.log(err)
        }
    }
)

export const pdfDegreeSlice = createSlice({
    name: "degrees",
    initialState: {
        status: "idle",
        error: null,
        response: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(pdfRequestThunk.pending, (state) => {
                state.status = "loading"
                console.log(state.status)
            })
            .addCase(pdfRequestThunk.fulfilled, (state, action) => {
                state.status = "succeeded"
                state.response = action.payload
                console.log(state.response)
            })
            .addCase(pdfRequestThunk.rejected, (state, action) => {
                state.status = "failed"
                state.error = action.error.message
                console.log(state.error)
            })
    },
})

export default pdfDegreeSlice.reducer
