import {createSlice, createAsyncThunk} from "@reduxjs/toolkit"
import {authApiSlice} from "./authApiSlice"

export const getNonceThunk = createAsyncThunk(
    "auth/getNonceThunk",
    async (address, {dispatch}) => {
        try {
            const response = dispatch(
                authApiSlice.endpoints.getNonce.initiate(address)
            )
            response.unsubscribe()
            const result = await response
            return result.data
        } catch (err) {
            console.log(err.response.data)
        }
    }
)

const authSlice = createSlice({
    name: "auth",
    initialState: {token: null},
    reducers: {
        setCredentials: (state, action) => {
            const {accessToken} = action.payload
            state.token = accessToken
        },
        logOut: (state, action) => {
            state.token = null
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getNonceThunk.pending, (state) => {
                state.status = "loading"
                console.log(state.status)
            })
            .addCase(getNonceThunk.fulfilled, (state, action) => {
                state.status = "succeeded"
                state.response = action.payload
                console.log(state.response)
            })
            .addCase(getNonceThunk.rejected, (state, action) => {
                state.status = "failed"
                state.error = action.error.message
                console.log(state.error)
            })
    },
})

export const {setCredentials, logOut} = authSlice.actions

export default authSlice.reducer

export const selectCurrentToken = (state) => state.auth.token
