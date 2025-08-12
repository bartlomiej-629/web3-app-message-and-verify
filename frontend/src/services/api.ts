import axios from 'axios';

const API_BASE_URL = 'https://web3-app-message-and-verify.onrender.com';

export async function verifySignature(message: string, signature: string) {
  try {
    const response = await axios.post(`${API_BASE_URL}/verify-signature`, {
      message,
      signature,
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
}
