<!-- src/components/RequestForm.vue -->
<template>
  <div class="request-form">
    <div class="container">
      <h1>🎵 Song Request</h1>
      <p>Request a song for the DJ!</p>

      <form @submit.prevent="submitRequest" class="form">
        <div class="form-group">
          <label for="songInfo">Song & Artist:</label>
          <input
            id="songInfo"
            v-model="songInfo"
            type="text"
            placeholder="e.g. Mr. Brightside - The Killers"
            required
            :disabled="isSubmitting"
          />
        </div>

        <div class="form-group">
          <label for="requesterName">Your Name (optional):</label>
          <input
            id="requesterName"
            v-model="requesterName"
            type="text"
            placeholder="e.g. Sarah"
            :disabled="isSubmitting"
          />
        </div>

        <button type="submit" :disabled="isSubmitting" class="submit-btn">
          {{ isSubmitting ? 'Sending...' : 'Request Song' }}
        </button>
      </form>

      <div v-if="submitted" class="success-message">
        ✅ Song request sent to DJ!
      </div>
    </div>
  </div>
</template>

<script>
import { ref as dbRef, push } from 'firebase/database'
import { database } from '../firebase.js'

export default {
  name: 'RequestForm',
  data() {
    return {
      songInfo: '',
      requesterName: '',
      isSubmitting: false,
      submitted: false
    }
  },
  methods: {
    async submitRequest() {
      if (!this.songInfo.trim()) return

      this.isSubmitting = true

      try {
        const requestData = {
          songInfo: this.songInfo.trim(),
          requesterName: this.requesterName.trim() || 'Anonymous',
          timestamp: Date.now(),
          played: false
        }

        await push(dbRef(database, 'requests'), requestData)

        // Reset form
        this.songInfo = ''
        this.requesterName = ''
        this.submitted = true

        // Hide success message after 3 seconds
        setTimeout(() => {
          this.submitted = false
        }, 3000)

      } catch (error) {
        console.error('Error submitting request:', error)
        alert('Error sending request. Please try again.')
      } finally {
        this.isSubmitting = false
      }
    }
  }
}
</script>

<style scoped>
.request-form {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.container {
  background: white;
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
  max-width: 500px;
  width: 100%;
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 10px;
  font-size: 2.5em;
}

p {
  text-align: center;
  color: #666;
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
}

input {
  width: 100%;
  padding: 15px;
  border: 2px solid #e1e1e1;
  border-radius: 10px;
  font-size: 16px;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

input:focus {
  outline: none;
  border-color: #667eea;
}

input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.submit-btn {
  width: 100%;
  padding: 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.success-message {
  margin-top: 20px;
  padding: 15px;
  background: #d4edda;
  color: #155724;
  border-radius: 10px;
  text-align: center;
  font-weight: 600;
}

@media (max-width: 600px) {
  .container {
    margin: 20px;
    padding: 30px 20px;
  }

  h1 {
    font-size: 2em;
  }
}
</style>