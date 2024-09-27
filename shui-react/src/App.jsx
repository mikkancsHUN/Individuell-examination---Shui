import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const getMessages = (setMessages) => {
  axios.get('https://revwbyhs8c.execute-api.eu-north-1.amazonaws.com/api/messages')
    .then(response => setMessages(response.data.data.message));
}

function App() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [username, setUsername] = useState('');
  const [editingMessageId, setEditingMessageId] = useState(null);

  useEffect(() => {
    getMessages(setMessages);
  }, []);

  // POST Message
  const postMessage = (e) => {
    e.preventDefault();
    axios.post(`https://revwbyhs8c.execute-api.eu-north-1.amazonaws.com/api/messages`, {
      username: username,
      message: newMessage
    })
      .then(response => {
        console.log('POST API response:', response);
        if (response.status >= 200 && response.status < 300) {
          getMessages(setMessages);
          setNewMessage(''); // Törölje az input mezőt
          setUsername('');   // Törölje az input mezőt
        }
      })
      .catch(error => console.error('Error posting message:', error));
  }
  
  // PUT Message
  const updateMessage = (id) => {
    const updatedMessage = {
      username: username,
      message: newMessage,
    };

    axios.put(`https://revwbyhs8c.execute-api.eu-north-1.amazonaws.com/api/messages/${id}`, updatedMessage)
      .then(response => {
        if (response.status >= 200 && response.status < 300) {
          getMessages(setMessages);
          setEditingMessageId(null);
          setNewMessage(''); // Törölje az input mezőt
          setUsername('');   // Törölje az input mezőt
        }
      })
      .catch(error => console.error('Error updating message:', error));
  }

  const handleEditClick = (message) => {
    setNewMessage(message.text);
    setUsername(message.username);
    setEditingMessageId(message.id);
  }

  // DELETE Message
  const deleteMessage = (id) => {
    axios.delete(`https://revwbyhs8c.execute-api.eu-north-1.amazonaws.com/api/messages/${id}`)
      .then(response => {
        if (response.status >= 200 && response.status < 300) {
          getMessages(setMessages);
        }
      })
      .catch(error => console.error('Error deleting message:', error));
  }

  return (
    <div className="app">
      <h1>Shui App</h1>
      <h2>Send or Edit message here:</h2>
      <form onSubmit={e => {
        e.preventDefault();
        if (editingMessageId) {
          updateMessage(editingMessageId);
        } else {
          postMessage(e);
        }
      }}>
        <input 
          onChange={(e) => setNewMessage(e.target.value)} 
          placeholder='Message' 
          type="text" 
          value={newMessage}
        />
        <input 
          onChange={(e) => setUsername(e.target.value)} 
          placeholder='Username' 
          type="text" 
          value={username}
        />
        <button type="submit">{editingMessageId ? 'Update Message' : 'Send Message'}</button>
      </form>
      <h3>Messages:</h3>
      <section>
        {
        messages.length > 0 ? (
          messages.map((message) => (
            <div className='message-bubble' key={message.id}>
              <p className='date'>Sent: {new Date(message.createdAt).toLocaleString()}</p>
              <p className='message'>{message.text}</p>
              <p className='username'>- {message.username}</p>
              <button className='edit-btn' onClick={() => handleEditClick(message)}>Edit</button>
              <button className='delete-btn' onClick={() => deleteMessage(message.id)}>Delete</button>
            </div>
          ))
        ) : (
          <p className='warning'>No message has been sent yet</p>
        )
        }
      </section>
    </div>
  );
}

export default App;
