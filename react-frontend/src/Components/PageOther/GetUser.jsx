import { useEffect, useState } from "react";
import axios from "../../config/axios";
export default function GetUser() {
  const [getUsers, setUsers] = useState([]);
  useEffect(() => {
    axios
      .get("/get-user")
      .then((res) => {
        setUsers(res.data);
      })
      .catch((e) => {
        console.log("error", e);
      });
  }, []);
  return (
    <>
      <div>{getUsers?.fullname}</div>
      <div>{getUsers?.email}</div>
    </>
  );
}
