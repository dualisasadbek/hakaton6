import swaggerJSDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "FixMyCity API",
      version: "1.0.0",
      description:
        "FixMyCity - shahar muammolarini kuzatish platformasi. AI yordamida shikoyatlarni tahlil qilish.",
    },
    servers: [{ url: "http://localhost:5000/api", description: "Local server" }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            firstName: { type: "string" },
            lastName: { type: "string" },
            email: { type: "string", format: "email" },
            role: { type: "string", enum: ["USER", "ADMIN", "SUPER_ADMIN"] },
            isBlocked: { type: "boolean" },
            avatarUrl: { type: "string", nullable: true },
          },
        },
        Complaint: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            title: { type: "string" },
            description: { type: "string" },
            latitude: { type: "number" },
            longitude: { type: "number" },
            address: { type: "string", nullable: true },
            status: {
              type: "string",
              enum: ["PENDING", "VERIFIED", "IN_PROGRESS", "RESOLVED", "REJECTED", "BLOCKED"],
            },
            aiDecision: { type: "string", enum: ["PENDING", "APPROVED", "BLOCKED"] },
          },
        },
        Category: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string" },
            slug: { type: "string" },
            icon: { type: "string", nullable: true },
            isActive: { type: "boolean" },
          },
        },
        ApiResponse: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            message: { type: "string" },
            data: {},
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.js", "./src/controllers/*.js"],
};

export const swaggerSpec = swaggerJSDoc(options);
