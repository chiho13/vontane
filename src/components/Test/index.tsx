import React, { useEffect } from "react";

export const Hello = () => {
  useEffect(() => {
    fetch(
      "http://localhost:3000/api/widget?id=019a2371-2871-40ec-941b-a21fec1f034e"
    )
      .then((response) => response.json()) // Parsing the JSON data to JavaScript object
      .then((data) => {
        console.log(data); // Access your data here
      })
      .catch((error) => {
        console.error("There was an error!", error);
      });
  }, []);
  return <div className="mt-5 p-4 text-2xl">Hello World</div>;
};
