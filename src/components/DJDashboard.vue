<!-- src/components/DJDashboard.vue -->
<template>
  <div class="dj-dashboard">
    <div class="header">
      <h1>🎧 DJ Dashboard</h1>
      <div class="stats">
        <span class="stat">{{ pendingRequests.length }} pending</span>
        <span class="stat">{{ playedRequests.length }} played</span>
      </div>
    </div>

    <div class="requests-container">
      <!-- Pending Requests -->
      <div class="section">
        <h2>🔔 New Requests</h2>
        <div v-if="pendingRequests.length === 0" class="empty-state">
          No new requests. Waiting for song requests...
        </div>
        <div
          v-for="request in pendingRequests"
          :key="request.id"
          class="request-card new"
        >
          <div class="request-info">
            <div class="song">{{ request.songInfo }}</div>
            <div class="meta">
              <span class="requester">{{ request.requesterName }}</span>
              <span class="time">{{ formatTime(request.timestamp) }}</span>
            </div>
          </div>
          <div class="actions">
            <button @click="markAsPlayed(request.id)" class="play-btn">
              ✓ Played
            </button>
            <button @click="removeRequest(request.id)" class="remove-btn">
              ✗ Skip
            </button>
          </div>
        </div>
      </div>

      <!-- Played Requests -->
      <div class="section">
        <h2>✅ Recently Played</h2>
        <div v-if="playedRequests.length === 0" class="empty-state">
          No songs played yet.
        </div>
        <div
          v-for="request in playedRequests.slice(0, 10)"
          :key="request.id"
          class="request-card played"
        >
          <div class="request-info">
            <div class="song">{{ request.songInfo }}</div>
            <div class="meta">
              <span class="requester">{{ request.requesterName }}</span>
              <span class="time">{{ formatTime(request.timestamp) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref as dbRef, onValue, update, remove } from 'firebase/database'
import { database } from '../firebase.js'

export default {
  name: 'DJDashboard',
  data() {
    return {
      requests: {}
    }
  },
  computed: {
    pendingRequests() {
      return Object.entries(this.requests)
        .filter(([_, request]) => !request.played)
        .map(([id, request]) => ({ id, ...request }))
        .sort((a, b) => a.timestamp - b.timestamp)
    },
    playedRequests() {
      return Object.entries(this.requests)
        .filter(([_, request]) => request.played)
        .map(([id, request]) => ({ id, ...request }))
        .sort((a, b) => b.timestamp - a.timestamp)
    }
  },
  mounted() {
    // Listen for real-time updates
    const requestsRef = dbRef(database, 'requests')
    onValue(requestsRef, (snapshot) => {
      const data = snapshot.val()
      this.requests = data || {}

      // Play notification sound for new requests
      this.playNotificationSound()
    })
  },
  methods: {
    async markAsPlayed(requestId) {
      try {
        const requestRef = dbRef(database, `requests/${requestId}`)
        await update(requestRef, { played: true, playedAt: Date.now() })
      } catch (error) {
        console.error('Error marking as played:', error)
      }
    },
    async removeRequest(requestId) {
      if (confirm('Remove this request?')) {
        try {
          const requestRef = dbRef(database, `requests/${requestId}`)
          await remove(requestRef)
        } catch (error) {
          console.error('Error removing request:', error)
        }
      }
    },
    formatTime(timestamp) {
      const date = new Date(timestamp)
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    },
    playNotificationSound() {
      // Simple notification sound using Web Audio API
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        oscillator.frequency.value = 800
        oscillator.type = 'sine'
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)

        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.2)
      } catch (error) {
        // Ignore audio errors
      }
    }
  }
}
</script>

<style scoped>
.dj-dashboard {
  min-height: 100vh;
  background: #1a1a1a;
  color: white;
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #333;
}

.header h1 {
  margin: 0;
  font-size: 2.5em;
}

.stats {
  display: flex;
  gap: 20px;
}

.stat {
  background: #333;
  padding: 10px 15px;
  border-radius: 20px;
  font-weight: 600;
}

.requests-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

.section h2 {
  margin-bottom: 20px;
  font-size: 1.5em;
  color: #fff;
}

.empty-state {
  padding: 40px;
  text-align: center;
  color: #666;
  font-style: italic;
}

.request-card {
  background: #2a2a2a;
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: transform 0.2s;
}

.request-card:hover {
  transform: translateY(-2px);
}

.request-card.new {
  border-left: 4px solid #4CAF50;
  animation: pulse 2s infinite;
}

.request-card.played {
  opacity: 0.7;
  border-left: 4px solid #666;
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7); }
  70% { box-shadow: 0 0 0 10px rgba(76, 175, 80, 0); }
  100% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0); }
}

.request-info {
  flex: 1;
}

.song {
  font-size: 1.2em;
  font-weight: 600;
  margin-bottom: 8px;
}

.meta {
  display: flex;
  gap: 15px;
  color: #aaa;
  font-size: 0.9em;
}

.requester::before {
  content: "👤 ";
}

.time::before {
  content: "🕐 ";
}

.actions {
  display: flex;
  gap: 10px;
}

.play-btn, .remove-btn {
  padding: 8px 15px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s;
}

.play-btn {
  background: #4CAF50;
  color: white;
}

.play-btn:hover {
  background: #45a049;
}

.remove-btn {
  background: #f44336;
  color: white;
}

.remove-btn:hover {
  background: #da190b;
}

@media (max-width: 768px) {
  .requests-container {
    grid-template-columns: 1fr;
  }

  .header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }

  .request-card {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }

  .actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>