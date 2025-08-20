/**
 * FieldTest Schema for Obsidian Bases Metadata Properties
 * Ensures consistent property validation across westmarkdev documentation
 */

import { z } from 'zod';

// Core system types for westmarkdev
export const SystemType = z.enum(['people', 'products', 'financial', 'growth', 'dashboard']);

// Content types across the ecosystem  
export const ContentType = z.enum([
  'project', 
  'agent', 
  'meeting', 
  'decision', 
  'resource', 
  'template',
  'overview'
]);

// Status workflow states
export const StatusType = z.enum([
  'draft',
  'active', 
  'review',
  'completed',
  'archived',
  'blocked'
]);

// Priority levels for resource allocation
export const PriorityType = z.enum(['critical', 'high', 'medium', 'low']);

// Base schema that all Obsidian Bases notes must conform to
export const BasesMetadataSchema = z.object({
  // Universal properties (required for all notes)
  system: SystemType,
  type: ContentType,
  status: StatusType,
  priority: PriorityType,
  owner: z.string().min(1, "Owner is required"),
  created: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  updated: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  
  // Optional universal properties
  deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional().or(z.literal("")),
  tags: z.array(z.string()).default([]),
  cover_image: z.string().optional().or(z.literal("")),
}).strict();

// Extended schema for Product system notes
export const ProductsMetadataSchema = BasesMetadataSchema.extend({
  // Product-specific properties (all strings for Bases compatibility)
  product_name: z.string().optional(),
  development_stage: z.enum(['concept', 'mvp', 'production', 'scaling']).optional(),
  tech_stack: z.array(z.string()).default([]),
  revenue_model: z.enum(['saas', 'consulting', 'freemium', 'enterprise', '']).optional(),
  mrr_target: z.string().regex(/^\d+$/, "MRR target must be numeric string").optional(),
  github_repo: z.string().optional(),
  deployment_status: z.enum(['local', 'staging', 'production']).optional(),
  customer_count: z.string().regex(/^\d+$/, "Customer count must be numeric string").optional(),
  dependencies: z.array(z.string()).default([]),
  revenue_impact: z.string().regex(/^\d+$/, "Revenue impact must be numeric string").optional(),
  
  // Dynamic formula properties (calculated by Bases, stored as strings)
  deadline_countdown: z.string().optional(),
  health_score: z.string().optional(),
  revenue_tier: z.string().optional(),
});

// Extended schema for People system notes (agents, team members)
export const PeopleMetadataSchema = BasesMetadataSchema.extend({
  // People-specific properties
  agent_name: z.string().optional(),
  role: z.enum(['founder', 'agent', 'contractor', 'advisor', 'customer']).optional(),
  specialization: z.array(z.string()).default([]),
  availability: z.enum(['full-time', 'part-time', 'on-demand', 'unavailable']).optional(),
  hourly_rate: z.string().regex(/^\d+$/, "Hourly rate must be numeric string").optional(),
  utilization_rate: z.string().regex(/^\d+$/, "Utilization rate must be numeric string").optional(),
  current_projects: z.array(z.string()).default([]),
  expertise_level: z.enum(['junior', 'mid', 'senior', 'expert']).optional(),
  
  // Dynamic formula properties
  workload_status: z.string().optional(),
  productivity_score: z.string().optional(),
});

// Extended schema for Financial system notes
export const FinancialMetadataSchema = BasesMetadataSchema.extend({
  // Financial-specific properties
  amount: z.string().regex(/^\d+(\.\d{2})?$/, "Amount must be numeric string").optional(),
  currency: z.enum(['USD', 'EUR', 'CAD']).optional(),
  category: z.enum(['revenue', 'expense', 'investment', 'funding']).optional(),
  frequency: z.enum(['one-time', 'monthly', 'quarterly', 'annual']).optional(),
  source: z.string().optional(),
  tax_category: z.string().optional(),
  runway_impact: z.string().regex(/^\d+$/, "Runway impact must be numeric string").optional(),
  
  // Dynamic formula properties
  mrr: z.string().optional(),
  arr: z.string().optional(),
  clv: z.string().optional(),
});

// Extended schema for Growth system notes (marketing, sales)
export const GrowthMetadataSchema = BasesMetadataSchema.extend({
  // Growth-specific properties
  campaign_type: z.enum(['content', 'social', 'email', 'paid', 'partnership']).optional(),
  budget: z.string().regex(/^\d+(\.\d{2})?$/, "Budget must be numeric string").optional(),
  target_audience: z.string().optional(),
  conversion_rate: z.string().regex(/^\d+(\.\d{2})?$/, "Conversion rate must be numeric string").optional(),
  roi: z.string().regex(/^\d+(\.\d{2})?$/, "ROI must be numeric string").optional(),
  channel: z.string().optional(),
  stage: z.enum(['awareness', 'consideration', 'conversion', 'retention']).optional(),
});

// Union type for all possible metadata schemas based on system
export const SystemSpecificMetadataSchema = z.discriminatedUnion('system', [
  ProductsMetadataSchema.extend({ system: z.literal('products') }),
  PeopleMetadataSchema.extend({ system: z.literal('people') }),
  FinancialMetadataSchema.extend({ system: z.literal('financial') }),
  GrowthMetadataSchema.extend({ system: z.literal('growth') }),
  BasesMetadataSchema.extend({ system: z.literal('dashboard') }),
]);

// Type exports for TypeScript usage
export type BasesMetadata = z.infer<typeof BasesMetadataSchema>;
export type ProductsMetadata = z.infer<typeof ProductsMetadataSchema>;
export type PeopleMetadata = z.infer<typeof PeopleMetadataSchema>;
export type FinancialMetadata = z.infer<typeof FinancialMetadataSchema>;
export type GrowthMetadata = z.infer<typeof GrowthMetadataSchema>;
export type SystemSpecificMetadata = z.infer<typeof SystemSpecificMetadataSchema>;

// Validation helper functions
export function validateBasesMetadata(data: unknown): BasesMetadata {
  return BasesMetadataSchema.parse(data);
}

export function validateSystemSpecificMetadata(data: unknown): SystemSpecificMetadata {
  return SystemSpecificMetadataSchema.parse(data);
}

// Template generation helpers
export function generateDefaultMetadata(
  system: SystemType['_output'],
  type: ContentType['_output'],
  overrides: Partial<BasesMetadata> = {}
): BasesMetadata {
  const now = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  
  return {
    system,
    type,
    status: 'draft',
    priority: 'medium',
    owner: '@westmarkdev',
    created: now,
    updated: now,
    deadline: '',
    tags: [system, type],
    cover_image: '',
    ...overrides
  };
}

// Validation for Obsidian Bases formulas (ensures string outputs)
export function validateFormulaOutput(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (value === null || value === undefined) return '';
  return String(value);
}