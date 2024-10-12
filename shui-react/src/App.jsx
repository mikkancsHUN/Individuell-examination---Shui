import { useState, useEffect } from 'react';
import axios from 'axios';

const getMessages = (setMessages) => {
  axios.get('https://revwbyhs8c.execute-api.eu-north-1.amazonaws.com/api/messages')
    .then(response => {
      const sortedMessages = response.data.data.message.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setMessages(sortedMessages);
    });
}

function App() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [username, setUsername] = useState('');
  const [filterUsername, setFilterUsername] = useState('');
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [sortBy, setSortBy] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [isFormActive, setIsFormActive] = useState(false); // Form active state

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
          setIsFormActive(false); // Remove active class after sending message
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
          setIsFormActive(false); // Remove active class after updating message
        }
      })
      .catch(error => console.error('Error updating message:', error));
  }

  const handleEditClick = (message) => {
    setNewMessage(message.text);
    setUsername(message.username);
    setEditingMessageId(message.id);
    setIsFormActive(true); // Add active class when editing
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
      <a href="index.html" className="shui-logo">S</a>
      <form className={isFormActive ? 'active' : ''} onSubmit={e => {
        e.preventDefault();
        if (editingMessageId) {
          updateMessage(editingMessageId);
        } else {
          postMessage(e);
        }
      }}>
        <textarea 
          className='message-input'
          onChange={(e) => setNewMessage(e.target.value)} 
          placeholder='Message' 
          type="text" 
          value={newMessage}>
        </textarea>
        <input
          className='username-input'
          onChange={(e) => setUsername(e.target.value)} 
          placeholder='Username' 
          type="text" 
          value={username}
        />
        <button className='send-btn' type="submit">{editingMessageId ? 'Update Message' : 'Send Message'}</button>
      </form>

    <div className='filter-form'>
      <input 
        onChange={(e) => setFilterUsername(e.target.value)}
        placeholder='Filter by username'
        type="text"
        value={filterUsername}
      />

      <div className="sort-buttons">
        <button onClick={() => handleSort('date')}>Sort by Date ({sortDirection === 'asc' ? 'Asc' : 'Desc'})</button>
      </div>
    </div>
      <section>
        {
        filteredMessages().length > 0 ? (
          filteredMessages().map((message) => (
            <div className='message-bubble' key={message.id}>
              <p className='date'>Sent: {new Date(message.createdAt).toLocaleString()}</p>
              <p className='message'>{message.text}</p>
              <p className='username'>- {message.username}</p>
              <button className='btn edit-btn' onClick={() => handleEditClick(message)}>Edit</button>
              <button className='btn delete-btn' onClick={() => deleteMessage(message.id)}>Delete</button>
            </div>
          ))
        ) : (
          <p className='warning'>You have no messages.</p>
        )
        }
      </section>

      <button className="new-message-btn" onClick={() => setIsFormActive(true)}>
        <svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#e8eaed">
          <path d="m483.33-523.67 40.34 40.34L762-721.67 721.67-762 483.33-523.67Zm-296.66 337H227l249.67-249.66-40.34-40.34L186.67-227v40.33Zm359.66-227L413.67-546.33 601.33-734l-29.66-29.67-229 229L295.33-582 520-807q24.67-24.67 51.83-25 27.17-.33 52.5 25l25 25L696-828.67Q707.33-840 722.17-840q14.83 0 26.16 11.33L828-749q11.33 11.33 11.33 26.83 0 15.5-11.33 26.84L546.33-413.67ZM252.67-120H120v-132.67l293.67-293.66 132.66 132.66L252.67-120Z"/>
        </svg>
      </button>
    </div>
  );
}

export default App;
