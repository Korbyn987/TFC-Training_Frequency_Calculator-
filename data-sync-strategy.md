# TFC Data Synchronization Strategy

## Hybrid Architecture: Local-First with Cloud Sync

### Core Principles
1. **Offline-First**: App works fully offline with local SQLite
2. **Background Sync**: Automatic sync when network available
3. **Conflict Resolution**: Handle simultaneous edits gracefully
4. **Incremental Sync**: Only sync changed data to minimize bandwidth

## Local SQLite Schema Extensions

```sql
-- Add sync tracking columns to existing tables
ALTER TABLE users ADD COLUMN sync_status VARCHAR(20) DEFAULT 'pending';
ALTER TABLE users ADD COLUMN last_synced_at TIMESTAMP;
ALTER TABLE users ADD COLUMN cloud_id UUID;

ALTER TABLE workouts ADD COLUMN sync_status VARCHAR(20) DEFAULT 'pending';
ALTER TABLE workouts ADD COLUMN last_synced_at TIMESTAMP;
ALTER TABLE workouts ADD COLUMN cloud_id UUID;
ALTER TABLE workouts ADD COLUMN version INTEGER DEFAULT 1;

-- Sync queue for offline changes
CREATE TABLE sync_queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_name VARCHAR(50) NOT NULL,
    record_id TEXT NOT NULL,
    operation VARCHAR(20) NOT NULL, -- insert, update, delete
    data TEXT, -- JSON payload
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    retry_count INTEGER DEFAULT 0,
    last_error TEXT
);

-- Conflict resolution table
CREATE TABLE sync_conflicts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_name VARCHAR(50) NOT NULL,
    local_record_id TEXT NOT NULL,
    cloud_record_id UUID NOT NULL,
    local_data TEXT, -- JSON
    cloud_data TEXT, -- JSON
    conflict_type VARCHAR(50), -- version_mismatch, simultaneous_edit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved BOOLEAN DEFAULT false
);
```

## Sync Service Implementation

