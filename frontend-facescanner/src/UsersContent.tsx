
import { UsersTable } from "./components/layout/UsersTable";
import { User } from "./types/user"; // Assuming you have this type
import React, { useState, useEffect } from "react";
import axios from "axios";

function UsersContent() {
  const [offset, setOffset] = useState(5);
  const [usersData, setUsersData] = useState<User[]>([]);
  const productsPerPage = 5;

  useEffect(() => {
    axios
      .get("https://feasible-dove-simply.ngrok-free.app/users", {
        headers: { "ngrok-skip-browser-warning": true },
      })
      .then((res) => {
        if (res?.data?.data) {
        console.log('before normalize', res?.data?.data);
        const normalizedData = res.data.data.map((user: any) => {
            const fields = user.fields || {};
            return {
              id: user.id,
              name: fields.Name || "N/A",
              email: fields.Email || "N/A",
              phoneNumber: fields.Phone || "N/A",
              digitalID: fields.DigitalID || "N/A",
              event: fields.Event || "N/A",
              time: fields.Timestamp ? new Date(fields.Timestamp) : new Date(),
            };
          });
  
          console.log("Normalized Users", normalizedData);
          setUsersData(normalizedData);
        }
      });
  }, []);

  const handlePrev = () => {
    setOffset((prev) => Math.max(productsPerPage, prev - productsPerPage));
  };

  const handleNext = () => {
    setOffset((prev) => Math.min(prev + productsPerPage, usersData.length));
  };

  return (
    <>
        <h1 className="text-3xl font-bold text-blue-400 mb-2">Users</h1>
        <UsersTable
        users={usersData}
        offset={offset}
        totalUsers={usersData.length}
        productsPerPage={productsPerPage}
        onPrev={handlePrev}
        onNext={handleNext}
        />
    </>
  
  );
}

export default UsersContent;
