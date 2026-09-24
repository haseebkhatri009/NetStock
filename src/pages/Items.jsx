import { useEffect, useMemo, useState } from 'react'
import {
  ref,
  push,
  onValue,
  update,
  remove
} from 'firebase/database'
import {
  Plus,
  Trash2,
  Pencil,
  X,
  Save,
  Search,
  Package,
  AlertCircle
} from 'lucide-react'

import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { formatDate } from '../utils/helpers'
import { Modal } from './Customers'
import Loader from '../components/Loader'


/* ============================================================
   CONFECTIONERY COMPANY ID
   ============================================================
   Sirf ye company ye page use kar sakti hai.
   Baaki companies ko redirect kar diya jayega.
   ============================================================ */

const CONFECTIONERY_COMPANY_ID = 'fKxuXEaw4ihtBunMYEVRYdKRxsH2'


/* ============================================================
   MAIN COMPONENT
   ============================================================ */

export default function Items() {

  const { companyId } = useAuth()


  /* ============================================================
     GUARD: Agar ye company allowed nahi, to kuch render mat karo
     (Route level pe bhi handle karna chahiye — App.jsx mein)
     ============================================================ */

  const isAllowedCompany = companyId === CONFECTIONERY_COMPANY_ID


  /* ============================================================
     STATE
     ============================================================ */

  const [items, setItems] = useState(null)
  const [search, setSearch] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState(null)

  const [itemName, setItemName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')


  /* ============================================================
     DELETE CONFIRMATION
     ============================================================ */

  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [deleting, setDeleting] = useState(false)


  /* ============================================================
     LOAD ITEMS
     ============================================================ */

  useEffect(() => {

    if (!companyId) return
    if (!isAllowedCompany) return

    const itemsRef = ref(
      db,
      `companies/${companyId}/confectionery-items`
    )

    const unsub = onValue(
      itemsRef,
      (snap) => {
        const value = snap.val() || {}

        const list = Object.entries(value)
          .map(([id, item]) => ({
            id,
            ...item
          }))
          .sort((a, b) => {
            const aName = String(a.name || '').toLowerCase()
            const bName = String(b.name || '').toLowerCase()
            return aName.localeCompare(bName)
          })

        setItems(list)
      },
      (err) => {
        console.error('items read failed:', err)
        setItems([])
      }
    )

    return () => unsub()

  }, [companyId, isAllowedCompany])


  /* ============================================================
     FILTERED ITEMS (search)
     ============================================================ */

  const filteredItems = useMemo(() => {

    if (!items) return []

    const q = search.trim().toLowerCase()

    if (!q) return items

    return items.filter((item) =>
      String(item.name || '')
        .toLowerCase()
        .includes(q)
    )

  }, [items, search])


  /* ============================================================
     OPEN NEW ITEM FORM
     ============================================================ */

  function openNewItem() {
    setItemName('')
    setEditingItem(null)
    setError('')
    setShowForm(true)
  }


  /* ============================================================
     OPEN EDIT ITEM FORM
     ============================================================ */

  function openEditItem(item) {
    setItemName(item.name || '')
    setEditingItem(item)
    setError('')
    setShowForm(true)
  }


  /* ============================================================
     CLOSE FORM
     ============================================================ */

  function closeForm() {
    if (saving) return
    setShowForm(false)
    setItemName('')
    setEditingItem(null)
    setError('')
  }


  /* ============================================================
     SUBMIT (Add / Update)
     ============================================================ */

  async function handleSubmit(e) {

    e.preventDefault()
    setError('')

    const name = itemName.trim()

    if (!name) {
      setError('Item name likhna zaroori hai.')
      return
    }

    /* ---------- Duplicate check (case-insensitive) ---------- */

    const duplicate = items?.find((it) => {
      if (editingItem && it.id === editingItem.id) return false
      return String(it.name || '').toLowerCase() === name.toLowerCase()
    })

    if (duplicate) {
      setError('Ye naam pehle se mojood hai.')
      return
    }

    setSaving(true)

    try {

      if (editingItem) {

        /* ---------- Update ---------- */

        await update(
          ref(
            db,
            `companies/${companyId}/confectionery-items/${editingItem.id}`
          ),
          {
            name,
            updatedAt: Date.now()
          }
        )

      } else {

        /* ---------- Create ---------- */

        await push(
          ref(
            db,
            `companies/${companyId}/confectionery-items`
          ),
          {
            name,
            createdAt: Date.now()
          }
        )

      }

      closeForm()

    } catch (err) {

      console.error('Item save error:', err)
      setError('Save nahi ho saka. Dobara koshish karein.')

    } finally {
      setSaving(false)
    }

  }


  /* ============================================================
     DELETE ITEM
     ============================================================ */

  async function handleDelete() {

    if (!deleteConfirm) return

    setDeleting(true)

    try {

      await remove(
        ref(
          db,
          `companies/${companyId}/confectionery-items/${deleteConfirm.id}`
        )
      )

      setDeleteConfirm(null)

    } catch (err) {

      console.error('Delete error:', err)
      alert('Delete nahi ho saka. Dobara koshish karein.')

    } finally {
      setDeleting(false)
    }

  }


  /* ============================================================
     GUARD RENDER
     ============================================================ */

  if (!isAllowedCompany) {
    return (
      <div className="border border-dashed border-line rounded-2xl py-16 flex flex-col items-center justify-center text-center">
        <AlertCircle className="text-slateink mb-3" size={28} />
        <p className="font-medium text-ink">
          Ye page is company ke liye available nahi hai.
        </p>
      </div>
    )
  }


  /* ============================================================
     RENDER
     ============================================================ */

  return (

    <>

      <div>

        {/* ======================================================
            HEADER
            ====================================================== */}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">

          <div>

            <h1 className="font-display text-2xl font-semibold text-ink">
              Items
            </h1>

            <p className="text-sm text-slateink mt-0.5">
              Add item names — these will automatically appear on the Invoice.
            </p>

          </div>


          <button
            onClick={openNewItem}
            className="flex items-center gap-2 rounded-lg bg-ink text-white text-sm font-medium px-4 py-2.5 hover:bg-inkSoft transition-colors self-start"
          >
            <Plus size={16} />
            Add Item
          </button>

        </div>


        {/* ======================================================
            SEARCH
            ====================================================== */}

        <div className="mb-6">

          <div className="relative max-w-md">

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input w-full pl-9 pr-10"
              placeholder="Search item by name..."
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slateink hover:text-ink"
              >
                <X size={14} />
              </button>
            )}

          </div>

          {items && (
            <p className="text-xs text-slateink mt-1">
              {filteredItems.length} of {items.length} item(s)
            </p>
          )}

        </div>


        {/* ======================================================
            LIST
            ====================================================== */}

        {items === null ? (

          <Loader />

        ) : filteredItems.length === 0 ? (

          <div className="border border-dashed border-line rounded-2xl py-16 flex flex-col items-center justify-center text-center">

            <Package className="text-slateink mb-3" size={28} />

            <p className="font-medium text-ink">
              {search
                ? 'No matching item found'
                : 'No items have been added yet.'}
            </p>

            {search ? (
              <p className="text-sm text-slateink mt-1">
                Try different keyword
              </p>
            ) : (
              <p className="text-sm text-slateink mt-1">
                Click "Add Item" to get started.
              </p>
            )}

          </div>

        ) : (

          <div className="bg-surface rounded-2xl border border-line shadow-card overflow-hidden">

            <div className="overflow-x-auto">

              <table className="w-full text-sm">

                <thead>

                  <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-slateink">

                    <th className="px-4 py-3 font-medium">
                      #
                    </th>

                    <th className="px-4 py-3 font-medium">
                      Item Name
                    </th>

                    <th className="px-4 py-3 font-medium">
                      Added
                    </th>

                    <th className="px-4 py-3 font-medium text-right">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredItems.map((item, index) => (

                    <tr
                      key={item.id}
                      className="border-b border-line last:border-0 hover:bg-paper/60"
                    >

                      <td className="px-4 py-3 text-xs text-slateink">
                        {index + 1}
                      </td>

                      <td className="px-4 py-3 font-medium text-ink">
                        {item.name}
                      </td>

                      <td className="px-4 py-3 text-xs text-slateink font-mono">
                        {item.createdAt ? formatDate(item.createdAt) : '—'}
                      </td>

                      <td className="px-4 py-3">

                        <div className="flex items-center justify-end gap-2">

                          <button
                            onClick={() => openEditItem(item)}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-ink hover:text-teal-dark"
                            title="Edit"
                          >
                            <Pencil size={13} />
                            Edit
                          </button>

                          <button
                            onClick={() => setDeleteConfirm(item)}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-coral hover:text-red-700"
                            title="Delete"
                          >
                            <Trash2 size={13} />
                            Delete
                          </button>

                        </div>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </div>

        )}

      </div>


      {/* ========================================================
          ADD / EDIT MODAL
          ======================================================== */}

      {showForm && (

        <Modal
          title={editingItem ? 'Edit Item' : 'Add Item'}
          onClose={closeForm}
        >

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >

            <label className="block">

              <span className="text-xs font-medium text-slateink">
                Item Name *
              </span>

              <input
                type="text"
                value={itemName}
                onChange={(e) => {
                  setItemName(e.target.value)
                  setError('')
                }}
                className="input mt-1 w-full"
                placeholder="e.g. Dairy Milk Chocolate"
                autoFocus
                required
              />

              <small className="text-xs text-slateink mt-1 block">
                Sirf naam — Invoice mein price manually type hoga.
              </small>

            </label>


            {error && (
              <p className="text-xs font-medium text-coral bg-coral-light rounded-lg px-3 py-2">
                {error}
              </p>
            )}


            <button
              type="submit"
              disabled={saving || !itemName.trim()}
              className="w-full rounded-lg bg-ink text-white text-sm font-medium py-2.5 hover:bg-inkSoft transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >

              <Save size={16} />

              {saving
                ? 'Saving…'
                : editingItem
                  ? 'Update Item'
                  : 'Add Item'}

            </button>

          </form>

        </Modal>

      )}


      {/* ========================================================
          DELETE CONFIRMATION
          ======================================================== */}

      {deleteConfirm && (

        <div className="fixed inset-0 z-[99999] bg-black/60 flex items-center justify-center p-4">

          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">

            <div className="flex items-center justify-between mb-4">

              <h3 className="text-lg font-semibold text-ink">
                Delete Item
              </h3>

              <button
                onClick={() => setDeleteConfirm(null)}
                className="text-slateink hover:text-ink"
              >
                <X size={20} />
              </button>

            </div>


            <div className="space-y-4">

              <p className="text-sm text-ink">
                Are you sure to delete this item?
              </p>

              <div className="bg-paper rounded-lg p-3 text-sm">

                <p className="font-medium text-ink">
                  {deleteConfirm.name}
                </p>

              </div>


              <div className="flex gap-3">

                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 rounded-lg border border-line text-ink text-sm font-medium py-2.5 hover:bg-paper transition-colors"
                >
                  Cancel
                </button>

                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 rounded-lg bg-coral text-white text-sm font-medium py-2.5 hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >

                  {deleting ? (
                    'Deleting…'
                  ) : (
                    <>
                      <Trash2 size={16} />
                      Delete
                    </>
                  )}

                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </>

  )

}