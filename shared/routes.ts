import { z } from 'zod';
import { insertVisitSchema, visits } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  visits: {
    list: {
      method: 'GET' as const,
      path: '/api/visits',
      input: z.object({
        search: z.string().optional(),
        status: z.enum(['checked_in', 'checked_out', 'all']).optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof visits.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/visits/:id',
      responses: {
        200: z.custom<typeof visits.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/visits',
      input: insertVisitSchema,
      responses: {
        201: z.custom<typeof visits.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/visits/:id',
      input: insertVisitSchema.partial().extend({
        status: z.string().optional(),
        checkOutTime: z.string().optional() // ISO string
      }),
      responses: {
        200: z.custom<typeof visits.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    checkout: {
      method: 'POST' as const,
      path: '/api/visits/:id/checkout',
      responses: {
        200: z.custom<typeof visits.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/visits/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
    scanRfid: {
      method: 'POST' as const,
      path: '/api/scan/rfid',
      input: z.object({ rfid: z.string() }),
      responses: {
        200: z.object({ success: z.boolean(), visit: z.custom<typeof visits.$inferSelect>().optional(), message: z.string() }),
        404: errorSchemas.notFound,
      }
    }
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
