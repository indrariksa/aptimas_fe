import { useFieldArray, type UseFormReturn } from 'react-hook-form'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '../../components/ui/button.tsx'
import { Field } from '../../components/shared.tsx'
import { moneyLabel } from '../../lib/utils.ts'
import type { DraftValues } from './model.ts'
import { budgetCents, lineCents, profileFor, type ProposalIssue } from './profiles.ts'

export function BudgetForm({ form, issues, profileVersionId }: { form: UseFormReturn<DraftValues>; issues: ProposalIssue[]; profileVersionId?: string | null }) {
  const { control, register, watch } = form
  const budget = useFieldArray({ control, name: 'proposal.budget' }), items = watch('proposal.budget'), profile = profileFor(watch('schemeVersionId'), profileVersionId)
  const errorFor = (path: string) => issues.find(item => item.path === path)?.message
  const total = budgetCents(items), groups = new Map<string, number | null>()
  items.forEach(item => { const key = item.category || 'Komponen belum dipilih', amount = lineCents(item), previous = groups.get(key) ?? 0; groups.set(key, amount === null || (amount !== null && !Number.isSafeInteger(previous + amount)) || (groups.has(key) && groups.get(key) === null) ? null : previous + amount) })
  return <section id="proposal-budget" tabIndex={-1} className="form-section"><h3>Rencana Anggaran Biaya</h3><p className="info-notice">Pagu contoh {moneyLabel(profile.budgetCap)}. Komponen dan pagu merupakan konfigurasi simulasi, bukan aturan pendanaan resmi. Gunakan titik untuk desimal.</p>{errorFor('proposal.budget') && <p className="field-error" role="alert">{errorFor('proposal.budget')}</p>}
    {budget.fields.map((item, index) => <div className="repeat-block budget-block" key={item.id}><div className="repeat-heading"><h3>Item RAB {index + 1}</h3><Button type="button" size="icon" variant="ghost" aria-label={`Hapus item RAB ${index + 1}`} onClick={() => budget.remove(index)}><Trash2 size={18} /></Button></div><div className="form-grid">
      <Field id={`proposal-budget-${index}-category`} label="Komponen" required error={errorFor(`proposal.budget.${index}.category`)}><select id={`proposal-budget-${index}-category`} {...register(`proposal.budget.${index}.category`)} aria-invalid={!!errorFor(`proposal.budget.${index}.category`)}><option value="">Pilih komponen</option>{profile.categories.map(category => <option key={category} value={category}>{category}</option>)}</select></Field>
      <Field id={`proposal-budget-${index}-description`} label="Item / uraian" required error={errorFor(`proposal.budget.${index}.description`)}><input id={`proposal-budget-${index}-description`} maxLength={500} {...register(`proposal.budget.${index}.description`)} aria-invalid={!!errorFor(`proposal.budget.${index}.description`)} /></Field>
      <Field id={`proposal-budget-${index}-unit`} label="Satuan" required error={errorFor(`proposal.budget.${index}.unit`)} hint="Contoh: paket, orang, unit, perjalanan."><input id={`proposal-budget-${index}-unit`} {...register(`proposal.budget.${index}.unit`)} aria-describedby={`proposal-budget-${index}-unit-hint`} /></Field>
      <Field id={`proposal-budget-${index}-year`} label="Tahun ke-" error={errorFor(`proposal.budget.${index}.year`)}><input id={`proposal-budget-${index}-year`} type="number" min={1} max={2} step={1} {...register(`proposal.budget.${index}.year`, { valueAsNumber: true })} /></Field>
      <Field id={`proposal-budget-${index}-price`} label="Harga satuan (Rp)" required hint="Maksimal 2 angka desimal."><input id={`proposal-budget-${index}-price`} type="number" inputMode="decimal" min={0} step="0.01" {...register(`proposal.budget.${index}.price`)} aria-describedby={`proposal-budget-${index}-price-hint`} /></Field>
      <Field id={`proposal-budget-${index}-quantity`} label="Volume" required error={errorFor(`proposal.budget.${index}.quantity`)} hint="Maksimal 3 angka desimal."><input id={`proposal-budget-${index}-quantity`} type="number" inputMode="decimal" min="0.001" step="0.001" {...register(`proposal.budget.${index}.quantity`)} aria-invalid={!!errorFor(`proposal.budget.${index}.quantity`)} aria-describedby={errorFor(`proposal.budget.${index}.quantity`) ? `proposal-budget-${index}-quantity-error` : `proposal-budget-${index}-quantity-hint`} /></Field>
    </div><p className="budget-subtotal">Subtotal <strong>{moneyLabel(lineCents(items[index]) === null ? null : lineCents(items[index])! / 100, 2)}</strong></p></div>)}
    <Button type="button" variant="outline" disabled={budget.fields.length >= 100} onClick={() => budget.append({ category: '', description: '', unit: '', quantity: '1', price: '', year: 1 })}><Plus size={17} />Tambah Item RAB</Button>
    {groups.size > 0 && <div className="budget-grouping"><h4>Ringkasan per Komponen</h4><dl>{[...groups].map(([category, amount]) => <div key={category}><dt>{category}</dt><dd>{moneyLabel(amount === null ? null : amount / 100, 2)}</dd></div>)}</dl></div>}
    <p className="budget-total">Total dana diajukan <strong>{moneyLabel(total === null ? null : total / 100, 2)}</strong></p><p className="field-hint">Dana disetujui dicatat terpisah setelah keputusan berwenang. Perhitungan ini simulasi; backend kelak menjadi sumber otoritatif.</p>
  </section>
}
