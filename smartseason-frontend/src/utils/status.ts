/**
 * Client-side status computation — mirrors backend logic in utils/status.ts
 */
export function computeStatusFE(field: { currentStage: string; plantingDate: string }): string {
  const days = Math.floor((Date.now() - new Date(field.plantingDate).getTime()) / 86_400_000)
  if (field.currentStage === 'HARVESTED') return 'COMPLETED'
  if (days > 90 && field.currentStage !== 'READY') return 'AT_RISK'
  return 'ACTIVE'
}