```javascript
class TFCSyncService {
  constructor(apiClient, localDb) {
    this.api = apiClient;
    this.db = localDb;
    this.syncInProgress = false;
    this.lastSyncTime = null;
  }

  // Main sync orchestrator
  async performSync() {
    if (this.syncInProgress) return;
    
    try {
      this.syncInProgress = true;
      console.log('Starting sync process...');
      
      // 1. Upload local changes
      await this.uploadLocalChanges();
      
      // 2. Download remote changes
      await this.downloadRemoteChanges();
      
      // 3. Resolve any conflicts
      await this.resolveConflicts();
      
      // 4. Update last sync timestamp
      this.lastSyncTime = new Date().toISOString();
      await this.updateLastSyncTime();
      
      console.log('Sync completed successfully');
    } catch (error) {
      console.error('Sync failed:', error);
      throw error;
    } finally {
      this.syncInProgress = false;
    }
  }

  // Upload pending local changes to cloud
  async uploadLocalChanges() {
    const pendingChanges = await this.db.executeSql(`
      SELECT * FROM sync_queue 
      WHERE retry_count < 3 
      ORDER BY created_at ASC
    `);

    for (const change of pendingChanges.rows._array) {
      try {
        await this.uploadSingleChange(change);
        
        // Remove from queue on success
        await this.db.executeSql(
          'DELETE FROM sync_queue WHERE id = ?',
          [change.id]
        );
      } catch (error) {
        // Increment retry count
        await this.db.executeSql(`
          UPDATE sync_queue 
          SET retry_count = retry_count + 1, last_error = ?
          WHERE id = ?
        `, [error.message, change.id]);
      }
    }
  }

  async uploadSingleChange(change) {
    const { table_name, operation, data } = change;
    const payload = JSON.parse(data);

    switch (operation) {
      case 'insert':
        if (table_name === 'workouts') {
          const response = await this.api.post('/workouts', payload);
          // Update local record with cloud ID
          await this.db.executeSql(`
            UPDATE workouts 
            SET cloud_id = ?, sync_status = 'synced', last_synced_at = ?
            WHERE id = ?
          `, [response.data.id, new Date().toISOString(), change.record_id]);
        }
        break;
        
      case 'update':
        if (table_name === 'workouts') {
          await this.api.put(`/workouts/${payload.cloud_id}`, payload);
          await this.db.executeSql(`
            UPDATE workouts 
            SET sync_status = 'synced', last_synced_at = ?
            WHERE id = ?
          `, [new Date().toISOString(), change.record_id]);
        }
        break;
        
      case 'delete':
        if (payload.cloud_id) {
          await this.api.delete(`/workouts/${payload.cloud_id}`);
        }
        break;
    }
  }

  // Download changes from cloud since last sync
  async downloadRemoteChanges() {
    const lastSync = this.lastSyncTime || '1970-01-01T00:00:00Z';
    
    // Get updated workouts
    const workoutsResponse = await this.api.get(`/workouts/sync?since=${lastSync}`);
    
    for (const workout of workoutsResponse.data) {
      await this.mergeRemoteWorkout(workout);
    }

    // Get updated user stats
    const statsResponse = await this.api.get(`/users/stats/sync?since=${lastSync}`);
    await this.mergeRemoteUserStats(statsResponse.data);
  }

  async mergeRemoteWorkout(remoteWorkout) {
    // Check if workout exists locally
    const localResult = await this.db.executeSql(
      'SELECT * FROM workouts WHERE cloud_id = ?',
      [remoteWorkout.id]
    );

    if (localResult.rows.length === 0) {
      // New workout from cloud - insert locally
      await this.insertRemoteWorkout(remoteWorkout);
    } else {
      // Existing workout - check for conflicts
      const localWorkout = localResult.rows.item(0);
      
      if (localWorkout.sync_status === 'pending') {
        // Conflict: both local and remote changes
        await this.recordConflict('workouts', localWorkout, remoteWorkout);
      } else {
        // No local changes - safe to update
        await this.updateLocalWorkout(remoteWorkout);
      }
    }
  }

  async recordConflict(tableName, localRecord, remoteRecord) {
    await this.db.executeSql(`
      INSERT INTO sync_conflicts 
      (table_name, local_record_id, cloud_record_id, local_data, cloud_data, conflict_type)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      tableName,
      localRecord.id,
      remoteRecord.id,
      JSON.stringify(localRecord),
      JSON.stringify(remoteRecord),
      'simultaneous_edit'
    ]);
  }

  // Conflict resolution strategies
  async resolveConflicts() {
    const conflicts = await this.db.executeSql(`
      SELECT * FROM sync_conflicts WHERE resolved = false
    `);

    for (const conflict of conflicts.rows._array) {
      await this.resolveConflict(conflict);
    }
  }

  async resolveConflict(conflict) {
    const localData = JSON.parse(conflict.local_data);
    const cloudData = JSON.parse(conflict.cloud_data);

    // Strategy 1: Last-write-wins based on updated_at
    if (new Date(localData.updated_at) > new Date(cloudData.updated_at)) {
      // Local version is newer - upload to cloud
      await this.api.put(`/workouts/${cloudData.id}`, localData);
      await this.markConflictResolved(conflict.id);
    } else {
      // Cloud version is newer - update local
      await this.updateLocalWorkout(cloudData);
      await this.markConflictResolved(conflict.id);
    }

    // Strategy 2: Merge non-conflicting fields (for complex objects)
    // Strategy 3: User intervention (show conflict resolution UI)
  }

  // Background sync scheduler
  startBackgroundSync() {
    // Sync every 5 minutes when app is active
    this.syncInterval = setInterval(async () => {
      if (await this.isOnline()) {
        try {
          await this.performSync();
        } catch (error) {
          console.log('Background sync failed:', error.message);
        }
      }
    }, 5 * 60 * 1000);

    // Sync when app comes back online
    NetInfo.addEventListener(state => {
      if (state.isConnected && !this.syncInProgress) {
        setTimeout(() => this.performSync(), 1000);
      }
    });
  }

  // Queue local changes for sync
  async queueChange(tableName, recordId, operation, data) {
    await this.db.executeSql(`
      INSERT INTO sync_queue (table_name, record_id, operation, data)
      VALUES (?, ?, ?, ?)
    `, [tableName, recordId, operation, JSON.stringify(data)]);

    // Mark record as pending sync
    await this.db.executeSql(`
      UPDATE ${tableName} 
      SET sync_status = 'pending', version = version + 1
      WHERE id = ?
    `, [recordId]);

    // Trigger immediate sync if online
    if (await this.isOnline()) {
      setTimeout(() => this.performSync(), 100);
    }
  }

  async isOnline() {
    try {
      const response = await fetch(`${this.api.baseURL}/health`, {
        method: 'HEAD',
        timeout: 5000
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}
```

## Integration with Existing Redux Store

```javascript
// Enhanced workout slice with sync support
const workoutSlice = createSlice({
  name: 'workout',
  initialState: {
    ...initialState,
    syncStatus: 'idle', // idle, syncing, error
    lastSyncTime: null,
    conflictsCount: 0
  },
  reducers: {
    // Existing reducers...
    
    setSyncStatus: (state, action) => {
      state.syncStatus = action.payload;
    },
    
    setLastSyncTime: (state, action) => {
      state.lastSyncTime = action.payload;
    },
    
    setConflictsCount: (state, action) => {
      state.conflictsCount = action.payload;
    },
    
    // Enhanced addWorkout with sync queueing
    addWorkout: (state, action) => {
      // Existing workout logic...
      
      // Queue for sync
      const syncService = getSyncService();
      syncService.queueChange('workouts', newWorkout.id, 'insert', newWorkout);
    }
  }
});
```

## Sync Status UI Components

```javascript
// Sync status indicator
function SyncStatusIndicator() {
  const syncStatus = useSelector(state => state.workout.syncStatus);
  const lastSyncTime = useSelector(state => state.workout.lastSyncTime);
  const conflictsCount = useSelector(state => state.workout.conflictsCount);

  const getStatusIcon = () => {
    switch (syncStatus) {
      case 'syncing': return '🔄';
      case 'error': return '⚠️';
      case 'idle': return '✅';
      default: return '📱';
    }
  };

  return (
    <View style={styles.syncStatus}>
      <Text>{getStatusIcon()}</Text>
      {lastSyncTime && (
        <Text style={styles.lastSync}>
          Last sync: {formatRelativeTime(lastSyncTime)}
        </Text>
      )}
      {conflictsCount > 0 && (
        <TouchableOpacity onPress={() => navigation.navigate('ConflictResolution')}>
          <Text style={styles.conflicts}>
            {conflictsCount} conflicts need resolution
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
```

## Migration Strategy

### Phase 1: Add Sync Infrastructure
1. Update local SQLite schema with sync columns
2. Implement sync service without cloud backend
3. Queue local changes in sync_queue table

### Phase 2: Cloud Backend Setup
1. Deploy chosen backend (Supabase recommended)
2. Implement API endpoints from specification
3. Set up authentication and user management

### Phase 3: Enable Sync
1. Connect sync service to cloud API
2. Implement conflict resolution
3. Add sync status UI components

### Phase 4: Social Features
1. Implement social feed and following system
2. Add leaderboards and ranking algorithms
3. Enable real-time notifications

## Performance Optimizations

- **Batch Operations**: Group multiple changes into single API calls
- **Delta Sync**: Only sync changed fields, not entire records
- **Compression**: Compress large payloads before transmission
- **Caching**: Cache frequently accessed data locally
- **Background Processing**: Use background tasks for sync operations

This strategy ensures your TFC app can work offline while providing seamless cloud synchronization and social features when online.
