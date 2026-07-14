import { isAxiosError } from "axios"
import api from "../lib/axios"

export const logout = async () => {
  try {
    await api.post("/auth/logout", {}, {
        withCredentials: true
    })
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const getUser = async () => {
  try {
    const response = await api.get("/auth/me",{
        withCredentials: true
    })
   
    return response.data
  } catch (error) {
    if(isAxiosError(error) && error.response?.status === 401) {
      return null
    }
    console.log(error)
    throw error
  }
}
