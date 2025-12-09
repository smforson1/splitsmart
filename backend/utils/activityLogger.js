const db = require('../db');

/**
 * Logs an activity to the database.
 * @param {Object} params
 * @param {string} params.groupId - The ID of the group where the activity occurred.
 * @param {string} params.actorId - The ID of the MEMBER who performed the action.
 * @param {string} params.actionType - The type of action (e.g., 'CREATE_EXPENSE', 'SETTLED', 'MEMBER_JOINED').
 * @param {string} [params.entityType] - The type of entity involved (e.g., 'expense', 'settlement', 'member').
 * @param {string} [params.entityId] - The ID of the entity.
 * @param {Object} [params.payload] - Additional data to store (e.g., expense amount, description).
 */
const logActivity = async ({ groupId, actorId, actionType, entityType, entityId, payload }) => {
    try {
        await db.query(
            `INSERT INTO activities (group_id, actor_id, action_type, entity_type, entity_id, payload)
       VALUES ($1, $2, $3, $4, $5, $6)`,
            [groupId, actorId, actionType || 'UNKNOWN', entityType || null, entityId || null, payload ? JSON.stringify(payload) : null]
        );
    } catch (error) {
        console.error('Failed to log activity:', error);
        // Don't throw error to avoid blocking the main operation
    }
};

module.exports = logActivity;
