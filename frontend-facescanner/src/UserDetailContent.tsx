// src/components/UserDetailContent.tsx

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import UserCard from "./components/layout/UserCard";

import { User } from "./types/user";// adjust path as needed

const UserDetailContent = () => {
  const { id } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [activityLogs, setActivityLogs] = useState([]);

   // Static example user data
  //  const exampleUser: User = {
  //   id: id || "12345",
  //   name: "John Doe",
  //   email: "john.doe@example.com",
  //   phoneNumber: "+1 234 567 890",
  //   digitalID: "DIGI123456",
  //   event: "Tech Conference 2025",
  //   time: new Date("2025-07-21T14:30:00Z"),
  // };

  const exampleActivityLogs = [
    {
      title: "Logged in",
      timestamp: "2025-07-25T09:15:00Z"
    },
    {
      title: "Updated profile information",
      timestamp: "2025-07-24T16:42:00Z"
    },
    {
      title: "Reset password",
      timestamp: "2025-07-23T11:05:00Z"
    },
    {
      title: "Viewed dashboard",
      timestamp: "2025-07-22T08:30:00Z"
    },
    {
      title: "Logged out",
      timestamp: "2025-07-22T08:50:00Z"
    }
  ];

  useEffect(() => {
    if (!id) return;

    axios
      .get(`https://feasible-dove-simply.ngrok-free.app/users/${id}`, {
        headers: { "ngrok-skip-browser-warning": true },
      })
      .then((res) => {
        if (res?.data?.data) {
          console.log("Before normalize", res.data.data);
          const userRaw = res.data.data; 
          const activityLogsData = userRaw?.log?.map((item) => {
            return {
              timestamp: item.fields?.timestamp.split("T")[0],
              title: item.fields?.title
            }
          })
          
          setActivityLogs(activityLogsData)

          // console.log('activity logs', activityLogs)

          const fields = userRaw.fields || {};

          const normalizedUser: User = {
            id: id,
            name: fields.Name || "N/A",
            email: fields.Email || "N/A",
            phoneNumber: fields.Phone || "N/A",
            digitalID: fields.DigitalID || "N/A",
            event: fields.Event || "N/A",
            time: fields.Timestamp ? new Date(fields.Timestamp) : new Date(),
            activityLog: userRaw?.log || [],
          };

          setUser(normalizedUser);
        }
      });
  }, [id]);

  if (!user) return <div className="p-4">Loading user details...</div>;

  return (
    <div className="p-4">
      {/* <UserCard user={user} activityLogs={["Logged in", "Viewed dashboard", "Updated profile"]} /> */}
      <UserCard user={user} activityLogs={activityLogs} />
    </div>
  );
};

export default UserDetailContent;
