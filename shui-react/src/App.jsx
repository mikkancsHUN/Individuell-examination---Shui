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
  const [filterUsername, setFilterUsername] = useState('');
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [sortBy, setSortBy] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

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
          setNewMessage('');
          setUsername('');
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
          setNewMessage('');
          setUsername('');
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

  // Szortírozás dátum szerint
  const sortMessages = (messages) => {
    let sortedMessages = [...messages];
    
    if (sortBy === 'date') {
      sortedMessages.sort((a, b) => {
        if (sortDirection === 'asc') {
          return new Date(a.createdAt) - new Date(b.createdAt);
        } else {
          return new Date(b.createdAt) - new Date(a.createdAt);
        }
      });
    }
    
    return sortedMessages;
  }

  const filteredMessages = () => {
    let filtered = sortMessages(messages);
    if (filterUsername) {
      filtered = filtered.filter(message => message.username.toLowerCase().includes(filterUsername.toLowerCase()));
    }
    return filtered;
  }

  const handleSort = (type) => {
    if (sortBy === type) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(type);
      setSortDirection('asc');
    }
  }

  return (
    <div className="app">
      <h1>Shui App</h1>
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

      <h2>Messages:</h2>

      <input 
        onChange={(e) => setFilterUsername(e.target.value)}
        placeholder='Filter by username'
        type="text"
        value={filterUsername}
      />

      <div className="sort-buttons">
        <button onClick={() => handleSort('date')}>Sort by Date ({sortDirection === 'asc' ? 'Asc' : 'Desc'})</button>
      </div>

      <section>
        {
        filteredMessages().length > 0 ? (
          filteredMessages().map((message) => (
            <div className='message-bubble' key={message.id}>
              <p className='date'>Sent: {new Date(message.createdAt).toLocaleString()}</p>
              <p className='message'>{message.text}</p>
              <p className='username'>- {message.username}</p>
              <button className='edit-btn' onClick={() => handleEditClick(message)}>Edit</button>
              <button className='delete-btn' onClick={() => deleteMessage(message.id)}>Delete</button>
            </div>
          ))
        ) : (
          <p className='warning'>No messages found</p>
        )
        }
      </section>
    </div>
  );
}

export default App;
