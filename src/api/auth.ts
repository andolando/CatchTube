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
    console.log(response.data)
    return response.data
  } catch (error) {
    console.log(error)
    throw error
  }
}
