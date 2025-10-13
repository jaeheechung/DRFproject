import React, { useState, useEffect } from 'react';

function InfoList() {
  const [infos, setInfos] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8000/api/information/')
      .then(response => response.json())
      .then(infos => setInfos(infos))
      .catch(error => console.error('Error fetching data:', error));
  }, []); // The empty array ensures this effect runs only once when the component mounts

  return (
    <div>
      <h1>Information</h1>
      <table>
        <thead>
          <tr>
            <th>Temperature</th>
            <th>Humidity</th>
          </tr>
        </thead>
        <tbody>
          {infos.map(info => (
            <tr key={info.id}>
              <td>{info.temperature}</td>
              <td>{info.humidity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default InfoList;
