import {configureStore} from "@reduxjs/toolkit"
import {setupListeners} from "@reduxjs/toolkit/query"
import {apiSlice} from "./api/apiSlice"
import authReducer from "../features/auth/authSlice"
import oracleReducer from "../features/deegrePdf/degreeSlice"
import degreesReducer from "../features/deegrePdf/pdfDegreeSlice"

export const store = configureStore({
    reducer: {
        [apiSlice.reducerPath]: apiSlice.reducer,
        auth: authReducer,
        oracle: oracleReducer,
        degrees: degreesReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(apiSlice.middleware),
    devTools: false,
})

setupListeners(store.dispatch)
