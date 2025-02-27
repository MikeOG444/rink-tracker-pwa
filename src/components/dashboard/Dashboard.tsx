import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { addActivity, getUserActivities } from "../../services/firestore";

const Dashboard = () => {
  const { user } = useAuth();
  const [activityType, setActivityType] = useState("");
  const [activityDetails, setActivityDetails] = useState("");
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchActivities();
    }
  }, [user]);

  const fetchActivities = async () => {
    if (user) {
      const logs = await getUserActivities(user.uid);
      setActivities(logs);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleLogActivity = async () => {
    if (!activityType || !activityDetails) return;
    await addActivity(user!.uid, activityType, activityDetails);
    setActivityType("");
    setActivityDetails("");
    fetchActivities(); // Refresh activity list
  };

  return (
    <div>
      <h2>Welcome to Your Dashboard</h2>
      {user ? (
        <div>
          <p><strong>Name:</strong> {user.displayName || "No Name"}</p>
          <p><strong>Email:</strong> {user.email}</p>
          {user.photoURL && <img src={user.photoURL} alt="User Avatar" width="100" />}
          
          <h3>Log a New Activity</h3>
          <select value={activityType} onChange={(e) => setActivityType(e.target.value)}>
            <option value="">Select Activity Type</option>
            <option value="Game">Game</option>
            <option value="Practice">Practice</option>
            <option value="Skills Session">Skills Session</option>
            <option value="Open Skate">Open Skate</option>
          </select>
          <input
            type="text"
            placeholder="Details"
            value={activityDetails}
            onChange={(e) => setActivityDetails(e.target.value)}
          />
          <button onClick={handleLogActivity}>Log Activity</button>

          <h3>Your Activities</h3>
          <ul>
            {activities.map((activity) => (
              <li key={activity.id}>
                <strong>{activity.type}</strong>: {activity.details} - {new Date(activity.timestamp).toLocaleString()}
              </li>
            ))}
          </ul>

          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default Dashboard;
