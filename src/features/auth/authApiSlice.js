import {apiSlice} from "../../app/api/apiSlice"
import {logOut, setCredentials} from "./authSlice"
import Cookies from "js-cookie"

export const authApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation({
            query: (credentials) => ({
                url: "/auth",
                method: "POST",
                body: {...credentials},
            }),
        }),

        getNonce: builder.mutation({
            query: (address) => ({
                url: `/auth/nonce/${address}`,
                method: "GET",
            }),
        }),

        refresh: builder.mutation({
            query: () => ({
                url: "/auth/refresh",
                method: "GET",
            }),
            async onQueryStarted(arg, {dispatch, queryFulfilled}) {
                try {
                    const {data} = await queryFulfilled
                    console.log(data)
                    const {accessToken} = data
                    dispatch(setCredentials({accessToken}))
                } catch (err) {
                    console.log(err)
                }
            },
        }),

        deletePdf: builder.mutation({
            query: (tokenId) => ({
                url: "/auth/delete",
                method: "POST",
                body: {tokenId},
            }),
        }),

        sendLogout: builder.mutation({
            query: () => ({
                url: "/auth/logout",
                method: "POST",
            }),
            async onQueryStarted(arg, {dispatch, queryFulfilled}) {
                try {
                    const {data} = await queryFulfilled
                    console.log(data)
                    const storedUriLink = await Cookies.get("studentTokenId")
                    if (storedUriLink) {
                        dispatch(
                            authApiSlice.endpoints.deletePdf.initiate(
                                storedUriLink
                            )
                        )
                    }
                    await Cookies.remove("studentTokenId")
                    dispatch(logOut())
                    dispatch(apiSlice.util.resetApiState())
                } catch (err) {
                    console.log(err)
                }
            },
        }),
    }),
})

export const {useLoginMutation, useSendLogoutMutation, useRefreshMutation} =
    authApiSlice
