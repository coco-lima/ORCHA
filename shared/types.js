"use strict";
// Shared types for AI Agent Orchestration Platform
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageType = exports.AgentStatus = exports.AgentType = exports.Priority = exports.CardType = exports.CardStatus = void 0;
var CardStatus;
(function (CardStatus) {
    CardStatus["PENDING"] = "pending";
    CardStatus["IN_PROGRESS"] = "in_progress";
    CardStatus["COMPLETED"] = "completed";
    CardStatus["FAILED"] = "failed";
    CardStatus["PAUSED"] = "paused";
    CardStatus["CANCELLED"] = "cancelled";
})(CardStatus || (exports.CardStatus = CardStatus = {}));
var CardType;
(function (CardType) {
    CardType["TASK"] = "task";
    CardType["NOTIFICATION"] = "notification";
    CardType["ANALYSIS"] = "analysis";
    CardType["INTEGRATION"] = "integration";
    CardType["REPORT"] = "report";
    CardType["AUTOMATION"] = "automation";
})(CardType || (exports.CardType = CardType = {}));
var Priority;
(function (Priority) {
    Priority["LOW"] = "low";
    Priority["MEDIUM"] = "medium";
    Priority["HIGH"] = "high";
    Priority["URGENT"] = "urgent";
})(Priority || (exports.Priority = Priority = {}));
var AgentType;
(function (AgentType) {
    AgentType["GENERAL"] = "general";
    AgentType["CUSTOMER_SUPPORT"] = "customer_support";
    AgentType["DATA_ANALYSIS"] = "data_analysis";
    AgentType["INTEGRATION"] = "integration";
    AgentType["AUTOMATION"] = "automation";
    AgentType["MONITORING"] = "monitoring";
})(AgentType || (exports.AgentType = AgentType = {}));
var AgentStatus;
(function (AgentStatus) {
    AgentStatus["IDLE"] = "idle";
    AgentStatus["BUSY"] = "busy";
    AgentStatus["OFFLINE"] = "offline";
    AgentStatus["ERROR"] = "error";
})(AgentStatus || (exports.AgentStatus = AgentStatus = {}));
var MessageType;
(function (MessageType) {
    // Card operations
    MessageType["CREATE_CARD"] = "create_card";
    MessageType["UPDATE_CARD"] = "update_card";
    MessageType["DELETE_CARD"] = "delete_card";
    MessageType["CARD_STATUS_CHANGE"] = "card_status_change";
    // Agent operations
    MessageType["AGENT_STATUS_UPDATE"] = "agent_status_update";
    MessageType["TASK_ASSIGNMENT"] = "task_assignment";
    MessageType["TASK_COMPLETION"] = "task_completion";
    // System messages
    MessageType["SYSTEM_NOTIFICATION"] = "system_notification";
    MessageType["ERROR"] = "error";
    MessageType["HEARTBEAT"] = "heartbeat";
    // Demo mode
    MessageType["DEMO_STEP"] = "demo_step";
})(MessageType || (exports.MessageType = MessageType = {}));
//# sourceMappingURL=types.js.map