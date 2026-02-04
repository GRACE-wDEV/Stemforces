import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    user_id: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    action_type: { 
      type: String, 
      required: true,
      enum: [
        "CREATE", "UPDATE", "DELETE", "RESTORE",
        "PUBLISH", "UNPUBLISH", "BULK_IMPORT", 
        "BULK_DELETE", "LOGIN", "LOGOUT"
      ]
    },
    resource_type: { 
      type: String, 
      required: true,
      enum: ["Question", "Quiz", "User", "Subject", "Auth"]
    },
    resource_id: { type: String },
    
    changes: {
      before: mongoose.Schema.Types.Mixed,
      after: mongoose.Schema.Types.Mixed
    },
    
    metadata: {
      ip_address: String,
      user_agent: String,
      session_id: String
    },
  },
  { timestamps: true }
);

auditLogSchema.index({ user_id: 1, createdAt: -1 });
auditLogSchema.index({ resource_type: 1, resource_id: 1, createdAt: -1 });
auditLogSchema.index({ action_type: 1, createdAt: -1 });

const AuditLog = mongoose.models.AuditLog || mongoose.model("AuditLog", auditLogSchema);
export default AuditLog;
