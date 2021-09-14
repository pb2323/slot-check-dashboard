import React from "react";
import axios from "axios";
import { parseCookies } from "nookies";
import TeacherViewTable from "../components/Home/TeacherViewTable";
import StudentViewTable from "../components/Home/StudentViewTable";
import baseUrl from "../utils/baseUrl";

function Index({ user, slots, errorLoading }) {
  return user.role === "student" ? (
    <>
      <h1>Student's View</h1>
      <StudentViewTable user={user} slots={slots} errorLoading={errorLoading} />
    </>
  ) : (
      <>
        <h1>Teacher's View</h1>
      <TeacherViewTable user={user} slots={slots} errorLoading={errorLoading} />
    </>
  );
}
Index.getInitialProps = async (ctx) => {
  try {
    const { token } = parseCookies(ctx);
    const { data } = await axios.get(`${baseUrl}/api/slots`, {
      headers: { Authorization: token },
    });
    return { slots: data.slots };
  } catch (err) {
    return { errorLoading: true };
  }
};

export default Index;
