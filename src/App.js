import React, { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import "./App.css";

// FAKE DATABASE
const medicinesDB = {
  med001: {
    name: "Paracetamol",
    purpose: "Pain reliever",
    dosage: "Every 6 hours",
  },
  med002: {
    name: "Amoxicillin",
    purpose: "Antibiotic",
    dosage: "Every 8 hours",
  },
};

export default function App() {
  const [medicine, setMedicine] = useState(null);
  const [time, setTime] = useState("");
  const [schedule, setSchedule] = useState([]);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", {
      fps: 10,
      qrbox: 250,
    });

    scanner.render((decodedText) => {
      console.log("Scanned:", decodedText);

      // ✅ 1. Check fake database (med001)
      if (medicinesDB[decodedText]) {
        setMedicine({ id: decodedText, ...medicinesDB[decodedText] });
        return;
      }

      // ✅ 2. Try JSON format
      try {
        const data = JSON.parse(decodedText);
        if (data.name && data.purpose && data.dosage) {
          setMedicine(data);
          return;
        }
      } catch (err) {
        // ignore error
      }

      // ✅ 3. Try plain text format
      if (decodedText.includes("Name:")) {
        const lines = decodedText.split("\n");
        const data = {};

        lines.forEach((line) => {
          const [key, value] = line.split(":");
          if (key && value) {
            data[key.trim().toLowerCase()] = value.trim();
          }
        });

        if (data.name) {
          setMedicine({
            name: data.name,
            purpose: data.purpose,
            dosage: data.dosage,
          });
          return;
        }
      }

      // ❌ Not recognized
      alert("Medicine not found or invalid QR format");
    });

    return () => scanner.clear().catch(() => {});
  }, []);

  const addSchedule = () => {
    if (!medicine) {
      alert("❌ Error: Please scan a medicine first!");
      return;
    }
    if (!time) {
      alert("❌ Error: Please select a time for the schedule!");
      return;
    }

    const newEntry = {
      id: Date.now(),
      med: medicine.name,
      time,
      taken: false,
    };

    setSchedule([...schedule, newEntry]);
    setTime("");
    alert("✅ Success: Medicine added to schedule!");
  };

  const markTaken = (id) => {
    setSchedule(
      schedule.map((item) =>
        item.id === id ? { ...item, taken: true } : item
      )
    );
    alert("✅ Medicine marked as taken!");
  };

  const deleteEntry = (id) => {
    setSchedule(schedule.filter((item) => item.id !== id));
    alert("🗑️ Medicine entry deleted!");
  };

  return (
    <div className="App">
      <div className="container">
        <h1>💊 Medicine Tracking Dashboard</h1>

        <div className="main-content">
          {/* QR SCANNER */}
          <div className="scanner-section">
            <h3>Scan Medicine</h3>
            <div id="reader"></div>
          </div>

          {/* MEDICINE INFO */}
          {medicine && (
            <div className="medicine-info">
              <h2>{medicine.name}</h2>
              <p><b>Purpose:</b> {medicine.purpose}</p>
              <p><b>Dosage:</b> {medicine.dosage}</p>

              <h4>Add Schedule</h4>
              <input
                type="datetime-local"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
              <br /><br />
              <button onClick={addSchedule}>Add to Dashboard</button>
            </div>
          )}
        </div>

        {/* DASHBOARD TABLE */}
        <div className="schedule-section">
          <h2>📋 Medicine Schedule</h2>
          <table className="schedule-table">
            <thead>
              <tr>
                <th>Medicine</th>
                <th>Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((item) => (
                <tr key={item.id}>
                  <td>{item.med}</td>
                  <td>{new Date(item.time).toLocaleString()}</td>
                  <td>
                    {item.taken ? (
                      <span className="status-taken">Taken</span>
                    ) : (
                      <span className="status-pending">Pending</span>
                    )}
                  </td>
                  <td>
                    {!item.taken && (
                      <button className="action-button mark-taken" onClick={() => markTaken(item.id)}>
                        Mark as Taken
                      </button>
                    )}
                    <button className="action-button delete" onClick={() => deleteEntry(item.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}