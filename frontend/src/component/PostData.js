import React, { useState } from 'react';

function AddItemForm({ onAddItem }) {
  const [name, setName] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault(); // Prevents the default form submission
    
    const newItem = { name };

    fetch('http://localhost:8000/api/information/create/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newItem),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Success:', data);
        onAddItem(data); // Call a function to update the parent component's state
        setName(''); // Clear the input field
      })
      .catch(error => console.error('Error adding item:', error));
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="text" 
        value={name} 
        onChange={(e) => setName(e.target.value)} 
        placeholder="Item Name" 
      />
      <button type="submit">Add Item</button>
    </form>
  );
}

export default AddItemForm;
