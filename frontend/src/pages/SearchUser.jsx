import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import useAuthStore from "../store/authStore";

const SearchUsers = () => {
  const { searchuser, users, error } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();

  // Controlled input states
  const [id, setId] = useState(searchParams.get("id") || "");
  const [name, setName] = useState(searchParams.get("name") || "");
  const navigate = useNavigate()
  // Whenever id or name changes, update URL + call backend
  useEffect(() => {
    const params = {};
    if (id) params.id = id;
    if (name) params.name = name;

    setSearchParams(params);

    // Only call backend if something is typed
    if (id || name) {
      searchuser(id, name);
    }
  }, [id, name]);

  return (
    <div>
      <h2 className="text-xl font-bold">Search Users</h2>
      <input
        type="text"
        placeholder="Enter ID"
        value={id}
        onChange={(e) => setId(e.target.value)}
      />
      <input
        type="text"
        placeholder="Enter Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div>
        <h3>Results:</h3>
        {(!id && !name) ? (
          <p>Please enter ID or Name to search.</p>
        ) : users && users.length > 0 ? (
          users.map((u) => (
            <div key={u.id}>
              {u.name} ({u.email}, {u.role})
              <button onClick={() => navigate(`/user-profile/${u._id}`)}>Go to their profile</button>
              {u.role === "student" ? (<button
                className="p-3 m-2 bg-red-500"
                onClick={() => navigate(`/update-student/${u._id}`)}>
                Update their profile
              </button>) : (<button
                className="p-3 m-2 bg-green-500"
                onClick={() => navigate(`/update-insturctor/${u._id}`)}>
                Update their profile
              </button>)}
            </div>

          ))
        ) : (
          <p>No users found.</p>
        )}
      </div>
    </div>
  );
};

export default SearchUsers;






