import axiosInstance from './axiosInstance'
import { AUTH } from './apiPaths'

export const uploadImage = async (file) => {
  const formData = new FormData()
  formData.append('image', file)
  const response = await axiosInstance.post(AUTH.uploadImage, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}
