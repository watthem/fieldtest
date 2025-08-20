/**
 * FieldTest Registry - Schema Export Hub
 * Centralized exports for all validation schemas
 */

// Core schemas
export * from './schemas/obsidian-bases-schema';

// Type exports
export type {
  BasesMetadata,
  ProductsMetadata,
  PeopleMetadata,
  FinancialMetadata,
  GrowthMetadata,
  SystemSpecificMetadata
} from './schemas/obsidian-bases-schema';

// Validation functions
export {
  validateBasesMetadata,
  validateSystemSpecificMetadata,
  generateDefaultMetadata,
  validateFormulaOutput
} from './schemas/obsidian-bases-schema';