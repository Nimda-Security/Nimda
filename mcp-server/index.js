import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// Initialize MCP Server
const server = new Server({
  name: "nimda-password-change",
  version: "1.0.0",
}, {
  capabilities: {
    tools: {},
  },
});

// In-memory storage for the password_change_token cookie
let storedCookie = "";
const backendUrl = process.env.BACKEND_URL || "http://localhost:8080";

// Register List of Tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "check_password_change_info",
        description: "Validates the user's userId, student number, and email. This is the 1st step of the password change flow. Initializes a session cookie.",
        inputSchema: {
          type: "object",
          properties: {
            userId: { type: "string", description: "The username/ID of the user." },
            studentNum: { type: "string", description: "The student number of the user." },
            email: { type: "string", description: "The registered email address of the user." }
          },
          required: ["userId", "studentNum", "email"]
        }
      },
      {
        name: "send_password_change_auth_mail",
        description: "Triggers the backend to send a 6-digit authentication code to the email address. This is the 2nd step. Must be called after check_password_change_info.",
        inputSchema: {
          type: "object",
          properties: {
            userId: { type: "string", description: "The username/ID of the user." },
            studentNum: { type: "string", description: "The student number of the user." },
            email: { type: "string", description: "The registered email address of the user." }
          },
          required: ["userId", "studentNum", "email"]
        }
      },
      {
        name: "verify_password_change_code",
        description: "Verifies the email authentication code received by the user. This is the 3rd step. Updates the session to be verified.",
        inputSchema: {
          type: "object",
          properties: {
            authCode: { type: "string", description: "The authentication code received by the user." }
          },
          required: ["authCode"]
        }
      },
      {
        name: "confirm_password_change",
        description: "Changes the user's password. This is the final step. Must be called after successful email code verification.",
        inputSchema: {
          type: "object",
          properties: {
            password: { type: "string", description: "The new password to set." }
          },
          required: ["password"]
        }
      }
    ]
  };
});

// Helper to update cookie from response headers
function updateCookie(headers) {
  let foundToken = null;
  if (typeof headers.getSetCookie === 'function') {
    const cookies = headers.getSetCookie();
    for (const cookie of cookies) {
      if (cookie.includes("password_change_token=")) {
        foundToken = cookie;
      }
    }
  } else {
    const setCookie = headers.get("set-cookie");
    if (setCookie && setCookie.includes("password_change_token=")) {
      foundToken = setCookie;
    }
  }

  if (foundToken) {
    const parts = foundToken.split(";");
    const tokenPart = parts.find(p => p.trim().startsWith("password_change_token="));
    if (tokenPart) {
      storedCookie = tokenPart.trim();
    }
  }
}

// Handle Tool Execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === "check_password_change_info") {
      const { userId, studentNum, email } = args;
      const res = await fetch(`${backendUrl}/api/cite/passwordChange/info-check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, studentNum, email })
      });

      if (!res.ok) {
        const text = await res.text();
        return {
          content: [{ type: "text", text: `Backend error (${res.status}): ${text}` }],
          isError: true
        };
      }

      const data = await res.json();
      updateCookie(res.headers);

      return {
        content: [{
          type: "text",
          text: `Info verification response: ${JSON.stringify(data.data || data)}\nSession token stored: ${storedCookie ? "Yes" : "No"}`
        }]
      };
    }

    if (name === "send_password_change_auth_mail") {
      if (!storedCookie) {
        return {
          content: [{ type: "text", text: "Error: No active session. Please verify user info first." }],
          isError: true
        };
      }

      const { userId, studentNum, email } = args;
      const res = await fetch(`${backendUrl}/api/cite/passwordChange/send-authMail`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cookie": storedCookie
        },
        body: JSON.stringify({ userId, studentNum, email })
      });

      if (!res.ok) {
        const text = await res.text();
        return {
          content: [{ type: "text", text: `Backend error (${res.status}): ${text}` }],
          isError: true
        };
      }

      return {
        content: [{ type: "text", text: "Successfully requested authentication email dispatch." }]
      };
    }

    if (name === "verify_password_change_code") {
      if (!storedCookie) {
        return {
          content: [{ type: "text", text: "Error: No active session. Please verify user info first." }],
          isError: true
        };
      }

      const { authCode } = args;
      const res = await fetch(`${backendUrl}/api/cite/passwordChange/check-authcode`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cookie": storedCookie
        },
        body: JSON.stringify({ authCode })
      });

      if (!res.ok) {
        const text = await res.text();
        return {
          content: [{ type: "text", text: `Backend error (${res.status}): ${text}` }],
          isError: true
        };
      }

      const text = await res.text();
      updateCookie(res.headers);

      return {
        content: [{ type: "text", text: `Verification response: ${text}\nVerified Session stored: ${storedCookie ? "Yes" : "No"}` }]
      };
    }

    if (name === "confirm_password_change") {
      if (!storedCookie) {
        return {
          content: [{ type: "text", text: "Error: No verified session. Please verify the code first." }],
          isError: true
        };
      }

      const { password } = args;
      const res = await fetch(`${backendUrl}/api/cite/passwordChange/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cookie": storedCookie
        },
        body: JSON.stringify({ password })
      });

      if (!res.ok) {
        const text = await res.text();
        return {
          content: [{ type: "text", text: `Backend error (${res.status}): ${text}` }],
          isError: true
        };
      }

      const text = await res.text();
      return {
        content: [{ type: "text", text: `Change Password Response: ${text}` }]
      };
    }

    return {
      content: [{ type: "text", text: `Unknown tool: ${name}` }],
      isError: true
    };
  } catch (error) {
    return {
      content: [{ type: "text", text: `Unexpected error: ${error.message}` }],
      isError: true
    };
  }
});

// Run using Stdio transport
const transport = new StdioServerTransport();
await server.connect(transport);
