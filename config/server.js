import { renderWorkspaceInviteEmail } from "../packages/main/src/server/email/workspaceInviteEmail.js";

export const config = {};


config.auth ||= {};
config.auth.profileMode = "users";


config.workspaceColor = "#1867C0";


config.workspaceInvitations = {
  enabled: false,
  allowInPersonalMode: false
};


config.workspaceSettings = {
  defaults: {
    invitesEnabled: false
  }
};


config.workspaceMembers = {
  defaults: {
    inviteExpiresInMs: 604800000
  }
};

config.workspaceInviteEmailTemplate = renderWorkspaceInviteEmail;
