import axios from "axios";
import baseUrl from "./baseUrl";
import cookie from "js-cookie";

export const createSlots = async (slots) => {
  try {
    const { data } = await axios.post(
      `${baseUrl}/api/slots/create`,
      { slots },
      {
        headers: { Authorization: cookie.get("token") },
      }
    );
    return data;
  } catch (err) {
    console.error(err);
  }
};

export const getSlots = async () => {
  try {
    const { data } = await axios.get(`${baseUrl}/api/slots`, {
      headers: { Authorization: cookie.get("token") },
    });
    return slots;
  } catch (err) {
    console.error(err);
  }
};

export const deleteSlots = async (arr) => {
  try {
    const { data } = await axios.post(
      `${baseUrl}/api/slots/remove`,
      {
        idToBeDeleted: arr,
      },
      { headers: { Authorization: cookie.get("token") } }
    );
    return res.json({ slots: data.slots });
  } catch (err) {
    console.error(err);
  }
};
